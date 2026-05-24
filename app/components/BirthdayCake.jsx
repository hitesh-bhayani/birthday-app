// app/components/BirthdayCake.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playWhooshSound, playPartyPopperSound } from "../utils/audioFX";
import { useConfig } from "../context/ConfigContext";
import { getTheme } from "../utils/themes";
import { Sparkles, Flame, Heart } from "lucide-react";

export default function BirthdayCake({ onBlow }) {
  const [blownCandles, setBlownCandles] = useState(new Set());
  const [micEnabled, setMicEnabled] = useState(false);
  const [litState, setLitState] = useState(0); // For lantern/sparkler progression
  const [isAnimating, setIsAnimating] = useState(false);

  const totalCandles = 5;
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  const config = useConfig();
  const theme = getTheme(config?.occasion);
  const ceremony = theme.ceremonyType; // cake, lantern, sparkler, wedding-candles, flower-grow

  const handleAction = (index) => {
    if (ceremony === "cake") {
      if (blownCandles.has(index)) return;
      playWhooshSound();
      setBlownCandles(prev => {
        const next = new Set(prev);
        next.add(index);
        if (next.size === totalCandles) {
          setTimeout(() => { onBlow && onBlow(); }, 1500);
        }
        return next;
      });
    } else {
      // Progress states for single-object ceremonies
      if (litState >= 3 || isAnimating) return;
      playWhooshSound();
      setIsAnimating(true);
      setLitState(prev => {
        const next = prev + 1;
        if (next >= 3) {
          setTimeout(() => { onBlow && onBlow(); }, 2000);
        }
        setTimeout(() => setIsAnimating(false), 600);
        return next;
      });
    }
  };

  const handleGlobalTap = () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (ceremony === "cake") {
      setBlownCandles(prev => {
        const newSet = new Set(prev);
        for (let i = 0; i < totalCandles; i++) {
          if (!newSet.has(i)) {
            playWhooshSound();
            newSet.add(i);
            if (newSet.size === totalCandles) {
              setTimeout(() => { onBlow && onBlow(); }, 1500);
            }
            break;
          }
        }
        return newSet;
      });
    } else {
      handleAction(litState);
    }
  };

  useEffect(() => {
    const initMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        
        const microphone = audioContext.createMediaStreamSource(stream);
        microphoneRef.current = microphone;
        microphone.connect(analyser);
        
        setMicEnabled(true);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        let consecutiveBlows = 0;
        
        const detectBlow = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const averageVolume = sum / bufferLength;
          
          // Noise-tolerant lower threshold for blow detection
          if (averageVolume > 20) {
            consecutiveBlows++;
            if (consecutiveBlows >= 4) { // Needs sustained input
              consecutiveBlows = 0;
              handleGlobalTap();
            }
          } else {
            consecutiveBlows = Math.max(0, consecutiveBlows - 1);
          }
          
          animationFrameRef.current = requestAnimationFrame(detectBlow);
        };
        
        detectBlow();
      } catch (err) {
        console.warn("Microphone access declined or unavailable:", err);
      }
    };
    
    initMic();
    
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [ceremony, litState, blownCandles]);

  // ── RENDER SPECIFIC CEREMONIES ──────────────────────────────────────────────
  const renderCeremony = () => {
    if (ceremony === "lantern") {
      return (
        <div className="flex flex-col items-center justify-center h-80">
          <motion.div
            animate={litState >= 3 ? { y: -300, scale: 0.5, opacity: 0 } : { y: [-5, 5, -5] }}
            transition={litState >= 3 ? { duration: 2.5, ease: "easeIn" } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
            onClick={handleGlobalTap}
            className="relative cursor-pointer flex flex-col items-center"
          >
            {/* Sky Lantern Body */}
            <div className={`relative w-40 h-56 rounded-t-[4rem] rounded-b-[1rem] border border-orange-500/20 bg-gradient-to-t ${
              litState === 0 ? "from-orange-950/40 via-orange-900/10 to-transparent" :
              litState === 1 ? "from-orange-800/60 via-orange-900/30 to-orange-950/20 shadow-[0_0_20px_rgba(249,115,22,0.2)]" :
              litState === 2 ? "from-orange-500/80 via-orange-700/50 to-orange-900/30 shadow-[0_0_40px_rgba(249,115,22,0.4)] animate-pulse" :
              "from-orange-400 via-orange-500 to-amber-300 shadow-[0_0_60px_rgba(249,115,22,0.8)]"
            } backdrop-blur-sm transition-all duration-700 flex flex-col items-center justify-end pb-8`}>
              
              {/* Highlight */}
              <div className="absolute inset-x-4 top-4 h-16 rounded-t-full bg-white/5 pointer-events-none" />

              {/* Lantern Burner Flame */}
              {litState > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], y: [0, -2, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={`w-10 h-14 rounded-full bg-gradient-to-t ${
                    litState === 1 ? "from-orange-600 to-yellow-500" :
                    litState === 2 ? "from-orange-500 via-yellow-400 to-white shadow-[0_0_20px_orange]" :
                    "from-orange-400 via-amber-300 to-white shadow-[0_0_35px_white]"
                  }`}
                />
              )}
            </div>
            {/* Wooden Base Ring */}
            <div className="w-44 h-4 bg-orange-900/60 rounded-full border border-orange-800/40 mt-[-5px]" />
          </motion.div>
        </div>
      );
    }

    if (ceremony === "sparkler") {
      return (
        <div className="flex flex-col items-center justify-center h-80">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            onClick={handleGlobalTap}
            className="relative cursor-pointer flex flex-col items-center"
          >
            {/* Sparkler Heart Head */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <Heart 
                size={120} 
                className={`transition-colors duration-700 ${
                  litState === 0 ? "text-gray-700 stroke-[1.5]" :
                  litState === 1 ? "text-amber-700 stroke-[2] shadow-[0_0_10px_rgba(245,158,11,0.2)]" :
                  litState === 2 ? "text-amber-500 stroke-[2.5] shadow-[0_0_20px_orange]" :
                  "text-white fill-amber-400 stroke-[3] drop-shadow-[0_0_30px_rgba(245,158,11,0.8)]"
                }`}
              />

              {/* Sparks emitting */}
              {litState > 0 && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {Array.from({ length: litState * 8 }).map((_, i) => {
                    const angle = (i * 360) / (litState * 8);
                    const distance = Math.random() * 40 + 35;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 1, scale: 1 }}
                        animate={{ 
                          x: [0, Math.cos(angle * Math.PI / 180) * distance],
                          y: [0, Math.sin(angle * Math.PI / 180) * distance],
                          opacity: [1, 0],
                          scale: [1, 0]
                        }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: Math.random() * 0.4 }}
                        className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300"
                      />
                    );
                  })}
                </div>
              )}
            </div>
            {/* Metal rod */}
            <div className="w-1.5 h-44 bg-gradient-to-b from-gray-500 to-gray-700 shadow-md rounded-b-md" />
          </motion.div>
        </div>
      );
    }

    if (ceremony === "wedding-candles") {
      return (
        <div className="flex items-end justify-center gap-6 md:gap-10 h-80 pb-6">
          {Array.from({ length: 3 }).map((_, i) => {
            const isLit = litState > i;
            const heightClass = i === 1 ? "h-64" : "h-52"; // Middle taller
            return (
              <div 
                key={i} 
                onClick={handleGlobalTap}
                className="flex flex-col items-center cursor-pointer group"
              >
                {/* Wick and Flame */}
                <div className="relative w-1 h-6 flex justify-center">
                  <div className="w-[1.5px] h-full bg-black/40" />
                  {isLit && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [-2, 2, -2] }}
                      transition={{ duration: 1 + Math.random(), repeat: Infinity }}
                      className="absolute bottom-3 w-4 h-9 rounded-full bg-gradient-to-t from-orange-500 via-yellow-400 to-white shadow-[0_0_20px_rgba(245,158,11,0.6)]"
                    />
                  )}
                </div>
                {/* Candle Body */}
                <div className={`w-14 ${heightClass} bg-gradient-to-b from-yellow-50/90 to-yellow-100/60 rounded-t-lg shadow-lg border border-yellow-200/20 backdrop-blur-[1px] relative transition-transform group-hover:scale-102`}>
                  {/* Wax dripping decoration */}
                  <div className="absolute top-0 inset-x-2 h-4 rounded-b-md bg-yellow-50 opacity-90" />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (ceremony === "flower-grow") {
      return (
        <div className="flex flex-col items-center justify-center h-80">
          <motion.div
            onClick={handleGlobalTap}
            className="relative cursor-pointer flex flex-col items-center"
          >
            {/* Flower Head */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              {litState === 0 && (
                // Rose bud
                <motion.div className="w-16 h-24 rounded-full bg-gradient-to-t from-pink-700 to-pink-500 border border-pink-400/20 shadow-lg" />
              )}
              {litState === 1 && (
                // Opening Bud
                <motion.div className="relative w-24 h-28 flex items-center justify-center">
                  <div className="absolute w-16 h-26 rounded-full bg-pink-600 rotate-[-15deg]" />
                  <div className="absolute w-16 h-26 rounded-full bg-pink-500 rotate-[15deg]" />
                  <div className="absolute w-12 h-20 rounded-full bg-rose-400" />
                </motion.div>
              )}
              {litState >= 2 && (
                // Fully Bloomed Rose
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative w-40 h-40 flex items-center justify-center"
                >
                  <div className="absolute w-36 h-36 rounded-full bg-pink-700/80 shadow-[0_0_20px_pink]" />
                  {/* Petals layer */}
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div 
                      key={idx} 
                      style={{ transform: `rotate(${idx * 60}deg)` }}
                      className="absolute w-20 h-28 rounded-full bg-gradient-to-t from-pink-600 to-rose-400 border border-pink-500/20 origin-center" 
                    />
                  ))}
                  <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-yellow-200 border border-white/20 shadow-md" />
                  <Sparkles className="absolute text-white w-8 h-8 animate-pulse" />
                </motion.div>
              )}
            </div>
            {/* Stem and leaf */}
            <div className="w-2 h-44 bg-emerald-700 rounded-b-md relative flex items-center">
              <motion.div 
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute left-2 w-10 h-6 bg-emerald-600 border border-emerald-500 rounded-r-full rounded-tl-full origin-left"
              />
            </div>
          </motion.div>
        </div>
      );
    }

    // Default Cake
    return (
      <div 
        onClick={handleCakeTap}
        className="relative cursor-pointer flex flex-col items-center mt-6"
      >
        {/* Candles Container */}
        <div className="flex gap-4 mb-2 z-20">
          {Array.from({ length: totalCandles }).map((_, index) => {
            const isBlown = blownCandles.has(index);
            return (
              <div 
                key={index} 
                className="relative flex flex-col items-center justify-end h-24 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBlowCandle(index);
                }}
              >
                {/* Flame */}
                <AnimatePresence>
                  {!isBlown && (
                    <motion.div
                      className="absolute top-2 w-3.5 h-7 bg-gradient-to-t from-orange-500 via-yellow-400 to-white rounded-full shadow-[0_0_15px_rgba(245,158,11,0.8)]"
                      style={{ transformOrigin: "bottom center" }}
                      animate={{ 
                        scale: [1, 1.25, 0.95, 1.15, 1],
                        rotate: [-3, 3, -1, 2, -3]
                      }}
                      exit={{ 
                        scale: 0,
                        opacity: 0,
                        transition: { duration: 0.3 }
                      }}
                      transition={{ 
                        repeat: Infinity,
                        duration: 1.2,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </AnimatePresence>
                {/* Candle body */}
                <div className={`w-3 h-14 bg-gradient-to-t ${
                  index % 2 === 0 ? 'from-pink-500 via-purple-400 to-pink-300' : 'from-indigo-500 via-cyan-400 to-indigo-300'
                } rounded-t-sm shadow-md`} />
              </div>
            );
          })}
        </div>

        {/* Cake Tier 3 (Top) */}
        <div className="w-48 h-12 bg-pink-100 rounded-t-2xl shadow-inner border-b border-pink-200/50 flex items-center justify-around px-4 relative z-10">
          <div className="absolute top-0 left-0 w-full h-2 bg-pink-300/30 rounded-t-2xl" />
          <div className="w-2 h-2 rounded-full bg-rose-400" />
          <div className="w-2 h-2 rounded-full bg-purple-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-rose-400" />
        </div>

        {/* Cake Tier 2 (Middle) */}
        <div className="w-64 h-16 bg-[#faf0f5] border-b border-pink-200/40 relative shadow-md">
          {/* Chocolate frosting drip decoration */}
          <div className="absolute top-0 inset-x-0 flex justify-between h-4 pointer-events-none">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="w-6 h-4 bg-[#8b5a2b] rounded-b-lg mt-[-2px] first:rounded-bl-none last:rounded-br-none" />
            ))}
          </div>
          <div className="absolute bottom-2 inset-x-8 flex justify-around">
            <span className="text-pink-300/50">✨</span>
            <span className="text-purple-300/50">✨</span>
            <span className="text-pink-300/50">✨</span>
          </div>
        </div>

        {/* Cake Tier 1 (Base) */}
        <div className="w-80 h-20 bg-pink-50 border-b border-pink-100 rounded-b-xl shadow-lg relative flex items-center justify-center">
          {/* White cream swirl pattern */}
          <div className="absolute top-0 left-0 w-full h-3 bg-white/70" />
          <span className="font-bold text-pink-400/60 font-serif tracking-widest text-lg md:text-xl select-none">
            WITH LOVE
          </span>
        </div>

        {/* Stand Plate */}
        <div className="w-88 h-4 bg-zinc-300 rounded-full border-t border-white shadow-xl mt-[-5px]" />
      </div>
    );
  };

  return (
    <section className="relative flex flex-col items-center justify-center w-full min-h-[100dvh] overflow-hidden z-10 px-4 py-8 select-none">
      {/* Mic Status Indicator */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 no-print">
        <div className={`w-2.5 h-2.5 rounded-full ${micEnabled ? 'bg-green-400 shadow-[0_0_10px_green]' : 'bg-orange-400'}`} />
        <span className="text-xs font-semibold text-gray-300 tracking-wide uppercase">
          {micEnabled ? "Mic Blow Enabled" : "Tap Screen to Play"}
        </span>
      </div>

      {/* Typography */}
      <div className="text-center mb-4 mt-16 max-w-lg z-10 pointer-events-none">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400 mb-2 drop-shadow-md"
        >
          {theme.ceremonyTitle}
        </motion.h2>
        <p className="text-gray-300 font-medium text-xs md:text-sm drop-shadow-sm leading-relaxed px-4">
          {theme.ceremonySubtitle}
        </p>
      </div>

      {/* Interactive ceremony element */}
      <div className="z-10 w-full max-w-md flex justify-center items-center">
        {renderCeremony()}
      </div>
    </section>
  );
}
