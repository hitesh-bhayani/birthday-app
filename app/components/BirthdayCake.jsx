// app/components/BirthdayCake.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playPopSound, playWhooshSound, playPartyPopperSound } from "../utils/audioFX";
import { useConfig } from "../context/ConfigContext";
import { getTheme } from "../utils/themes";
import { Flame, Wind } from "lucide-react";
import confetti from "canvas-confetti";

/* ─────────────────────────────────────────────
   Tiny helper: random sprinkle / decoration data
───────────────────────────────────────────── */
const SPRINKLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  angle: Math.random() * 360,
  dist: 28 + Math.random() * 36,
  color: ["#f472b6","#facc15","#4ade80","#60a5fa","#fb923c","#a78bfa","#f87171","#34d399"][i % 8],
  w: 6 + Math.random() * 8,
  h: 3 + Math.random() * 3,
  rot: Math.floor(Math.random() * 180),
}));

const TIER2_SPRINKLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  angle: Math.random() * 360,
  dist: 20 + Math.random() * 28,
  color: ["#f472b6","#facc15","#4ade80","#60a5fa","#fb923c","#a78bfa"][i % 6],
  w: 5 + Math.random() * 7,
  h: 2 + Math.random() * 3,
  rot: Math.floor(Math.random() * 180),
}));

/* ─────────────────────────────────────────────
   Candle positions on the top tier
───────────────────────────────────────────── */
const CANDLE_CONFIGS = [
  { left: "15%",  color: "#f472b6", wax: "#fce7f3" },
  { left: "30%",  color: "#facc15", wax: "#fefce8" },
  { left: "47%",  color: "#60a5fa", wax: "#eff6ff" },
  { left: "64%",  color: "#4ade80", wax: "#f0fdf4" },
  { left: "79%",  color: "#fb923c", wax: "#fff7ed" },
];

