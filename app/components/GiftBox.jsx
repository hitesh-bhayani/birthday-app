// app/components/GiftBox.jsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { playPartyPopperSound } from "../utils/audioFX";
import FireworksFinale from "./FireworksFinale";
import { useConfig } from "../context/ConfigContext";
import { getTheme } from "../utils/themes";

export default function GiftBox({ onOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const config = useConfig();
  const theme = getTheme(config?.occasion);

  const handleDragEnd = (event, info) => {
    if (info.offset.y < -50 || Math.abs(info.offset.x) > 100) {
      handleOpen();
    }
  };

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    playPartyPopperSound();

    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#a855f7', '#ec4899', '#3b82f6', '#facc15']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#a855f7', '#ec4899', '#3b82f6', '#facc15']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    setTimeout(() => setShowMessage(true), 800);
    setTimeout(() => setShowFireworks(true), 2000);
  };

  const renderLid = () => {
    const type = theme.giftType;
    
    if (type === "velvet-ring") {
      return (
        <div className="relative w-44 h-24 bg-gradient-to-br from-rose-800 to-red-950 rounded-[40%] shadow-[0_10px_20px_rgba(0,0,0,0.5)] z-20 cursor-grab active:cursor-grabbing border-b-[6px] border-rose-900 mx-auto flex items-center justify-center">
          {/* Gold Oval Frame */}
          <div className="w-[88%] h-[84%] rounded-[40%] border-2 border-yellow-500/30 flex items-center justify-center">
            <span className="text-yellow-400/40 text-xs font-serif tracking-widest uppercase">LOVE</span>
          </div>
        </div>
      );
    }

    if (type === "gold-chest") {
      return (
        <div className="relative w-56 h-20 bg-gradient-to-t from-amber-900 via-amber-800 to-yellow-950 rounded-t-3xl shadow-lg z-20 cursor-grab active:cursor-grabbing border-b-4 border-amber-950 mx-auto">
          {/* Gold Straps */}
          <div className="absolute top-0 bottom-0 left-8 w-4 bg-gradient-to-r from-yellow-500 to-yellow-600 border-x border-amber-950/40" />
          <div className="absolute top-0 bottom-0 right-8 w-4 bg-gradient-to-r from-yellow-500 to-yellow-600 border-x border-amber-950/40" />
          {/* Key Latch */}
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-8 h-10 bg-yellow-500 rounded-b-md border-x border-b border-amber-950 shadow-md z-30" />
        </div>
      );
    }

    // Default Wrapped
    return (
      <div className="relative w-56 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-[0_10px_20px_rgba(0,0,0,0.4)] z-20 cursor-grab active:cursor-grabbing border-b-4 border-indigo-700 mx-auto">
        {/* Horizontal Ribbon */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-4 bg-gradient-to-r from-yellow-300 to-yellow-500 shadow-sm" />
        {/* Vertical Ribbon */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 bg-gradient-to-b from-yellow-300 to-yellow-500 shadow-sm" />
        
        {/* Ribbon Bow */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-end">
           <div className="w-12 h-10 border-[6px] border-yellow-400 rounded-[50%_50%_0_50%] origin-bottom-right -rotate-12 translate-x-2" />
           <div className="w-12 h-10 border-[6px] border-yellow-400 rounded-[50%_50%_50%_0] origin-bottom-left rotate-12 -translate-x-2" />
           <div className="absolute bottom-[-2px] left-1/2 -translate-x-1/2 w-5 h-4 bg-yellow-500 rounded-sm" />
        </div>
      </div>
    );
  };

  const renderBase = () => {
    const type = theme.giftType;

    if (type === "velvet-ring") {
      return (
        <div className="relative w-42 h-32 bg-gradient-to-br from-rose-900 to-red-950 rounded-t-sm rounded-b-[40%] shadow-2xl mx-auto -mt-2 z-10 overflow-hidden border-t-8 border-rose-950/80 flex items-center justify-center">
          {/* Inside Ring Holder Slot */}
          {isOpen && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute top-2 w-28 h-12 bg-black/40 rounded-full border border-rose-800/50 flex items-center justify-center"
            >
              {/* Ring Drawing */}
              <div className="w-12 h-12 rounded-full border-4 border-yellow-400/80 shadow-[0_0_15px_rgba(250,204,21,0.5)] flex items-center justify-center">
                {/* Shining Jewel */}
                <div className="w-4 h-4 rotate-45 bg-cyan-100 shadow-[0_0_10px_white] mt-[-36px] border border-cyan-200" />
              </div>
            </motion.div>
          )}
        </div>
      );
    }

    if (type === "gold-chest") {
      return (
        <div className="relative w-54 h-36 bg-gradient-to-br from-amber-950 via-amber-900 to-yellow-950 rounded-b-xl shadow-2xl mx-auto -mt-2 z-10 overflow-hidden border-t-8 border-amber-950/80">
          {/* Gold Straps */}
          <div className="absolute top-0 bottom-0 left-7 w-4 bg-gradient-to-b from-yellow-500 to-yellow-600 border-x border-amber-950/40 shadow-inner" />
          <div className="absolute top-0 bottom-0 right-7 w-4 bg-gradient-to-b from-yellow-500 to-yellow-600 border-x border-amber-950/40 shadow-inner" />
          
          {/* Gold Corner Accents */}
          <div className="absolute bottom-0 left-0 w-6 h-6 bg-yellow-600 rounded-bl-xl border-t border-r border-amber-950/40" />
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-yellow-600 rounded-br-xl border-t border-l border-amber-950/40" />
        </div>
      );
    }

    // Default Base
    return (
      <div className="relative w-52 h-40 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-b-xl shadow-2xl mx-auto -mt-2 z-10 overflow-hidden border-t-8 border-indigo-800/50">
         {/* Vertical Ribbon */}
         <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-inner" />
      </div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {showFireworks && (
          <FireworksFinale onComplete={() => { setShowFireworks(false); onOpen && onOpen(); }} />
        )}
      </AnimatePresence>

      <section className="relative flex flex-col items-center justify-center w-full px-6 py-6 md:py-12 z-10 min-h-[60vh]">
        <motion.div
          className="text-center mb-8 md:mb-16 transition-opacity duration-1000 pointer-events-none"
          style={{ opacity: isOpen ? 0 : 1 }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isOpen ? 0 : 1, y: 0 }}
        >
          <h2 className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400 mb-2 drop-shadow-md">
            {theme.giftTitle}
          </h2>
          <p className="text-gray-300 text-sm md:text-base">
            {theme.giftSubtitle}
          </p>
        </motion.div>

        {/* Gift Box Container */}
        <motion.div
          className="relative flex flex-col items-center mt-8 md:mt-12 scale-90 md:scale-100"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={!isOpen ? { 
            opacity: 1, 
            scale: 1,
            rotate: [0, -3, 3, -3, 3, 0]
          } : { opacity: 1, scale: 1 }}
          transition={!isOpen ? { 
            rotate: { duration: 0.5, repeat: Infinity, repeatDelay: 2.2 },
            opacity: { duration: 1 },
            scale: { type: "spring", bounce: 0.5, duration: 1 }
          } : { type: "spring", bounce: 0.5, duration: 1 }}
        >
          {/* Box Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative">
            {/* Sparkles when open */}
            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-20 left-1/2 -translate-x-1/2 w-full flex justify-center z-0"
                >
                  <div className="w-32 h-32 bg-yellow-200/40 blur-[40px] rounded-full mix-blend-screen animate-pulse" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Surprise Message */}
            <AnimatePresence>
              {showMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: -65, scale: 1 }}
                  transition={{ duration: 1, type: "spring" }}
                  className="absolute -top-32 left-1/2 -translate-x-1/2 w-max max-w-[90vw] text-center z-40 pointer-events-none bg-black/75 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.85)]"
                >
                  <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-t from-yellow-200 via-yellow-100 to-white drop-shadow-lg leading-relaxed">
                    {config.giftBoxMessage || "Wishing you endless joy & health!"}
                  </h3>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lid (Draggable) */}
            <motion.div
              drag={!isOpen ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={handleDragEnd}
              onClick={handleOpen}
              animate={isOpen ? { y: -260, opacity: 0, rotate: -15, scale: 1.15 } : { y: 0 }}
              transition={isOpen ? { duration: 0.7, ease: "easeOut" } : { type: "spring", bounce: 0.5 }}
              whileHover={!isOpen ? { scale: 1.03, rotate: 1 } : {}}
              whileTap={!isOpen ? { scale: 0.98 } : {}}
            >
              {renderLid()}
            </motion.div>

            {/* Box Base */}
            {renderBase()}
          </div>
        </motion.div>
      </section>
    </>
  );
}
