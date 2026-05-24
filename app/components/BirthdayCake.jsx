// app/components/BirthdayCake.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playWhooshSound } from "../utils/audioFX";

export default function BirthdayCake({ onBlow }) {
  const [blownCandles, setBlownCandles] = useState(new Set());
  const [micEnabled, setMicEnabled] = useState(false);
  const totalCandles = 5;
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  const handleBlowCandle = (index) => {
    if (blownCandles.has(index)) return;
    
    playWhooshSound();
    
    setBlownCandles(prev => {
      const next = new Set(prev);
      next.add(index);
      
      if (next.size === totalCandles) {
        setTimeout(() => {
          onBlow && onBlow();
        }, 1500);
      }
      return next;
    });
  };

  const handleCakeTap = () => {
    // Ensure AudioContext is resumed (Safari fix)
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    // Find the first unblown candle and blow it out
    setBlownCandles(prev => {
      const newSet = new Set(prev);
      for (let i = 0; i < totalCandles; i++) {
        if (!newSet.has(i)) {
          // Wrap inside state setter to ensure we always have latest state
          playWhooshSound();
          newSet.add(i);
          if (newSet.size === totalCandles) {
            setTimeout(() => {
              onBlow && onBlow();
            }, 1500);
          }
          break;
        }
      }
      return newSet;
    });
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
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        let lastBlowTime = 0;
        const detectBlow = () => {
          analyser.getByteFrequencyData(dataArray);
          
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          
          // If a loud sound (blow) is detected, blow out one candle
          if (average > 35) { // Lowered threshold for noise-canceling mics
            const now = Date.now();
            if (now - lastBlowTime > 300) { // Throttle blows to look realistic
              handleCakeTap();
              lastBlowTime = now;
            }
          }
          
          animationFrameRef.current = requestAnimationFrame(detectBlow);
        };
        
        detectBlow();
      } catch (err) {
        console.log("Microphone permission denied or unsupported:", err);
      }
    };

    initMic();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // 5 Candle configurations (position and colorful magic flames)
  const candleConfigs = [
    { x: -50, color: "from-pink-400 to-rose-200" },
    { x: -25, color: "from-blue-400 to-cyan-200" },
    { x: 0, color: "from-purple-400 to-fuchsia-200" },
    { x: 25, color: "from-emerald-400 to-teal-200" },
    { x: 50, color: "from-orange-400 to-yellow-200" },
  ];

  return (
    <section className="relative flex flex-col items-center justify-between w-full px-6 pt-28 pb-12 md:py-24 z-10 min-h-[100dvh]">
      <motion.div
        className="text-center mb-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400 mb-2">
          Make a Wish!
        </h2>
        <p className="text-gray-300 h-6 text-sm md:text-base">
          {blownCandles.size < totalCandles 
            ? (micEnabled ? "🎤 Blow into your phone or tap to extinguish!" : "Tap the candles to blow them out!")
            : "Your wish is granted! 🎂"}
        </p>
      </motion.div>

      {/* Interactive Cake Container */}
      <motion.div
        className="relative cursor-pointer group flex flex-col items-center mt-auto mb-10"
        onClick={handleCakeTap}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.5, duration: 1 }}
      >
        {/* Glow behind the cake */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 blur-[80px] rounded-full pointer-events-none" />

        {/* Top Tier */}
        <div className="relative w-32 h-16 bg-gradient-to-b from-pink-300 to-pink-400 mx-auto rounded-t-xl rounded-b-md shadow-[0_4px_10px_rgba(0,0,0,0.2)] border border-pink-200/50 z-20">
          
          {/* Candles */}
          <div className="absolute bottom-[100%] left-0 w-full flex justify-center z-10">
            {candleConfigs.map(({ x, color }, i) => {
              const isThisCandleBlownOut = blownCandles.has(i);

              return (
                <motion.div 
                  key={i} 
                  className="absolute bottom-[-10px] flex flex-col items-center p-4 cursor-pointer"
                  style={{ x }}
                  animate={!isThisCandleBlownOut ? { y: [0, -4, 0] } : { y: 0 }}
                  transition={{ duration: 1.5 + (i * 0.2), repeat: Infinity, ease: "easeInOut" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBlowCandle(i);
                  }}
                >
                  {/* Flame */}
                  <AnimatePresence>
                    {!isThisCandleBlownOut && (
                      <motion.div
                        exit={{ opacity: 0, scale: 0, y: -10, rotate: 45 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                      >
                        {/* Colorful Magical Glow */}
                        <div className={`absolute -top-1 -left-2 w-7 h-9 rounded-full blur-md opacity-60 bg-gradient-to-t ${color}`} />
                        
                        <motion.div 
                          className={`w-3 h-5 bg-gradient-to-t ${color} rounded-[50%_50%_20%_20%] relative z-10`}
                          animate={{ 
                            scale: [1, 1.1, 0.9, 1.1, 1],
                            rotate: [0, -4, 4, -2, 0]
                          }}
                          transition={{ 
                            duration: 0.3 + (Math.random() * 0.2), 
                            repeat: Infinity,
                            repeatType: "mirror",
                            delay: i * 0.1
                          }}
                        />
                        {/* Inner flame highlight */}
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-2 bg-white/80 rounded-full z-20" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Smoke (shows when blown out) */}
                  <AnimatePresence>
                    {isThisCandleBlownOut && (
                      <motion.div
                        initial={{ opacity: 0, y: 0, scale: 0.5 }}
                        animate={{ opacity: [0, 0.5, 0], y: -40, scale: 1.5, rotate: 15 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute top-2 w-4 h-4 rounded-full bg-gray-300/40 blur-sm"
                      />
                    )}
                  </AnimatePresence>

                  {/* Wick */}
                  <div className="w-[2px] h-2 bg-gray-700 mt-2" />
                  {/* Candle Body */}
                  <div className="w-3 h-16 rounded-sm bg-gradient-to-b from-red-200 to-white shadow-[inset_2px_0_4px_rgba(0,0,0,0.1)] relative overflow-hidden">
                    {/* Stripes */}
                    <div className="absolute top-2 -left-2 w-8 h-2 bg-red-400 rotate-45" />
                    <div className="absolute top-6 -left-2 w-8 h-2 bg-red-400 rotate-45" />
                    <div className="absolute top-10 -left-2 w-8 h-2 bg-red-400 rotate-45" />
                    <div className="absolute top-14 -left-2 w-8 h-2 bg-red-400 rotate-45" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Icing Drips */}
          <div className="absolute top-0 left-0 w-full flex justify-around px-1">
             <div className="w-4 h-6 bg-white rounded-b-full shadow-sm" />
             <div className="w-5 h-8 bg-white rounded-b-full shadow-sm -mt-1" />
             <div className="w-4 h-5 bg-white rounded-b-full shadow-sm" />
             <div className="w-6 h-9 bg-white rounded-b-full shadow-sm -mt-2" />
             <div className="w-4 h-6 bg-white rounded-b-full shadow-sm" />
          </div>
        </div>

        {/* Middle Tier */}
        <div className="relative w-48 h-20 bg-gradient-to-b from-purple-400 to-purple-500 mx-auto -mt-2 rounded-md shadow-[0_4px_15px_rgba(0,0,0,0.3)] border border-purple-300/30 z-10">
          {/* Decorative band */}
          <div className="absolute bottom-2 w-full h-3 bg-purple-600/50 flex justify-around items-center px-2">
             {Array.from({length: 8}).map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
             ))}
          </div>
        </div>

        {/* Bottom Tier */}
        <div className="relative w-64 h-24 bg-gradient-to-b from-indigo-500 to-indigo-600 mx-auto -mt-2 rounded-b-2xl rounded-t-md shadow-[0_10px_30px_rgba(0,0,0,0.4)] border border-indigo-400/30 z-0">
          {/* Base plate */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-72 h-8 rounded-[50%] bg-white/10 border border-white/20 shadow-2xl" />
        </div>

      </motion.div>
    </section>
  );
}
