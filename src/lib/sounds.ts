let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export type SoundPack = "wood" | "retro" | "laser" | "zen";

export function playChessSound(
  type: "move" | "capture" | "check" | "gameover" | "castle" | "promotion",
  pack: SoundPack = "wood"
) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Helper to create a gain node to avoid pops
    const createGain = (duration: number, startVal = 1, endVal = 0) => {
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(startVal, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(endVal, 0.0001), now + duration);
      gain.connect(ctx.destination);
      return gain;
    };

    if (pack === "wood") {
      // Wood Pack: Warm, clicky, percussion acoustic
      if (type === "move") {
        const osc = ctx.createOscillator();
        const gain = createGain(0.12, 0.4, 0.001);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === "capture") {
        const osc = ctx.createOscillator();
        const gain = createGain(0.18, 0.6, 0.001);
        osc.type = "sine";
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.setValueAtTime(120, now + 0.05);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === "check") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = createGain(0.2, 0.5, 0.001);
        const gain2 = createGain(0.25, 0.5, 0.001);

        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(440, now);
        osc1.connect(gain1);
        osc1.start(now);
        osc1.stop(now + 0.2);

        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(554.37, now + 0.08);
        osc2.connect(gain2);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.33);
      } else if (type === "castle") {
        const osc = ctx.createOscillator();
        const gain = createGain(0.22, 0.4, 0.001);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.setValueAtTime(180, now + 0.08);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === "promotion") {
        [329.63, 392.00, 523.25, 659.25].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = createGain(0.3, 0.25, 0.001);
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          osc.connect(gain);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.3);
        });
      } else if (type === "gameover") {
        [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = createGain(0.8, 0.2, 0.001);
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now);
          osc.connect(gain);
          osc.start(now);
          osc.stop(now + 0.8);
        });
      }
    } else if (pack === "retro") {
      // 8-Bit NES Pack: Square waves
      if (type === "move") {
        const osc = ctx.createOscillator();
        const gain = createGain(0.1, 0.3, 0.001);
        osc.type = "square";
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.setValueAtTime(220, now + 0.05);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "capture") {
        const osc = ctx.createOscillator();
        const gain = createGain(0.15, 0.5, 0.001);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "check") {
        const osc = ctx.createOscillator();
        const gain = createGain(0.25, 0.4, 0.001);
        osc.type = "square";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(660, now + 0.08);
        osc.frequency.setValueAtTime(880, now + 0.16);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "castle") {
        const osc = ctx.createOscillator();
        const gain = createGain(0.2, 0.3, 0.001);
        osc.type = "square";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554, now + 0.08);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "promotion") {
        [440, 554, 659, 880].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = createGain(0.15, 0.25, 0.001);
          osc.type = "square";
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          osc.connect(gain);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.15);
        });
      } else if (type === "gameover") {
        [440, 415, 392, 349].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = createGain(0.3, 0.25, 0.001);
          osc.type = "square";
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          osc.connect(gain);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.3);
        });
      }
    } else if (pack === "laser") {
      // Sci-Fi Cyberpunk Laser Pack
      if (type === "move") {
        const osc = ctx.createOscillator();
        const gain = createGain(0.12, 0.3, 0.001);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === "capture") {
        const osc = ctx.createOscillator();
        const gain = createGain(0.2, 0.4, 0.001);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === "check") {
        const osc = ctx.createOscillator();
        const gain = createGain(0.3, 0.4, 0.001);
        osc.type = "sine";
        osc.frequency.setValueAtTime(2000, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.15);
        osc.frequency.linearRampToValueAtTime(2000, now + 0.3);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === "castle") {
        const osc = ctx.createOscillator();
        const gain = createGain(0.25, 0.3, 0.001);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "promotion") {
        const osc = ctx.createOscillator();
        const gain = createGain(0.5, 0.3, 0.001);
        osc.type = "sine";
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(2500, now + 0.5);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === "gameover") {
        const osc = ctx.createOscillator();
        const gain = createGain(0.8, 0.4, 0.001);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.4);
        osc.frequency.linearRampToValueAtTime(150, now + 0.8);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.8);
      }
    } else if (pack === "zen") {
      // Quiet Zen: Soft bell, chime
      if (type === "move") {
        const osc = ctx.createOscillator();
        const gain = createGain(0.18, 0.25, 0.001);
        osc.type = "sine";
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.18);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === "capture") {
        const osc = ctx.createOscillator();
        const gain = createGain(0.15, 0.3, 0.001);
        osc.type = "triangle";
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "check") {
        const osc = ctx.createOscillator();
        const gain = createGain(0.6, 0.25, 0.001);
        osc.type = "sine";
        osc.frequency.setValueAtTime(1174.66, now);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === "castle") {
        [800, 1000].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = createGain(0.15, 0.2, 0.001);
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + idx * 0.08 + 0.15);
          osc.connect(gain);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.15);
        });
      } else if (type === "promotion") {
        [1046.50, 1318.51, 1567.98].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = createGain(0.5, 0.15, 0.001);
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          osc.connect(gain);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.5);
        });
      } else if (type === "gameover") {
        const osc = ctx.createOscillator();
        const gain = createGain(1.2, 0.3, 0.001);
        osc.type = "sine";
        osc.frequency.setValueAtTime(196.00, now);
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + 1.2);
      }
    }
  } catch (error) {
    console.error("Audio synthesis error:", error);
  }
}
