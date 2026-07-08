import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

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

// Endpoint to get a chess hint / tactical concept
app.post("/api/gemini/hint", async (req, res) => {
  try {
    const { fen, moveHistory, turn, difficulty } = req.body;
    
    if (!fen) {
      return res.status(400).json({ error: "FEN position is required" });
    }

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
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error in /api/gemini/hint:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate tactical hint from Gemini." 
    });
  }
});

// Endpoint to explain a mistake
app.post("/api/gemini/explain-mistake", async (req, res) => {
  try {
    const { fenBefore, moveMade, recommendedMove, turn } = req.body;

    if (!fenBefore || !moveMade) {
      return res.status(400).json({ error: "Missing FEN or move details" });
    }

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
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error in /api/gemini/explain-mistake:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate mistake explanation." 
    });
  }
});

// Endpoint to analyze the entire completed game
app.post("/api/gemini/post-game-analysis", async (req, res) => {
  try {
    const { moves, winner, gameMode, mistakes } = req.body;

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
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error in /api/gemini/post-game-analysis:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate post-game analysis." 
    });
  }
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
