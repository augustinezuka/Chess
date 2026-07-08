import { Chess } from "chess.js";
import { Difficulty } from "../types";

// Piece values for board evaluation
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Positional tables for White (mirrored for Black)
const PAWN_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0]
];

const KNIGHT_TABLE = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50]
];

const BISHOP_TABLE = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20]
];

const ROOK_TABLE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0]
];

const QUEEN_TABLE = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 5, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20]
];

const KING_MIDDLE_TABLE = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20]
];

const KING_END_TABLE = [
  [-50, -40, -30, -20, -20, -30, -40, -50],
  [-30, -20, -10, 0, 0, -10, -20, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 30, 40, 40, 30, -10, -30],
  [-30, -10, 20, 30, 30, 20, -10, -30],
  [-30, -30, 0, 0, 0, 0, -30, -30],
  [-50, -30, -30, -30, -30, -30, -30, -50]
];

// Helper to check if we are in the endgame (no queens, or major pieces are scarce)
function isEndgame(chess: Chess): boolean {
  let majorPiecesCount = 0;
  chess.board().forEach((row) => {
    row.forEach((square) => {
      if (square && square.type !== "p" && square.type !== "k") {
        majorPiecesCount++;
      }
    });
  });
  return majorPiecesCount <= 4;
}

// Evaluate board from White's perspective
function evaluateBoard(chess: Chess): number {
  let score = 0;
  const board = chess.board();
  const endgame = isEndgame(chess);

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = board[r][c];
      if (!square) continue;

      const type = square.type;
      const color = square.color;
      let pieceValue = PIECE_VALUES[type] || 0;

      // Positional table value
      let posValue = 0;
      // Flip row index for Black table lookup
      const lookupRow = color === "w" ? r : 7 - r;
      const lookupCol = color === "w" ? c : 7 - c;

      switch (type) {
        case "p":
          posValue = PAWN_TABLE[lookupRow][lookupCol];
          break;
        case "n":
          posValue = KNIGHT_TABLE[lookupRow][lookupCol];
          break;
        case "b":
          posValue = BISHOP_TABLE[lookupRow][lookupCol];
          break;
        case "r":
          posValue = ROOK_TABLE[lookupRow][lookupCol];
          break;
        case "q":
          posValue = QUEEN_TABLE[lookupRow][lookupCol];
          break;
        case "k":
          posValue = endgame
            ? KING_END_TABLE[lookupRow][lookupCol]
            : KING_MIDDLE_TABLE[lookupRow][lookupCol];
          break;
      }

      const totalValue = pieceValue + posValue;

      if (color === "w") {
        score += totalValue;
      } else {
        score -= totalValue;
      }
    }
  }

  return score;
}

// Minimax algorithm with alpha-beta pruning
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean
): { score: number; move: string | null } {
  // Base case: terminal node
  if (depth === 0 || chess.isGameOver()) {
    return { score: evaluateBoard(chess), move: null };
  }

  const moves = chess.moves();
  // Sort moves loosely (captures first) to optimize alpha-beta pruning
  moves.sort((a, b) => {
    const aCap = a.includes("x") ? 1 : 0;
    const bCap = b.includes("x") ? 1 : 0;
    return bCap - aCap;
  });

  let bestMove: string | null = null;

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, false).score;
      chess.undo();

      if (evaluation > maxEval) {
        maxEval = evaluation;
        bestMove = move;
      }
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) {
        break; // beta cutoff
      }
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evaluation = minimax(chess, depth - 1, alpha, beta, true).score;
      chess.undo();

      if (evaluation < minEval) {
        minEval = evaluation;
        bestMove = move;
      }
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) {
        break; // alpha cutoff
      }
    }
    return { score: minEval, move: bestMove };
  }
}

/**
 * Computes the best move for the active side.
 * @param fen The current board position in FEN
 * @param difficulty "Easy" | "Medium" | "Hard"
 * @returns The chosen move in string/SAN format
 */
export function getBestMove(fen: string, difficulty: Difficulty): string {
  const chess = new Chess(fen);
  const moves = chess.moves();

  if (moves.length === 0) return "";

  const activeColor = chess.turn();
  const isMaximizing = activeColor === "w";

  // Difficulty configurations:
  // - Easy: Depth 1 + 35% chance to play a completely random legal move or make a tiny blunder
  if (difficulty === "Easy") {
    if (Math.random() < 0.35) {
      const randomIndex = Math.floor(Math.random() * moves.length);
      return moves[randomIndex];
    }
    const result = minimax(chess, 1, -Infinity, Infinity, isMaximizing);
    return result.move || moves[0];
  }

  // - Medium: Depth 2, solid tactical awareness
  if (difficulty === "Medium") {
    // 10% chance to make a slight mistake to simulate human errors
    if (Math.random() < 0.10) {
      const randomIndex = Math.floor(Math.random() * moves.length);
      return moves[randomIndex];
    }
    const result = minimax(chess, 2, -Infinity, Infinity, isMaximizing);
    return result.move || moves[0];
  }

  // - Hard: Depth 3, standard tactical and positional look-ahead (alpha-beta)
  const result = minimax(chess, 3, -Infinity, Infinity, isMaximizing);
  return result.move || moves[0];
}

/**
 * Runs a local engine evaluation on the last move to see if it's a mistake.
 * If the score drop is greater than 150 centipawns (1.5 pawns) and there's a better move,
 * we flag it as a mistake.
 */
export function evaluateMoveQuality(
  fenBefore: string,
  moveMade: string,
  turn: "w" | "b"
): { isMistake: boolean; bestMove: string; scoreDifference: number } {
  const chessBefore = new Chess(fenBefore);
  
  // Best move evaluation
  const isWhite = turn === "w";
  const { score: bestScore, move: bestMove } = minimax(chessBefore, 2, -Infinity, Infinity, isWhite);
  
  if (!bestMove) {
    return { isMistake: false, bestMove: "", scoreDifference: 0 };
  }

  // Execute the move they actually made
  try {
    const chessAfter = new Chess(fenBefore);
    chessAfter.move(moveMade);
    const actualScore = evaluateBoard(chessAfter);
    
    // Calculate centipawn drop
    // If white: high score is good. A drop is bestScore - actualScore.
    // If black: low score is good. A drop is actualScore - bestScore.
    const scoreDiff = isWhite ? (bestScore - actualScore) : (actualScore - bestScore);
    
    // A drop of > 150 centipawns (equivalent to 1.5 pawns) is classed as a mistake.
    // But exclude checkmate / game over positions where move values fluctuate heavily.
    if (scoreDiff > 150 && moveMade !== bestMove && !chessBefore.isGameOver()) {
      return {
        isMistake: true,
        bestMove,
        scoreDifference: scoreDiff,
      };
    }
  } catch (err) {
    console.error("Evaluation move error:", err);
  }

  return { isMistake: false, bestMove, scoreDifference: 0 };
}
