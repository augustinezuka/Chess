export type GameMode = "local" | "ai";

export type ChessColor = "w" | "b";

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface GameTimer {
  initialMinutes: number;
  incrementSeconds: number;
  label: string;
}

export interface PlayerTimerState {
  whiteTime: number; // in milliseconds
  blackTime: number; // in milliseconds
  isActive: boolean;
  timeLimitExceeded: ChessColor | null;
}

export interface MoveRecord {
  san: string;
  from: string;
  to: string;
  piece: string;
  color: ChessColor;
  captured?: string;
  promotion?: string;
  grade?: "book" | "excellent" | "good" | "inaccuracy" | "mistake" | "check" | "capture" | "castle" | "promotion";
}

export interface AiHint {
  motif: string;
  subtleHint: string;
  recommendedMove: string;
  explanation: string;
}

export interface MistakeRecord {
  moveIndex: number;
  moveNumber: number;
  turn: ChessColor;
  moveMade: string;
  recommendedMove: string;
  fenBefore: string;
  explanation?: {
    whyMistake: string;
    howExploited: string;
    whyBetter: string;
    educationalRule: string;
  };
}

export interface TacticalPuzzle {
  description: string;
  correctMove: string;
  solutionExplanation: string;
}

export interface PostGameAnalysis {
  openingName: string;
  performanceGrade: string;
  strategicTakeaway: string;
  whiteStrengths: string[];
  whiteWeaknesses: string[];
  blackStrengths: string[];
  blackWeaknesses: string[];
  tacticalPuzzle: TacticalPuzzle;
}

export interface SavedGame {
  id: string;
  date: string;
  mode: GameMode;
  difficulty?: Difficulty;
  winner: ChessColor | "draw" | null;
  moves: string[];
  mistakes: MistakeRecord[];
  analysis?: PostGameAnalysis;
  timers?: {
    whiteInitial: number;
    blackInitial: number;
    whiteRemaining: number;
    blackRemaining: number;
  };
}

export interface TacticalLesson {
  id: string;
  title: string;
  motif: string;
  description: string;
  fen: string; // FEN for the puzzle board
  targetMove: string; // The correct chess move in SAN (e.g. "Qxf7#", "Nxf7")
  hint: string;
  explanation: string;
}
