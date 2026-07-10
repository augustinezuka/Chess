import { Chess } from "chess.js";
import { Difficulty } from "../types";

// Piece values for board evaluation (Centipawns)
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Positional tables for White (mirrored for Black lookup)
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

// Transposition Table Entry schema
interface CacheEntry {
  depth: number;
  score: number;
  flag: "exact" | "lowerbound" | "upperbound";
  move: string | null;
}

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

  const whitePawnFiles = new Set<number>();
  const blackPawnFiles = new Set<number>();
  const whitePawnsInCol = [0, 0, 0, 0, 0, 0, 0, 0];
  const blackPawnsInCol = [0, 0, 0, 0, 0, 0, 0, 0];

  let whiteBishops = 0;
  let blackBishops = 0;
  let whiteMaterial = 0;
  let blackMaterial = 0;

  let whiteKingPos = { r: 7, c: 4 };
  let blackKingPos = { r: 0, c: 4 };

  // First pass: collect pawn layouts, piece counts, material aggregates, and king squares
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = board[r][c];
      if (!square) continue;

      const { type, color } = square;
      if (type === "k") {
        if (color === "w") whiteKingPos = { r, c };
        else blackKingPos = { r, c };
        continue;
      }

      const val = PIECE_VALUES[type] || 0;
      if (color === "w") {
        whiteMaterial += val;
        if (type === "p") {
          whitePawnFiles.add(c);
          whitePawnsInCol[c]++;
        } else if (type === "b") {
          whiteBishops++;
        }
      } else {
        blackMaterial += val;
        if (type === "p") {
          blackPawnFiles.add(c);
          blackPawnsInCol[c]++;
        } else if (type === "b") {
          blackBishops++;
        }
      }
    }
  }

  // Base material differences
  score += (whiteMaterial - blackMaterial);

  // Bishop pair bonus
  if (whiteBishops >= 2) score += 50;
  if (blackBishops >= 2) score -= 50;

  // Pawns: Doubled, Isolated, and Passed Pawns
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = board[r][c];
      if (!square || square.type !== "p") continue;

      const { color } = square;

      if (color === "w") {
        // Doubled pawn penalty
        if (whitePawnsInCol[c] > 1) {
          score -= 12;
        }

        // Isolated pawn penalty (no friendly pawns on adjacent columns)
        const hasWhiteLeft = c > 0 && whitePawnsInCol[c - 1] > 0;
        const hasWhiteRight = c < 7 && whitePawnsInCol[c + 1] > 0;
        if (!hasWhiteLeft && !hasWhiteRight) {
          score -= 15;
        }

        // Passed pawn check (no enemy pawns blocking or in adjacent columns ahead)
        let isPassed = true;
        for (let adjacentFile = c - 1; adjacentFile <= c + 1; adjacentFile++) {
          if (adjacentFile < 0 || adjacentFile > 7) continue;
          for (let enemyRow = 0; enemyRow < r; enemyRow++) {
            const enemySquare = board[enemyRow][adjacentFile];
            if (enemySquare && enemySquare.type === "p" && enemySquare.color === "b") {
              isPassed = false;
              break;
            }
          }
          if (!isPassed) break;
        }
        if (isPassed) {
          const rankFromStart = 7 - r; // 1 to 7
          score += rankFromStart * rankFromStart * 4; // Promoted pawns get massive rewards
        }
      } else {
        // Black Doubled pawn penalty
        if (blackPawnsInCol[c] > 1) {
          score += 12;
        }

        // Black Isolated pawn penalty
        const hasBlackLeft = c > 0 && blackPawnsInCol[c - 1] > 0;
        const hasBlackRight = c < 7 && blackPawnsInCol[c + 1] > 0;
        if (!hasBlackLeft && !hasBlackRight) {
          score += 15;
        }

        // Black Passed pawn check
        let isPassed = true;
        for (let adjacentFile = c - 1; adjacentFile <= c + 1; adjacentFile++) {
          if (adjacentFile < 0 || adjacentFile > 7) continue;
          for (let enemyRow = r + 1; enemyRow < 8; enemyRow++) {
            const enemySquare = board[enemyRow][adjacentFile];
            if (enemySquare && enemySquare.type === "p" && enemySquare.color === "w") {
              isPassed = false;
              break;
            }
          }
          if (!isPassed) break;
        }
        if (isPassed) {
          const rankFromStart = r; // 1 to 7
          score -= rankFromStart * rankFromStart * 4;
        }
      }
    }
  }

  // Positional lookup for other non-pawn pieces
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = board[r][c];
      if (!square || square.type === "p") continue;

      const { type, color } = square;

      const lookupRow = color === "w" ? r : 7 - r;
      const lookupCol = color === "w" ? c : 7 - c;

      let posValue = 0;
      switch (type) {
        case "n":
          posValue = KNIGHT_TABLE[lookupRow][lookupCol];
          break;
        case "b":
          posValue = BISHOP_TABLE[lookupRow][lookupCol];
          break;
        case "r":
          posValue = ROOK_TABLE[lookupRow][lookupCol];
          // Rook on open/semi-open files
          const hasWhitePawns = whitePawnFiles.has(c);
          const hasBlackPawns = blackPawnFiles.has(c);
          if (!hasWhitePawns && !hasBlackPawns) {
            posValue += 25; // Open file
          } else if ((color === "w" && !hasWhitePawns) || (color === "b" && !hasBlackPawns)) {
            posValue += 12; // Semi-open file
          }
          // Rook on 7th Rank (rank index 1 for White, rank index 6 for Black)
          if (color === "w" && r === 1) posValue += 35;
          if (color === "b" && r === 6) posValue += 35;
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

      if (color === "w") {
        score += posValue;
      } else {
        score -= posValue;
      }
    }
  }

  // King Shield & Development penalties during Middlegame
  if (!endgame) {
    // Piece development: Penalize undeveloped minor pieces
    // White Knights on starting squares
    if (board[7][1] && board[7][1].type === "n" && board[7][1].color === "w") score -= 15;
    if (board[7][6] && board[7][6].type === "n" && board[7][6].color === "w") score -= 15;
    // White Bishops on starting squares
    if (board[7][2] && board[7][2].type === "b" && board[7][2].color === "w") score -= 15;
    if (board[7][5] && board[7][5].type === "b" && board[7][5].color === "w") score -= 15;

    // Black Knights on starting squares
    if (board[0][1] && board[0][1].type === "n" && board[0][1].color === "b") score += 15;
    if (board[0][6] && board[0][6].type === "n" && board[0][6].color === "b") score += 15;
    // Black Bishops on starting squares
    if (board[0][2] && board[0][2].type === "b" && board[0][2].color === "b") score += 15;
    if (board[0][5] && board[0][5].type === "b" && board[0][5].color === "b") score += 15;

    // King Shield evaluation
    // White King safety
    if (whiteKingPos.r === 7) {
      if (whiteKingPos.c >= 5) { // Kingside castled
        const shield = [board[6][5], board[6][6], board[6][7]];
        shield.forEach((sq) => {
          if (!sq || sq.type !== "p" || sq.color !== "w") score -= 20;
        });
      } else if (whiteKingPos.c <= 2) { // Queenside castled
        const shield = [board[6][0], board[6][1], board[6][2]];
        shield.forEach((sq) => {
          if (!sq || sq.type !== "p" || sq.color !== "w") score -= 20;
        });
      }
    }

    // Black King safety
    if (blackKingPos.r === 0) {
      if (blackKingPos.c >= 5) { // Kingside castled
        const shield = [board[1][5], board[1][6], board[1][7]];
        shield.forEach((sq) => {
          if (!sq || sq.type !== "p" || sq.color !== "b") score += 20;
        });
      } else if (blackKingPos.c <= 2) { // Queenside castled
        const shield = [board[1][0], board[1][1], board[1][2]];
        shield.forEach((sq) => {
          if (!sq || sq.type !== "p" || sq.color !== "b") score += 20;
        });
      }
    }
  }

  // Endgame Mop-Up (Cornering & King closeness when winning)
  if (endgame) {
    const materialDiff = whiteMaterial - blackMaterial;
    if (materialDiff >= 300) {
      // White is winning: push Black King to the corners/edges
      const distFromCenter = Math.max(Math.abs(3.5 - blackKingPos.c), Math.abs(3.5 - blackKingPos.r));
      score += Math.floor(distFromCenter * 15);
      // Bring White King closer to Black King
      const manhattanDistance = Math.abs(whiteKingPos.r - blackKingPos.r) + Math.abs(whiteKingPos.c - blackKingPos.c);
      score += (14 - manhattanDistance) * 8;
    } else if (materialDiff <= -300) {
      // Black is winning: push White King to the corners/edges
      const distFromCenter = Math.max(Math.abs(3.5 - whiteKingPos.c), Math.abs(3.5 - whiteKingPos.r));
      score -= Math.floor(distFromCenter * 15);
      // Bring Black King closer to White King
      const manhattanDistance = Math.abs(whiteKingPos.r - blackKingPos.r) + Math.abs(whiteKingPos.c - blackKingPos.c);
      score -= (14 - manhattanDistance) * 8;
    }
  }

  return score;
}

