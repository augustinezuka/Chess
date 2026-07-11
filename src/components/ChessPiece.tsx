import React from "react";

interface ChessPieceProps {
  type: string; // 'p', 'r', 'n', 'b', 'q', 'k'
  color: "w" | "b";
  className?: string;
  pieceStyle?: "classic" | "minimal" | "abstract" | "neon" | "royal" | "nature" | "glass" | "gothic" | "shadow" | "retro8bit" | "space" | "aurora" | "steampunk" | "origami" | "cartoon" | "egyptian" | "pirate" | "cyberGlitch";
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

  // 4. Neon Cyberpunk Glow Pieces
  if (pieceStyle === "neon") {
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
        className={`flex items-center justify-center w-full h-full text-4xl md:text-5xl select-none leading-none transition-all duration-300 ${
          isWhite
            ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.95)] drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)] filter font-extrabold"
            : "text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.95)] drop-shadow-[0_2px_3px_rgba(0,0,0,0.4)] filter font-extrabold"
        }`}
      >
        {pieceChar}
      </div>
    );
  }

  // 5. Deluxe Royal Metallic Tokens (Gold vs Sapphire/Obsidian)
  if (pieceStyle === "royal") {
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
        className={`flex items-center justify-center w-[85%] h-[85%] mx-auto rounded-full border shadow-md aspect-square select-none transition-all duration-150 ${
          isWhite
            ? "bg-gradient-to-br from-yellow-50 via-amber-200 to-amber-500 text-amber-950 border-amber-300 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.9),0_2px_4px_rgba(0,0,0,0.35)]"
            : "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 text-slate-100 border-slate-600 shadow-[inset_0_1.5px_2.5px_rgba(255,255,255,0.18),0_2px_4px_rgba(0,0,0,0.5)]"
        }`}
      >
        <span className="text-2xl md:text-3xl leading-none font-bold">
          {pieceChar}
        </span>
      </div>
    );
  }

  // 6. Nature Hand-carved Wood Grains
  if (pieceStyle === "nature") {
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
        className={`flex items-center justify-center w-[85%] h-[85%] mx-auto rounded-lg border shadow-md aspect-square select-none transition-all duration-150 ${
          isWhite
            ? "bg-gradient-to-br from-[#F5E6CA] via-[#E6D5B8] to-[#D4C3A3] text-[#5C3D2E] border-[#C4B292] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.7),0_2px_3px_rgba(0,0,0,0.12)]"
            : "bg-gradient-to-br from-[#4A3933] via-[#352F2C] to-[#251D1A] text-[#E6D5B8] border-[#2A1E1A] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.1),0_2px_3.5px_rgba(0,0,0,0.4)]"
        }`}
      >
        <span className="text-2xl md:text-3xl leading-none font-bold">
          {pieceChar}
        </span>
      </div>
    );
  }

  // 7. Translucent Glass Orbs
  if (pieceStyle === "glass") {
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
        className={`flex items-center justify-center w-[85%] h-[85%] mx-auto rounded-full border shadow-lg aspect-square select-none backdrop-blur-xs transition-all duration-150 ${
          isWhite
            ? "bg-white/40 border-white/60 text-indigo-950 shadow-[0_4px_8px_rgba(255,255,255,0.15),inset_0_2px_4px_rgba(255,255,255,0.6)]"
            : "bg-slate-950/40 border-slate-700/50 text-cyan-200 shadow-[0_4px_8px_rgba(0,0,0,0.35),inset_0_2px_4px_rgba(255,255,255,0.1)]"
        }`}
      >
        <span className={`text-2xl md:text-3xl leading-none font-extrabold ${isWhite ? "drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]" : "drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"}`}>
          {pieceChar}
        </span>
      </div>
    );
  }

  // 8. Dark Medieval/Gothic Seals
  if (pieceStyle === "gothic") {
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
        className={`flex items-center justify-center w-[80%] h-[80%] mx-auto border-2 shadow-[2px_2px_5px_rgba(0,0,0,0.35)] aspect-square select-none transition-all duration-150 rounded-md rotate-45 ${
          isWhite
            ? "bg-stone-200 border-amber-600 text-stone-850 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]"
            : "bg-slate-900 border-red-700 text-red-500 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.15)]"
        }`}
      >
        <span className="text-2xl md:text-3xl leading-none font-black -rotate-45 block">
          {pieceChar}
        </span>
      </div>
    );
  }

  // 9. Ghostly Glowing Shadows
  if (pieceStyle === "shadow") {
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
        className={`flex items-center justify-center w-full h-full text-4xl md:text-5xl select-none leading-none transition-all duration-300 ${
          isWhite
            ? "text-yellow-100 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] filter font-extrabold scale-105"
            : "text-purple-350 drop-shadow-[0_0_10px_rgba(192,132,252,0.8)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] filter font-extrabold scale-105"
        }`}
      >
        {pieceChar}
      </div>
    );
  }

  // 10. Monospace Retro 8-Bit Boxes
  if (pieceStyle === "retro8bit") {
    const labels: Record<string, string> = {
      k: "KNG",
      q: "QUN",
      r: "ROK",
      b: "BSH",
      n: "KNT",
      p: "PWN",
    };

    const label = labels[lowerType] || "";

    return (
      <div
        className={`flex items-center justify-center w-[85%] h-[80%] mx-auto border-2 font-mono text-[9px] md:text-[10px] font-black select-none tracking-tight rounded-none transition-all duration-150 ${
          isWhite
            ? "bg-black border-emerald-400 text-emerald-400 shadow-[2px_2px_0px_#059669]"
            : "bg-black border-rose-500 text-rose-500 shadow-[2px_2px_0px_#be123c]"
        }`}
      >
        {label}
      </div>
    );
  }

  // 11. Planetary Cosmic Nebulas
  if (pieceStyle === "space") {
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
        className={`flex items-center justify-center w-[85%] h-[85%] mx-auto rounded-full border shadow-lg aspect-square select-none transition-all duration-300 ${
          isWhite
            ? "bg-gradient-to-tr from-sky-900 via-indigo-700 to-cyan-500 text-white border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.45)]"
            : "bg-gradient-to-tr from-purple-950 via-fuchsia-900 to-rose-700 text-fuchsia-100 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.45)]"
        }`}
      >
        <span className="text-2xl md:text-3xl leading-none drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.55)] font-bold">
          {pieceChar}
        </span>
      </div>
    );
  }

  // 12. Aurora Borealis Discs
  if (pieceStyle === "aurora") {
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
        className={`flex items-center justify-center w-[85%] h-[85%] mx-auto rounded-full border shadow-md aspect-square select-none transition-all duration-150 ${
          isWhite
            ? "bg-gradient-to-br from-emerald-500/80 to-teal-400/80 text-emerald-950 border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.35)]"
            : "bg-gradient-to-br from-indigo-950/90 to-purple-800/90 text-purple-250 border-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.35)]"
        }`}
      >
        <span className="text-2xl md:text-3xl leading-none font-black">
          {pieceChar}
        </span>
      </div>
    );
  }

  // 13. Steam & Brass Steampunk
  if (pieceStyle === "steampunk") {
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
        className={`flex items-center justify-center w-[85%] h-[85%] mx-auto rounded-full border shadow-md aspect-square select-none transition-all duration-150 ${
          isWhite
            ? "bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 text-stone-900 border-amber-500 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.65),2px_2px_4px_rgba(0,0,0,0.3)]"
            : "bg-gradient-to-br from-stone-600 via-stone-750 to-stone-900 text-amber-200 border-stone-800 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.1),2px_2px_4px_rgba(0,0,0,0.45)]"
        }`}
      >
        <div className="w-[88%] h-[88%] rounded-full border border-dashed border-stone-500/35 flex items-center justify-center">
          <span className="text-2xl md:text-3xl leading-none font-extrabold">
            {pieceChar}
          </span>
        </div>
      </div>
    );
  }

  // 14. Folded Geometric Origami
  if (pieceStyle === "origami") {
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
        className={`flex items-center justify-center w-[80%] h-[80%] mx-auto shadow-md aspect-square select-none transition-all duration-150 ${
          isWhite
            ? "bg-[#FFFDF9] text-[#2C3E50] border-t border-l border-[#BDC3C7]"
            : "bg-[#2C3E50] text-[#ECF0F1] border-b border-r border-[#34495E]"
        }`}
        style={{ clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)" }}
      >
        <span className="text-2xl md:text-2.5xl leading-none font-bold">
          {pieceChar}
        </span>
      </div>
    );
  }

  // 15. Cute Playful Cartoon Emojis
  if (pieceStyle === "cartoon") {
    const labels: Record<string, string> = {
      k: "👑",
      q: "💖",
      r: "🏰",
      b: "🧙",
      n: "🦄",
      p: "🍪",
    };

    const pieceChar = labels[lowerType] || "";

    return (
      <div
        className={`flex items-center justify-center w-[85%] h-[85%] mx-auto border border-slate-950 rounded-xl aspect-square select-none shadow-[2px_2px_0px_#000] transition-all duration-150 ${
          isWhite
            ? "bg-yellow-100"
            : "bg-indigo-300"
        }`}
      >
        <span className="text-2.5xl md:text-3xl leading-none filter drop-shadow-[0_1px_0_rgba(0,0,0,0.2)]">
          {pieceChar}
        </span>
      </div>
    );
  }

  // 16. Ancient Egyptian Hieroglyphs
  if (pieceStyle === "egyptian") {
    const labels: Record<string, string> = {
      k: "𓋹", // Ankh (Life/King)
      q: "𓁐", // Goddess (Queen)
      r: "𓉡", // Temple (Rook)
      b: "𓅃", // Falcon Horus (Bishop)
      n: "𓃗", // Horse (Knight)
      p: "𓆣", // Scarab Beetle (Pawn)
    };

    const pieceChar = labels[lowerType] || "";

    return (
      <div
        className={`flex items-center justify-center w-[85%] h-[85%] mx-auto rounded-full border shadow-md aspect-square select-none transition-all duration-150 ${
          isWhite
            ? "bg-gradient-to-br from-[#F5E6C9] via-[#E6D4B7] to-[#C8B28F] text-[#4E3629] border-[#B59C75] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.8),0_2px_4px_rgba(0,0,0,0.18)]"
            : "bg-gradient-to-br from-[#403026] via-[#2F2119] to-[#1C120E] text-[#E6D4B7] border-[#251913] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.12),0_2px_4px_rgba(0,0,0,0.45)]"
        }`}
      >
        <span className="text-2.5xl md:text-3xl leading-none font-bold filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
          {pieceChar}
        </span>
      </div>
    );
  }

  // 17. Pirate & Sea Treasure
  if (pieceStyle === "pirate") {
    const labels: Record<string, string> = {
      k: "🏴‍☠️", // Pirate flag (King)
      q: "💎", // Diamond (Queen)
      r: "⚓", // Anchor (Rook)
      b: "🦜", // Parrot (Bishop)
      n: "🦈", // Shark (Knight)
      p: "🪙", // Gold Coin (Pawn)
    };

    const pieceChar = labels[lowerType] || "";

    return (
      <div
        className={`flex items-center justify-center w-[85%] h-[85%] mx-auto rounded-lg border-2 shadow-lg aspect-square select-none transition-all duration-150 ${
          isWhite
            ? "bg-gradient-to-br from-amber-100 to-yellow-500 text-[#2C1B10] border-amber-600 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.8),0_2px_4px_rgba(0,0,0,0.25)]"
            : "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 text-slate-100 border-slate-900 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.12),0_2px_4px_rgba(0,0,0,0.5)]"
        }`}
      >
        <span className="text-2.5xl md:text-3xl leading-none filter drop-shadow-[0_1.5px_1px_rgba(0,0,0,0.25)]">
          {pieceChar}
        </span>
      </div>
    );
  }

  // 18. Cyber Chromatic Glitch
  if (pieceStyle === "cyberGlitch") {
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
      <div className="relative flex items-center justify-center w-full h-full text-4xl md:text-5xl select-none leading-none transition-all duration-150 group">
        <span className={`absolute select-none font-extrabold opacity-70 animate-pulse text-red-500 translate-x-0.5 -translate-y-0.5`}>
          {pieceChar}
        </span>
        <span className={`absolute select-none font-extrabold opacity-70 animate-pulse text-cyan-400 -translate-x-0.5 translate-y-0.5`}>
          {pieceChar}
        </span>
        <span className={`absolute font-extrabold z-10 ${
          isWhite ? "text-white" : "text-slate-950"
        }`}>
          {pieceChar}
        </span>
      </div>
    );
  }

  return null;
};

