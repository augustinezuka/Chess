export interface ChessOpening {
  id: string;
  name: string;
  category: string;
  moves: string[]; // Sequence of moves in SAN format, e.g. ["e4", "e5", "Nf3", "Nc6", "Bc4"]
  description: string;
  strategicTheme: string;
  tacticalTricks: string;
}

export const CHESS_OPENINGS: ChessOpening[] = [
  // --- Open Games (1.e4 e5) ---
  {
    id: "kings_gambit",
    name: "King's Gambit",
    category: "Open Games (1.e4 e5)",
    moves: ["e4", "e5", "f4"],
    description: "One of the oldest and most aggressive chess openings. White immediately sacrifices a wing pawn on f4 to draw Black's e5 pawn away from the center, aiming to build a massive pawn center with d4 and open the f-file for kingside attacks.",
    strategicTheme: "Rapid king-side attack, central domination, open f-file.",
    tacticalTricks: "Black must watch out for the weak f7 square. White must watch out for Queen checks on h4 if the f-pawn is gone and the knight is drawn away."
  },
  {
    id: "italian_game",
    name: "Italian Game",
    category: "Open Games (1.e4 e5)",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"],
    description: "A highly logical developmental opening. White places the bishop on the active c4 square, targeting the vulnerable f7 pawn, while preparing to castle kingside rapidly.",
    strategicTheme: "Classical center control, rapid development, f7-pawn focus.",
    tacticalTricks: "Leads to tactical battlefields like the Fried Liver Attack (Ng5 sacrificing on f7) or the quiet, solid 'Giuoco Piano'."
  },
  {
    id: "ruy_lopez",
    name: "Ruy López",
    category: "Open Games (1.e4 e5)",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
    description: "Also known as the Spanish Game, the Ruy López is one of the most thoroughly analyzed openings in history. White attacks the knight on c6, which is Black's primary defender of the central e5 pawn.",
    strategicTheme: "Indirect pressure on e5, complex long-term pawn structures, queenside maneuvering.",
    tacticalTricks: "Noah's Ark Trap: Black traps White's light-squared bishop on b3 using queenside pawns (a6, b5, c5, then c4)."
  },
  {
    id: "scotch_game",
    name: "Scotch Game",
    category: "Open Games (1.e4 e5)",
    moves: ["e4", "e5", "Nf3", "Nc6", "d4"],
    description: "White immediately strikes at the center by pushing d4 on move 3. This forces an immediate pawn trade, opening up lines and leading to dynamic, active piece play.",
    strategicTheme: "Immediate central tension, open vertical files, early piece trades.",
    tacticalTricks: "White's central knight on d4 can sometimes be pinned or targeted. Watch out for Black's active queen on h4 or f6 targeting e4/d4."
  },
  {
    id: "vienna_game",
    name: "Vienna Game",
    category: "Open Games (1.e4 e5)",
    moves: ["e4", "e5", "Nc3"],
    description: "A solid alternative to 2.Nf3. White develops the queen's knight first, keeping the f-pawn free to push (f4) on subsequent moves, mimicking a King's Gambit but with extra backup.",
    strategicTheme: "Flexible pawn structures, potential f4 expansion, solid defensive foundations.",
    tacticalTricks: "A quick f4 can lead to sharp tactics. If Black plays 2...Bc5, White can strike with the Vienna Gambit (f4) or even Queen development to g4/f3."
  },
  {
    id: "bishops_opening",
    name: "Bishop's Opening",
    category: "Open Games (1.e4 e5)",
    moves: ["e4", "e5", "Bc4"],
    description: "White develops the light-squared bishop before the knights. This keeps options open, such as pushing the f-pawn (f4) or transposing into an Italian Game or Vienna Game.",
    strategicTheme: "Development flexibility, early f7 pressure, avoiding knight-pin lines.",
    tacticalTricks: "Can transpose to the Scholar's Mate if Black defends carelessly. Black must watch out for a sudden Qh5 or Qf3 combined with Bc4."
  },
  {
    id: "center_game",
    name: "Center Game",
    category: "Open Games (1.e4 e5)",
    moves: ["e4", "e5", "d4", "exd4", "Qxd4"],
    description: "White plays an immediate d4 to blast open the center on move 2. After 2...exd4, White recaptures with the queen. While the queen is exposed, White gets active piece placements.",
    strategicTheme: "Open files, rapid queen mobilization, queenside castling prospects.",
    tacticalTricks: "Black usually plays 3...Nc6 gaining a free tempo by attacking the White queen, so White must retreat the queen safely (usually to Qe3 or Qd1)."
  },
  {
    id: "danish_gambit",
    name: "Danish Gambit",
    category: "Open Games (1.e4 e5)",
    moves: ["e4", "e5", "d4", "exd4", "c3", "dxc3", "Bc4"],
    description: "A double-pawn sacrifice. White gives up two pawns in exchange for two powerful, active bishops slicing across the open board towards Black's un-castled kingside.",
    strategicTheme: "Extreme material sacrifice for overwhelming development, open diagonals.",
    tacticalTricks: "White's bishops on c4 and b2 are devastating. Black must play accurately or return the pawns with d5 to neutralize the fierce attack."
  },
  {
    id: "evans_gambit",
    name: "Evans Gambit",
    category: "Open Games (1.e4 e5)",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "b4"],
    description: "A famous variation of the Italian Game. White sacrifices the b-pawn to draw Black's dark-squared bishop away, gaining a tempo to play c3 and d4, seizing the entire center.",
    strategicTheme: "Sacrificing flank pawns for central acceleration and dangerous open files.",
    tacticalTricks: "White's queen and dark-squared bishop form a highly aggressive battery on the b3-f7 and a3-f8 diagonals."
  },
  {
    id: "ponziani_opening",
    name: "Ponziani Opening",
    category: "Open Games (1.e4 e5)",
    moves: ["e4", "e5", "Nf3", "Nc6", "c3"],
    description: "One of the oldest recorded openings. White plays 3.c3 to prepare a massive d4 push. It is relatively rare but full of surprising tricks for unprepared opponents.",
    strategicTheme: "Preparing d4, keeping a backup pawn on c3, solid piece chains.",
    tacticalTricks: "If Black plays the aggressive counter-strike 3...d5, White can respond with 4.Qa4! pinning the c6 knight, setting up severe tactical traps."
  },

  // --- Sicilian Defense (1.e4 c5) ---
  {
    id: "sicilian_defense",
    name: "Sicilian Defense",
    category: "Sicilian Defense",
    moves: ["e4", "c5"],
    description: "The most popular and successful defense to 1.e4. By playing c5, Black fights for the center symmetrically but creates an asymmetrical board position, playing for a win from move one.",
    strategicTheme: "Asymmetry, half-open c-file, counterplay on the queenside, central d-pawn trades.",
    tacticalTricks: "Extremely sharp tactical lines. Black usually trades the c-pawn for White's d-pawn, establishing an extra central pawn advantage."
  },
  {
    id: "sicilian_najdorf",
    name: "Najdorf Variation",
    category: "Sicilian Defense",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "a6"],
    description: "The legendary Najdorf variation, favored by Garry Kasparov and Bobby Fischer. The move 5...a6 is a brilliant multi-purpose prophylactic move that stops White's knights or bishops from using b5, while preparing a future b5 push for queenside space.",
    strategicTheme: "Prophylaxis, queenside expansion, flexible king position, intense theoretical battles.",
    tacticalTricks: "A true tactical hotbed. White often tries central sacrifices like Nd5 or Nf5, or launches an all-out pawn storm with f4, g4, and h4."
  },
  {
    id: "sicilian_dragon",
    name: "Dragon Variation",
    category: "Sicilian Defense",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "g6"],
    description: "Named after the dragon constellation due to Black's pawn structure. Black fianchettoes the dark-squared bishop on g7, where it shoots down the long diagonal, exerting massive pressure on the queenside.",
    strategicTheme: "Fianchetto bishop power, sharp opposite-side castling races, kingside pawn storms.",
    tacticalTricks: "In the Yugoslav Attack, White castles queenside and storms the h-file to mate Black. Black counter-attacks on the c-file, often sacrificing a rook on c3."
  },
  {
    id: "sicilian_accelerated_dragon",
    name: "Accelerated Dragon",
    category: "Sicilian Defense",
    moves: ["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "g6"],
    description: "A refined version of the Dragon. Black plays g6 early, avoiding d6, with the ambitious plan of pushing d7-d5 in a single move, saving a valuable tempo in the center.",
    strategicTheme: "Avoiding d6, faster d5 strike, minimizing Yugoslav Attack lines.",
    tacticalTricks: "White can establish the Maroczy Bind (c4!), restricting Black's activity, which Black must counter with active knight jumps."
  },
  {
    id: "sicilian_classical",
    name: "Classical Sicilian",
    category: "Sicilian Defense",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "Nc6"],
    description: "A highly logical and natural Sicilian. Black develops knights to their most active squares (c6 and f6) before committing the kingside pawns.",
    strategicTheme: "Natural piece development, pressure on d4, dynamic flexibility.",
    tacticalTricks: "White often responds with the Richter-Rauzer (Bg5) or Sozin Attack (Bc4), targeting the f7 and e6 squares."
  },
  {
    id: "sicilian_scheveningen",
    name: "Scheveningen Variation",
    category: "Sicilian Defense",
    moves: ["e4", "c5", "Nf3", "d6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "e6"],
    description: "Black establishes a small, compact pawn center (d6 and e6), often called the 'small center'. This creates a highly resilient wall that is tough to crack, while keeping options open for counter-strikes.",
    strategicTheme: "Defensive resilience, small pawn center, flexible d5/e5 breakthroughs.",
    tacticalTricks: "White can launch the aggressive Keres Attack (g4!), charging down the board immediately, which requires active defensive tactics by Black."
  },
  {
    id: "sicilian_sveshnikov",
    name: "Sveshnikov Variation",
    category: "Sicilian Defense",
    moves: ["e4", "c5", "Nf3", "Nc6", "d4", "cxd4", "Nxd4", "Nf6", "Nc3", "e5"],
    description: "An aggressive variation. Black immediately drives White's knight away with 5...e5, accepting a weak, backward pawn on d6 and a hole on d5 in exchange for tremendous active piece play and central control.",
    strategicTheme: "Active counterplay, central space, accepting strategic weaknesses for activity.",
    tacticalTricks: "White's knight jumps to b5, aiming to lock down the d6 weakness or the d5 outpost. Black must play dynamically with a6, b5."
  },
  {
    id: "sicilian_alapin",
    name: "Alapin Variation",
    category: "Sicilian Defense",
    moves: ["e4", "c5", "c3"],
    description: "An excellent anti-Sicilian weapon. White plays 2.c3 to prepare a solid d4 central pawn wedge. It blunts Black's typical Sicilian tactical counterplays.",
    strategicTheme: "Building a classic central pawn duo, avoiding theory-heavy open Sicilians.",
    tacticalTricks: "Black usually strikes back instantly with 2...d5 or 2...Nf6, leading to isolated queen pawn structures with unique tactical features."
  },
  {
    id: "sicilian_smith_morra",
    name: "Smith–Morra Gambit",
    category: "Sicilian Defense",
    moves: ["e4", "c5", "d4", "cxd4", "c3"],
    description: "A highly aggressive gambit. White sacrifices the c-pawn to gain rapid, open diagonals, an open c-file for the rooks, and a massive lead in development.",
    strategicTheme: "Pawn sacrifice for rapid coordination, open lines, preventing Black's setup.",
    tacticalTricks: "If Black is not careful, White's knights can jump to d5 or b5, and the rooks on the d-file can trap Black's un-castled king."
  },

  // --- French Defense (1.e4 e6) ---
  {
    id: "french_defense",
    name: "French Defense",
    category: "French Defense",
    moves: ["e4", "e6"],
    description: "A robust, counter-attacking opening. By playing e6, Black prepares to meet d4 with d5. Black accepts a temporarily restricted light-squared bishop in exchange for an incredibly solid pawn structure.",
    strategicTheme: "Solid pawn chains, attacking the base of White's pawn chain (c5!), queenside pressure.",
    tacticalTricks: "The 'French Bishop' on c8 is notoriously locked in. Black must use maneuvers like b6 and Ba6 to swap it off, or break open the center later."
  },
  {
    id: "french_advance",
    name: "Advance Variation",
    category: "French Defense",
    moves: ["e4", "e6", "d4", "d5", "e5"],
    description: "White immediately locks the center with e5, gaining spatial advantages on the kingside. This establishes a fixed pawn skeleton where both sides know exactly where to strike.",
    strategicTheme: "Closed pawn chain, space advantages, attacking pawn chain bases (c5 for Black, f4-f5 for White).",
    tacticalTricks: "Black immediately attacks d4 with c5, Nc6, and Qb6. White must hold the d4 anchor at all costs."
  },
  {
    id: "french_tarrasch",
    name: "Tarrasch Variation",
    category: "French Defense",
    moves: ["e4", "e6", "d4", "d5", "Nd2"],
    description: "Developed by Siegbert Tarrasch. White develops the knight to d2 instead of c3, which avoids pins on the a5-e1 diagonal (like Bb4) and keeps the c3 pawn free to support d4.",
    strategicTheme: "Flexible knight placement, maintaining c3 support, slower but safer build-up.",
    tacticalTricks: "Black usually strikes back with c5! to exploit White's slightly passive piece coordination on the second rank."
  },
  {
    id: "french_winawer",
    name: "Winawer Variation",
    category: "French Defense",
    moves: ["e4", "e6", "d4", "d5", "Nc3", "Bb4"],
    description: "A highly sharp and double-edged line. Black pins White's c3 knight, threatening the e4 pawn. This often leads to unbalanced positions with damaged pawn structures but great tactical opportunities.",
    strategicTheme: "Pins, doubling White's pawns, unbalanced counter-strikes on the wings.",
    tacticalTricks: "White often plays Qg4, attacking the weakened g7 square, leading to chaotic wild lines where kingside castles are abandoned."
  },
  {
    id: "french_classical",
    name: "Classical Variation",
    category: "French Defense",
    moves: ["e4", "e6", "d4", "d5", "Nc3", "Nf6"],
    description: "The most natural continuation of the French. White develops the knight actively to c3, and Black responds by developing the kingside knight to f6, creating immediate tension on e4.",
    strategicTheme: "Direct piece contact, central pressure, standard kingside development.",
    tacticalTricks: "White often plays Bg5 to pin the f6 knight. Black can break the pin with Be7 or launch into the sharp MacCutcheon variation (Bb4)."
  },

  // --- Caro–Kann Defense (1.e4 c6) ---
  {
    id: "caro_kann_defense",
    name: "Caro–Kann Defense",
    category: "Caro–Kann Defense",
    moves: ["e4", "c6"],
    description: "One of the most reliable and solid responses to 1.e4. Unlike the French, Black prepares the d5 push by playing c6, which keeps the light-squared bishop free to develop outside the pawn chain.",
    strategicTheme: "Solid pawn structure, free light-squared bishop, safe king, endgame superiority.",
    tacticalTricks: "Black has very few weaknesses, making it hard for White to find direct tactical targets. Black aims to chip away at White's center later."
  },
  {
    id: "caro_kann_advance",
    name: "Advance Variation",
    category: "Caro–Kann Defense",
    moves: ["e4", "c6", "d4", "d5", "e5"],
    description: "White locks the center with e5. Unlike the French, Black can play Bf5 before pushing e6, getting the bishop out of its prison before locking the gate.",
    strategicTheme: "Space versus active pieces, fighting for control of the dark squares.",
    tacticalTricks: "White often tries to hunt Black's active f5 bishop with g4 and h4-h5, or plays c3, Bd3 to neutralize it."
  },
  {
    id: "caro_kann_classical",
    name: "Classical Variation",
    category: "Caro–Kann Defense",
    moves: ["e4", "c6", "d4", "d5", "Nc3", "dxe4", "Nxe4", "Bf5"],
    description: "The main-line Caro-Kann. Black trades the d5 pawn for the e4 pawn, develops the light-squared bishop with an attack on the knight, and establishes a secure, solid fortress.",
    strategicTheme: "Piece trades, solid pawn skeletons, endgame transition.",
    tacticalTricks: "White's knight on e4 will hop to g3. Black must watch out for h4-h5 traps trying to trap the bishop on g6."
  },
  {
    id: "caro_kann_panov",
    name: "Panov Attack",
    category: "Caro–Kann Defense",
    moves: ["e4", "c6", "d4", "d5", "exd5", "cxd5", "c4"],
    description: "White attacks Black's center immediately with c4, turning the solid Caro-Kann into a highly open, tactical, and aggressive battlefield. This often leads to an isolated queen's pawn for White.",
    strategicTheme: "Isolated Queen Pawn (IQP) structures, rapid lines for attacking pieces, central open files.",
    tacticalTricks: "White gets great piece activity. Black must blockade the d5 square using knights to stop the pawn from advancing."
  },

  // --- Indian Defenses (1.d4 Nf6) ---
  {
    id: "kings_indian_defense",
    name: "King's Indian Defense",
    category: "Indian Defenses",
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "Bg7"],
    description: "A hypermodern, highly aggressive opening. Black lets White build a massive pawn center, then fianchettoes the dark bishop and launches a devastating counter-attack on White's center later.",
    strategicTheme: "Fianchetto, kingside pawn storm (f5-f4), closed center blockades.",
    tacticalTricks: "Often leads to amazing opposite-side attacks. White storms the queenside while Black plays for mate on the kingside."
  },
  {
    id: "queens_indian_defense",
    name: "Queen's Indian Defense",
    category: "Indian Defenses",
    moves: ["d4", "Nf6", "c4", "e6", "Nf3", "b6"],
    description: "A solid, hypermodern defense. Black prepares to develop the light-squared bishop to b7 or a6 to control the critical e4 and d4 central squares from a distance.",
    strategicTheme: "Flank control of the center, hypermodernism, piece-based center control.",
    tacticalTricks: "Black's bishop on b7 combined with a knight on e4 can form a powerful blockading battery."
  },
  {
    id: "nimzo_indian_defense",
    name: "Nimzo-Indian Defense",
    category: "Indian Defenses",
    moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"],
    description: "One of the most highly respected defenses in chess. Black pins White's c3 knight, stopping e4. Black is ready to exchange the bishop for the knight, doubling White's pawns.",
    strategicTheme: "Pins, damaging White's pawn structure, blockading the doubled pawns.",
    tacticalTricks: "If White's pawns are doubled on c3/c4, Black can isolate and target them using knights and a light bishop on a6."
  },
  {
    id: "bogo_indian_defense",
    name: "Bogo-Indian Defense",
    category: "Indian Defenses",
    moves: ["d4", "Nf6", "c4", "e6", "Nf3", "Bb4+"],
    description: "Developed by Efim Bogoljubov. Black delivers an immediate check on b4. It is a solid alternative to the Nimzo-Indian when White plays Nf3 instead of Nc3.",
    strategicTheme: "Early trades, rapid king safety, fluid light-squared pieces.",
    tacticalTricks: "Trading bishops on d2 often leads to highly technical, strategic games with minimal early tactical risk."
  },
  {
    id: "old_indian_defense",
    name: "Old Indian Defense",
    category: "Indian Defenses",
    moves: ["d4", "Nf6", "c4", "d6", "Nc3", "e5"],
    description: "An older, more compact defense. Black develops the bishop to e7 instead of g7, creating a cramped but extremely solid, resilient defensive shell.",
    strategicTheme: "Cramped but solid structures, central d6-e5 hold, maneuver-focused gameplay.",
    tacticalTricks: "White must watch out for a sudden exchange on d4 followed by Ng4, targeting weaknesses on the kingside."
  },

  // --- Queen's Pawn Openings (1.d4 d5) ---
  {
    id: "queens_gambit",
    name: "Queen's Gambit",
    category: "Queen's Pawn Openings",
    moves: ["d4", "d5", "c4"],
    description: "One of the oldest and most dominant openings. White offers the c-pawn to deflect Black's d5 pawn from the center. It is not a true gambit, as White can always win the pawn back.",
    strategicTheme: "Central pawn pressure, queenside initiative, open lines for major pieces.",
    tacticalTricks: "If Black tries to desperately hold onto the captured c4 pawn with b5, White can blast the queenside open with a4 and win material."
  },
  {
    id: "queens_gambit_accepted",
    name: "Queen's Gambit Accepted",
    category: "Queen's Gambit Accepted",
    moves: ["d4", "d5", "c4", "dxc4"],
    description: "Black captures the c4 pawn. Instead of holding the center, Black surrenders it temporarily, planning to strike back with e5 or c5 later while enjoying free development.",
    strategicTheme: "Surrendering center for active flank development, quick e6/c5 counterplay.",
    tacticalTricks: "White often plays e3 or e4 to recover the pawn. Black must not play b5 to save it, or they risk losing their rook to early Queen checks."
  },
  {
    id: "queens_gambit_declined",
    name: "Queen's Gambit Declined",
    category: "Queen's Gambit Declined",
    moves: ["d4", "d5", "c4", "e6"],
    description: "The classic way of meeting the Queen's Gambit. Black supports the d5 pawn with e6, maintaining a rock-solid foothold in the center of the board.",
    strategicTheme: "Solid central defense, developing light bishop to e7, safe kingside castling.",
    tacticalTricks: "White's pin with Bg5 is highly classical. Black must navigate the Carlsbad exchange pawn structures."
  },
  {
    id: "slav_defense",
    name: "Slav Defense",
    category: "Slav Defense",
    moves: ["d4", "d5", "c4", "c6"],
    description: "A highly resilient defense. Black defends the d5 pawn with c6 instead of e6. This keeps the c8 bishop free to develop, avoiding the locked-in 'French Bishop' problem.",
    strategicTheme: "Maintaining d5 without blocking the light bishop, queenside stability.",
    tacticalTricks: "Black can sometimes threaten to capture on c4 and keep it with b5, forcing White to play actively."
  },
  {
    id: "semi_slav_defense",
    name: "Semi-Slav Defense",
    category: "Semi-Slav Defense",
    moves: ["d4", "d5", "c4", "e6", "Nf3", "Nf6", "Nc3", "c6"],
    description: "A combination of the Slav and Queen's Gambit Declined. Black creates an incredibly solid triangle of pawns (c6-d5-e6). It is highly complex and leading to extremely sharp tactical theoretical wars.",
    strategicTheme: "Super-solid pawn triangle, sharp counter-gambits (Botvinnik or Moscow variations).",
    tacticalTricks: "The Botvinnik system is famous for being one of the most tactical, computer-analyzed, wild lines in chess history."
  },
  {
    id: "london_system",
    name: "London System",
    category: "London System",
    moves: ["d4", "d5", "Nf3", "Nf6", "Bf4"],
    description: "A highly popular 'scheme' opening. White develops the dark-squared bishop to f4 first, then builds a solid pyramid of pawns with e3 and c3. It is incredibly solid and can be played against almost anything.",
    strategicTheme: "Rock-solid pawn pyramid, safe piece development, avoiding heavy theoretical memory.",
    tacticalTricks: "White's knights can jump to e5, setting up massive kingside attacks if Black castles passively."
  },
  {
    id: "colle_system",
    name: "Colle System",
    category: "Colle System",
    moves: ["d4", "d5", "Nf3", "Nf6", "e3"],
    description: "Similar to the London, but White keeps the dark bishop inside on c1, choosing a fast e3, Bd3, and Nbd2 build-up, aiming for a sudden e4 push to break open the board.",
    strategicTheme: "Preparing the e4 central break, quiet but explosive development.",
    tacticalTricks: "A sudden e4 push can unleash a devastating attack on Black's kingside if they are unprepared."
  },
  {
    id: "torre_attack",
    name: "Torre Attack",
    category: "Torre Attack",
    moves: ["d4", "Nf6", "Nf3", "e6", "Bg5"],
    description: "White develops the light-squared knight to f3 and pins Black's knight with Bg5 on move 3. This avoids heavy theoretical lines while maintaining an active kingside initiative.",
    strategicTheme: "Pins, rapid minor-piece mobilization, central pressure.",
    tacticalTricks: "White can often sacrifice a bishop on h7 (The Greek Gift) if Black castles too early without defensive guards."
  },

  // --- Flank Openings ---
  {
    id: "english_opening",
    name: "English Opening",
    category: "Flank Openings",
    moves: ["c4"],
    description: "White attacks the d5 square from the side using the c-pawn, keeping options extremely flexible. It often transposes into queen's pawn openings or reversed Sicilian structures.",
    strategicTheme: "Hypermodernism, control of d5 from the flank, long-term queenside expansion.",
    tacticalTricks: "White's dark-squared bishop fianchettoes on g2, shooting down the long diagonal and creating pressure on b7/c6."
  },
  {
    id: "reti_opening",
    name: "Réti Opening",
    category: "Flank Openings",
    moves: ["Nf3", "d5", "c4"],
    description: "Developed by Richard Réti. White develops the king's knight on move one, keeping options open, then strikes at Black's d5 pawn from the side with c4, often fianchettoing both bishops.",
    strategicTheme: "Double-fianchetto, fluid center, maneuvering gameplay.",
    tacticalTricks: "Black must be careful of central over-expansion. White will lure Black's pawns forward and then chip away at them."
  },
  {
    id: "bird_opening",
    name: "Bird Opening",
    category: "Flank Openings",
    moves: ["f4"],
    description: "White plays 1.f4, immediately claiming space on the kingside and controlling the e5 square, similar to a Dutch Defense but with a tempo extra.",
    strategicTheme: "Kingside control, e5 outpost domination, active flank play.",
    tacticalTricks: "White must watch out for From's Gambit (1...e5!), which is an extremely sharp and dangerous counter-sac."
  },
  {
    id: "larsens_opening",
    name: "Larsen's Opening",
    category: "Flank Openings",
    moves: ["b3"],
    description: "White fianchettoes the queen's bishop on b2 immediately. From b2, the bishop exerts powerful diagonal pressure across the entire center of the board, targeting the f6 and g7 squares.",
    strategicTheme: "Hypermodern bishop domination, queenside expansion, offbeat lines.",
    tacticalTricks: "If Black plays e5, White's bishop on b2 is already eyeing the e5 pawn, leading to immediate tactical skirmishes."
  },

  // --- Other Popular Defenses ---
  {
    id: "alekhine_defense",
    name: "Alekhine Defense",
    category: "Other Popular Defenses",
    moves: ["e4", "Nf3", "Nf6"], // Note: often written as e4 Nf6, 2.e5 Nd5
    description: "An offbeat hypermodern defense. Black plays 1...Nf6, actively provoking White's e-pawn to chase the knight. Black's plan is to let White over-expand their center and then systematically destroy it.",
    strategicTheme: "Provocation, hypermodern center destruction, flexible knight jumps.",
    tacticalTricks: "If White pushes too many central pawns (Four Pawns Attack), they can end up with a structurally weak center that Black's pieces can easily dismantle."
  },
  {
    id: "pirc_defense",
    name: "Pirc Defense",
    category: "Other Popular Defenses",
    moves: ["e4", "d6", "d4", "Nf6", "Nc3", "g6"],
    description: "Pronounced 'peerts'. Black allows White to establish a classic central pawn duo (d4/e4), then fianchettoes the bishop on g7, aiming to strike back at the center using d6, e5, or c5.",
    strategicTheme: "Fianchetto, counter-striking the center, flexible pawn setups.",
    tacticalTricks: "White can play the aggressive Austrian Attack (f4!), putting massive direct tactical pressure on Black's kingside."
  },
  {
    id: "modern_defense",
    name: "Modern Defense",
    category: "Other Popular Defenses",
    moves: ["e4", "g6", "d4", "Bg7"],
    description: "Closely related to the Pirc. Black fianchettoes the king's bishop immediately, delaying Nf6 or avoiding it entirely, creating a highly flexible counter-attacking layout.",
    strategicTheme: "Hypermodern bishop control, flexible developmental transpositions.",
    tacticalTricks: "Black often strikes on the queenside with a quick a6, b5, and Bb7, while undermining White's d4 pawn with c5."
  },
  {
    id: "scandinavian_defense",
    name: "Scandinavian Defense",
    category: "Other Popular Defenses",
    moves: ["e4", "d5"],
    description: "One of the oldest recorded defenses. Black immediately strikes at White's e4 pawn with d5. It forces an open center and active queen play from move one.",
    strategicTheme: "Immediate central trade, open files, fast queen mobilization.",
    tacticalTricks: "After 2.exd5 Qxd5 3.Nc3, the Black queen must retreat (typically to Qa5 or Qd8). White gets a lead in development, but Black has a solid pawn skeleton."
  },
  {
    id: "dutch_defense",
    name: "Dutch Defense",
    category: "Other Popular Defenses",
    moves: ["d4", "f5"],
    description: "An aggressive, asymmetric defense to 1.d4. Black plays f5 to claim control of the e4 square from the flank, aiming for a full kingside attack later in the game.",
    strategicTheme: "Control of e4 from the flank, kingside space, unbalanced pawn structures.",
    tacticalTricks: "White can play the dangerous Staunton Gambit (e4!), sacrificing a pawn for rapid, tactical lines against Black's king."
  },
  {
    id: "benoni_defense",
    name: "Benoni Defense",
    category: "Other Popular Defenses",
    moves: ["d4", "Nf6", "c4", "c5", "d5"],
    description: "Black immediately attacks White's d4 pawn with c5, provoking White to push d5. This creates a highly dynamic, asymmetric pawn structure with an open e-file and an active dark-squared bishop.",
    strategicTheme: "Asymmetrical space, active queenside pawn majority, fast piece mobilization.",
    tacticalTricks: "Black gets massive tactical activity on the long dark diagonal. White tries to push e4-e5 to breakthrough."
  },
  {
    id: "benko_gambit",
    name: "Benko Gambit",
    category: "Other Popular Defenses",
    moves: ["d4", "Nf6", "c4", "c5", "d5", "b5"],
    description: "Black sacrifices a queenside pawn on move 5. Unlike typical gambits, Black plays for long-term positional pressure on the open a and b-files, targeting White's queenside pawns.",
    strategicTheme: "Queenside pressure on open files, double-fianchetto potential, long-term initiative.",
    tacticalTricks: "White often captures the pawn, but must spend the rest of the game defending a and b pawn weaknesses under siege from Black's rooks."
  },
  {
    id: "grunfeld_defense",
    name: "Grünfeld Defense",
    category: "Other Popular Defenses",
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5"],
    description: "A highly dynamic hypermodern defense popularized by Garry Kasparov. Black allows White to occupy the center with e4, then strikes back immediately with c5 and Bg7 to blast it apart.",
    strategicTheme: "Shattering White's center, active pieces, complex tactical lines.",
    tacticalTricks: "White gets a massive center but Black has intense pressure. White's d4 pawn is often under severe tactical siege."
  },
  {
    id: "catalan_opening",
    name: "Catalan Opening",
    category: "Other Popular Defenses",
    moves: ["d4", "Nf6", "c4", "e6", "g3", "d5", "Bg2"],
    description: "White combines the Queen's Gambit with a kingside bishop fianchetto. The light-squared bishop on g2 is the star of the opening, exerting quiet but devastating pressure down the h1-a8 diagonal.",
    strategicTheme: "Long-range diagonal pressure, solid center, safe king position.",
    tacticalTricks: "White often sacrifices the c4 pawn temporarily, knowing the g2 bishop will win it back with interest or pin the queenside."
  },
  {
    id: "stonewall_attack",
    name: "Stonewall Attack",
    category: "Other Popular Defenses",
    moves: ["d4", "d5", "e3", "Nf6", "Bd3", "c5", "c3", "e6", "f4"],
    description: "White builds an unbreakable wall of pawns on d4, e3, f4, and c3. This locks down the e5 square, creating a perfect launchpad for a devastating, straightforward kingside attack.",
    strategicTheme: "Rock-solid pawn wall, locking down the e5 outpost, heavy piece kingside lift.",
    tacticalTricks: "White will lift knights to e5 and transfer the queen/rooks to the h-file to launch an unstoppable mating attack on Black's castle."
  }
];

/**
 * Detects if the played moves match any of the registered chess openings.
 * Returns the most specific (longest move match) opening found.
 */
export function detectOpening(playedMoves: string[]): ChessOpening | null {
  if (!playedMoves || playedMoves.length === 0) return null;

  let bestMatch: ChessOpening | null = null;
  let maxMatchLength = 0;

  for (const opening of CHESS_OPENINGS) {
    const openingMoves = opening.moves;
    if (openingMoves.length > playedMoves.length) continue;

    let match = true;
    for (let i = 0; i < openingMoves.length; i++) {
      if (playedMoves[i].toLowerCase() !== openingMoves[i].toLowerCase()) {
        match = false;
        break;
      }
    }

    if (match && openingMoves.length > maxMatchLength) {
      bestMatch = opening;
      maxMatchLength = openingMoves.length;
    }
  }

  return bestMatch;
}

