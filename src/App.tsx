import React, { useState, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { ChessPiece } from "./components/ChessPiece";
import { getBestMove, evaluateMoveQuality } from "./lib/chessEngine";
import { TACTICAL_LESSONS } from "./data/tacticalLessons";
import { CHESS_OPENINGS, detectOpening } from "./data/chessOpenings";
import {
  Play,
  Pause,
  RotateCcw,
  HelpCircle,
  Trophy,
  Sparkles,
  BookOpen,
  Clock,
  AlertTriangle,
  Check,
  User,
  Cpu,
  ChevronRight,
  ChevronLeft,
  Save,
  Trash2,
  Undo2,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
  Compass
} from "lucide-react";
import {
  GameMode,
  ChessColor,
  Difficulty,
  PlayerTimerState,
  MoveRecord,
  AiHint,
  MistakeRecord,
  PostGameAnalysis,
  SavedGame,
  TacticalLesson
} from "./types";

export default function App() {
  // Navigation Tabs
  // "play" -> Active match screen
  // "lessons" -> Tactical puzzles trainer
  // "saved" -> Replay & Review center
  // "openings" -> Interactive Opening & Tactics Explorer
  const [activeTab, setActiveTab] = useState<"play" | "lessons" | "saved" | "openings">("play");

  // --- Chess Openings Explorer State ---
  const [selectedOpening, setSelectedOpening] = useState<any>(CHESS_OPENINGS[0]);
  const [openingMoveIndex, setOpeningMoveIndex] = useState<number>(0);
  const [isOpeningAutoPlaying, setIsOpeningAutoPlaying] = useState<boolean>(false);
  const [openingPracticeMode, setOpeningPracticeMode] = useState<boolean>(false);
  const [openingPracticeStep, setOpeningPracticeStep] = useState<number>(0);
  const [openingPracticeFeedback, setOpeningPracticeFeedback] = useState<string>("");
  const [openingSelectedSquare, setOpeningSelectedSquare] = useState<string | null>(null);
  const [openingValidDestinations, setOpeningValidDestinations] = useState<string[]>([]);
  const [openingSearchQuery, setOpeningSearchQuery] = useState<string>("");
  const [selectedOpeningCategory, setSelectedOpeningCategory] = useState<string>("All");

  // Mobile sidebar drawers state
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);


  // Game Settings State
  const [gameMode, setGameMode] = useState<GameMode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [playerColor, setPlayerColor] = useState<ChessColor>("w");
  const [timeControl, setTimeControl] = useState<string>("10m"); // Options: "3m", "5m", "10m", "15m + 10s", "None"

  // Game Engine & Board State
  const [game, setGame] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [isBoardFlipped, setIsBoardFlipped] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validDestinations, setValidDestinations] = useState<string[]>([]);
  const [promotionState, setPromotionState] = useState<{ from: string; to: string } | null>(null);

  // Active Move History log for the sidebar
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);

  // Timer State
  const [timerState, setTimerState] = useState<PlayerTimerState>({
    whiteTime: 10 * 60 * 1000,
    blackTime: 10 * 60 * 1000,
    isActive: false,
    timeLimitExceeded: null,
  });

  // AI Opponent Thinking State
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Gemini AI Hint States
  const [currentHint, setCurrentHint] = useState<AiHint | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [showFullHint, setShowFullHint] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);

  // Live Mistake Logging
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);

  // Post-Game Analysis State
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [postGameAnalysis, setPostGameAnalysis] = useState<PostGameAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [customPuzzleSolved, setCustomPuzzleSolved] = useState<boolean | null>(null);
  const [customPuzzleGuess, setCustomPuzzleGuess] = useState("");

  // Saved Games List
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [selectedSavedGame, setSelectedSavedGame] = useState<SavedGame | null>(null);
  const [reviewMoveIndex, setReviewMoveIndex] = useState<number>(0);
  const [reviewBoard, setReviewBoard] = useState<Chess | null>(null);

  // Tactical Lessons Mode State
  const [selectedLesson, setSelectedLesson] = useState<TacticalLesson | null>(null);
  const [lessonBoard, setLessonBoard] = useState<Chess | null>(null);
  const [lessonFen, setLessonFen] = useState("");
  const [lessonSelectedSquare, setLessonSelectedSquare] = useState<string | null>(null);
  const [lessonValidDestinations, setLessonValidDestinations] = useState<string[]>([]);
  const [lessonStatus, setLessonStatus] = useState<"unstarted" | "wrong" | "solved">("unstarted");
  const [lessonFeedback, setLessonFeedback] = useState("");
  const [lessonHintRevealed, setLessonHintRevealed] = useState(false);

  // Board Centipawn Advantage evaluation (simulated dynamically from board state)
  const [advantageVal, setAdvantageVal] = useState<number>(0.0);

  // Game End reasons and overlay triggers
  const [gameEndedReason, setGameEndedReason] = useState<"checkmate" | "draw" | "stalemate" | "timeout" | "resignation" | null>(null);
  const [showGameOverOverlay, setShowGameOverOverlay] = useState(false);

  // Danger Vision & Special Rules Help Center
  const [isDangerVisionEnabled, setIsDangerVisionEnabled] = useState(false);
  const [selectedRulesTab, setSelectedRulesTab] = useState<"castling" | "enpassant" | "promotion">("castling");
  const [isRulesPanelExpanded, setIsRulesPanelExpanded] = useState(true);

  // References
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- Initial Mount & LocalStorage loading ---
  useEffect(() => {
    loadSavedGames();
  }, []);

  const loadSavedGames = () => {
    try {
      const stored = localStorage.getItem("chess_trainer_games");
      if (stored) {
        setSavedGames(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load saved games:", err);
    }
  };

  // --- Initialize Clocks on Time Control selection ---
  useEffect(() => {
    resetClocks();
  }, [timeControl]);

  const resetClocks = () => {
    let initialMs = 10 * 60 * 1000; // 10m default
    if (timeControl === "3m") initialMs = 3 * 60 * 1000;
    else if (timeControl === "5m") initialMs = 5 * 60 * 1000;
    else if (timeControl === "15m + 10s") initialMs = 15 * 60 * 1000;

    setTimerState({
      whiteTime: initialMs,
      blackTime: initialMs,
      isActive: false,
      timeLimitExceeded: null,
    });
  };

  // --- Countdown Clocks Effect ---
  useEffect(() => {
    if (timerState.isActive && !game.isGameOver() && timeControl !== "None") {
      timerIntervalRef.current = setInterval(() => {
        setTimerState((prev) => {
          const isWhiteTurn = game.turn() === "w";
          const newWhiteTime = isWhiteTurn ? Math.max(0, prev.whiteTime - 100) : prev.whiteTime;
          const newBlackTime = !isWhiteTurn ? Math.max(0, prev.blackTime - 100) : prev.blackTime;

          let exceeded: ChessColor | null = null;
          if (newWhiteTime <= 0) {
            exceeded = "w";
          } else if (newBlackTime <= 0) {
            exceeded = "b";
          }

          if (exceeded) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            return {
              ...prev,
              whiteTime: newWhiteTime,
              blackTime: newBlackTime,
              isActive: false,
              timeLimitExceeded: exceeded,
            };
          }

          return {
            ...prev,
            whiteTime: newWhiteTime,
            blackTime: newBlackTime,
          };
        });
      }, 100);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerState.isActive, fen, timeControl, game]);

  // --- Game Over Detection & Auto Handling ---
  useEffect(() => {
    if (game.isGameOver()) {
      let reason: "checkmate" | "draw" | "stalemate" | "timeout" | "resignation" = "checkmate";
      if (game.isStalemate()) {
        reason = "stalemate";
      } else if (game.isDraw()) {
        reason = "draw";
      }
      setGameEndedReason(reason);
      setTimerState((prev) => (prev.isActive ? { ...prev, isActive: false } : prev));
      setShowGameOverOverlay(true);
    } else if (timerState.timeLimitExceeded) {
      setGameEndedReason("timeout");
      setShowGameOverOverlay(true);
    } else {
      if (gameEndedReason !== "resignation") {
        setGameEndedReason(null);
        setShowGameOverOverlay(false);
      }
    }
  }, [fen, timerState.timeLimitExceeded]);

  // --- Handle Time control increments ---
  const handleMoveIncrement = (color: ChessColor) => {
    if (timeControl !== "15m + 10s") return;
    setTimerState((prev) => ({
      ...prev,
      whiteTime: color === "w" ? prev.whiteTime + 10000 : prev.whiteTime,
      blackTime: color === "b" ? prev.blackTime + 10000 : prev.blackTime,
    }));
  };

  // --- Trigger Chess AI Move ---
  useEffect(() => {
    const isAiTurn =
      gameMode === "ai" &&
      ((playerColor === "w" && game.turn() === "b") || (playerColor === "b" && game.turn() === "w"));

    if (isAiTurn && !game.isGameOver() && !timerState.timeLimitExceeded) {
      setIsAiThinking(true);
      // Run AI minimax move computation on a short timeout to prevent UI freezing
      const aiTimer = setTimeout(() => {
        try {
          const currentFen = game.fen();
          const bestMoveSan = getBestMove(currentFen, difficulty);
          if (bestMoveSan) {
            const turnBefore = game.turn();
            const fenBefore = game.fen();
            const resultMove = game.move(bestMoveSan);

            if (resultMove) {
              setFen(game.fen());
              handleMoveIncrement(turnBefore);
              updateMoveLogs(resultMove);
              calculateAdvantage(game);

              // Evaluate if the AI made a mistake (unlikely on Hard, possible on Medium/Easy)
              const evaluation = evaluateMoveQuality(fenBefore, resultMove.san, turnBefore);
              if (evaluation.isMistake) {
                logMistake(resultMove.san, evaluation.bestMove, fenBefore, turnBefore);
              }
            }
          }
        } catch (err) {
          console.error("AI error executing move:", err);
        } finally {
          setIsAiThinking(false);
        }
      }, 600);

      return () => clearTimeout(aiTimer);
    }
  }, [fen, gameMode, playerColor, difficulty]);

  // --- Update advantage bar from current board state ---
  const calculateAdvantage = (chessObj: Chess) => {
    let score = 0;
    chessObj.board().forEach((row) => {
      row.forEach((sq) => {
        if (sq) {
          const valMap: Record<string, number> = { p: 1, n: 3, b: 3.25, r: 5, q: 9, k: 0 };
          const pVal = valMap[sq.type] || 0;
          score += sq.color === "w" ? pVal : -pVal;
        }
      });
    });
    setAdvantageVal(Number(score.toFixed(1)));
  };

  // --- Move logging and updating ---
  const updateMoveLogs = (move: any) => {
    const moveRec: MoveRecord = {
      san: move.san,
      from: move.from,
      to: move.to,
      piece: move.piece,
      color: move.color,
      captured: move.captured,
      promotion: move.promotion,
    };
    setMoveHistory((prev) => [...prev, moveRec]);
  };

  // --- Background mistake notes logger ---
  const logMistake = async (
    moveMade: string,
    recommendedMove: string,
    fenBefore: string,
    turn: ChessColor
  ) => {
    const nextIndex = mistakes.length;
    const moveNum = Math.floor(moveHistory.length / 2) + 1;

    // Create a skeleton mistake record first so it loads on screen immediately
    const skeleton: MistakeRecord = {
      moveIndex: moveHistory.length,
      moveNumber: moveNum,
      turn,
      moveMade,
      recommendedMove,
      fenBefore,
    };

    setMistakes((prev) => [...prev, skeleton]);

    // Fetch deep explanation from Gemini AI
    try {
      const response = await fetch("/api/gemini/explain-mistake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fenBefore, moveMade, recommendedMove, turn }),
      });

      if (response.ok) {
        const explanationData = await response.json();
        setMistakes((prev) => {
          const copy = [...prev];
          const matched = copy.findIndex((m) => m.fenBefore === fenBefore && m.moveMade === moveMade);
          if (matched !== -1) {
            copy[matched].explanation = explanationData;
          }
          return copy;
        });
      }
    } catch (err) {
      console.error("Failed to explain mistake via Gemini:", err);
    }
  };

  // --- Reset Entire Match ---
  const handleRestartMatch = () => {
    setIsLeftSidebarOpen(false);
    setIsRightSidebarOpen(false);
    const newG = new Chess();
    setGame(newG);
    setFen(newG.fen());
    setMoveHistory([]);
    setSelectedSquare(null);
    setValidDestinations([]);
    setMistakes([]);
    setPostGameAnalysis(null);
    setCustomPuzzleSolved(null);
    setCustomPuzzleGuess("");
    setCurrentHint(null);
    setAdvantageVal(0);
    setGameEndedReason(null);
    setShowGameOverOverlay(false);
    resetClocks();
    
    // Automatically flip board for black if they play black vs AI
    if (gameMode === "ai" && playerColor === "b") {
      setIsBoardFlipped(true);
    } else {
      setIsBoardFlipped(false);
    }
  };

  // --- Interactive Move Handling ---
  const handleSquareClick = (square: string) => {
    // Check if game is completed or AI is thinking
    if (game.isGameOver() || isAiThinking || timerState.timeLimitExceeded) return;

    // Prevent player from moving AI's pieces in AI mode
    if (gameMode === "ai") {
      const turnColor = game.turn();
      if (turnColor !== playerColor) return;
    }

    const piece = game.get(square as any);

    // If a valid destination is clicked, execute the move!
    if (selectedSquare && validDestinations.includes(square)) {
      // Check for pawn promotion
      const selectedPiece = game.get(selectedSquare as any);
      const isPawn = selectedPiece?.type === "p";
      const isPromotionRank = square.endsWith("8") || square.endsWith("1");

      if (isPawn && isPromotionRank) {
        setPromotionState({ from: selectedSquare, to: square });
        return;
      }

      executePlayerMove(selectedSquare, square);
      return;
    }

    // Select piece
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
      const legalMoves = game.moves({ square: square as any, verbose: true }) as any[];
      setValidDestinations(legalMoves.map((m) => m.to));
    } else {
      setSelectedSquare(null);
      setValidDestinations([]);
    }
  };

  const executePlayerMove = (from: string, to: string, promotion: string = "q") => {
    const turnBefore = game.turn();
    const fenBefore = game.fen();

    try {
      const moveResult = game.move({ from, to, promotion });
      if (moveResult) {
        setFen(game.fen());
        setSelectedSquare(null);
        setValidDestinations([]);
        setPromotionState(null);
        handleMoveIncrement(turnBefore);
        updateMoveLogs(moveResult);
        calculateAdvantage(game);

        // Turn on clocks on first moves
        if (moveHistory.length === 0 && timeControl !== "None") {
          setTimerState((prev) => ({ ...prev, isActive: true }));
        }

        // Evaluate move quality in background
        const qualityEval = evaluateMoveQuality(fenBefore, moveResult.san, turnBefore);
        if (qualityEval.isMistake) {
          logMistake(moveResult.san, qualityEval.bestMove, fenBefore, turnBefore);
        }
      }
    } catch (err) {
      console.error("Invalid move:", err);
    }
  };

  // --- Undo Move ---
  const handleUndo = () => {
    if (isAiThinking || moveHistory.length === 0) return;

    if (gameMode === "ai") {
      // Undo 2 moves (AI move and Player move)
      if (moveHistory.length >= 2) {
        game.undo();
        game.undo();
        setMoveHistory((prev) => prev.slice(0, -2));
        setMistakes((prev) => prev.filter((m) => m.moveIndex < moveHistory.length - 2));
      } else {
        // Just undo 1
        game.undo();
        setMoveHistory((prev) => prev.slice(0, -1));
        setMistakes((prev) => prev.filter((m) => m.moveIndex < moveHistory.length - 1));
      }
    } else {
      // PvP mode: undo 1 move
      game.undo();
      setMoveHistory((prev) => prev.slice(0, -1));
      setMistakes((prev) => prev.filter((m) => m.moveIndex < moveHistory.length - 1));
    }

    setFen(game.fen());
    setSelectedSquare(null);
    setValidDestinations([]);
    calculateAdvantage(game);
  };

  // --- Get Tactical Hint from Gemini AI ---
  const handleRequestHint = async () => {
    if (game.isGameOver() || isAiThinking) return;

    setLoadingHint(true);
    setHintError(null);
    setShowFullHint(false);

    try {
      const response = await fetch("/api/gemini/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fen: game.fen(),
          moveHistory: moveHistory.map((m) => m.san),
          turn: game.turn(),
          difficulty,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to load coaching advice from server.");
      }

      const data = await response.json();
      setCurrentHint(data);
    } catch (err: any) {
      setHintError(err.message || "Something went wrong fetching the hint.");
    } finally {
      setLoadingHint(false);
    }
  };

  // --- Post Match Game Analysis ---
  const handleRequestAnalysis = async (forcedWinner?: "w" | "b" | "draw") => {
    setLoadingAnalysis(true);
    setAnalysisError(null);
    setCustomPuzzleSolved(null);
    setCustomPuzzleGuess("");

    let winnerName: "w" | "b" | "draw" | null = forcedWinner || null;
    if (!winnerName) {
      if (game.isCheckmate()) {
        winnerName = game.turn() === "w" ? "b" : "w"; // checkmated side loses
      } else if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition()) {
        winnerName = "draw";
      } else if (timerState.timeLimitExceeded) {
        winnerName = timerState.timeLimitExceeded === "w" ? "b" : "w";
      }
    }

    try {
      const response = await fetch("/api/gemini/post-game-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moves: moveHistory.map((m) => m.san),
          winner: winnerName,
          gameMode,
          mistakes,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to reach post-game analyst.");
      }

      const analysisData = await response.json();
      setPostGameAnalysis(analysisData);

      // Auto save match to local storage when analysis is loaded
      saveMatch(analysisData, winnerName);
    } catch (err: any) {
      setAnalysisError(err.message || "Failed to generate AI coaching report.");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // --- Save match to Local Storage ---
  const saveMatch = (analysisReport?: PostGameAnalysis, winnerSide?: "w" | "b" | "draw" | null) => {
    const matchId = `match_${Date.now()}`;
    const newSaved: SavedGame = {
      id: matchId,
      date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
      mode: gameMode,
      difficulty: gameMode === "ai" ? difficulty : undefined,
      winner: winnerSide || null,
      moves: moveHistory.map((m) => m.san),
      mistakes,
      analysis: analysisReport,
    };

    const updated = [newSaved, ...savedGames];
    setSavedGames(updated);
    localStorage.setItem("chess_trainer_games", JSON.stringify(updated));
  };

  // --- Delete Saved Match ---
  const handleDeleteSavedGame = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedGames.filter((g) => g.id !== id);
    setSavedGames(updated);
    localStorage.setItem("chess_trainer_games", JSON.stringify(updated));
    if (selectedSavedGame?.id === id) {
      setSelectedSavedGame(null);
    }
  };

  // --- Manual Resignation ---
  const handleResign = () => {
    if (game.isGameOver() || timerState.timeLimitExceeded || gameEndedReason) return;
    const confirmResign = window.confirm("Are you sure you want to resign?");
    if (confirmResign) {
      setTimerState((prev) => ({ ...prev, isActive: false }));
      const loser = gameMode === "ai" ? playerColor : game.turn();
      const winner = loser === "w" ? "b" : "w";
      setGameEndedReason("resignation");
      setShowGameOverOverlay(true);
      handleRequestAnalysis(winner);
    }
  };

  // --- Offer Draw ---
  const handleOfferDraw = () => {
    if (game.isGameOver() || timerState.timeLimitExceeded || gameEndedReason) return;
    if (gameMode === "ai") {
      // AI accepts / declines based on positional evaluation
      if (Math.abs(advantageVal) < 1.0) {
        alert("The Chess AI accepts your draw offer!");
        setTimerState((prev) => ({ ...prev, isActive: false }));
        setGameEndedReason("draw");
        setShowGameOverOverlay(true);
        handleRequestAnalysis("draw");
      } else {
        alert("The Chess AI declines the draw offer. Fight on!");
      }
    } else {
      const pvpAccept = window.confirm("Opponent offered a draw. Do you accept?");
      if (pvpAccept) {
        setTimerState((prev) => ({ ...prev, isActive: false }));
        setGameEndedReason("draw");
        setShowGameOverOverlay(true);
        handleRequestAnalysis("draw");
      }
    }
  };

  // --- View Saved Match Replay ---
  const handleSelectSavedGame = (saved: SavedGame) => {
    setSelectedSavedGame(saved);
    setIsLeftSidebarOpen(false);
    setIsRightSidebarOpen(false);
    const revChess = new Chess();
    // Load moves sequentially
    saved.moves.forEach((mv) => {
      try {
        revChess.move(mv);
      } catch (e) {
        console.error("Replay load error:", e);
      }
    });

    setReviewBoard(revChess);
    setReviewMoveIndex(saved.moves.length);
    setActiveTab("saved");
  };

  const handleReviewMoveStep = (step: number) => {
    if (!selectedSavedGame) return;
    const targetIndex = reviewMoveIndex + step;
    if (targetIndex < 0 || targetIndex > selectedSavedGame.moves.length) return;

    const rChess = new Chess();
    for (let i = 0; i < targetIndex; i++) {
      try {
        rChess.move(selectedSavedGame.moves[i]);
      } catch (err) {
        console.error("Error setting up replay step:", err);
      }
    }
    setReviewBoard(rChess);
    setReviewMoveIndex(targetIndex);
  };

  // --- Custom Puzzle solver ---
  const handleCheckCustomPuzzle = () => {
    if (!postGameAnalysis) return;
    const correct = postGameAnalysis.tacticalPuzzle.correctMove.toLowerCase().trim();
    const guess = customPuzzleGuess.toLowerCase().trim();

    if (guess === correct || correct.includes(guess) && guess.length > 1) {
      setCustomPuzzleSolved(true);
    } else {
      setCustomPuzzleSolved(false);
    }
  };

  // --- Tactical Lessons (Puzzles) Handling ---
  const handleSelectLesson = (lesson: TacticalLesson) => {
    setSelectedLesson(lesson);
    setIsLeftSidebarOpen(false);
    setIsRightSidebarOpen(false);
    const lChess = new Chess(lesson.fen);
    setLessonBoard(lChess);
    setLessonFen(lChess.fen());
    setLessonSelectedSquare(null);
    setLessonValidDestinations([]);
    setLessonStatus("unstarted");
    setLessonFeedback("");
    setLessonHintRevealed(false);
    setActiveTab("lessons");
  };

  const handleLessonSquareClick = (square: string) => {
    if (!lessonBoard || lessonStatus === "solved") return;

    // Check if clicked square is destination
    if (lessonSelectedSquare && lessonValidDestinations.includes(square)) {
      // Find what the move notation is
      const moves = lessonBoard.moves({ square: lessonSelectedSquare as any, verbose: true }) as any[];
      const matchedMove = moves.find((m) => m.to === square);

      if (matchedMove) {
        const playedSan = matchedMove.san;
        // Try playing it on a copy to verify
        const testBoard = new Chess(lessonBoard.fen());
        try {
          testBoard.move(playedSan);
          // Check if matches target
          if (playedSan.toLowerCase() === selectedLesson?.targetMove.toLowerCase()) {
            lessonBoard.move(playedSan);
            setLessonFen(lessonBoard.fen());
            setLessonStatus("solved");
            setLessonFeedback("Correct! You found the winning tactical combination.");
            setLessonSelectedSquare(null);
            setLessonValidDestinations([]);
          } else {
            setLessonStatus("wrong");
            setLessonFeedback(`Incorrect. ${playedSan} is not the optimal tactical move. Try again!`);
          }
        } catch (err) {
          console.error(err);
        }
      }
      return;
    }

    const piece = lessonBoard.get(square as any);
    if (piece && piece.color === lessonBoard.turn()) {
      setLessonSelectedSquare(square);
      const legalMoves = lessonBoard.moves({ square: square as any, verbose: true }) as any[];
      setLessonValidDestinations(legalMoves.map((m) => m.to));
    } else {
      setLessonSelectedSquare(null);
      setLessonValidDestinations([]);
    }
  };

  const handleResetLesson = () => {
    if (!selectedLesson) return;
    const lChess = new Chess(selectedLesson.fen);
    setLessonBoard(lChess);
    setLessonFen(lChess.fen());
    setLessonSelectedSquare(null);
    setLessonValidDestinations([]);
    setLessonStatus("unstarted");
    setLessonFeedback("");
    setLessonHintRevealed(false);
  };

  // --- Chess Openings Explorer Helpers ---
  const handleSelectOpening = (opening: any) => {
    setSelectedOpening(opening);
    setOpeningMoveIndex(0);
    setIsOpeningAutoPlaying(false);
    setOpeningPracticeMode(false);
    setOpeningPracticeStep(0);
    setOpeningPracticeFeedback("");
    setOpeningSelectedSquare(null);
    setOpeningValidDestinations([]);
  };

  const handleStartOpeningPractice = () => {
    setOpeningPracticeMode(true);
    setOpeningPracticeStep(0);
    setOpeningPracticeFeedback(`Let's practice the ${selectedOpening.name}! Make the first move for White: ${selectedOpening.moves[0]}`);
    setOpeningSelectedSquare(null);
    setOpeningValidDestinations([]);
    setIsOpeningAutoPlaying(false);
    setOpeningMoveIndex(0);
  };

  const handleOpeningSquareClick = (square: string) => {
    if (!selectedOpening || !openingPracticeMode) return;

    // Build the board at the current practice step
    const board = new Chess();
    for (let i = 0; i < openingPracticeStep; i++) {
      try {
        board.move(selectedOpening.moves[i]);
      } catch (err) {
        console.error("Rebuilding practice board error:", err);
      }
    }

    if (openingSelectedSquare) {
      if (openingSelectedSquare === square) {
        setOpeningSelectedSquare(null);
        setOpeningValidDestinations([]);
        return;
      }

      try {
        const moves = board.moves({ square: openingSelectedSquare as any, verbose: true }) as any[];
        const targetMove = moves.find((m) => m.from === openingSelectedSquare && m.to === square);

        if (targetMove) {
          const playedSan = targetMove.san;
          const expectedSan = selectedOpening.moves[openingPracticeStep];

          // Flexibly match SAN, LAN, or destination coordinates
          const isMatch = 
            playedSan.toLowerCase() === expectedSan.toLowerCase() || 
            targetMove.to.toLowerCase() === expectedSan.toLowerCase() ||
            (targetMove.from + targetMove.to).toLowerCase() === expectedSan.toLowerCase();

          if (isMatch) {
            const nextStep = openingPracticeStep + 1;
            setOpeningPracticeStep(nextStep);
            setOpeningSelectedSquare(null);
            setOpeningValidDestinations([]);

            if (nextStep >= selectedOpening.moves.length) {
              setOpeningPracticeFeedback(`🎉 Brilliant! You've successfully completed the ${selectedOpening.name} opening sequence!`);
              setOpeningPracticeMode(false);
            } else {
              const whoseTurn = nextStep % 2 === 0 ? "White" : "Black";
              setOpeningPracticeFeedback(`✨ Correct! Move "${playedSan}" matches the theory. Next move for ${whoseTurn}: "${selectedOpening.moves[nextStep]}"`);
            }
          } else {
            setOpeningPracticeFeedback(`❌ Incorrect. Playing "${playedSan}" deviates from the ${selectedOpening.name} line. Expected: "${expectedSan}". Try again!`);
            setOpeningSelectedSquare(null);
            setOpeningValidDestinations([]);
          }
        } else {
          setOpeningSelectedSquare(null);
          setOpeningValidDestinations([]);
        }
      } catch (err) {
        console.error("Practice move selection error:", err);
        setOpeningSelectedSquare(null);
        setOpeningValidDestinations([]);
      }
    } else {
      const piece = board.get(square as any);
      if (piece && piece.color === board.turn()) {
        setOpeningSelectedSquare(square);
        try {
          const dests = board.moves({ square: square as any, verbose: true }) as any[];
          setOpeningValidDestinations(dests.map((d) => d.to));
        } catch (err) {
          console.error("Error computing opening practice destinations:", err);
        }
      }
    }
  };

  // Autoplay effect for Chess Openings
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isOpeningAutoPlaying && selectedOpening) {
      interval = setInterval(() => {
        setOpeningMoveIndex((prev) => {
          if (prev >= selectedOpening.moves.length) {
            setIsOpeningAutoPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpeningAutoPlaying, selectedOpening]);

  // --- Rendering Helpers ---
  const renderSquareCoordinates = (square: string, rowIdx: number, colIdx: number, isBlackOnBottom: boolean) => {
    const isLight = (rowIdx + colIdx) % 2 === 0;
    const textColor = isLight ? "text-slate-800 font-semibold" : "text-slate-300 font-semibold";

    const displayRow = isBlackOnBottom ? rowIdx + 1 : 8 - rowIdx;
    const displayCol = isBlackOnBottom ? 7 - colIdx : colIdx;
    const letter = ["a", "b", "c", "d", "e", "f", "g", "h"][displayCol];

    return (
      <div className="absolute inset-0 p-0.5 flex flex-col justify-between pointer-events-none text-[9px] select-none opacity-40">
        {displayCol === 0 && <span className={`${textColor} leading-none`}>{displayRow}</span>}
        {displayRow === 1 && <span className={`${textColor} leading-none self-end mt-auto`}>{letter}</span>}
      </div>
    );
  };

  const formatTimer = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const dec = Math.floor((ms % 1000) / 100);
    
    // Add red flashing state if less than 30s
    const isLow = ms < 30000;
    
    return (
      <span className={isLow ? "text-red-500 animate-pulse font-bold" : ""}>
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        {isLow && <span className="text-xs opacity-75">.{dec}</span>}
      </span>
    );
  };

  // Generate 8x8 Board Grid
  const generateBoardGrid = (chessInstance: Chess, onSquareClick: (sq: string) => void, selSquare: string | null, validDests: string[]) => {
    const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

    const activeRanks = isBoardFlipped ? [...ranks].reverse() : ranks;
    const activeFiles = isBoardFlipped ? [...files].reverse() : files;

    const squares = [];

    // Find if king is in check to draw warning ring
    const turnColor = chessInstance.turn();
    const isCheck = chessInstance.inCheck();
    let checkSquare: string | null = null;
    
    if (isCheck) {
      // Find the king's square
      chessInstance.board().forEach((row) => {
        row.forEach((sq) => {
          if (sq && sq.type === "k" && sq.color === turnColor) {
            checkSquare = sq.square;
          }
        });
      });
    }

    // Danger Vision calculation (squares threatened by opponent)
    let threatenedSquares: string[] = [];
    if (isDangerVisionEnabled) {
      try {
        const copy = new Chess(chessInstance.fen());
        if (!copy.isGameOver()) {
          const fenParts = copy.fen().split(" ");
          fenParts[1] = fenParts[1] === "w" ? "b" : "w";
          const opponentBoard = new Chess(fenParts.join(" "));
          const opponentMoves = opponentBoard.moves({ verbose: true }) as any[];
          threatenedSquares = opponentMoves.map((m) => m.to);
        }
      } catch (e) {
        console.error("Danger Vision calculation error:", e);
      }
    }

    // Get selected piece's moves for flags check
    let selectedSquareMoves: any[] = [];
    if (selSquare) {
      try {
        selectedSquareMoves = chessInstance.moves({ square: selSquare as any, verbose: true }) as any[];
      } catch (e) {
        console.error("Error fetching selected square moves:", e);
      }
    }

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const rankName = activeRanks[r];
        const fileName = activeFiles[c];
        const sqName = fileName + rankName;

        const piece = chessInstance.get(sqName as any);
        const isLight = (r + c) % 2 === 0;
        const isSelected = selSquare === sqName;
        const isValidDest = validDests.includes(sqName);
        const isKingInCheck = checkSquare === sqName;
        const isThreatened = threatenedSquares.includes(sqName);
        const isMyPiece = piece && piece.color === turnColor;

        let bgClass = isLight ? "bg-[#E2E8F0]" : "bg-[#94A3B8]"; // Warm off-white & cool gray-blue

        if (isSelected) {
          bgClass = "bg-indigo-300/80 ring-2 ring-indigo-500 ring-inset";
        } else if (isValidDest) {
          bgClass = isLight ? "bg-[#C7D2FE]" : "bg-[#818CF8]"; // light indigo highlights
        } else if (isKingInCheck) {
          bgClass = "bg-red-400 animate-pulse";
        } else if (isDangerVisionEnabled && isThreatened) {
          bgClass = isLight ? "bg-red-100 border border-red-200" : "bg-red-200/95 border border-red-300";
        }

        squares.push(
          <div
            id={`square-${sqName}`}
            key={sqName}
            onClick={() => onSquareClick(sqName)}
            className={`${bgClass} relative flex items-center justify-center cursor-pointer transition-all duration-150 hover:opacity-90 aspect-square select-none`}
          >
            {renderSquareCoordinates(sqName, r, c, isBoardFlipped)}

            {/* Custom high-fidelity vector piece */}
            {piece && (
              <div className="w-[85%] h-[85%] transition-transform duration-200 hover:scale-105 active:scale-95 drop-shadow-md z-10">
                <ChessPiece type={piece.type} color={piece.color} />
              </div>
            )}

            {/* Danger Vision alert badges for user pieces under active threat */}
            {isDangerVisionEnabled && isThreatened && isMyPiece && (
              <>
                <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping z-20 pointer-events-none" />
                <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-600 rounded-full flex items-center justify-center text-[7px] text-white font-extrabold z-20 pointer-events-none shadow" title="Piece is currently attacked!">
                  ⚠️
                </div>
              </>
            )}

            {/* Interactive Move highlights and specific rules overlays */}
            {isValidDest && (() => {
              const moveInfo = selectedSquareMoves.find((m) => m.to === sqName);
              const flags = moveInfo?.flags || "";
              const isCastling = flags.includes("k") || flags.includes("q");
              const isEnPassant = flags.includes("e");
              const isPromotion = flags.includes("p");
              const isCapture = flags.includes("c") || isEnPassant;

              if (isCastling) {
                return (
                  <div className="absolute inset-0 bg-cyan-500/20 border-2 border-cyan-400 flex flex-col items-center justify-center z-20 pointer-events-none animate-pulse">
                    <span className="text-sm md:text-lg leading-none filter drop-shadow">🏰</span>
                    <span className="text-[7px] font-black text-cyan-200 mt-0.5 uppercase tracking-tighter">Castle</span>
                  </div>
                );
              }
              if (isEnPassant) {
                return (
                  <div className="absolute inset-0 bg-amber-500/25 border-2 border-amber-400 flex flex-col items-center justify-center z-20 pointer-events-none animate-pulse">
                    <span className="text-sm md:text-lg leading-none filter drop-shadow">💨</span>
                    <span className="text-[7px] font-black text-amber-200 mt-0.5 uppercase tracking-tighter">E.P.</span>
                  </div>
                );
              }
              if (isPromotion) {
                return (
                  <div className="absolute inset-0 bg-fuchsia-500/20 border-2 border-fuchsia-400 flex flex-col items-center justify-center z-20 pointer-events-none">
                    <span className="text-sm md:text-lg leading-none filter drop-shadow">👑</span>
                    <span className="text-[7px] font-black text-fuchsia-200 mt-0.5 uppercase tracking-tighter">Promote</span>
                  </div>
                );
              }
              if (isCapture) {
                return (
                  <div className="absolute w-[80%] h-[80%] border-4 border-red-500/60 rounded-full z-20 pointer-events-none flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow" />
                  </div>
                );
              }
              // Normal move
              if (!piece) {
                return (
                  <div className="absolute w-3.5 h-3.5 bg-indigo-600/60 rounded-full z-20 pointer-events-none shadow-sm" />
                );
              }
              return null;
            })()}
          </div>
        );
      }
    }

    return squares;
  };

  return (
    <div id="app-root" className="flex flex-col min-h-screen md:h-screen w-full bg-[#0F172A] text-slate-200 font-sans md:border md:border-slate-800 md:shadow-2xl md:rounded-lg overflow-x-hidden md:overflow-hidden mx-auto my-auto relative">
      
      {/* Header: Brand and Global Tabs */}
      <header id="app-header" className="h-14 flex items-center justify-between px-4 md:px-6 bg-[#1E293B] border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">GM</div>
          <div>
            <h1 className="text-xs md:text-sm font-bold tracking-tight">Grandmaster <span className="text-indigo-400">AI Coach</span></h1>
            <p className="text-[10px] text-slate-400 hidden sm:block">Chess Tactics & Tactical Analyst</p>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="flex items-center gap-1 md:gap-2">
          <button
            id="tab-play"
            onClick={() => {
              setActiveTab("play");
              setSelectedSavedGame(null);
            }}
            className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3.5 py-1 md:py-1.5 rounded-md text-[10px] md:text-xs font-semibold transition-all ${
              activeTab === "play" && !selectedSavedGame
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <Sparkles size={11} className="md:w-[13px] md:h-[13px]" />
            <span className="hidden xs:inline">Play Match</span>
            <span className="xs:hidden">Play</span>
          </button>
          
          <button
            id="tab-lessons"
            onClick={() => {
              setActiveTab("lessons");
              setSelectedSavedGame(null);
              if (!selectedLesson) {
                handleSelectLesson(TACTICAL_LESSONS[0]);
              }
            }}
            className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3.5 py-1 md:py-1.5 rounded-md text-[10px] md:text-xs font-semibold transition-all ${
              activeTab === "lessons"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <BookOpen size={11} className="md:w-[13px] md:h-[13px]" />
            <span className="hidden xs:inline">Tactics Trainer</span>
            <span className="xs:hidden">Tactics</span>
          </button>

          <button
            id="tab-openings"
            onClick={() => {
              setActiveTab("openings");
              setSelectedSavedGame(null);
            }}
            className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3.5 py-1 md:py-1.5 rounded-md text-[10px] md:text-xs font-semibold transition-all ${
              activeTab === "openings"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <Compass size={11} className="md:w-[13px] md:h-[13px]" />
            <span className="hidden xs:inline">Opening Explorer</span>
            <span className="xs:hidden">Openings</span>
          </button>

          <button
            id="tab-saved"
            onClick={() => {
              setActiveTab("saved");
              if (savedGames.length > 0 && !selectedSavedGame) {
                handleSelectSavedGame(savedGames[0]);
              }
            }}
            className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3.5 py-1 md:py-1.5 rounded-md text-[10px] md:text-xs font-semibold transition-all ${
              activeTab === "saved" || selectedSavedGame
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <Trophy size={11} className="md:w-[13px] md:h-[13px]" />
            <span className="hidden xs:inline">Replays</span>
            <span className="xs:hidden">Replays</span>
          </button>
        </div>

        {/* Stats metrics */}
        <div className="hidden md:flex items-center gap-5 text-[11px] font-medium border-l border-slate-800 pl-5">
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Tactics Cleared</span>
            <span className="text-emerald-400">5 / 5 Motifs</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Saved Games</span>
            <span className="text-indigo-400 font-semibold">{savedGames.length} Saved</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="app-main-content" className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* ================= LEFT SIDEBAR: SAVED GAMES & HISTORY ================= */}
        <aside
          id="sidebar-left"
          className={`${
            isLeftSidebarOpen
              ? "fixed inset-y-0 left-0 z-50 w-72 flex animate-slideInLeft"
              : "hidden"
          } md:relative md:flex md:w-64 border-r border-slate-800 flex-col bg-[#0F172A] h-full shadow-2xl md:shadow-none`}
        >
          {/* Mobile close button header */}
          <div className="md:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Match Settings & History</span>
            <button
              onClick={() => setIsLeftSidebarOpen(false)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            >
              <XCircle size={18} />
            </button>
          </div>
          
          {/* Top Panel: Match Settings (Only available in "play" tab) */}
          {activeTab === "play" && (
            <div className="p-4 border-b border-slate-800 space-y-3 bg-[#111827]/40">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <RotateCcw size={10} /> Match Configuration
              </h2>
              
              {/* Game Mode Picker */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Game Mode</label>
                <div className="grid grid-cols-2 gap-1 bg-[#1E293B] p-0.5 rounded-md border border-slate-700/50">
                  <button
                    onClick={() => setGameMode("ai")}
                    className={`py-1 text-[10px] font-bold rounded text-center transition-all ${
                      gameMode === "ai" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    VS AI
                  </button>
                  <button
                    onClick={() => setGameMode("local")}
                    className={`py-1 text-[10px] font-bold rounded text-center transition-all ${
                      gameMode === "local" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Local PvP
                  </button>
                </div>
              </div>

              {/* AI Difficulty (only if AI mode) */}
              {gameMode === "ai" && (
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">AI Coach Difficulty</label>
                  <div className="grid grid-cols-3 gap-1 bg-[#1E293B] p-0.5 rounded-md border border-slate-700/50">
                    {(["Easy", "Medium", "Hard"] as Difficulty[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`py-0.5 text-[9px] font-extrabold rounded text-center transition-all ${
                          difficulty === level ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Timer selection */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Timer Limit</label>
                <select
                  value={timeControl}
                  onChange={(e) => setTimeControl(e.target.value)}
                  className="w-full bg-[#1E293B] border border-slate-700/50 rounded-md py-1 px-2 text-[10px] font-medium text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="3m">3 min (Bullet / Blitz)</option>
                  <option value="5m">5 min (Blitz)</option>
                  <option value="10m">10 min (Rapid)</option>
                  <option value="15m + 10s">15 min + 10s increment</option>
                  <option value="None">Relaxed (No Clocks)</option>
                </select>
              </div>

              {/* AI Color Select */}
              {gameMode === "ai" && (
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Your Color</label>
                  <div className="grid grid-cols-3 gap-1 bg-[#1E293B] p-0.5 rounded-md border border-slate-700/50">
                    <button
                      onClick={() => setPlayerColor("w")}
                      className={`py-0.5 text-[9px] font-bold rounded ${playerColor === "w" ? "bg-slate-200 text-slate-900" : "text-slate-400"}`}
                    >
                      White
                    </button>
                    <button
                      onClick={() => setPlayerColor("b")}
                      className={`py-0.5 text-[9px] font-bold rounded ${playerColor === "b" ? "bg-slate-200 text-slate-900" : "text-slate-400"}`}
                    >
                      Black
                    </button>
                    <button
                      onClick={() => {
                        const rColor = Math.random() < 0.5 ? "w" : "b";
                        setPlayerColor(rColor);
                      }}
                      className="py-0.5 text-[9px] font-bold rounded text-slate-400 hover:text-slate-200"
                    >
                      Random
                    </button>
                  </div>
                </div>
              )}

              {/* Apply & Restart */}
              <button
                onClick={handleRestartMatch}
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded shadow transition-all uppercase tracking-wider flex items-center justify-center gap-1"
              >
                <RefreshCw size={11} /> Start New Match
              </button>
            </div>
          )}

          {/* Lessons list (Only shown in tactics trainer tab) */}
          {activeTab === "lessons" && (
            <div className="p-4 border-b border-slate-800 space-y-2">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-2">
                <BookOpen size={10} /> Lessons & Puzzles
              </h2>
              <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                {TACTICAL_LESSONS.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson)}
                    className={`p-2 rounded border cursor-pointer transition-all ${
                      selectedLesson?.id === lesson.id
                        ? "bg-indigo-600/10 border-indigo-500"
                        : "bg-slate-900/40 border-slate-800 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold text-slate-200 leading-tight">{lesson.title}</span>
                      {lessonStatus === "solved" && selectedLesson?.id === lesson.id && (
                        <Check size={11} className="text-emerald-400 mt-0.5" />
                      )}
                    </div>
                    <span className="text-[9px] text-indigo-400 font-bold block mt-0.5">{lesson.motif}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Openings list (Only shown in openings tab) */}
          {activeTab === "openings" && (
            <div className="p-4 border-b border-slate-800 space-y-3 shrink-0 bg-[#111827]/40 animate-fadeIn">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Compass size={11} className="text-indigo-400" /> Theory & Openings
              </h2>
              
              {/* Category selector */}
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Pawn Category</label>
                <select
                  value={selectedOpeningCategory}
                  onChange={(e) => setSelectedOpeningCategory(e.target.value)}
                  className="w-full text-[10px] bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-300 font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="All">All Openings (50+)</option>
                  <option value="Open Games (1.e4 e5)">Open Games (1.e4 e5)</option>
                  <option value="Sicilian Defense">Sicilian Defense (1.e4 c5)</option>
                  <option value="French Defense">French Defense (1.e4 e6)</option>
                  <option value="Caro–Kann Defense">Caro–Kann Defense (1.e4 c6)</option>
                  <option value="Indian Defenses">Indian Defenses (1.d4 Nf6)</option>
                  <option value="Queen's Pawn Openings">Queen's Pawn (1.d4 d5)</option>
                  <option value="Flank Openings">Flank Openings (c4, Nf3, f4, b3)</option>
                  <option value="Other Popular Defenses">Other Popular Defenses</option>
                </select>
              </div>

              {/* Search bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search openings & traps..."
                  value={openingSearchQuery}
                  onChange={(e) => setOpeningSearchQuery(e.target.value)}
                  className="w-full text-[10px] bg-slate-900 border border-slate-800 rounded pl-7 pr-3 py-1.5 text-slate-200 placeholder-slate-500 font-medium focus:outline-none focus:border-indigo-500"
                />
                <Search size={11} className="absolute left-2.5 top-2.5 text-slate-500" />
              </div>

              {/* Scrollable List */}
              <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                {(() => {
                  const filtered = CHESS_OPENINGS.filter((op) => {
                    const matchesCategory = selectedOpeningCategory === "All" || op.category === selectedOpeningCategory;
                    const matchesSearch = 
                      op.name.toLowerCase().includes(openingSearchQuery.toLowerCase()) || 
                      op.category.toLowerCase().includes(openingSearchQuery.toLowerCase()) ||
                      op.strategicTheme.toLowerCase().includes(openingSearchQuery.toLowerCase());
                    return matchesCategory && matchesSearch;
                  });

                  if (filtered.length === 0) {
                    return <p className="text-[10px] text-slate-500 text-center py-4 font-medium italic">No openings found</p>;
                  }

                  return filtered.map((op) => (
                    <div
                      key={op.id}
                      onClick={() => handleSelectOpening(op)}
                      className={`p-2 rounded border text-left cursor-pointer transition-all ${
                        selectedOpening?.id === op.id
                          ? "bg-indigo-600/20 border-indigo-500/80 shadow-sm"
                          : "bg-slate-900/40 border-slate-800 hover:bg-slate-850"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[10px] font-bold text-slate-200 leading-tight block truncate max-w-[130px]">{op.name}</span>
                        <span className="text-[8px] bg-indigo-500/10 border border-indigo-500/20 px-1 py-0.5 rounded text-indigo-300 font-extrabold shrink-0">
                          {op.moves.length} moves
                        </span>
                      </div>
                      <span className="text-[8px] text-slate-400 block mt-0.5 truncate">{op.category}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Saved Matches Log List (Available across tabs for quick lookup) */}
          <div className="flex-1 p-4 flex flex-col min-h-0 bg-[#0c1322]">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>Saved Matches</span>
              <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full">{savedGames.length}</span>
            </h2>

            {savedGames.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <Trophy size={20} className="text-slate-600 mb-2" />
                <p className="text-[10px] text-slate-500">No matches saved yet. Completed matches are analyzed and stored here automatically.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {savedGames.map((g) => {
                  const isSelected = selectedSavedGame?.id === g.id;
                  let resultLabel = "Draw";
                  let resultColor = "text-slate-400";
                  if (g.winner === "w") {
                    resultLabel = "White Won";
                    resultColor = "text-emerald-400";
                  } else if (g.winner === "b") {
                    resultLabel = "Black Won";
                    resultColor = "text-rose-400";
                  }

                  return (
                    <div
                      key={g.id}
                      onClick={() => handleSelectSavedGame(g)}
                      className={`p-2.5 rounded border text-left transition-all cursor-pointer group ${
                        isSelected
                          ? "bg-indigo-600/10 border-indigo-500"
                          : "bg-slate-900 border-slate-800 hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex justify-between items-start text-xs">
                        <span className="font-bold text-slate-200">
                          {g.mode === "ai" ? `vs. Chess AI (${g.difficulty})` : "Local PvP"}
                        </span>
                        <span className="text-[9px] text-slate-500">{g.date}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1.5 text-[10px]">
                        <span className={`font-semibold ${resultColor}`}>{resultLabel}</span>
                        <span className="text-slate-400 font-mono">{g.moves.length} moves</span>
                      </div>
                      {g.mistakes.length > 0 && (
                        <p className="text-[9px] text-amber-400 mt-1 flex items-center gap-0.5">
                          <AlertTriangle size={8} /> {g.mistakes.length} mistakes recorded
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center mt-2 border-t border-slate-800/60 pt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] text-indigo-400 font-bold hover:underline">Replay Game</span>
                        <button
                          onClick={(e) => handleDeleteSavedGame(g.id, e)}
                          className="text-slate-500 hover:text-red-400 p-0.5"
                          title="Delete replay"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ================= CENTER: ACTIVE BOARD OR TACTICAL PUZZLE ================= */}
        <section id="center-board-area" className="flex-1 bg-slate-900 flex flex-col items-center justify-start md:justify-center p-3 md:p-4 relative overflow-y-auto min-h-0">
          
          {/* Backdrop overlay for mobile sidebars */}
          {(isLeftSidebarOpen || isRightSidebarOpen) && (
            <div
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden animate-fadeIn"
              onClick={() => {
                setIsLeftSidebarOpen(false);
                setIsRightSidebarOpen(false);
              }}
            />
          )}

          {/* Mobile top controller bar */}
          <div className="w-full max-w-[420px] flex md:hidden justify-between items-center mb-3 bg-[#1E293B] p-2.5 rounded-lg border border-slate-800 shadow-lg shrink-0 select-none">
            <button
              onClick={() => setIsLeftSidebarOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 rounded text-xs font-bold text-slate-200 border border-slate-700/50"
            >
              <RotateCcw size={12} className="text-indigo-400" />
              Settings
            </button>
            
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {activeTab === "play" ? "Play Match" : activeTab === "lessons" ? "Tactics" : "Replays"}
            </span>

            <button
              onClick={() => setIsRightSidebarOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 rounded text-xs font-bold text-slate-200 border border-slate-700/50"
            >
              <Sparkles size={12} className="text-emerald-400 animate-pulse" />
              AI Coach
            </button>
          </div>

          {/* Board Control Actions (Flip Board & Danger Vision) */}
          <div className="absolute top-4 right-4 flex gap-1.5 z-20 hidden md:flex animate-fadeIn">
            <button
              onClick={() => setIsDangerVisionEnabled(!isDangerVisionEnabled)}
              className={`px-3 py-1.5 rounded-md transition-all shadow border flex items-center gap-1.5 text-xs font-bold cursor-pointer ${
                isDangerVisionEnabled
                  ? "bg-rose-600/95 text-white border-rose-500 hover:bg-rose-500 animate-pulse"
                  : "bg-[#1E293B]/80 text-slate-300 hover:text-white border-slate-700/50"
              }`}
              title="Toggle Danger Vision (Highlight threatened squares and pieces)"
            >
              <AlertTriangle size={13} className={isDangerVisionEnabled ? "animate-bounce" : ""} />
              <span>Danger Vision: {isDangerVisionEnabled ? "ON" : "OFF"}</span>
            </button>

            <button
              onClick={() => setIsBoardFlipped(!isBoardFlipped)}
              className="p-1.5 bg-[#1E293B]/80 hover:bg-indigo-600 rounded-md text-slate-300 hover:text-white transition-all shadow border border-slate-700/50 cursor-pointer flex items-center justify-center"
              title="Flip Chessboard"
            >
              <TrendingUp size={14} className="transform rotate-45" />
            </button>
          </div>

          {activeTab === "play" && (
            <div className="w-full max-w-[420px] flex flex-col justify-center">
              
              {/* Opponent Info Header (Black by default unless flipped) */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shadow border ${
                    isBoardFlipped ? "bg-slate-100 border-white text-slate-900" : "bg-slate-800 border-slate-700 text-white"
                  }`}>
                    {isBoardFlipped ? "♘" : "♞"}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      {isBoardFlipped
                        ? "You / White"
                        : gameMode === "ai"
                        ? `Chess AI Coach (Level: ${difficulty})`
                        : "Opponent / Black"}
                    </div>
                    <div className="text-[9px] text-slate-400 font-semibold tracking-wider">
                      {!isBoardFlipped && gameMode === "ai" ? "AUTO-EVALUATING" : "BLACK PIECES"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Danger Vision button for mobile */}
                  <button
                    onClick={() => setIsDangerVisionEnabled(!isDangerVisionEnabled)}
                    className={`md:hidden p-1.5 rounded-md transition-all border flex items-center justify-center gap-1 text-[10px] font-bold cursor-pointer ${
                      isDangerVisionEnabled
                        ? "bg-rose-600 text-white border-rose-500 animate-pulse"
                        : "bg-slate-800/80 text-slate-300 border-slate-700/50"
                    }`}
                    title="Toggle Danger Vision"
                  >
                    <AlertTriangle size={11} />
                    <span>Danger: {isDangerVisionEnabled ? "ON" : "OFF"}</span>
                  </button>

                  {/* Flip button for mobile */}
                  <button
                    onClick={() => setIsBoardFlipped(!isBoardFlipped)}
                    className="md:hidden p-1.5 bg-slate-800/80 hover:bg-indigo-600 rounded-md text-slate-300 hover:text-white transition-all border border-slate-700/50 cursor-pointer"
                    title="Flip Chessboard"
                  >
                    <TrendingUp size={12} className="transform rotate-45" />
                  </button>

                  {/* Black Timer Block */}
                  {timeControl !== "None" && (
                    <div className={`text-sm md:text-xl font-mono px-2 md:px-3 py-0.5 md:py-1 rounded border shadow-inner ${
                      game.turn() === "b" && timerState.isActive
                        ? "bg-red-500/10 text-red-400 border-red-500/40 font-bold"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}>
                      {formatTimer(isBoardFlipped ? timerState.whiteTime : timerState.blackTime)}
                    </div>
                  )}
                </div>
              </div>

              {/* Detected Opening Live Assistant Banner */}
              {(() => {
                const liveOp = detectOpening(moveHistory.map((m) => m.san));
                if (!liveOp) return null;
                return (
                  <div className="mb-2 p-2 bg-indigo-950/50 border border-indigo-500/20 rounded-md flex items-center justify-between select-none animate-fadeIn shrink-0">
                    <div className="flex items-center gap-2 overflow-hidden mr-1">
                      <span className="text-sm">📖</span>
                      <div className="min-w-0">
                        <p className="text-[8px] text-indigo-400 font-extrabold uppercase leading-none tracking-wider">Opening Theory</p>
                        <p className="text-[10px] font-bold text-slate-100 truncate mt-0.5">{liveOp.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        handleSelectOpening(liveOp);
                        setActiveTab("openings");
                      }}
                      className="text-[8px] text-indigo-300 hover:text-white font-black bg-indigo-900/40 border border-indigo-500/30 hover:bg-indigo-600 px-2 py-1 rounded transition-all shrink-0 uppercase tracking-wider cursor-pointer"
                    >
                      Study Line
                    </button>
                  </div>
                );
              })()}

              {/* Main Interactive Chess Grid */}
              <div className="relative border-2 md:border-4 border-slate-800 rounded shadow-2xl overflow-hidden bg-slate-800 aspect-square w-full">
                <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                  {generateBoardGrid(game, handleSquareClick, selectedSquare, validDestinations)}
                </div>

                {/* Promotion selection overlay Modal */}
                {promotionState && (
                  <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                    <p className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider">Promote Your Pawn</p>
                    <div className="flex gap-3">
                      {["q", "r", "b", "n"].map((type) => (
                        <button
                          key={type}
                          onClick={() => executePlayerMove(promotionState.from, promotionState.to, type)}
                          className="w-14 h-14 md:w-16 md:h-16 bg-[#1E293B] hover:bg-indigo-600 rounded-lg p-1.5 md:p-2 flex items-center justify-center transition-all border border-slate-700 shadow-md group"
                        >
                          <div className="w-[80%] h-[80%] group-hover:scale-110 transition-transform">
                            <ChessPiece type={type} color={game.turn()} />
                          </div>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setPromotionState(null)}
                      className="mt-4 px-3 py-1 text-[10px] text-slate-400 hover:text-slate-200 uppercase font-semibold"
                    >
                      Cancel Move
                    </button>
                  </div>
                )}

                {/* AI is thinking overlay indicator */}
                {isAiThinking && (
                  <div className="absolute bottom-3 left-3 bg-[#1E293B]/90 border border-indigo-500/40 px-3 py-1.5 rounded-md flex items-center gap-2 text-[10px] text-indigo-300 font-bold shadow-lg z-20 animate-pulse">
                    <Cpu size={12} className="animate-spin text-indigo-400" />
                    AI Coach calculating...
                  </div>
                )}

                {/* Game Over Visual Overlay */}
                {showGameOverOverlay && gameEndedReason && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6 text-center select-none animate-fadeIn">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-400 mb-3 animate-bounce">
                      <Trophy size={28} className="md:w-8 md:h-8" />
                    </div>

                    <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">
                      {gameEndedReason === "checkmate" && "Checkmate!"}
                      {gameEndedReason === "draw" && "Draw Declared"}
                      {gameEndedReason === "stalemate" && "Stalemate!"}
                      {gameEndedReason === "timeout" && "Time Out!"}
                      {gameEndedReason === "resignation" && "Resigned!"}
                    </h2>

                    <p className="text-slate-300 text-[10px] md:text-xs mt-1.5 max-w-[260px] leading-relaxed">
                      {(() => {
                        if (gameEndedReason === "checkmate") {
                          const winner = game.turn() === "w" ? "Black" : "White";
                          return `${winner} has delivered checkmate and won the match!`;
                        }
                        if (gameEndedReason === "stalemate") {
                          return "The match ended in a Stalemate (no legal moves for the active side).";
                        }
                        if (gameEndedReason === "draw") {
                          return "Draw. The game has concluded with no winner.";
                        }
                        if (gameEndedReason === "timeout") {
                          const winner = timerState.timeLimitExceeded === "w" ? "Black" : "White";
                          return `${winner} wins on time!`;
                        }
                        if (gameEndedReason === "resignation") {
                          const resigningSide = gameMode === "ai" ? playerColor : game.turn();
                          const winner = resigningSide === "w" ? "Black" : "White";
                          return `${resigningSide === "w" ? "White" : "Black"} resigned. ${winner} wins.`;
                        }
                        return "The match has concluded.";
                      })()}
                    </p>

                    <div className="mt-5 flex flex-col gap-2 w-full max-w-[200px]">
                      {loadingAnalysis ? (
                        <div className="flex flex-col items-center gap-1.5 py-2">
                          <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-[9px] text-indigo-300 font-bold uppercase tracking-widest animate-pulse">
                            Generating AI Report...
                          </span>
                        </div>
                      ) : postGameAnalysis ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-1.5 text-[9px] text-emerald-400 font-semibold uppercase tracking-wider">
                          ✨ AI Report Generated!
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            let winnerSide: "w" | "b" | "draw" | null = null;
                            if (gameEndedReason === "checkmate") {
                              winnerSide = game.turn() === "w" ? "b" : "w";
                            } else if (gameEndedReason === "timeout") {
                              winnerSide = timerState.timeLimitExceeded === "w" ? "b" : "w";
                            } else if (gameEndedReason === "resignation") {
                              const resigningSide = gameMode === "ai" ? playerColor : game.turn();
                              winnerSide = resigningSide === "w" ? "b" : "w";
                            } else {
                              winnerSide = "draw";
                            }
                            handleRequestAnalysis(winnerSide);
                          }}
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded uppercase tracking-wider shadow cursor-pointer transition-colors"
                        >
                          Request AI Analysis
                        </button>
                      )}

                      <div className="flex gap-1.5">
                        <button
                          onClick={handleRestartMatch}
                          className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded uppercase tracking-wider border border-slate-700 cursor-pointer transition-colors"
                        >
                          New Match
                        </button>
                        <button
                          onClick={() => setShowGameOverOverlay(false)}
                          className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 text-[10px] font-bold rounded uppercase tracking-wider border border-slate-800 cursor-pointer transition-colors"
                        >
                          Review Board
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Player Info Header (White by default unless flipped) */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg shadow border ${
                    isBoardFlipped ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-100 border-white text-slate-900"
                  }`}>
                    {isBoardFlipped ? "♞" : "♘"}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      {isBoardFlipped
                        ? gameMode === "ai"
                          ? `Chess AI Coach (Level: ${difficulty})`
                          : "Opponent / Black"
                        : "You / White"}
                    </div>
                    <div className="text-[9px] text-indigo-400 font-bold tracking-wider">
                      {isAiThinking && !isBoardFlipped ? "THINKING..." : isBoardFlipped ? "BLACK PIECES" : "WHITE PIECES"}
                    </div>
                  </div>
                </div>

                {/* White Timer Block */}
                {timeControl !== "None" && (
                  <div className={`text-sm md:text-xl font-mono px-2 md:px-3 py-0.5 md:py-1 rounded border shadow-inner ${
                    game.turn() === "w" && timerState.isActive
                      ? "bg-red-500/10 text-red-400 border-red-500/40 font-bold"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}>
                    {formatTimer(isBoardFlipped ? timerState.blackTime : timerState.whiteTime)}
                  </div>
                )}
              </div>

              {/* Game status overlay messages (Checkmate, Stalemate, Draw) */}
              {(game.isGameOver() || gameEndedReason) && (
                <div className="mt-3 p-2 bg-indigo-600/20 border border-indigo-500/30 rounded text-center text-xs text-indigo-200 font-medium flex items-center justify-between gap-3 px-3">
                  <span className="text-left">
                    {game.isCheckmate() || gameEndedReason === "checkmate" ? (
                      "Checkmate! The game has ended."
                    ) : game.isStalemate() || gameEndedReason === "stalemate" ? (
                      "Stalemate! Game drawn."
                    ) : game.isDraw() || gameEndedReason === "draw" ? (
                      "Game drawn."
                    ) : gameEndedReason === "resignation" ? (
                      "Game over via Resignation."
                    ) : timerState.timeLimitExceeded || gameEndedReason === "timeout" ? (
                      `Timeout! ${timerState.timeLimitExceeded === "w" ? "White" : "Black"} ran out of time.`
                    ) : (
                      "Game over!"
                    )}
                  </span>
                  {!showGameOverOverlay && (
                    <button
                      onClick={() => setShowGameOverOverlay(true)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] uppercase font-bold tracking-wider rounded transition-colors shadow cursor-pointer whitespace-nowrap"
                    >
                      Show Summary
                    </button>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ================= TACTICS TRAINER LESSONS BOARD ================= */}
          {activeTab === "lessons" && selectedLesson && lessonBoard && (
            <div className="w-full max-w-[420px] flex flex-col justify-center">
              <div className="mb-2">
                <span className="text-[10px] bg-indigo-600/30 text-indigo-300 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  Tactics Challenge
                </span>
                <h3 className="text-sm font-bold text-slate-200 mt-1">{selectedLesson.title}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{selectedLesson.description}</p>
              </div>

              {/* Chessboard Grid for Puzzle */}
              <div className="border-2 md:border-4 border-slate-800 rounded shadow-2xl overflow-hidden bg-slate-800 aspect-square w-full">
                <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                  {generateBoardGrid(lessonBoard, handleLessonSquareClick, lessonSelectedSquare, lessonValidDestinations)}
                </div>
              </div>

              {/* Feedback and interactions block */}
              <div className="mt-3 p-3 rounded bg-[#1E293B] border border-slate-800">
                {lessonStatus === "unstarted" && (
                  <div>
                    <p className="text-[11px] text-slate-300 italic">Find the best tactical move for {lessonBoard.turn() === "w" ? "White" : "Black"} in this position.</p>
                    <div className="flex justify-between items-center mt-2.5">
                      <button
                        onClick={() => setLessonHintRevealed(true)}
                        className="text-[10px] text-indigo-400 font-bold hover:underline"
                      >
                        Need a clue?
                      </button>
                      <button
                        onClick={handleResetLesson}
                        className="text-[10px] text-slate-400 font-bold hover:underline"
                      >
                        Reset position
                      </button>
                    </div>
                    {lessonHintRevealed && (
                      <p className="text-[10px] text-indigo-300 bg-indigo-600/10 border border-indigo-500/20 p-2 rounded mt-2 leading-relaxed">
                        <strong>Coaching Clue:</strong> {selectedLesson.hint}
                      </p>
                    )}
                  </div>
                )}

                {lessonStatus === "wrong" && (
                  <div className="space-y-2">
                    <p className="text-xs text-rose-400 font-bold flex items-center gap-1">
                      <XCircle size={13} /> {lessonFeedback}
                    </p>
                    <button
                      onClick={handleResetLesson}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] rounded font-bold transition-all uppercase"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {lessonStatus === "solved" && (
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} /> {lessonFeedback}
                    </p>
                    <p className="text-[10px] text-slate-300 leading-relaxed bg-slate-900/60 p-2 rounded border border-slate-800">
                      {selectedLesson.explanation}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          const currentIndex = TACTICAL_LESSONS.findIndex((l) => l.id === selectedLesson.id);
                          const nextIndex = (currentIndex + 1) % TACTICAL_LESSONS.length;
                          handleSelectLesson(TACTICAL_LESSONS[nextIndex]);
                        }}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded transition-all uppercase tracking-wider"
                      >
                        Next Lesson
                      </button>
                      <button
                        onClick={handleResetLesson}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] rounded font-bold transition-all uppercase"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= REPLAYS & SAVED MATCH STEP-THROUGH BOARD ================= */}
          {activeTab === "saved" && selectedSavedGame && reviewBoard && (
            <div className="w-full max-w-[420px] flex flex-col justify-center">
              <div className="mb-2">
                <span className="text-[10px] bg-slate-800 text-indigo-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Replay Theater
                </span>
                <h3 className="text-sm font-bold text-slate-200 mt-1">
                  Replaying {selectedSavedGame.mode === "ai" ? `vs. AI (${selectedSavedGame.difficulty})` : "Local PvP"}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Step through your moves using the controller. Read mistake alerts in the sidebar.
                </p>
              </div>

              {/* Chessboard for Replay */}
              <div className="border-2 md:border-4 border-slate-800 rounded shadow-2xl overflow-hidden bg-slate-800 aspect-square w-full">
                <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                  {generateBoardGrid(reviewBoard, () => {}, null, [])}
                </div>
              </div>

              {/* Navigation Controller Bar */}
              <div className="mt-3 flex items-center justify-between bg-[#1E293B] p-2 rounded-md border border-slate-800 select-none">
                <button
                  onClick={() => handleReviewMoveStep(-reviewMoveIndex)}
                  disabled={reviewMoveIndex === 0}
                  className="p-1 px-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30"
                  title="First Move"
                >
                  ⏮
                </button>
                <button
                  onClick={() => handleReviewMoveStep(-1)}
                  disabled={reviewMoveIndex === 0}
                  className="p-1 px-2 bg-slate-800 hover:bg-indigo-600 rounded text-xs text-slate-200 disabled:opacity-30 flex items-center gap-1"
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                <span className="text-[11px] font-mono text-slate-300 font-semibold">
                  Move {reviewMoveIndex} / {selectedSavedGame.moves.length}
                </span>
                <button
                  onClick={() => handleReviewMoveStep(1)}
                  disabled={reviewMoveIndex === selectedSavedGame.moves.length}
                  className="p-1 px-2 bg-slate-800 hover:bg-indigo-600 rounded text-xs text-slate-200 disabled:opacity-30 flex items-center gap-1"
                >
                  Next <ChevronRight size={13} />
                </button>
                <button
                  onClick={() => handleReviewMoveStep(selectedSavedGame.moves.length - reviewMoveIndex)}
                  disabled={reviewMoveIndex === selectedSavedGame.moves.length}
                  className="p-1 px-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30"
                  title="Last Move"
                >
                  ⏭
                </button>
              </div>
            </div>
          )}

          {/* ================= OPENINGS & TACTICAL TRAPS EXPLORER BOARD ================= */}
          {activeTab === "openings" && selectedOpening && (() => {
            const currentOpeningBoard = new Chess();
            const limit = openingPracticeMode ? openingPracticeStep : openingMoveIndex;
            for (let i = 0; i < limit; i++) {
              try {
                currentOpeningBoard.move(selectedOpening.moves[i]);
              } catch (err) {
                // Ignore matching errors in progressive build
              }
            }

            return (
              <div className="w-full max-w-[420px] flex flex-col justify-center animate-fadeIn">
                <div className="mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-indigo-600/30 text-indigo-300 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                      {selectedOpening.category}
                    </span>
                    {openingPracticeMode && (
                      <span className="text-[9px] bg-emerald-600/30 text-emerald-300 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                        Practice Active
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-200 mt-1 flex items-center gap-1">
                    <Compass size={13} className="text-indigo-400 animate-spin-slow" /> {selectedOpening.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                    {openingPracticeMode 
                      ? "Play the correct theoretical moves on the board. The coach will guide your hand!"
                      : "Step through the starting moves of this opening. Observe the piece coordination."}
                  </p>
                </div>

                {/* Chessboard Grid for Opening */}
                <div className="border-2 md:border-4 border-slate-800 rounded shadow-2xl overflow-hidden bg-slate-800 aspect-square w-full">
                  <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                    {generateBoardGrid(
                      currentOpeningBoard,
                      openingPracticeMode ? handleOpeningSquareClick : () => {},
                      openingPracticeMode ? openingSelectedSquare : null,
                      openingPracticeMode ? openingValidDestinations : []
                    )}
                  </div>
                </div>

                {/* Interactive Feedback / Playback controllers */}
                {openingPracticeMode ? (
                  <div className="mt-3 p-3 rounded bg-slate-900/80 border border-slate-800">
                    <p className="text-xs font-bold text-indigo-300">Practice Guide</p>
                    <p className="text-[11px] text-slate-200 mt-1 leading-relaxed">{openingPracticeFeedback || "Make the first move!"}</p>
                    
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/60">
                      <span className="text-[9px] text-slate-400 font-mono">Move {openingPracticeStep} / {selectedOpening.moves.length}</span>
                      <button
                        onClick={() => {
                          setOpeningPracticeMode(false);
                          setOpeningPracticeFeedback("");
                          setOpeningMoveIndex(0);
                        }}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded font-bold uppercase transition-all"
                      >
                        Exit Practice
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Navigation Controller Bar */}
                    <div className="mt-3 flex items-center justify-between bg-[#1E293B] p-2 rounded-md border border-slate-800 select-none">
                      <button
                        onClick={() => setOpeningMoveIndex(0)}
                        disabled={openingMoveIndex === 0}
                        className="p-1 px-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="First Move"
                      >
                        ⏮
                      </button>
                      <button
                        onClick={() => setOpeningMoveIndex((prev) => Math.max(0, prev - 1))}
                        disabled={openingMoveIndex === 0}
                        className="p-1 px-2 bg-slate-800 hover:bg-indigo-600 rounded text-xs text-slate-200 disabled:opacity-30 flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <ChevronLeft size={13} /> Prev
                      </button>
                      
                      {/* Play / Pause Autoplay */}
                      <button
                        onClick={() => setIsOpeningAutoPlaying(!isOpeningAutoPlaying)}
                        className={`p-1 px-2.5 rounded text-[10px] font-extrabold uppercase transition-all cursor-pointer ${
                          isOpeningAutoPlaying 
                            ? "bg-amber-600/20 text-amber-300 border border-amber-500/30 animate-pulse" 
                            : "bg-indigo-600 text-white hover:bg-indigo-500"
                        }`}
                      >
                        {isOpeningAutoPlaying ? "⏸ Pause" : "▶ Autoplay"}
                      </button>

                      <button
                        onClick={() => setOpeningMoveIndex((prev) => Math.min(selectedOpening.moves.length, prev + 1))}
                        disabled={openingMoveIndex === selectedOpening.moves.length}
                        className="p-1 px-2 bg-slate-800 hover:bg-indigo-600 rounded text-xs text-slate-200 disabled:opacity-30 flex items-center gap-1 cursor-pointer font-bold"
                      >
                        Next <ChevronRight size={13} />
                      </button>
                      <button
                        onClick={() => setOpeningMoveIndex(selectedOpening.moves.length)}
                        disabled={openingMoveIndex === selectedOpening.moves.length}
                        className="p-1 px-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                        title="Last Move"
                      >
                        ⏭
                      </button>
                    </div>

                    {/* Practice launcher banner */}
                    <div className="mt-3 p-2.5 rounded bg-gradient-to-r from-indigo-900/40 to-[#1e1b4b]/30 border border-indigo-500/20 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-extrabold text-indigo-300 uppercase">Interactive Drills</p>
                        <p className="text-[9px] text-slate-400">Can you play this opening sequence from memory?</p>
                      </div>
                      <button
                        onClick={handleStartOpeningPractice}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded shadow transition-all uppercase tracking-wider"
                      >
                        Practice Line
                      </button>
                    </div>
                  </>
                )}

                {/* Theory Coach Commentary */}
                <div className="mt-3 p-3 bg-slate-900/50 border border-slate-800/80 rounded-lg flex-1 overflow-y-auto max-h-[170px] space-y-2.5 pr-1 text-left">
                  <div>
                    <h4 className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Theoretical Moves</h4>
                    <p className="text-xs font-mono text-slate-200 font-bold mt-0.5">
                      {selectedOpening.moves.map((mv: string, idx: number) => {
                        const moveNum = Math.floor(idx / 2) + 1;
                        const isWhite = idx % 2 === 0;
                        return (
                          <span key={idx} className={idx < limit ? "text-indigo-400 font-extrabold" : "text-slate-500"}>
                            {isWhite ? `${moveNum}.` : ""}
                            {mv}{" "}
                          </span>
                        );
                      })}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Strategic Themes</h4>
                    <p className="text-[10px] text-slate-300 leading-relaxed mt-0.5">{selectedOpening.strategicTheme}</p>
                  </div>

                  <div>
                    <h4 className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Tactical Tricks & Weaknesses</h4>
                    <p className="text-[10px] text-slate-300 leading-relaxed mt-0.5">{selectedOpening.tacticalTricks}</p>
                  </div>

                  <div>
                    <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">General Overview</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">{selectedOpening.description}</p>
                  </div>
                </div>
              </div>
            );
          })()}

        </section>

        {/* ================= RIGHT SIDEBAR: AI ANALYSIS, HINTS, & MISTAKES ================= */}
        <aside
          id="sidebar-right"
          className={`${
            isRightSidebarOpen
              ? "fixed inset-y-0 right-0 z-50 w-80 flex animate-slideInRight"
              : "hidden"
          } md:relative md:flex md:w-72 border-l border-slate-800 flex-col bg-[#1E293B] h-full shadow-2xl md:shadow-none`}
        >
          {/* Mobile close button header */}
          <div className="md:hidden p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">AI Coach & Analysis</span>
            <button
              onClick={() => setIsRightSidebarOpen(false)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            >
              <XCircle size={18} />
            </button>
          </div>
          
          {/* Centipawn Engine Evaluation Gauge */}
          {activeTab === "play" && (
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
                <span>Centipawn Advantage</span>
                <span className="font-mono text-indigo-400 font-semibold">
                  {advantageVal > 0 ? `+${advantageVal}` : advantageVal}
                </span>
              </h2>
              {/* Dynamic bar */}
              <div className="h-2.5 bg-slate-900 rounded-full relative overflow-hidden border border-slate-800 shadow-inner">
                {/* Advantage filler */}
                <div
                  className="absolute top-0 bottom-0 bg-indigo-500 transition-all duration-300"
                  style={{
                    left: "50%",
                    right: advantageVal > 0 ? `${Math.max(0, 50 - advantageVal * 10)}%` : "50%",
                    width: advantageVal > 0 ? `${Math.min(50, advantageVal * 10)}%` : "0%",
                  }}
                />
                <div
                  className="absolute top-0 bottom-0 bg-red-400 transition-all duration-300"
                  style={{
                    right: "50%",
                    left: advantageVal < 0 ? `${Math.max(0, 50 - Math.abs(advantageVal) * 10)}%` : "50%",
                    width: advantageVal < 0 ? `${Math.min(50, Math.abs(advantageVal) * 10)}%` : "0%",
                  }}
                />
                <div className="absolute left-1/2 top-0 bottom-0 w-[1.5px] bg-slate-600 z-10" />
              </div>
              <div className="flex justify-between text-[8px] text-slate-500 uppercase font-bold tracking-wider mt-1">
                <span>Black +Adv</span>
                <span>Balanced</span>
                <span>White +Adv</span>
              </div>
            </div>
          )}

          {/* Core Content Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col min-h-0">
            
            {/* MATCH REVIEW PANEL FOR COMPLETED MATCH / REPLAYS */}
            {(selectedSavedGame || (activeTab === "play" && (game.isGameOver() || timerState.timeLimitExceeded || postGameAnalysis))) ? (
              <div className="space-y-4">
                <div className="bg-emerald-600/10 border border-emerald-500/20 p-3 rounded-md">
                  <h3 className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wider mb-1">
                    <Trophy size={11} /> Post-Match Analyser
                  </h3>
                  <p className="text-[10px] text-slate-300 leading-relaxed mb-2.5">
                    Request a full tactical review powered by Gemini AI to identify opening labels, strengths, weaknesses, and custom tactical puzzles.
                  </p>

                  {!postGameAnalysis && !selectedSavedGame?.analysis && (
                    <button
                      onClick={handleRequestAnalysis}
                      disabled={loadingAnalysis}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-700 text-white text-[10px] font-bold rounded uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                    >
                      {loadingAnalysis ? (
                        <>
                          <RefreshCw size={11} className="animate-spin" /> Analyzing match...
                        </>
                      ) : (
                        "Generate Review"
                      )}
                    </button>
                  )}

                  {analysisError && (
                    <p className="text-[9px] text-rose-400 mt-2 font-medium">{analysisError}</p>
                  )}
                </div>

                {/* Analyzed details */}
                {(postGameAnalysis || selectedSavedGame?.analysis) && (
                  <div className="space-y-3">
                    {(() => {
                      const report = postGameAnalysis || selectedSavedGame?.analysis;
                      if (!report) return null;

                      return (
                        <>
                          {/* Opening and Grade */}
                          <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800 flex justify-between items-center">
                            <div>
                              <span className="text-[8px] text-slate-500 uppercase font-bold block">Opening Chess Lane</span>
                              <span className="text-[11px] font-bold text-indigo-300">{report.openingName}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] text-slate-500 uppercase font-bold block">Tactics Grade</span>
                              <span className="text-sm font-black text-emerald-400">{report.performanceGrade}</span>
                            </div>
                          </div>

                          {/* Takeaway summary */}
                          <div className="bg-slate-900/40 p-2.5 rounded border border-slate-800">
                            <span className="text-[8px] text-slate-500 uppercase font-bold block mb-1">Strategic Coach Takeaway</span>
                            <p className="text-[10px] text-slate-300 leading-relaxed italic">
                              "{report.strategicTakeaway}"
                            </p>
                          </div>

                          {/* Strengths and Weaknesses */}
                          <div className="grid grid-cols-2 gap-2 text-[9px]">
                            <div className="bg-slate-900/30 p-2 rounded border border-slate-800/80">
                              <span className="text-emerald-400 font-bold uppercase block mb-1">White Strengths</span>
                              <ul className="list-disc list-inside space-y-1 text-slate-300">
                                {report.whiteStrengths.slice(0, 2).map((s, i) => (
                                  <li key={i} className="truncate" title={s}>{s}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-slate-900/30 p-2 rounded border border-slate-800/80">
                              <span className="text-rose-400 font-bold uppercase block mb-1">White Flaws</span>
                              <ul className="list-disc list-inside space-y-1 text-slate-300">
                                {report.whiteWeaknesses.slice(0, 2).map((w, i) => (
                                  <li key={i} className="truncate" title={w}>{w}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Tactical Puzzle widget */}
                          <div className="bg-indigo-600/5 border border-indigo-500/20 p-2.5 rounded">
                            <h4 className="text-[10px] font-bold text-indigo-400 flex items-center gap-1 uppercase">
                              <Sparkles size={10} /> Personalized Coach Puzzle
                            </h4>
                            <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                              {report.tacticalPuzzle.description}
                            </p>
                            
                            <div className="mt-2.5 flex gap-1">
                              <input
                                type="text"
                                value={customPuzzleGuess}
                                onChange={(e) => setCustomPuzzleGuess(e.target.value)}
                                placeholder="Enter correct move (e.g. e4)"
                                className="flex-1 bg-slate-900 border border-slate-700/60 rounded px-1.5 py-1 text-[10px] text-slate-200 focus:outline-none focus:border-indigo-500"
                              />
                              <button
                                onClick={handleCheckCustomPuzzle}
                                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 rounded text-white text-[10px] font-bold uppercase tracking-wider"
                              >
                                Try
                              </button>
                            </div>

                            {customPuzzleSolved === true && (
                              <p className="text-[9px] text-emerald-400 mt-1.5 font-semibold leading-relaxed">
                                Correct! Explanation: {report.tacticalPuzzle.solutionExplanation}
                              </p>
                            )}
                            {customPuzzleSolved === false && (
                              <p className="text-[9px] text-red-400 mt-1.5 font-semibold">
                                Try again. Watch your positioning!
                              </p>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : null}

            {/* AI COACH TACTICAL HINTS BLOCK (Play view only) */}
            {activeTab === "play" && !game.isGameOver() && !timerState.timeLimitExceeded && (
              <div className="bg-slate-900 p-3.5 rounded border border-slate-800">
                <div className="flex justify-between items-center mb-1.5">
                  <h3 className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                    <HelpCircle size={12} /> AI Tactical Hints
                  </h3>
                  <button
                    onClick={handleRequestHint}
                    disabled={loadingHint}
                    className="text-[10px] text-indigo-300 hover:text-indigo-200 font-bold flex items-center gap-0.5 disabled:opacity-50"
                  >
                    {loadingHint ? (
                      <>
                        <RefreshCw size={10} className="animate-spin" /> Analyzing...
                      </>
                    ) : (
                      "Ask Coach"
                    )}
                  </button>
                </div>

                {!currentHint && !loadingHint && (
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Stuck in a position? Tap "Ask Coach" to receive a subtle suggestion targeting tactical motifs.
                  </p>
                )}

                {hintError && (
                  <p className="text-[9px] text-rose-400 mt-1.5 leading-relaxed font-semibold">
                    {hintError}
                  </p>
                )}

                {currentHint && (
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] bg-indigo-600/30 text-indigo-300 font-bold px-1.5 py-0.5 rounded uppercase">
                        {currentHint.motif}
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-slate-300 leading-relaxed bg-[#1E293B] p-2 rounded border border-slate-800">
                      <strong>Coach clue:</strong> "{currentHint.subtleHint}"
                    </p>

                    {!showFullHint ? (
                      <button
                        onClick={() => setShowFullHint(true)}
                        className="w-full text-center py-1 bg-slate-800 hover:bg-slate-700 text-[9px] font-bold rounded uppercase text-slate-300 tracking-wider transition-all"
                      >
                        Reveal Solution Move
                      </button>
                    ) : (
                      <div className="space-y-1.5 bg-indigo-950/20 border border-indigo-500/20 p-2 rounded animate-fadeIn">
                        <p className="text-[10px] text-slate-200 font-bold">
                          Recommended Move: <span className="text-indigo-400 text-xs font-mono font-black">{currentHint.recommendedMove}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                          {currentHint.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SPECIAL CHESS RULES & LIVE TRACKER ASSIST (Play view only) */}
            {activeTab === "play" && (
              <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setIsRulesPanelExpanded(!isRulesPanelExpanded)}
                  className="w-full flex justify-between items-center bg-[#1E293B]/80 px-3.5 py-2.5 text-left border-b border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-indigo-400 font-bold text-xs">🎓 Special Rules Guide</span>
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-300 font-extrabold px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-widest">
                      Live Assist
                    </span>
                  </div>
                  <span className="text-slate-400 text-xs">
                    {isRulesPanelExpanded ? "▲" : "▼"}
                  </span>
                </button>

                {isRulesPanelExpanded && (
                  <div className="p-3.5 space-y-3.5 animate-fadeIn">
                    {/* Compact Interactive Tab selector */}
                    <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-md border border-slate-800/80">
                      {[
                        { id: "castling", label: "🏰 Castle" },
                        { id: "enpassant", label: "💨 E.P." },
                        { id: "promotion", label: "👑 Promote" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setSelectedRulesTab(tab.id as any)}
                          className={`py-1.5 rounded flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                            selectedRulesTab === tab.id
                              ? "bg-indigo-600/90 text-white shadow-md font-bold"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                          }`}
                        >
                          <span className="text-[10px] tracking-tight font-extrabold">{tab.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Tab contents */}
                    {(() => {
                      const getCastlingAndEnPassantStatus = (chessInstance: Chess) => {
                        try {
                          const fen = chessInstance.fen();
                          const parts = fen.split(" ");
                          const castlingPart = parts[2] || "-";
                          const epSquare = parts[3] || "-";

                          return {
                            whiteKingside: castlingPart.includes("K"),
                            whiteQueenside: castlingPart.includes("Q"),
                            blackKingside: castlingPart.includes("k"),
                            blackQueenside: castlingPart.includes("q"),
                            enPassantSquare: epSquare === "-" ? null : epSquare,
                          };
                        } catch (e) {
                          console.error("Error parsing FEN for rules status:", e);
                          return {
                            whiteKingside: false,
                            whiteQueenside: false,
                            blackKingside: false,
                            blackQueenside: false,
                            enPassantSquare: null,
                          };
                        }
                      };

                      const status = getCastlingAndEnPassantStatus(game);
                      
                      if (selectedRulesTab === "castling") {
                        return (
                          <div className="space-y-2.5 text-left text-[10px] md:text-xs leading-relaxed animate-fadeIn">
                            <p className="text-slate-400">
                              Move your King <strong className="text-slate-200">2 squares</strong> towards a Rook. The Rook automatically jumps over. Neither King nor Rook can have moved before!
                            </p>
                            
                            {/* Live Castling Status Meter */}
                            <div className="bg-slate-950 border border-slate-800/80 rounded-md p-2 space-y-2">
                              <span className="text-[8px] font-extrabold text-indigo-400 uppercase tracking-widest block border-b border-slate-800/60 pb-1">
                                Live Castling Eligibility
                              </span>
                              <div className="grid grid-cols-2 gap-2 text-[9px] font-medium text-slate-300">
                                <div>
                                  <span className="text-slate-500 block uppercase tracking-tighter">White (You)</span>
                                  <div className="flex flex-col gap-0.5 mt-1 font-mono">
                                    <div className="flex items-center gap-1.5">
                                      <span className={status.whiteKingside ? "text-emerald-400" : "text-slate-500"}>
                                        {status.whiteKingside ? "🟢" : "❌"}
                                      </span>
                                      <span>Kingside (O-O)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className={status.whiteQueenside ? "text-emerald-400" : "text-slate-500"}>
                                        {status.whiteQueenside ? "🟢" : "❌"}
                                      </span>
                                      <span>Queenside (O-O-O)</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-slate-500 block uppercase tracking-tighter">Black (AI)</span>
                                  <div className="flex flex-col gap-0.5 mt-1 font-mono">
                                    <div className="flex items-center gap-1.5">
                                      <span className={status.blackKingside ? "text-emerald-400" : "text-slate-500"}>
                                        {status.blackKingside ? "🟢" : "❌"}
                                      </span>
                                      <span>Kingside (o-o)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className={status.blackQueenside ? "text-emerald-400" : "text-slate-500"}>
                                        {status.blackQueenside ? "🟢" : "❌"}
                                      </span>
                                      <span>Queenside (o-o-o)</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (selectedRulesTab === "enpassant") {
                        return (
                          <div className="space-y-2.5 text-left text-[10px] md:text-xs leading-relaxed animate-fadeIn">
                            <p className="text-slate-400">
                              If an opponent advances a pawn <strong className="text-slate-200">two squares</strong> and lands next to yours, you can capture it diagonally "in passing". This must be done <em className="text-indigo-400 font-bold">immediately</em>!
                            </p>

                            {/* Live En Passant Detector */}
                            <div className="bg-slate-950 border border-slate-800/80 rounded-md p-2 flex flex-col gap-1">
                              <span className="text-[8px] font-extrabold text-indigo-400 uppercase tracking-widest block border-b border-slate-800/60 pb-1">
                                En Passant Tracker
                              </span>
                              <div className="flex items-center justify-between mt-1 text-[9px]">
                                <span className="text-slate-500">Active E.P. Target Square:</span>
                                <span className={`font-mono font-black px-1.5 py-0.5 rounded ${
                                  status.enPassantSquare 
                                    ? "bg-amber-500/20 text-amber-400 animate-pulse border border-amber-500/30" 
                                    : "bg-slate-900 text-slate-500"
                                }`}>
                                  {status.enPassantSquare ? status.enPassantSquare.toUpperCase() : "NONE ACTIVE"}
                                </span>
                              </div>
                              {status.enPassantSquare && (
                                <p className="text-[8px] text-amber-400/90 mt-1 leading-snug">
                                  🔥 A pawn can now be captured on {status.enPassantSquare}! Select your adjacent pawn to see the active capture option.
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      }

                      if (selectedRulesTab === "promotion") {
                        return (
                          <div className="space-y-2.5 text-left text-[10px] md:text-xs leading-relaxed animate-fadeIn">
                            <p className="text-slate-400">
                              Advance any pawn to the <strong className="text-slate-200">opposite end rank</strong> (8th rank for White, 1st for Black) to automatically promote it into a more powerful piece of your choice.
                            </p>
                            <div className="bg-slate-950 border border-slate-800/80 rounded-md p-2 flex gap-1.5 items-center">
                              <span className="text-indigo-400 text-lg leading-none">👑</span>
                              <div>
                                <span className="text-[8px] font-bold text-indigo-300 block uppercase tracking-wide">Promotion Tip</span>
                                <span className="text-[9px] text-slate-400">Queens are usually chosen, but Knights can occasionally create immediate fork tactics!</span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* LIVE MISTAKES NOTES FEED (Play view / Replay view only) */}
            {(activeTab === "play" || activeTab === "saved") && (
              <div className="space-y-2.5">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 border-b border-slate-800 pb-1.5">
                  <AlertTriangle size={12} className="text-amber-400" /> Recorded Mistakes ({
                    selectedSavedGame ? selectedSavedGame.mistakes.length : mistakes.length
                  })
                </h3>

                {/* Show mistakes list */}
                {(() => {
                  const activeMistakes = selectedSavedGame ? selectedSavedGame.mistakes : mistakes;
                  if (activeMistakes.length === 0) {
                    return (
                      <p className="text-[10px] text-slate-500 italic">No major blunders or mistakes captured yet. Your moves are evaluated in centipawns in real-time.</p>
                    );
                  }

                  return (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {activeMistakes.map((m, i) => (
                        <div key={i} className="bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-md text-left">
                          <div className="flex justify-between items-center text-[10px] font-bold text-amber-300">
                            <span>Move {m.moveNumber} ({m.turn === "w" ? "White" : "Black"})</span>
                            <span className="font-mono text-slate-400">Played: {m.moveMade} → Best: {m.recommendedMove}</span>
                          </div>

                          {!m.explanation ? (
                            <div className="flex items-center gap-2 mt-1.5">
                              <RefreshCw size={10} className="animate-spin text-amber-400" />
                              <span className="text-[9px] text-slate-400">AI analysis loading...</span>
                            </div>
                          ) : (
                            <div className="mt-1.5 space-y-1.5 text-[10px] text-slate-300 leading-relaxed border-t border-amber-500/10 pt-1.5">
                              <p>
                                <strong className="text-amber-200">Mistake:</strong> {m.explanation.whyMistake}
                              </p>
                              <p>
                                <strong className="text-rose-300">How exploited:</strong> {m.explanation.howExploited}
                              </p>
                              <p>
                                <strong className="text-emerald-300">Why recommended is better:</strong> {m.explanation.whyBetter}
                              </p>
                              <div className="bg-slate-900/60 p-1.5 rounded mt-1.5 border border-slate-800">
                                <span className="text-[8px] text-indigo-400 font-extrabold block uppercase">Coach Rule of Thumb</span>
                                <span className="text-[9px] text-indigo-200 italic leading-snug">"{m.explanation.educationalRule}"</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* LESSON DETAILS IN SIDEBAR (Lessons view only) */}
            {activeTab === "lessons" && selectedLesson && (
              <div className="space-y-3">
                <div className="bg-slate-900 p-3 rounded border border-slate-800 text-left">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tactical Motif</h4>
                  <p className="text-xs font-black text-indigo-400">{selectedLesson.motif}</p>
                </div>
                
                <div className="bg-[#1E293B] p-3 rounded border border-slate-800 text-left space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lesson Goal</h4>
                  <ul className="text-[10px] text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                    <li>Analyze the current layout on the board.</li>
                    <li>Move {lessonBoard?.turn() === "w" ? "White" : "Black"} pieces to solve.</li>
                    <li>Find a trade, fork, pin, skewer or checkmate pattern.</li>
                    <li>Read the Master coach explanation once completed!</li>
                  </ul>
                </div>
              </div>
            )}

          </div>
        </aside>
      </main>

      {/* Footer Navigation / Control Bar */}
      <footer id="app-footer" className="h-16 md:h-[70px] bg-[#1E293B] border-t border-slate-800 flex items-center px-3 md:px-6 gap-2 md:gap-4 shrink-0 select-none overflow-x-auto md:overflow-visible">
        {activeTab === "play" && (
          <>
            <button
              id="btn-undo"
              onClick={handleUndo}
              disabled={isAiThinking || moveHistory.length === 0}
              className="flex flex-col items-center justify-center px-3 md:px-5 h-11 md:h-12 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-slate-300 transition-colors border border-slate-700/50 cursor-pointer min-w-[50px] md:min-w-16 flex-shrink-0"
            >
              <Undo2 size={13} className="md:w-[15px] md:h-[15px]" />
              <span className="text-[8px] md:text-[9px] uppercase font-bold mt-1">Undo</span>
            </button>
            
            <button
              id="btn-hint"
              onClick={handleRequestHint}
              disabled={isAiThinking || game.isGameOver()}
              className="flex flex-col items-center justify-center px-3 md:px-5 h-11 md:h-12 bg-slate-800 hover:bg-indigo-600 disabled:opacity-30 rounded text-slate-300 hover:text-white transition-colors border border-slate-700/50 cursor-pointer min-w-[50px] md:min-w-16 flex-shrink-0"
            >
              <HelpCircle size={13} className="md:w-[15px] md:h-[15px]" />
              <span className="text-[8px] md:text-[9px] uppercase font-bold mt-1">Hint</span>
            </button>
            
            <button
              id="btn-analysis"
              onClick={() => {
                if (game.isGameOver() || timerState.timeLimitExceeded) {
                  handleRequestAnalysis();
                } else {
                  if (window.confirm("Game is still active! Analyze current state and conclude match?")) {
                    setTimerState((prev) => ({ ...prev, isActive: false }));
                    handleRequestAnalysis();
                  }
                }
              }}
              disabled={moveHistory.length === 0}
              className="flex flex-col items-center justify-center px-3 md:px-5 h-11 md:h-12 bg-slate-800 hover:bg-emerald-600 disabled:opacity-30 rounded text-slate-300 hover:text-white transition-all border border-slate-700/50 cursor-pointer min-w-[50px] md:min-w-16 flex-shrink-0"
            >
              <Sparkles size={13} className="md:w-[15px] md:h-[15px]" />
              <span className="text-[8px] md:text-[9px] uppercase font-bold mt-1">Analysis</span>
            </button>

            <div className="flex-1 md:block hidden"></div>

            <button
              id="btn-offer-draw"
              onClick={handleOfferDraw}
              disabled={game.isGameOver()}
              className="px-3 md:px-6 py-2 md:py-2.5 bg-[#1E293B] hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded text-[10px] md:text-xs border border-slate-700 shadow transition-all uppercase tracking-wider whitespace-nowrap flex-shrink-0"
            >
              Offer Draw
            </button>
            <button
              id="btn-resign"
              onClick={handleResign}
              disabled={game.isGameOver()}
              className="px-3 md:px-6 py-2 md:py-2.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white font-bold rounded text-[10px] md:text-xs border border-red-500/30 transition-all uppercase tracking-wider whitespace-nowrap flex-shrink-0"
            >
              Resign
            </button>
          </>
        )}

        {activeTab === "lessons" && selectedLesson && (
          <>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Stuck? Use the clue in the sidebar or restart the tactical challenge layout.
            </span>
            <div className="flex-1"></div>
            <button
              onClick={handleResetLesson}
              className="px-4 md:px-6 py-2 md:py-2.5 bg-[#1E293B] hover:bg-slate-700 text-slate-300 font-bold rounded text-[10px] md:text-xs border border-slate-700 uppercase tracking-wider whitespace-nowrap"
            >
              Reset Lesson
            </button>
            <button
              onClick={() => {
                const currentIndex = TACTICAL_LESSONS.findIndex((l) => l.id === selectedLesson.id);
                const nextIndex = (currentIndex + 1) % TACTICAL_LESSONS.length;
                handleSelectLesson(TACTICAL_LESSONS[nextIndex]);
              }}
              className="px-4 md:px-6 py-2 md:py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-[10px] md:text-xs shadow-lg uppercase tracking-wider whitespace-nowrap"
            >
              Next Motif
            </button>
          </>
        )}

        {activeTab === "saved" && selectedSavedGame && (
          <>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Replay controls: Step forwards and backwards to inspect mistakes and piece alignments.
            </span>
            <div className="flex-1"></div>
            <button
              onClick={() => {
                setActiveTab("play");
                setSelectedSavedGame(null);
              }}
              className="px-4 md:px-6 py-2 md:py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-[10px] md:text-xs shadow-lg uppercase tracking-wider whitespace-nowrap"
            >
              Back to Active Play
            </button>
          </>
        )}
      </footer>

    </div>
  );
}
