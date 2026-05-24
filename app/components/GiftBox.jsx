// app/components/GiftBox.jsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { playPartyPopperSound } from "../utils/audioFX";
import FireworksFinale from "./FireworksFinale";
import { useConfig } from "../context/ConfigContext";

export default function GiftBox({ onOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const config = useConfig();

  const handleDragEnd = (event, info) => {
    // Open if dragged upwards or significantly to the side
    if (info.offset.y < -50 || Math.abs(info.offset.x) > 100) {
      handleOpen();
    }
  };

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    playPartyPopperSound();

    // Huge celebration explosion when opened
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
    // onOpen will be called by FireworksFinale's onComplete callback
  };

  return (
    <>
      {/* Fireworks Finale */}
      <AnimatePresence>
        {showFireworks && (
          <FireworksFinale onComplete={() => { setShowFireworks(false); onOpen && onOpen(); }} />
        )}
      </AnimatePresence>

      <section className="relative flex flex-col items-center justify-center w-full px-6 py-6 md:py-12 z-10 min-h-[60vh]">
      <motion.div
        className="text-center mb-8 md:mb-16 transition-opacity duration-1000"
        style={{ opacity: isOpen ? 0 : 1 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: isOpen ? 0 : 1, y: 0 }}
      >
        <h2 className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400 mb-2">
          Almost There!
        </h2>
        <p className="text-gray-300 text-sm md:text-base">
          Swipe the lid upwards to open your present
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
          rotate: { duration: 0.5, repeat: Infinity, repeatDelay: 2 },
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
                animate={{ opacity: 1, y: -60, scale: 1 }}
                transition={{ duration: 1, type: "spring" }}
                className="absolute -top-32 left-1/2 -translate-x-1/2 w-max max-w-[90vw] text-center z-40 pointer-events-none bg-black/60 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.8)]"
              >
                <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-t from-yellow-200 to-white drop-shadow-lg">
                  {config.giftBoxMessage || "Wishing you endless joy & health!"}
                </h3>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lid (Draggable) */}
          <motion.div
            drag={!isOpen ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            onClick={handleOpen}
            animate={isOpen ? { y: -250, opacity: 0, rotate: -15, scale: 1.2 } : { y: 0 }}
            transition={isOpen ? { duration: 0.6, ease: "easeOut" } : { type: "spring", bounce: 0.6 }}
            whileHover={!isOpen ? { scale: 1.02, rotate: 1 } : {}}
            whileTap={!isOpen ? { scale: 0.98 } : {}}
            className="relative w-56 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-[0_10px_20px_rgba(0,0,0,0.4)] z-20 cursor-grab active:cursor-grabbing border-b-4 border-indigo-700 mx-auto"
            style={{ x: 0 }}
          >
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
          </motion.div>

          {/* Box Base */}
          <div className="relative w-52 h-40 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-b-xl shadow-2xl mx-auto -mt-2 z-10 overflow-hidden border-t-8 border-indigo-800/50">
             {/* Vertical Ribbon */}
             <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-6 bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-inner" />
             {/* Inside shadow/depth when open */}
             <div className={`absolute top-0 left-0 w-full h-8 bg-black/40 transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
          </div>
        </div>

      </motion.div>
    </section>
    </>
  );
}