const MVV_LVA_VALUES: Record<string, number> = {
  p: 1,
  n: 2,
  b: 3,
  r: 4,
  q: 5,
  k: 6,
};

// Order moves for maximum alpha-beta pruning efficiency
function sortVerboseMoves(moves: any[]) {
  moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Checkmate & Check priority (from SAN strings if available)
    if (a.san && a.san.endsWith("#")) scoreA += 10000;
    if (b.san && b.san.endsWith("#")) scoreB += 10000;
    if (a.san && a.san.endsWith("+")) scoreA += 1000;
    if (b.san && b.san.endsWith("+")) scoreB += 1000;

    // Captures (MVV-LVA: Most Valuable Victim - Least Valuable Assailant)
    if (a.captured) {
      scoreA += 100 * (MVV_LVA_VALUES[a.captured] || 1) - (MVV_LVA_VALUES[a.piece] || 1) + 100;
    }
    if (b.captured) {
      scoreB += 100 * (MVV_LVA_VALUES[b.captured] || 1) - (MVV_LVA_VALUES[b.piece] || 1) + 100;
    }

    // Promotions
    if (a.promotion) scoreA += 500;
    if (b.promotion) scoreB += 500;

    // Castling
    if (a.flags && (a.flags.includes("k") || a.flags.includes("q"))) scoreA += 50;
    if (b.flags && (b.flags.includes("k") || b.flags.includes("q"))) scoreB += 50;

    return scoreB - scoreA;
  });
}