/* ─────────────────────────────────────────────
   Flame SVG — pure CSS-animated, no framer
───────────────────────────────────────────── */
function Candle({ lit, color, wax, onClick }) {
  const [showSmoke, setShowSmoke] = useState(false);
  const prevLitRef = useRef(lit);

  useEffect(() => {
    if (prevLitRef.current && !lit) {
      // Candle just blown out — show smoke
      setShowSmoke(true);
      const t = setTimeout(() => setShowSmoke(false), 2600);
      return () => clearTimeout(t);
    }
    prevLitRef.current = lit;
  }, [lit]);

  return (
    <div
      onClick={onClick}
      className="relative flex flex-col items-center cursor-pointer select-none"
      style={{ width: 22 }}
    >
      {/* Flame + smoke area */}
      <div style={{ height: 44, display: "flex", alignItems: "flex-end", justifyContent: "center", position: "relative" }}>

        {/* Smoke puffs — shown after blowout */}
        <AnimatePresence>
          {showSmoke && (
            <motion.div
              key="smoke-wrap"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)" }}
            >
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, x: 0, opacity: 0.75, scale: 0.4 }}
                  animate={{
                    y: -(28 + i * 12),
                    x: i % 2 === 0 ? -5 : 5,
                    opacity: 0,
                    scale: 1.6 + i * 0.4,
                  }}
                  transition={{ duration: 1.4 + i * 0.2, delay: i * 0.18, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: "rgba(200,200,210,0.75)",
                    filter: "blur(3.5px)",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flame */}
        <AnimatePresence>
          {lit && (
            <motion.div
              key="flame"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{
                scaleY: [1, 1.18, 0.88, 1.12, 1],
                scaleX: [1, 0.9, 1.1, 0.95, 1],
                opacity: 1,
              }}
              exit={{ scaleY: 0, opacity: 0, transition: { duration: 0.25, repeat: 0 } }}
              transition={{ duration: 0.25, repeat: Infinity, repeatDelay: 0.05 }}
              style={{ transformOrigin: "bottom center" }}
            >
              {/* Outer flame */}
              <div style={{
                width: 16,
                height: 30,
                borderRadius: "50% 50% 30% 30% / 60% 60% 40% 40%",
                background: "linear-gradient(to top, #f97316, #facc15 50%, #fffbeb)",
                filter: "blur(0.5px)",
                boxShadow: `0 0 12px 6px ${color}99, 0 0 22px 10px ${color}44`,
                position: "relative",
              }}>
                {/* Inner white core */}
                <div style={{
                  position: "absolute",
                  bottom: 2,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 5,
                  height: 14,
                  borderRadius: "50% 50% 30% 30% / 60% 60% 40% 40%",
                  background: "rgba(255,255,255,0.9)",
                }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Wick */}
      <div style={{
        width: 2,
        height: 6,
        background: lit ? "#374151" : "#1f2937",
        borderRadius: 2,
        marginBottom: -1,
        zIndex: 1,
      }} />

      {/* Candle body */}
      <div style={{
        width: 14,
        height: 52,
        background: `linear-gradient(to right, ${color}cc, ${wax}, ${color}cc)`,
        borderRadius: "3px 3px 4px 4px",
        boxShadow: `0 2px 8px ${color}55`,
        border: `1px solid ${color}66`,
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Diagonal stripe decoration */}
        {[0,14,28,42].map(t => (
          <div key={t} style={{
            position: "absolute",
            top: t,
            left: -4,
            width: "140%",
            height: 3,
            background: `${color}55`,
            transform: "rotate(-25deg)",
          }} />
        ))}
        {/* Wax drip at top */}
        <div style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 10,
          height: 8,
          background: wax,
          borderRadius: "0 0 6px 6px",
        }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function BirthdayCake({ onBlow }) {
  const config = useConfig();
  const theme = getTheme(config?.occasion);
  const ceremony = theme.ceremonyType;

  // Phase: 'unlit' | 'lit' | 'blown'
  const [candlesPhase, setCandlesPhase] = useState('unlit');
  const candlesPhaseRef = useRef('unlit');

  // Candles start UNLIT
  const [litCandles, setLitCandles] = useState(new Set());
  const [isBlownOut, setIsBlownOut] = useState(false);
  const [showProceed, setShowProceed] = useState(false);

  // Non-cake ceremony state
  const [litState, setLitState] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Mic
  const [micEnabled, setMicEnabled] = useState(false);
  const [blowStrength, setBlowStrength] = useState(0); // 0-100 live blow meter
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const blowStreakRef = useRef(0);

  // Auto-light / auto-blow refs
  const autoLightTimerRef = useRef(null);
  const lightingRef = useRef(false);
  const autoBlowTimerRef = useRef(null);
  const autoBlowingRef = useRef(false);
  const litCandlesRef = useRef(new Set());
  const showProceedRef = useRef(false);

  // Keep refs in sync
  useEffect(() => { litCandlesRef.current = litCandles; }, [litCandles]);
  useEffect(() => { showProceedRef.current = showProceed; }, [showProceed]);
  useEffect(() => { candlesPhaseRef.current = candlesPhase; }, [candlesPhase]);

  // ── LIGHT CANDLES (one by one, 400ms apart) ──
  const lightAllCandles = () => {
    if (lightingRef.current || candlesPhaseRef.current !== 'unlit') return;
    lightingRef.current = true;
    if (autoLightTimerRef.current) clearTimeout(autoLightTimerRef.current);
    [0, 1, 2, 3, 4].forEach((idx) => {
      setTimeout(() => {
        setLitCandles(prev => { const n = new Set(prev); n.add(idx); return n; });
        playPopSound?.();
        confetti({
          particleCount: 15,
          spread: 35,
          origin: { y: 0.55 },
          colors: [CANDLE_CONFIGS[idx].color, '#facc15', '#fff'],
        });
        if (idx === 4) {
          setTimeout(() => {
            setCandlesPhase('lit');
            lightingRef.current = false;
            // start the auto-blow timer now that candles are lit
            resetAutoBlowTimer();
          }, 300);
        }
      }, idx * 400);
    });
  };

  // ── RESET AUTO-LIGHT TIMER (5s idle → light) ──
  const resetAutoLightTimer = () => {
    if (autoLightTimerRef.current) clearTimeout(autoLightTimerRef.current);
    if (candlesPhaseRef.current !== 'unlit' || lightingRef.current) return;
    autoLightTimerRef.current = setTimeout(() => {
      if (candlesPhaseRef.current === 'unlit' && !lightingRef.current) lightAllCandles();
    }, 5000);
  };

  // ── BLOW CANDLES ONE-BY-ONE ──
  const blowOneByOne = () => {
    if (autoBlowingRef.current) return;
    autoBlowingRef.current = true;
    const remaining = [...litCandlesRef.current].sort();
    remaining.forEach((candleIndex, i) => {
      setTimeout(() => {
        if (showProceedRef.current) return;
        setLitCandles(prev => { const n = new Set(prev); n.delete(candleIndex); return n; });
        playWhooshSound?.();
        confetti({
          particleCount: 18,
          spread: 40,
          origin: { y: 0.55 },
          colors: [CANDLE_CONFIGS[candleIndex].color, '#facc15', '#fff'],
        });
        if (i === remaining.length - 1) {
          setTimeout(() => {
            setIsBlownOut(true);
            setShowProceed(true);
            setCandlesPhase('blown');
            playPartyPopperSound?.();
            confetti({ particleCount: 180, spread: 90, origin: { y: 0.6 }, colors: ['#f472b6','#facc15','#60a5fa','#4ade80','#fb923c','#a78bfa'] });
            setTimeout(() => {
              confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } });
              confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } });
            }, 400);
          }, 800);
        }
      }, i * 1000);
    });
  };

  // ── RESET AUTO-BLOW TIMER (10s idle → blow) ──
  const resetAutoBlowTimer = () => {
    if (autoBlowTimerRef.current) clearTimeout(autoBlowTimerRef.current);
    if (showProceedRef.current || autoBlowingRef.current) return;
    autoBlowTimerRef.current = setTimeout(() => {
      if (!showProceedRef.current && !autoBlowingRef.current && candlesPhaseRef.current === 'lit') {
        blowOneByOne();
      }
    }, 10000);
  };

  // Toggle individual candle
  const handleToggleCandle = (index) => {
    if (candlesPhase !== 'lit' || showProceed) return;
    resetAutoBlowTimer(); // reset idle timer on interaction
    setLitCandles(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
        playWhooshSound?.();
      } else {
        next.add(index);
        playPopSound?.();
        confetti({
          particleCount: 10,
          spread: 30,
          origin: { y: 0.6 },
          colors: [CANDLE_CONFIGS[index].color, '#facc15', '#fff'],
        });
      }
      return next;
    });
  };

  // Blow out all
  const handleBlowOutAll = () => {
    // Use refs so this works correctly even when called from stale closures (mic loop)
    if (litCandlesRef.current.size === 0 || showProceedRef.current) return;
    setLitCandles(new Set());
    setIsBlownOut(true);
    setShowProceed(true);
    setCandlesPhase('blown');
    playPartyPopperSound?.();
    confetti({
      particleCount: 180,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#f472b6","#facc15","#60a5fa","#4ade80","#fb923c","#a78bfa"],
    });
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 400);
  };

  // Non-cake ceremony
  const handleNonCakeAction = () => {
    if (litState >= 3 || isAnimating) return;
    playWhooshSound?.();
    setIsAnimating(true);
    setLitState(prev => {
      const next = prev + 1;
      if (next >= 3) setTimeout(() => { onBlow?.(); }, 2000);
      setTimeout(() => setIsAnimating(false), 600);
      return next;
    });
  };

  // Start auto-LIGHT timer on mount (for cake ceremony)
  useEffect(() => {
    if (ceremony !== 'cake') return;
    resetAutoLightTimer();
    return () => {
      if (autoLightTimerRef.current) clearTimeout(autoLightTimerRef.current);
      if (autoBlowTimerRef.current) clearTimeout(autoBlowTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ceremony]);

  // Mic detection
  useEffect(() => {
    if (ceremony !== "cake") return;
    const initMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        ctx.createMediaStreamSource(stream).connect(analyser);
        setMicEnabled(true);
        const data = new Uint8Array(analyser.frequencyBinCount);
        let streak = 0;

        // ── Ambient calibration ──
        // Spend the first 60 frames (~1s) measuring background noise
        // so fans / AC don't false-trigger.
        let calibFrames = 0;
        let calibSum = 0;
        let blowThreshold = 45; // fallback until calibrated

        const tick = () => {
          if (!analyserRef.current) return;

          analyser.getByteFrequencyData(data);
          const avg = data.reduce((s, v) => s + v, 0) / data.length;

          // ── Phase 1: calibration (first 60 frames) ──
          if (calibFrames < 60) {
            calibSum += avg;
            calibFrames++;
            if (calibFrames === 60) {
              const baseline = calibSum / 60;
              // Threshold = 2.8× ambient, but never lower than 45
              blowThreshold = Math.max(45, baseline * 2.8);
            }
            animationFrameRef.current = requestAnimationFrame(tick);
            return;
          }

          // ── Phase 2: blow detection ──
          if (candlesPhaseRef.current !== 'lit' || litCandlesRef.current.size === 0 || showProceedRef.current) {
            setBlowStrength(0);
            streak = 0;
            animationFrameRef.current = requestAnimationFrame(tick);
            return;
          }

          // Normalize strength relative to threshold (0 = quiet, 100 = well above threshold)
          const strength = Math.min(100, Math.round(((avg - blowThreshold * 0.5) / (blowThreshold * 1.5)) * 100));
          setBlowStrength(Math.max(0, strength));

          if (avg > blowThreshold) {
            streak++;
            // Require 12 consecutive frames of sustained blow (~200ms at 60fps)
            if (streak >= 12) {
              streak = 0;
              setBlowStrength(0);
              resetAutoBlowTimer();
              handleBlowOutAll();
            }
          } else {
            // Decay streak quickly if sound drops — background noise is intermittent
            streak = Math.max(0, streak - 2);
          }
          animationFrameRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        // mic not available
      }
    };
    initMic();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      audioContextRef.current?.close().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ceremony]);

  /* ── NON-CAKE CEREMONIES ── */
  if (ceremony !== "cake") {
    return (
      <section className="relative flex flex-col items-center justify-center w-full min-h-[100dvh] overflow-hidden z-10 px-4 py-8 select-none">
        <div className="flex flex-col items-center gap-6 z-10">
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-4xl font-extrabold text-center bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400"
          >
            {theme.ceremonyTitle}
          </motion.h2>
          <p className="text-gray-400 text-sm text-center max-w-sm">{theme.ceremonySubtitle}</p>

          {/* Tap area */}
          <div
            onClick={handleNonCakeAction}
            className="cursor-pointer flex flex-col items-center gap-3"
          >
            {ceremony === "lantern" && (
              <motion.div
                animate={litState >= 3 ? { y: -300, opacity: 0 } : { y: [-5, 5, -5] }}
                transition={litState >= 3 ? { duration: 2 } : { duration: 3, repeat: Infinity }}
                className={`relative w-40 h-56 rounded-t-[4rem] rounded-b-2xl border flex items-end justify-center pb-6 ${
                  litState === 0 ? "bg-orange-950/40 border-orange-800/20" :
                  litState === 1 ? "bg-orange-800/60 border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.3)]" :
                  "bg-orange-400/80 border-orange-300/30 shadow-[0_0_60px_rgba(249,115,22,0.7)]"
                }`}
              >
                {litState > 0 && (
                  <motion.div animate={{ scale: [1,1.2,1] }} transition={{ duration:1.5, repeat:Infinity }}
                    className="w-8 h-12 rounded-full bg-gradient-to-t from-orange-500 to-yellow-300"
                  />
                )}
              </motion.div>
            )}
            {(ceremony === "sparkler" || ceremony === "wedding-candles" || ceremony === "flower-grow") && (
              <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-6xl">
                {ceremony === "sparkler" ? "✨" : ceremony === "wedding-candles" ? "🕯️" : "🌸"}
              </div>
            )}
          </div>

          {litState < 3 && (
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Tap to interact</span>
            </div>
          )}
        </div>
      </section>
    );
  }

  /* ─────────────────────────────────────────────
     CAKE RENDER
  ───────────────────────────────────────────── */
  const allLit = litCandles.size === 5;
  const ambientGlow = litCandles.size > 0;

  return (
    <section className="relative flex flex-col items-center justify-center w-full min-h-[100dvh] overflow-hidden z-10 px-4 py-3 select-none">

      {/* Ambient background glow when candles are lit */}
      <AnimatePresence>
        {ambientGlow && !showProceed && (
          <motion.div
            key="glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.65, 0.4] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(251,191,36,0.18) 0%, rgba(249,115,22,0.08) 50%, transparent 80%)",
              zIndex: 1,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── HEADER TEXT ── */}
      <div className="relative z-10 flex flex-col items-center mb-2 text-center">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-1"
        >
          <span className="text-xs font-semibold text-amber-300 tracking-widest uppercase">
            {showProceed ? "✨ Wishes Sent!" : "🎂 It's Celebration Time"}
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="text-2xl md:text-4xl font-extrabold tracking-tight"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-pink-400 to-violet-400">
            {showProceed ? "Make a Wish!" : "Blow Out the Candles!"}
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="text-gray-400 text-xs mt-1 max-w-xs"
        >
          {showProceed
            ? "Your birthday magic has been released! 🎁"
            : micEnabled
            ? "Blow into your mic to extinguish the candles!"
            : "Tap the button below to light the candles"}
        </motion.p>
      </div>

      {/* ── THE CAKE ── */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1, y: [0, -4, 0] }}
        transition={{
          opacity: { duration: 0.6 },
          scale: { duration: 0.6 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.6 },
        }}
        style={{ perspective: "900px", transform: "rotateX(0deg) rotateY(0deg)" }}
      >
        {/* ── TIER 3 (TOP / SMALLEST) — purple + candles on top ── */}
        <div style={{ position: "relative", zIndex: 6, display: "flex", flexDirection: "column", alignItems: "center" }}>

          {/* CANDLES — sit ABOVE the tier 3 cap */}
          <div style={{
            width: 130,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "flex-end",
            paddingLeft: 4,
            paddingRight: 4,
            marginBottom: -6,
            zIndex: 10,
            position: "relative",
          }}>
            {CANDLE_CONFIGS.map((c, i) => (
              <Candle
                key={i}
                lit={litCandles.has(i)}
                color={c.color}
                wax={c.wax}
                onClick={() => handleToggleCandle(i)}
              />
            ))}
          </div>

          {/* Top cap for tier 3 (candle base) */}
          <div style={{
            width: 130,
            height: 18,
            background: "linear-gradient(135deg, #ede9fe, #ddd6fe 50%, #c4b5fd)",
            borderRadius: "50%",
            boxShadow: "0 -1px 6px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.3)",
            border: "1.5px solid rgba(255,255,255,0.5)",
            position: "relative",
            zIndex: 7,
          }}>
            {/* Frosting drips from tier 3 top */}
            {[10,32,54,76,100,122].map((x, i) => (
              <div key={i} style={{
                position: "absolute",
                top: "50%",
                left: x,
                width: 8 + (i % 2) * 3,
                height: 10 + (i % 3) * 4,
                background: "rgba(255,255,255,0.85)",
                borderRadius: "0 0 50% 50%",
                transform: "translateX(-50%)",
              }}/>
            ))}

            {/* Candle ambient glow on top cap */}
            <AnimatePresence>
              {ambientGlow && !showProceed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: "radial-gradient(ellipse at 50% 30%, rgba(251,191,36,0.5) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Tier 3 wall */}
          <div style={{
            width: 130,
            height: 56,
            margin: "-9px auto 0",
            background: "linear-gradient(to bottom, #c4b5fd, #8b5cf6 40%, #6d28d9)",
            borderRadius: "0 0 4px 4px",
            boxShadow: "inset -10px 0 18px rgba(0,0,0,0.3), inset 8px 0 12px rgba(255,255,255,0.2), 0 4px 10px rgba(0,0,0,0.4)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
              background: "linear-gradient(to right, rgba(0,0,0,0.2) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.2) 100%)",
              pointerEvents: "none",
            }}/>
            {/* Star / heart decorations */}
            {["★","♥","★","♥","★"].map((sym, i) => (
              <div key={i} style={{
                position: "absolute",
                left: `${12 + i * 18}%`,
                top: "35%",
                color: "rgba(255,255,255,0.7)",
                fontSize: 10,
                transform: "rotate(-10deg)",
              }}>{sym}</div>
            ))}
          </div>
        </div>

        {/* ── TIER 2 (MIDDLE) — amber ── */}
        <div style={{ position: "relative", zIndex: 4, marginTop: -5, display: "flex", flexDirection: "column", alignItems: "center" }}>

          {/* Top ellipse cap for tier 2 */}
          <div style={{
            width: 190,
            height: 20,
            background: "linear-gradient(135deg, #fef9c3, #fde68a 50%, #fcd34d)",
            borderRadius: "50%",
            boxShadow: "0 -1px 6px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.3)",
            border: "1.5px solid rgba(255,255,255,0.5)",
            position: "relative",
            zIndex: 5,
          }}>
            {/* Frosting drips from tier 2 top */}
            {[12,38,65,90,118,145,170].map((x, i) => (
              <div key={i} style={{
                position: "absolute",
                top: "55%",
                left: x,
                width: 9 + (i % 3) * 3,
                height: 12 + (i % 3) * 5,
                background: "rgba(255,255,255,0.88)",
                borderRadius: "0 0 50% 50%",
                transform: "translateX(-50%)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}/>
            ))}
          </div>

          {/* Tier 2 wall */}
          <div style={{
            width: 190,
            height: 68,
            margin: "-10px auto 0",
            background: "linear-gradient(to bottom, #fde68a, #f59e0b 40%, #d97706)",
            borderRadius: "0 0 4px 4px",
            boxShadow: "inset -16px 0 24px rgba(0,0,0,0.25), inset 12px 0 16px rgba(255,255,255,0.2), 0 4px 10px rgba(0,0,0,0.4)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
              background: "linear-gradient(to right, rgba(0,0,0,0.2) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.2) 100%)",
              pointerEvents: "none",
            }}/>
            {/* Ribbon on tier 2 */}
            <div style={{
              position: "absolute",
              bottom: 12,
              left: 0, right: 0,
              height: 12,
              background: "rgba(255,255,255,0.2)",
              borderTop: "1px solid rgba(255,255,255,0.5)",
              borderBottom: "1px solid rgba(255,255,255,0.5)",
            }}/>
            {/* Sprinkles tier 2 */}
            {TIER2_SPRINKLES.map(s => (
              <div key={s.id} style={{
                position: "absolute",
                left: `${8 + (s.id / TIER2_SPRINKLES.length) * 84}%`,
                top: `${15 + Math.cos(s.id) * 30}%`,
                width: s.w,
                height: s.h,
                background: s.color,
                borderRadius: 2,
                transform: `rotate(${s.rot}deg)`,
                opacity: 0.85,
              }}/>
            ))}
          </div>
        </div>

        {/* ── TIER 1 (BOTTOM / LARGEST) — pink ── */}
        <div style={{ position: "relative", zIndex: 2, marginTop: -5, display: "flex", flexDirection: "column", alignItems: "center" }}>

          {/* Top ellipse cap for tier 1 */}
          <div style={{
            width: 260,
            height: 24,
            background: "linear-gradient(135deg, #fce7f3, #fbcfe8 50%, #f9a8d4)",
            borderRadius: "50%",
            boxShadow: "0 -2px 8px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.3)",
            border: "1.5px solid rgba(255,255,255,0.5)",
            position: "relative",
            zIndex: 3,
          }}>
            {/* Frosting drips from tier 1 top */}
            {[10,40,70,100,130,160,190,220,245].map((x, i) => (
              <div key={i} style={{
                position: "absolute",
                top: "60%",
                left: x,
                width: 10 + (i % 3) * 4,
                height: 14 + (i % 4) * 6,
                background: "rgba(255,255,255,0.9)",
                borderRadius: "0 0 50% 50%",
                transform: "translateX(-50%)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}/>
            ))}
          </div>

          {/* Tier 1 wall */}
          <div style={{
            width: 260,
            height: 80,
            margin: "-12px auto 0",
            background: "linear-gradient(to bottom, #f9a8d4, #ec4899 40%, #be185d)",
            borderRadius: "0 0 4px 4px",
            boxShadow: "inset -20px 0 30px rgba(0,0,0,0.25), inset 20px 0 20px rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.4)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Side sheen */}
            <div style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
              background: "linear-gradient(to right, rgba(0,0,0,0.2) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.2) 100%)",
              pointerEvents: "none",
            }}/>
            {/* Decorative horizontal ribbon */}
            <div style={{
              position: "absolute",
              bottom: 14,
              left: 0, right: 0,
              height: 14,
              background: "rgba(255,255,255,0.18)",
              borderTop: "1px solid rgba(255,255,255,0.4)",
              borderBottom: "1px solid rgba(255,255,255,0.4)",
            }}/>
            {/* Sprinkles on tier 1 */}
            {SPRINKLES.map(s => (
              <div key={s.id} style={{
                position: "absolute",
                left: `${10 + (s.id / SPRINKLES.length) * 80}%`,
                top: `${20 + Math.sin(s.id) * 35}%`,
                width: s.w,
                height: s.h,
                background: s.color,
                borderRadius: 2,
                transform: `rotate(${s.rot}deg)`,
                opacity: 0.9,
              }}/>
            ))}
            {/* Name text on tier 1 */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "rgba(255,255,255,0.95)",
              fontFamily: "'Georgia', serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              whiteSpace: "nowrap",
            }}>
              {config?.recipientName
                ? `Happy Birthday ${config.recipientName}`
                : "Happy Birthday!"}
            </div>
          </div>
        </div>

        {/* PLATE / STAND — at the very bottom */}
        <div style={{
          width: 280,
          height: 16,
          background: "linear-gradient(135deg, #c0a060, #f5e0a0, #c0a060)",
          borderRadius: "50%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.3)",
          border: "2px solid #b8960a",
          margin: "4px auto 0",
          position: "relative",
          zIndex: 1,
        }}>
          <div style={{
            position: "absolute",
            top: "20%",
            left: "5%",
            width: "90%",
            height: "60%",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
          }} />
        </div>

        {/* Drop shadow */}
        <div style={{
          width: 300,
          height: 12,
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 70%)",
          margin: "6px auto 0",
          borderRadius: "50%",
        }}/>
      </motion.div>

      {/* ── CONTROLS ── */}

      <div className="relative z-10 mt-3 flex flex-col items-center gap-2">
        {candlesPhase === 'unlit' && (
          /* Phase 1: candles not yet lit */
          <div className="flex flex-col items-center gap-3">
            <motion.button
              onClick={() => { lightAllCandles(); }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              animate={{ scale: [1, 1.05, 1], boxShadow: ['0 0 20px rgba(251,146,60,0.4)', '0 0 35px rgba(251,146,60,0.7)', '0 0 20px rgba(251,146,60,0.4)'] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-base text-white border"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #fb923c, #f472b6)',
                borderColor: 'rgba(251,191,36,0.5)',
                boxShadow: '0 0 25px rgba(251,146,60,0.5), 0 4px 12px rgba(0,0,0,0.35)',
              }}
            >
              <Flame size={18} /> 🕯️ Light the Candles
            </motion.button>
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"/>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                Auto-lighting in 5s if no action…
              </span>
            </div>
          </div>
        )}

        {candlesPhase === 'lit' && !showProceed && (
          /* Phase 2: candles lit, waiting to blow */
          <div className="flex flex-col items-center gap-3">
            <motion.button
              onClick={handleBlowOutAll}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              disabled={litCandles.size === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-white shadow-lg border transition-all disabled:opacity-40"
              style={{
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                borderColor: 'rgba(236,72,153,0.4)',
                boxShadow: '0 0 24px rgba(236,72,153,0.4), 0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              <Wind size={16} /> 🎂 Blow Out Candles
            </motion.button>
            <div className="flex flex-col items-center gap-2">
              {/* Mic status pill */}
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <div className={`w-2 h-2 rounded-full ${micEnabled ? 'bg-green-400 animate-pulse shadow-[0_0_8px_green]' : 'bg-amber-400'}`}/>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  {micEnabled ? 'Mic Active — Blow to extinguish!' : 'Tap the button or blow into mic'}
                </span>
              </div>

              {/* Live blow meter — only when mic is active */}
              {micEnabled && (
                <div className="flex flex-col items-center gap-1 w-48">
                  {/* Wave bars */}
                  <div className="flex items-end gap-1 h-8">
                    {[0.3, 0.5, 0.7, 1, 0.85, 0.65, 0.45, 0.6, 0.8, 0.5, 0.35].map((base, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height: blowStrength > 5
                            ? `${Math.max(6, Math.min(32, base * blowStrength * 0.32 + 4))}px`
                            : '4px',
                          opacity: blowStrength > 5 ? 0.9 : 0.25,
                          backgroundColor: blowStrength > 60
                            ? '#f472b6'
                            : blowStrength > 30
                            ? '#fb923c'
                            : '#60a5fa',
                        }}
                        transition={{ duration: 0.1, ease: 'easeOut' }}
                        style={{ width: 6, borderRadius: 3, minHeight: 4 }}
                      />
                    ))}
                  </div>
                  {/* Label */}
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{
                    color: blowStrength > 60 ? '#f472b6' : blowStrength > 30 ? '#fb923c' : '#6b7280'
                  }}>
                    {blowStrength > 60 ? '💨 Strong blow!' : blowStrength > 20 ? '🌬️ Keep blowing…' : '🎤 Blow here…'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {showProceed && (
          /* Phase 3: all blown, proceed */
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="flex flex-col items-center gap-2"
          >
            <motion.button
              onClick={() => onBlow?.()}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white text-sm shadow-xl border border-pink-400/30"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6)',
                boxShadow: '0 0 32px rgba(236,72,153,0.5), 0 4px 16px rgba(0,0,0,0.3)',
              }}
            >
              🎁 Open Your Gift →
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
