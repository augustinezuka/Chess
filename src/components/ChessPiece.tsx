import React from "react";

interface ChessPieceProps {
  type: string; // 'p', 'r', 'n', 'b', 'q', 'k'
  color: "w" | "b";
  className?: string;
  pieceStyle?: "classic" | "minimal" | "abstract";
}

export const ChessPiece: React.FC<ChessPieceProps> = ({
  type,
  color,
  className = "w-full h-full",
  pieceStyle = "classic",
}) => {
  const isWhite = color === "w";
  const lowerType = type.toLowerCase();

  // 1. Classic Wikipedia SVG pieces
  const pieceUrls: Record<string, string> = {
    w_p: "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg",
    w_r: "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg",
    w_n: "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg",
    w_b: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg",
    w_q: "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
    w_k: "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg",
    b_p: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg",
    b_r: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg",
    b_n: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg",
    b_b: "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg",
    b_q: "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg",
    b_k: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg",
  };

  if (pieceStyle === "classic") {
    const key = `${color}_${lowerType}`;
    const src = pieceUrls[key];
    if (!src) return null;

    return (
      <img
        src={src}
        alt={`${color === "w" ? "White" : "Black"} ${lowerType}`}
        className={`${className} select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]`}
        referrerPolicy="no-referrer"
      />
    );
  }

  // 2. Minimalist Unicode Silhouettes
  // Force text-mode rendering using the Unicode variation selector-15 (\uFE0E) to prevent OS emoji override
  if (pieceStyle === "minimal") {
    const unicodePieces: Record<string, string> = {
      k: "♚\uFE0E",
      q: "♛\uFE0E",
      r: "♜\uFE0E",
      b: "♝\uFE0E",
      n: "♞\uFE0E",
      p: "♟\uFE0E",
    };

    const pieceChar = unicodePieces[lowerType];
    if (!pieceChar) return null;

    return (
      <div
        className={`flex items-center justify-center w-full h-full text-4xl md:text-5xl select-none leading-none transition-all duration-150 ${
          isWhite
            ? "text-slate-50 drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] filter font-semibold"
            : "text-slate-900 drop-shadow-[0_1.5px_1px_rgba(255,255,255,0.7)] drop-shadow-[0_2.5px_3.5px_rgba(0,0,0,0.85)] filter font-semibold"
        }`}
      >
        {pieceChar}
      </div>
    );
  }

  // 3. Abstract Notation Tokens (Letter-based)
  if (pieceStyle === "abstract") {
    const labels: Record<string, string> = {
      k: "K",
      q: "Q",
      r: "R",
      b: "B",
      n: "N",
      p: "P",
    };

    const label = labels[lowerType] || "";

    return (
      <div
        className={`flex items-center justify-center w-full h-full rounded-full border border-slate-700/20 shadow-md aspect-square select-none transition-all duration-150 ${
          isWhite
            ? "bg-gradient-to-br from-amber-50 to-amber-100/90 text-amber-900 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.9),0_2px_4px_rgba(0,0,0,0.12)] border-amber-300/60"
            : "bg-gradient-to-br from-slate-800 to-slate-950 text-slate-100 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.15),0_2px_4px_rgba(0,0,0,0.4)] border-slate-700/60"
        }`}
      >
        <span className="font-mono font-black text-lg md:text-xl tracking-tighter leading-none">
          {label}
        </span>
      </div>
    );
  }

  return null;
};