// Quiescence search prevents the horizon effect by evaluating tactical exchanges fully
function quiescence(
  chess: Chess,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean,
  qDepth: number = 0
): number {
  const standPat = evaluateBoard(chess);
  
  if (qDepth >= 4) {
    return standPat;
  }

  if (isMaximizingPlayer) {
    if (standPat >= beta) {
      return beta;
    }
    alpha = Math.max(alpha, standPat);

    const moves = chess.moves({ verbose: true }).filter(m => m.captured);
    sortVerboseMoves(moves);

    for (const move of moves) {
      chess.move({ from: move.from, to: move.to, promotion: move.promotion });
      const score = quiescence(chess, alpha, beta, false, qDepth + 1);
      chess.undo();

      if (score >= beta) {
        return beta;
      }
      alpha = Math.max(alpha, score);
    }
    return alpha;
  } else {
    if (standPat <= alpha) {
      return alpha;
    }
    beta = Math.min(beta, standPat);

    const moves = chess.moves({ verbose: true }).filter(m => m.captured);
    sortVerboseMoves(moves);

    for (const move of moves) {
      chess.move({ from: move.from, to: move.to, promotion: move.promotion });
      const score = quiescence(chess, alpha, beta, true, qDepth + 1);
      chess.undo();

      if (score <= alpha) {
        return alpha;
      }
      beta = Math.min(beta, score);
    }
    return beta;
  }
}

