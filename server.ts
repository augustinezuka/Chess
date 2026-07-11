import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { Chess } from "chess.js";

dotenv.config();

const app = express();
const PORT = 3000;

// Setup JSON body parser
app.use(express.json());

// Helper function to lazy-get or check Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel (Settings > Secrets).");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Simple piece values for local engine fallback evaluation
const PIECE_VALUES: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

function evaluateBoardSimple(chess: Chess): number {
  let score = 0;
  const board = chess.board();
  for (const row of board) {
    for (const square of row) {
      if (square) {
        const val = PIECE_VALUES[square.type] || 0;
        score += square.color === "w" ? val : -val;
      }
    }
  }
  return score;
}

function getLocalBestMove(chess: Chess): string {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return "";
  
  const isWhite = chess.turn() === "w";
  let bestMove = moves[0].san;
  let bestScore = isWhite ? -Infinity : Infinity;

  for (const move of moves) {
    chess.move({ from: move.from, to: move.to, promotion: move.promotion });
    const score = evaluateBoardSimple(chess);
    chess.undo();

    if (isWhite) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move.san;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move.san;
      }
    }
  }
  return bestMove;
}

// Endpoint to get a chess hint / tactical concept
app.post("/api/gemini/hint", async (req, res) => {
  const { fen, moveHistory, turn, difficulty } = req.body;
  
  if (!fen) {
    return res.status(400).json({ error: "FEN position is required" });
  }

  const hasApiKey = !!process.env.GEMINI_API_KEY;

  if (hasApiKey) {
    try {
      const ai = getGeminiClient();
      
      const prompt = `You are an elite chess coach. Analyze this chess position.
Current FEN: ${fen}
Current turn: ${turn === "w" ? "White" : "Black"}
Move History so far: ${JSON.stringify(moveHistory || [])}
AI Difficulty level (if playing AI): ${difficulty || "Medium"}

Provide a tactical coaching hint for the player whose turn it is. Do NOT give away the direct answer in the "subtleHint" field; instead, guide their attention to a tactical motif (like a fork, pin, skewer, discovered attack, overloaded defender, or simple piece safety) and tell them what to focus on. Provide the full solution separately.

You MUST respond with a valid JSON object matching this schema:
{
  "motif": "Name of the key tactical motif (e.g., 'Pin', 'Fork', 'Deflection', 'Development')",
  "subtleHint": "A coaching hint that helps the player find the move themselves without naming the target square directly (e.g., 'Look at the alignment of your queen and the opponent's undefended rook.')",
  "recommendedMove": "The absolute best algebraic notation move (e.g., 'Nxf7', 'O-O', 'Be4')",
  "explanation": "A clear, encouraging 2-3 sentence explanation of why this recommended move is excellent and what tactical benefits it provides."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              motif: { type: Type.STRING },
              subtleHint: { type: Type.STRING },
              recommendedMove: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ["motif", "subtleHint", "recommendedMove", "explanation"],
          },
        },
      });

      const resultText = response.text?.trim() || "{}";
      return res.json(JSON.parse(resultText));
    } catch (error: any) {
      console.warn("Gemini hint failed, falling back to local engine:", error);
    }
  }

  // --- LOCAL FALLBACK ---
  try {
    const chess = new Chess(fen);
    const recommendedMove = getLocalBestMove(chess);
    
    let motif = "Development & Positioning";
    let subtleHint = "Look for ways to coordinate your pieces and improve control of key squares.";
    let explanation = "This move increases your positional pressure and helps establish standard tactical advantages.";

    if (recommendedMove.includes("x")) {
      motif = "Piece Capture / Material Gain";
      subtleHint = "Look for opportunities to capture an active opposing piece to win material.";
      explanation = `Capturing with ${recommendedMove} secures a material advantage and removes a potentially active opposing defender.`;
    } else if (recommendedMove.endsWith("+")) {
      motif = "King Safety / Direct Check";
      subtleHint = "Consider forcing the opponent's king to react by delivering a direct check.";
      explanation = `Delivering check with ${recommendedMove} disrupts the opponent's coordination and limits their active options.`;
    } else if (recommendedMove === "O-O" || recommendedMove === "O-O-O") {
      motif = "Castling & King Safety";
      subtleHint = "Get your king tucked away safely and bring your rook into the battle.";
      explanation = "Castling places your king behind a solid pawn wall and coordinates your rooks on the back rank.";
    } else if (recommendedMove.startsWith("N") || recommendedMove.startsWith("B")) {
      motif = "Minor Piece Activation";
      subtleHint = "Develop your knights or bishops toward the center to control key central outposts.";
      explanation = `Activating your piece with ${recommendedMove} improves your central control and develops critical squares.`;
    }

    res.json({
      motif,
      subtleHint,
      recommendedMove,
      explanation
    });
  } catch (localErr: any) {
    console.error("Local hint generation failed:", localErr);
    res.status(500).json({ error: "Failed to generate hint." });
  }
});

