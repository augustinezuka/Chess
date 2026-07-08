import { TacticalLesson } from "../types";

export const TACTICAL_LESSONS: TacticalLesson[] = [
  {
    id: "lesson_fork_1",
    title: "The Royal Knight Fork",
    motif: "Knight Fork",
    description: "Forks are moves where a single piece attacks two or more opponent pieces simultaneously. Knights are the masters of forks because of their unique 'L-shaped' movement. In this position, find the knight jump that attacks both Black's king and queen at the same time.",
    fen: "r3k2r/ppq2ppp/4b3/4p1B1/2NnP3/8/PP3QPP/R3KBNR w KQkq - 1 12",
    targetMove: "Nd6+",
    hint: "Look for a square where your White Knight can check the Black King on e8 while also threatening the Black Queen on c7.",
    explanation: "Playing Nd6+ checks Black's King. Since the knight cannot be captured safely (and the King must move), Black is forced to run with their King, leaving their powerful Queen on c7 completely vulnerable to capture on the very next move."
  },
  {
    id: "lesson_pin_2",
    title: "The Pin is Mightier than the Sword",
    motif: "Absolute Pin",
    description: "A pin occurs when an attacked piece cannot move without exposing a more valuable piece behind it. An 'absolute pin' is when the piece behind is the King, meaning the pinned piece is legally forbidden from moving. Exploit the absolute pin on Black's f-pawn.",
    fen: "r1bqk2r/ppppbppp/2n5/4p1B1/4P1P1/3P1N2/PPP2P1P/RN1QKB1R b KQkq - 0 5",
    targetMove: "Bxg5",
    hint: "Identify the Black piece pinned to the King, or look for a trade that takes advantage of White's exposed Bishop on g5.",
    explanation: "This lesson demonstrates capitalizing on an undefended bishop. By playing Bxg5, Black captures White's active light-squared bishop, gaining a clean material advantage."
  },
  {
    id: "lesson_skewer_3",
    title: "The Skewer Attack",
    motif: "Skewer",
    description: "A skewer is the opposite of a pin. A valuable piece is attacked first, and when it moves to safety, a less valuable piece behind it is left exposed. In this endgame, White has a winning skewer. Find it!",
    fen: "8/1R6/8/2k5/8/r7/2K5/8 w - - 0 1",
    targetMove: "Rb2",
    hint: "Your Rook wants to position itself to check the Black King while lining up with the undefended Rook behind it.",
    explanation: "By playing Rb2, White safeguards their positioning. In chess endgames, skewers are highly effective because kings are forced to flee checks, exposing Rooks or Queens behind them on the same rank or file."
  },
  {
    id: "lesson_discovered_4",
    title: "The Discovered Check",
    motif: "Discovered Attack",
    description: "A discovered attack happens when you move a piece out of the way, unleashing an attack from a friendly piece behind it. If the unleashed attack is a check, it's called a discovered check, which is incredibly destructive because the opponent must respond to the check immediately, letting you capture anything with the moving piece. Win Black's Queen!",
    fen: "rn2kb1r/pp2pppp/2p2n2/q7/2B3b1/2NP1N2/PPPB1PPP/R2QK2R w KQkq - 1 8",
    targetMove: "Nd5",
    hint: "Move your White Knight to attack Black's Queen on a5, which simultaneously opens up your Bishop on d2 to attack the Queen, or discover an attack on Black's center.",
    explanation: "By jumping Nd5, White attacks the Queen on a5. More importantly, it clears the c3 square, unleashing a direct discovery. This double-threat wins massive tempo and material."
  },
  {
    id: "lesson_back_rank_5",
    title: "Smothered Back-Rank Mate",
    motif: "Back-Rank Mate",
    description: "A back-rank mate is a checkmate delivered by a Rook or Queen along the opponent's back rank (the 1st or 8th rank), where the opponent's king is trapped behind its own shield of pawns. Deliver checkmate in one move!",
    fen: "6kr/5ppp/8/8/8/8/8/4R1K1 w - - 0 1",
    targetMove: "Re8#",
    hint: "Attack the Black King directly on the 8th rank with your Rook. Note how Black's own pawns block its escape.",
    explanation: "Playing Re8# places the Black King in check. Because the King is completely boxed in by its own pawns on f7, g7, and h7, and no Black piece can block or capture the Rook, it is a clean back-rank checkmate!"
  }
];
