// app/components/BalloonGame.jsx
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ChevronRight, Sparkles } from "lucide-react";
import { playPopSound, playPartyPopperSound } from "../utils/audioFX";

export default function BalloonGame({ onComplete }) {
  const [poppedIds, setPoppedIds] = useState(new Set());
  const [balloons, setBalloons] = useState([]);
  const target = 3; // Pop 3 to continue
  
  const balloonColors = [
    "from-pink-500 to-rose-500",
    "from-purple-500 to-indigo-500",
    "from-blue-400 to-cyan-500",
    "from-emerald-400 to-teal-500",
    "from-red-400 to-orange-500",
  ];

  useEffect(() => {
    // Generate 5 floating balloons
    const newBalloons = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      x: 10 + Math.random() * 60, // Random X from 10% to 70% to prevent overflow
      delay: Math.random() * 3, // Staggered start times
      duration: 10 + Math.random() * 6, // Floating speed (Slower)
      drift: 5 + Math.random() * 10, // Max drift of 15% to stay on screen
      isSpecial: i === 2 || i === 4, // 2 Golden Popper balloons
      colorClass: (i === 2 || i === 4)
        ? "from-yellow-300 via-yellow-400 to-yellow-600 shadow-[0_0_30px_rgba(250,204,21,0.6)]"
        : balloonColors[i % balloonColors.length]
    }));
    setBalloons(newBalloons);
  }, []);

  const handlePop = (balloon, e) => {
    if (poppedIds.has(balloon.id)) return;


    if (balloon.isSpecial) {
      playPartyPopperSound();
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
        colors: ['#facc15', '#fbbf24', '#f59e0b', '#fff'],
        ticks: 200,
        gravity: 0.8,
        scalar: 1.2
      });
    } else {
      playPopSound();
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
        colors: ['#fff', '#ec4899', '#3b82f6'],
        ticks: 100,
        gravity: 0.8,
        scalar: 0.6
      });
    }

    setPoppedIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(balloon.id);
      return newSet;
    });
  };

  const balloonsRemaining = target - poppedIds.size;

  return (
    <section className="relative flex flex-col items-center w-full h-full min-h-[100dvh] overflow-hidden z-10 px-4 py-6 md:px-6 md:py-12">
      {/* Top Text Layer */}
      <motion.div
        className="text-center z-20 pt-20 md:pt-24 pointer-events-none"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 mb-2 drop-shadow-lg">
          Catch the Balloons!
        </h2>
        <p className="text-gray-200 h-6 drop-shadow-md font-medium text-sm md:text-base">
          {poppedIds.size === 0 
            ? "Tap the moving balloons to pop them!" 
            : `Great! Pop ${balloonsRemaining > 0 ? balloonsRemaining : 0} more or continue below`}
        </p>
      </motion.div>

      {/* Continue Button Layer */}
      <div className="relative z-30 mt-4 md:mt-8 h-16 flex justify-center items-center pointer-events-none">
        <AnimatePresence>
          {poppedIds.size >= target && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, type: "spring" }}
              onClick={onComplete}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-4 px-6 md:px-8 font-semibold text-white bg-gradient-to-br from-pink-500 to-purple-600 pointer-events-auto active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                Continue to Cake <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Balloons Container */}
      {balloons.map(balloon => {
        const isPopped = poppedIds.has(balloon.id);
        
        return (
          <AnimatePresence key={balloon.id}>
            {!isPopped && (
              <motion.div
                className="absolute cursor-pointer flex flex-col items-center justify-center p-4 z-10"
                style={{ left: `${balloon.x}%`, top: '110%' }}
                initial={{ top: '110%' }}
                animate={{ 
                  top: '-20%',
                  x: [0, balloon.drift, -balloon.drift, balloon.drift, 0]
                }}
                transition={{
                  top: { duration: balloon.duration, repeat: Infinity, ease: "linear", delay: balloon.delay },
                  x: { duration: balloon.duration * 0.7, repeat: Infinity, ease: "easeInOut", delay: balloon.delay }
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.8 }}
                onClick={(e) => handlePop(balloon, e)}
              >
                {/* Balloon Body */}
                <div className={`relative w-24 h-32 md:w-32 md:h-40 rounded-[50%] bg-gradient-to-br ${balloon.colorClass} ${balloon.isSpecial ? 'border border-yellow-200' : ''}`}>
                  {/* Highlight */}
                  <div className="absolute top-3 left-3 w-6 h-10 rounded-[50%] bg-white/40 rotate-[-30deg]" />
                  {/* Special Sparkle */}
                  {balloon.isSpecial && (
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/70 w-12 h-12 animate-pulse pointer-events-none" />
                  )}
                  {/* Balloon tie */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-sm bg-inherit opacity-80" />
                </div>
                {/* String */}
                <div className="w-[1px] h-20 md:h-24 bg-white/30 mt-1" />
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}


    </section>
  );
}