// Endpoint to explain a mistake
app.post("/api/gemini/explain-mistake", async (req, res) => {
  const { fenBefore, moveMade, recommendedMove, turn } = req.body;

  if (!fenBefore || !moveMade) {
    return res.status(400).json({ error: "Missing FEN or move details" });
  }

  const hasApiKey = !!process.env.GEMINI_API_KEY;

  if (hasApiKey) {
    try {
      const ai = getGeminiClient();

      const prompt = `You are an educational chess coach explaining a tactical mistake.
FEN before the mistake: ${fenBefore}
The player (${turn === "w" ? "White" : "Black"}) made the move: ${moveMade}
The recommended best move was: ${recommendedMove || "a different tactical move"}

Explain in educational terms why the move made was a mistake, and why the recommended move was superior. Mention if a piece was left hanging, if it walked into a tactical pin/fork, or if it gave up control of a key file or diagonal. Keep the tone supportive and educational.

You MUST respond with a valid JSON object matching this schema:
{
  "whyMistake": "Clear explanation of why the move made was suboptimal (e.g., 'Moving the knight to g5 leaves the e4 pawn undefended and allows a strong counter-attack.')",
  "howExploited": "How the opponent could exploit this mistake (e.g., 'The opponent can capture on e4, threatening your rook on h1.')",
  "whyBetter": "Why the recommended move was much stronger (e.g., 'O-O protects your king and completes your basic development safely.')",
  "educationalRule": "A key chess principle or rule of thumb to remember (e.g., 'Always look for undefended pieces before launching an attack.')"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              whyMistake: { type: Type.STRING },
              howExploited: { type: Type.STRING },
              whyBetter: { type: Type.STRING },
              educationalRule: { type: Type.STRING },
            },
            required: ["whyMistake", "howExploited", "whyBetter", "educationalRule"],
          },
        },
      });

      const resultText = response.text?.trim() || "{}";
      return res.json(JSON.parse(resultText));
    } catch (error: any) {
      console.warn("Gemini explain-mistake failed, falling back to local logic:", error);
    }
  }

  // --- LOCAL FALLBACK ---
  res.json({
    whyMistake: `The move ${moveMade} was played, which might overlook key positional safety or miss a stronger line.`,
    howExploited: "The opponent could leverage this move to secure active open lines or gain central momentum.",
    whyBetter: recommendedMove 
      ? `The alternative ${recommendedMove} coordinates your pieces more effectively and maintains a more secure defense.`
      : "A standard defensive or developing move would protect your critical files and avoid weak outposts.",
    educationalRule: "Always review piece safety and count active defenders before choosing a move."
  });
});

// Endpoint to analyze the entire completed game
app.post("/api/gemini/post-game-analysis", async (req, res) => {
  const { moves, winner, gameMode, mistakes } = req.body;

  const hasApiKey = !!process.env.GEMINI_API_KEY;

  if (hasApiKey) {
    try {
      const ai = getGeminiClient();

      const prompt = `You are an elite Grandmaster Chess Coach providing post-game analysis.
Game details:
- Mode: ${gameMode === "ai" ? "VS Chess AI" : "Local Pass-and-Play"}
- Winner: ${winner ? (winner === "w" ? "White" : "Black") : "Draw/Stalemate"}
- Moves played (in sequence): ${JSON.stringify(moves || [])}
- Mistakes noted during the match: ${JSON.stringify(mistakes || [])}

Provide a comprehensive post-game review. Analyze the opening played, identify critical tactical moments, grade both players, and generate a customized chess puzzle from their game state for them to solve.

You MUST respond with a valid JSON object matching this schema:
{
  "openingName": "Name of the opening played (e.g., 'Ruy Lopez', 'Sicilian Defense: Closed', 'Unknown / Custom')",
  "performanceGrade": "Overall tactical grade for the player (A+, B, C-, etc.)",
  "strategicTakeaway": "A 2-3 sentence strategic advice summarizing the game. What should they practice? (e.g., 'Excellent center control, but watch out for diagonal back-rank threats.')",
  "whiteStrengths": ["Strength 1", "Strength 2"],
  "whiteWeaknesses": ["Weakness 1", "Weakness 2"],
  "blackStrengths": ["Strength 1", "Strength 2"],
  "blackWeaknesses": ["Weakness 1", "Weakness 2"],
  "tacticalPuzzle": {
    "description": "Describe a puzzle scenario based on their game (e.g., 'At move 12, there was a missed chance for a knight fork. Find the double threat.')",
    "correctMove": "The correct algebraic move to solve it",
    "solutionExplanation": "Explain why this move solves the puzzle and wins material or positioning."
  }
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              openingName: { type: Type.STRING },
              performanceGrade: { type: Type.STRING },
              strategicTakeaway: { type: Type.STRING },
              whiteStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              whiteWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              blackStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              blackWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              tacticalPuzzle: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  correctMove: { type: Type.STRING },
                  solutionExplanation: { type: Type.STRING },
                },
                required: ["description", "correctMove", "solutionExplanation"],
              }
            },
            required: [
              "openingName", 
              "performanceGrade", 
              "strategicTakeaway", 
              "whiteStrengths", 
              "whiteWeaknesses", 
              "blackStrengths", 
              "blackWeaknesses",
              "tacticalPuzzle"
            ],
          },
        },
      });

      const resultText = response.text?.trim() || "{}";
      return res.json(JSON.parse(resultText));
    } catch (error: any) {
      console.warn("Gemini post-game-analysis failed, falling back to local engine:", error);
    }
  }

  // --- LOCAL FALLBACK ---
  const firstMove = moves && moves[0];
  let openingName = "Modern Defense / Custom System";
  if (firstMove === "e4") openingName = "King's Pawn Game";
  else if (firstMove === "d4") openingName = "Queen's Pawn Game";
  else if (firstMove === "Nf3") openingName = "Réti Opening";
  else if (firstMove === "c4") openingName = "English Opening";

  const numMistakes = (mistakes || []).length;
  let performanceGrade = "A";
  if (numMistakes === 1) performanceGrade = "A-";
  else if (numMistakes === 2) performanceGrade = "B+";
  else if (numMistakes === 3) performanceGrade = "B";
  else if (numMistakes > 3) performanceGrade = "C";

  res.json({
    openingName,
    performanceGrade,
    strategicTakeaway: "You demonstrated solid strategic thinking. Focus on developing your minor pieces early and scan the entire board for potential tactical openings.",
    whiteStrengths: ["Fast piece development", "Good king safety and castling timing"],
    whiteWeaknesses: ["Minor pawn weaknesses in the center", "Vulnerability on the f-file diagonal"],
    blackStrengths: ["Strong central pawn structure", "Excellent coordination of knights and rooks"],
    blackWeaknesses: ["Slightly passive bishops", "Vulnerability to back-rank tactical motifs"],
    tacticalPuzzle: {
      description: "Review your opening moves in this match. Can you find the alternative candidate move that would have achieved more active control over the center files?",
      correctMove: firstMove || "e4",
      solutionExplanation: "This move stakes a claim in the center, activates your pieces, and prepares castling."
    }
  });
});

// Mount Vite middleware in development, serve build output in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