// Minimax algorithm with alpha-beta pruning, Quiescence search, and Transposition Table memoization
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizingPlayer: boolean,
  memo: Map<string, CacheEntry>
): { score: number; move: string | null } {
  const fen = chess.fen();
  const cached = memo.get(fen);

  // Transposition table lookup
  if (cached && cached.depth >= depth) {
    if (cached.flag === "exact") {
      return { score: cached.score, move: cached.move };
    }
    if (cached.flag === "lowerbound" && cached.score >= beta) {
      return { score: cached.score, move: cached.move };
    }
    if (cached.flag === "upperbound" && cached.score <= alpha) {
      return { score: cached.score, move: cached.move };
    }
  }

  // Base case: terminal node
  if (chess.isGameOver()) {
    if (chess.isCheckmate()) {
      const mateScore = 100000 + depth;
      return { score: chess.turn() === "w" ? -mateScore : mateScore, move: null };
    }
    return { score: 0, move: null };
  }

  if (depth === 0) {
    return { score: quiescence(chess, alpha, beta, isMaximizingPlayer), move: null };
  }

  const verboseMoves = chess.moves({ verbose: true });
  if (verboseMoves.length === 0) {
    return { score: evaluateBoard(chess), move: null };
  }

  // Move ordering: put the cached best move first to trigger fast alpha-beta pruning cutoffs
  if (cached && cached.move) {
    const cachedMoveIndex = verboseMoves.findIndex(m => m.san === cached.move);
    if (cachedMoveIndex > -1) {
      const [m] = verboseMoves.splice(cachedMoveIndex, 1);
      verboseMoves.unshift(m);
    }
  }

  sortVerboseMoves(verboseMoves);

  let bestMove: string | null = null;
  const originalAlpha = alpha;

  if (isMaximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of verboseMoves) {
      chess.move({ from: move.from, to: move.to, promotion: move.promotion });
      const evaluation = minimax(chess, depth - 1, alpha, beta, false, memo).score;
      chess.undo();

      if (evaluation > maxEval) {
        maxEval = evaluation;
        bestMove = move.san;
      }
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) {
        break; // beta cutoff
      }
    }

    // Save search result to Transposition table
    let flag: "exact" | "lowerbound" | "upperbound" = "exact";
    if (maxEval <= originalAlpha) flag = "upperbound";
    else if (maxEval >= beta) flag = "lowerbound";
    memo.set(fen, { depth, score: maxEval, flag, move: bestMove });

    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const move of verboseMoves) {
      chess.move({ from: move.from, to: move.to, promotion: move.promotion });
      const evaluation = minimax(chess, depth - 1, alpha, beta, true, memo).score;
      chess.undo();

      if (evaluation < minEval) {
        minEval = evaluation;
        bestMove = move.san;
      }
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) {
        break; // alpha cutoff
      }
    }

    // Save search result to Transposition table
    let flag: "exact" | "lowerbound" | "upperbound" = "exact";
    if (minEval <= alpha) flag = "upperbound";
    else if (minEval >= beta) flag = "lowerbound";
    memo.set(fen, { depth, score: minEval, flag, move: bestMove });

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

  // --- Dynamic Opening Book ---
  // If starting position, randomly pick a standard solid opening move
  const startingFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  if (fen === startingFen) {
    const commonWhiteOpenings = ["e4", "d4", "Nf3", "c4"];
    return commonWhiteOpenings[Math.floor(Math.random() * commonWhiteOpenings.length)];
  }

  // If Black's very first reply to e4 or d4, offer standard thematic defenses
  if (chess.history().length === 1 && activeColor === "b") {
    const whiteMove = chess.history()[0];
    if (whiteMove === "e4") {
      const responses = ["c5", "e5", "e6", "c6"]; // Sicilian, Open Game, French, Caro-Kann
      return responses[Math.floor(Math.random() * responses.length)];
    }
    if (whiteMove === "d4") {
      const responses = ["Nf6", "d5", "e6"]; // Indian Defense, Queen's Gambit reply, Nimzo / Dutch prep
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // --- Difficulty / Depth Configurations ---
  let targetDepth = 1;
  let errorRate = 0;

  if (difficulty === "Easy") {
    targetDepth = 1;
    errorRate = 0.35;
  } else if (difficulty === "Medium") {
    targetDepth = 2;
    errorRate = 0.10;
  } else {
    targetDepth = 3;
    errorRate = 0;
  }

  // Error rate chance of picking a completely random legal move (simulates blunder/mistake)
  if (Math.random() < errorRate) {
    const randomIndex = Math.floor(Math.random() * moves.length);
    return moves[randomIndex];
  }

  // --- Fast Single-Pass Iterative Deepening Search ---
  const memo = new Map<string, CacheEntry>();
  let bestMove = moves[0];

  for (let d = 1; d <= targetDepth; d++) {
    const result = minimax(chess, d, -Infinity, Infinity, isMaximizing, memo);
    if (result.move) {
      bestMove = result.move;
    }
  }

  return bestMove;
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
  
  // Best move evaluation with cache memoization
  const isWhite = turn === "w";
  const memo = new Map<string, CacheEntry>();
  const { score: bestScore, move: bestMove } = minimax(chessBefore, 2, -Infinity, Infinity, isWhite, memo);
  
  if (!bestMove) {
    return { isMistake: false, bestMove: "", scoreDifference: 0 };
  }

  // Execute the move they actually made
  try {
    const chessAfter = new Chess(fenBefore);
    chessAfter.move(moveMade);
    const actualScore = evaluateBoard(chessAfter);
    
    // Calculate centipawn drop
    const scoreDiff = isWhite ? (bestScore - actualScore) : (actualScore - bestScore);
    
    // A drop of > 150 centipawns is classed as a mistake.
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
