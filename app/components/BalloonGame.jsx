// app/components/BalloonGame.jsx
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ChevronRight, Sparkles } from "lucide-react";
import { playPopSound, playPartyPopperSound } from "../utils/audioFX";
import { useConfig } from "../context/ConfigContext";
import { getTheme } from "../utils/themes";

export default function BalloonGame({ onComplete }) {
  const [poppedIds, setPoppedIds] = useState(new Set());
  const [items, setItems] = useState([]);
  const target = 3; // Pop 3 to continue
  
  const config = useConfig();
  const theme = getTheme(config?.occasion);

  const colorsMap = {
    birthday: [
      "from-pink-500 to-rose-500",
      "from-purple-500 to-indigo-500",
      "from-blue-400 to-cyan-500",
      "from-emerald-400 to-teal-500",
      "from-red-400 to-orange-500",
    ],
    anniversary: [
      "from-rose-500 to-red-600",
      "from-pink-500 to-rose-600",
      "from-red-500 to-purple-600",
      "from-pink-400 to-rose-500",
      "from-rose-600 to-purple-700",
    ],
    engagement: [
      "from-amber-400 to-orange-500",
      "from-yellow-400 to-amber-500",
      "from-pink-400 to-rose-400",
      "from-amber-500 to-pink-500",
      "from-yellow-300 to-orange-400",
    ],
    wedding: [
      "from-yellow-200 via-yellow-100 to-yellow-300",
      "from-amber-300 to-yellow-500",
      "from-zinc-100 via-zinc-200 to-zinc-300",
      "from-orange-200 to-amber-300",
      "from-yellow-200 to-orange-300",
    ],
    "mother-day": [
      "from-pink-300 to-rose-400",
      "from-purple-300 to-pink-400",
      "from-lavender-300 to-purple-400",
      "from-pink-400 to-pink-600",
      "from-rose-300 to-purple-400",
    ],
    "father-day": [
      "from-blue-500 to-indigo-600",
      "from-cyan-500 to-blue-600",
      "from-indigo-500 to-indigo-700",
      "from-amber-500 to-orange-600",
      "from-blue-600 to-cyan-700",
    ]
  };

  const itemColors = colorsMap[config?.occasion] || colorsMap.birthday;

  useEffect(() => {
    // Generate 5 floating items
    const newItems = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      x: 10 + Math.random() * 60, // Random X from 10% to 70% to prevent overflow
      delay: Math.random() * 2.5, // Staggered start times
      duration: 9 + Math.random() * 5, // Floating speed (Slower)
      drift: 5 + Math.random() * 10, // Max drift of 15% to stay on screen
      isSpecial: i === 2 || i === 4, // 2 Golden Popper special items
      colorClass: (i === 2 || i === 4)
        ? "from-yellow-300 via-yellow-400 to-yellow-600 shadow-[0_0_30px_rgba(250,204,21,0.6)]"
        : itemColors[i % itemColors.length]
    }));
    setItems(newItems);
  }, [config]);

  const handlePop = (item, e) => {
    if (poppedIds.has(item.id)) return;

    if (item.isSpecial) {
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
      newSet.add(item.id);
      return newSet;
    });
  };

  const remaining = target - poppedIds.size;

  const renderShape = (item) => {
    const type = theme.gameItemType;
    if (type === "heart") {
      return (
        <div className={`relative w-20 h-20 md:w-28 md:h-28 flex items-center justify-center`}>
          <svg viewBox="0 0 32 29.6" className="w-full h-full drop-shadow-xl select-none pointer-events-none">
            <defs>
              <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={item.colorClass.includes("from-yellow-300") ? "#fde047" : "#f43f5e"} />
                <stop offset="50%" stopColor={item.colorClass.includes("from-yellow-300") ? "#eab308" : "#e11d48"} />
                <stop offset="100%" stopColor={item.colorClass.includes("from-yellow-300") ? "#ca8a04" : "#be123c"} />
              </linearGradient>
            </defs>
            <path d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z" 
              fill={`url(#grad-${item.id})`}
            />
          </svg>
          {item.isSpecial && (
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90 w-8 h-8 animate-pulse pointer-events-none" />
          )}
        </div>
      );
    }

    if (type === "flower") {
      return (
        <div className={`relative w-20 h-20 md:w-28 md:h-28 flex items-center justify-center`}>
          <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-xl select-none pointer-events-none">
            <defs>
              <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={item.colorClass.includes("from-yellow-300") ? "#fde047" : "#ffc0cb"} />
                <stop offset="100%" stopColor={item.colorClass.includes("from-yellow-300") ? "#ca8a04" : "#f472b6"} />
              </linearGradient>
            </defs>
            <path d="M12,2A10,10,0,0,0,2,12a10,10,0,0,0,10,10,10,10,0,0,0,10,-10A10,10,0,0,0,12,2Zm0,18a8,8,0,0,1,-8,-8,8,8,0,0,1,8,-8,8,8,0,0,1,8,8,8,8,0,0,1,-8,8Z" fill={`url(#grad-${item.id})`} opacity="0.3"/>
            <path d="M12,5a3,3,0,0,0,-3,3c0,2.5,3,5.5,3,5.5s3,-3,3,-5.5A3,3,0,0,0,12,5Z" fill={`url(#grad-${item.id})`}/>
            <path d="M12,19a3,3,0,0,0,3,-3c0,-2.5,-3,-5.5,-3,-5.5s,-3,3,-3,5.5A3,3,0,0,0,12,19Z" fill={`url(#grad-${item.id})`}/>
            <path d="M5,12a3,3,0,0,0,3,3c2.5,0,5.5,-3,5.5,-3s-3,-3,-3,-5.5A3,3,0,0,0,5,12Z" fill={`url(#grad-${item.id})`}/>
            <path d="M19,12a3,3,0,0,0,-3,-3c-2.5,0,-5.5,3,-5.5,3s3,3,3,5.5A3,3,0,0,0,19,12Z" fill={`url(#grad-${item.id})`}/>
            <circle cx="12" cy="12" r="2.5" fill="#fff" />
          </svg>
          {item.isSpecial && (
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90 w-8 h-8 animate-pulse pointer-events-none" />
          )}
        </div>
      );
    }

    if (type === "star" || type === "ring-bubble" || type === "crystal-bubble") {
      return (
        <div className={`relative w-20 h-20 md:w-26 md:h-26 rounded-full bg-gradient-to-br ${item.colorClass} border border-white/20 backdrop-blur-sm flex items-center justify-center`}>
          <div className="absolute top-2 left-2 w-4 h-6 rounded-[50%] bg-white/40 rotate-[-30deg]" />
          <Sparkles className="text-white/80 w-8 h-8 animate-pulse pointer-events-none" />
        </div>
      );
    }

    // Default Balloon
    return (
      <>
        {/* Balloon Body */}
        <div className={`relative w-24 h-32 md:w-32 md:h-40 rounded-[50%] bg-gradient-to-br ${item.colorClass} ${item.isSpecial ? 'border border-yellow-200' : ''}`}>
          {/* Highlight */}
          <div className="absolute top-3 left-3 w-6 h-10 rounded-[50%] bg-white/40 rotate-[-30deg]" />
          {/* Special Sparkle */}
          {item.isSpecial && (
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/70 w-12 h-12 animate-pulse pointer-events-none" />
          )}
          {/* Balloon tie */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-sm bg-inherit opacity-80" />
        </div>
        {/* String */}
        <div className="w-[1px] h-20 md:h-24 bg-white/30 mt-1" />
      </>
    );
  };

  const getContinueText = () => {
    switch (theme.ceremonyType) {
      case "wedding-candles": return "Continue to Candle Lighting";
      case "lantern": return "Continue to Lantern Release";
      case "sparkler": return "Continue to Light Sparkler";
      case "flower-grow": return "Continue to Bloom Flower";
      default: return "Continue to Cake";
    }
  };

  return (
    <section className="relative flex flex-col items-center w-full h-full min-h-[100dvh] overflow-hidden z-10 px-4 py-6 md:px-6 md:py-12">
      {/* Top Text Layer */}
      <motion.div
        className="text-center z-20 pt-20 md:pt-24 pointer-events-none"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 mb-2 drop-shadow-lg">
          {theme.gameTitle}
        </h2>
        <p className="text-gray-200 h-6 drop-shadow-md font-medium text-sm md:text-base">
          {poppedIds.size === 0 
            ? theme.gameSubtitle 
            : `Great! Pop ${remaining > 0 ? remaining : 0} more or continue below`}
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
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-4 px-6 md:px-8 font-semibold text-white bg-gradient-to-br from-pink-500 to-purple-600 pointer-events-auto active:scale-95 shadow-[0_0_30px_rgba(236,72,153,0.3)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                {getContinueText()} <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Items Container */}
      {items.map(item => {
        const isPopped = poppedIds.has(item.id);
        
        return (
          <AnimatePresence key={item.id}>
            {!isPopped && (
              <motion.div
                className="absolute cursor-pointer flex flex-col items-center justify-center p-4 z-10"
                style={{ left: `${item.x}%`, top: '110%' }}
                initial={{ top: '110%' }}
                animate={{ 
                  top: '-20%',
                  x: [0, item.drift, -item.drift, item.drift, 0]
                }}
                transition={{
                  top: { duration: item.duration, repeat: Infinity, ease: "linear", delay: item.delay },
                  x: { duration: item.duration * 0.7, repeat: Infinity, ease: "easeInOut", delay: item.delay }
                }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.8 }}
                onClick={(e) => handlePop(item, e)}
              >
                {renderShape(item)}
              </motion.div>
            )}
          </AnimatePresence>
        );
      })}
    </section>
  );
}
