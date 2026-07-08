import React from "react";

interface ChessPieceProps {
  type: string; // 'p', 'r', 'n', 'b', 'q', 'k'
  color: "w" | "b";
  className?: string;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, className = "w-full h-full" }) => {
  const isWhite = color === "w";
  const lowerType = type.toLowerCase();

  // Standard high-resolution Wikipedia Chess piece vector URLs
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
};

