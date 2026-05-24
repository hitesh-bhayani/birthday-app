"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Star, ChevronRight, Volume2, VolumeX, Music, ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";

import IntroCard from "./components/IntroCard";
import BalloonGame from "./components/BalloonGame";
import BirthdayCake from "./components/BirthdayCake";
import GiftBox from "./components/GiftBox";
import Gallery from "./components/Gallery";
import StarField from "./components/StarField";
import { useConfig } from "./context/ConfigContext";

export default function Home() {
  const [step, setStep] = useState("gateway");
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef(null);
  const config = useConfig();

  useEffect(() => {
    setMounted(true);
    // Slight confetti pop on load to make it feel celebratory
    const timer = setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#a855f7', '#ec4899', '#3b82f6', '#facc15']
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Safely manage audio playback to prevent AbortError in StrictMode
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Audio auto-play prevented or interrupted:", error);
            setIsPlaying(false);
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const toggleMusic = (e) => {
    e.stopPropagation();
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    setHasInteracted(true);
    if (typeof window !== "undefined") {
      window.__isMuted = !newIsPlaying;
    }
  };

  const handleGlobalClick = () => {
    if (!hasInteracted && step !== "gateway") {
      setIsPlaying(true);
      setHasInteracted(true);
      if (typeof window !== "undefined") window.__isMuted = false;
    }
  };

  const handleGatewayUnlock = () => {
    setIsPlaying(true);
    setHasInteracted(true);
    if (typeof window !== "undefined") window.__isMuted = false;
    setStep("landing");
  };

  const handleEnter = (e) => {
     e.stopPropagation();
     // Start music if they haven't interacted yet
     if (!hasInteracted) {
       setIsPlaying(true);
       setHasInteracted(true);
       if (typeof window !== "undefined") window.__isMuted = false;
     }

     // Trigger celebration confetti
     confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.8 },
      colors: ['#a855f7', '#ec4899', '#3b82f6', '#facc15']
    });
    
    setTimeout(() => {
       setStep("intro");
    }, 1000);
  };

  const handleBack = (e) => {
    e.stopPropagation();
    if (step === "intro") setStep("landing");
    else if (step === "game") setStep("intro");
    else if (step === "cake") setStep("game");
    else if (step === "gift") setStep("cake");
    else if (step === "gallery") setStep("gift");
  };

  // Skip rendering if not mounted to avoid hydration mismatch
  if (!mounted) return null;

  return (
    <main 
      onClick={handleGlobalClick}
      className={`relative flex flex-col items-center justify-center overflow-x-hidden bg-[#0a0a0a] text-white font-sans ${step === "gallery" ? "min-h-[100dvh] overflow-y-auto" : "h-[100dvh] overflow-hidden"}`}
    >
      
      {/* Magical Star Field Background */}
      <StarField />

      {/* Invisible Native Audio Player */}
      <audio 
        ref={audioRef}
        src={config.musicPath || "/birthday-music.mp3"}
        loop
      />

      {/* Floating Back Button */}
      <AnimatePresence>
        {step !== "landing" && step !== "gateway" && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.5 }}
            onClick={handleBack}
            className="fixed top-6 left-6 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-3 px-4 text-sm font-medium backdrop-blur-md transition-all hover:bg-white/10 hover:text-white text-gray-300 no-print cursor-pointer"
          >
            <ArrowLeft size={20} />
            <span className="hidden md:inline">Back</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Music Controls */}
      <AnimatePresence>
        {step !== "gateway" && (
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 1 }}
            onClick={toggleMusic}
            className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-3 px-4 text-sm font-medium backdrop-blur-md transition-all hover:bg-white/10 no-print"
          >
            {isPlaying ? (
              <>
                <Volume2 className="text-pink-400" size={20} />
                <span className="hidden md:inline">Playing</span>
              </>
            ) : (
              <>
                <VolumeX className="text-gray-400" size={20} />
                <span className="hidden md:inline text-gray-400">Music Off</span>
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Background glowing orbs - Shared across steps */}
      <div className="absolute top-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-pink-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] h-[20rem] w-[20rem] rounded-full bg-blue-600/20 blur-[100px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === "gateway" && (
          <motion.div
            key="gateway"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="w-full flex flex-col items-center justify-center min-h-[100dvh]"
          >
            <div className="text-center mb-16 space-y-6">
              <motion.h1 
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-4xl md:text-5xl font-light tracking-[0.25em] text-pink-200"
              >
                FOR YOU
              </motion.h1>
              <p className="text-gray-400 font-light text-sm tracking-widest uppercase">
                A special surprise awaits
              </p>
            </div>

            {/* Slider track */}
            <div className="relative w-64 md:w-72 h-16 bg-white/5 border border-white/10 rounded-full flex items-center px-2 overflow-hidden backdrop-blur-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
              <span className="absolute w-full text-center text-gray-400 font-medium text-xs md:text-sm tracking-[0.2em] pointer-events-none z-0">
                SLIDE TO OPEN <span className="opacity-50">{">>>"}</span>
              </span>
              
              {/* Draggable thumb */}
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 190 }}
                dragElastic={0.05}
                onDragEnd={(e, info) => {
                  if (info.offset.x > 30) { // Highly sensitive!
                    handleGatewayUnlock();
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-[0_0_20px_rgba(236,72,153,0.8)] flex items-center justify-center cursor-grab active:cursor-grabbing"
              >
                <ChevronRight className="text-white w-6 h-6" />
              </motion.div>
            </div>
          </motion.div>
        )}

        {step === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8 }}
            className="w-full flex flex-col items-center justify-center"
          >
            {/* Floating decorative icons */}
            <motion.div 
              animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }} 
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[15%] left-[10%] md:left-[20%] text-pink-400/40 pointer-events-none"
            >
              <Heart size={32} />
            </motion.div>
            <motion.div 
              animate={{ y: [0, 20, 0], rotate: [0, -15, 15, 0] }} 
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[20%] left-[5%] md:left-[15%] text-purple-400/40 pointer-events-none"
            >
              <Music size={40} />
            </motion.div>
            <motion.div 
              animate={{ y: [0, -15, 0], scale: [1, 1.2, 1] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-[25%] right-[10%] md:right-[20%] text-yellow-400/40 pointer-events-none"
            >
              <Star size={24} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative z-10 flex flex-col items-center w-full max-w-2xl px-4 py-6 md:px-6 md:py-12"
            >
              {/* The Image Container */}
              <motion.div
                whileHover={{ scale: 1.02, rotate: -1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative group mb-6 md:mb-10"
              >
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-70 blur-md transition duration-1000 group-hover:opacity-100 group-hover:duration-200" />
                <div className="relative rounded-xl border border-white/10 bg-black/50 p-2 shadow-2xl backdrop-blur-sm">
                  <div className="overflow-hidden rounded-lg">
                    <Image
                      src={config.heroImagePath || "/original_images/PREM2902.JPG"}
                      alt="Birthday Celebration"
                      width={320}
                      height={320}
                      className="w-48 h-48 md:w-80 md:h-80 aspect-square object-cover transition-transform duration-700 group-hover:scale-105"
                      priority
                    />
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 pointer-events-none" />
                </div>
              </motion.div>

              {/* Typography Section */}
              <div className="text-center mb-6 md:mb-10 space-y-2 md:space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <span className="inline-block rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-xs md:text-sm font-medium text-pink-300 backdrop-blur-sm mb-2 md:mb-4">
                    ✨ A Special Celebration
                  </span>
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-4xl md:text-6xl font-extrabold tracking-tight"
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 drop-shadow-sm">
                    {config.landingTitle || "Happy Birthday"}
                  </span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="text-base md:text-xl text-gray-400 max-w-lg mx-auto font-light leading-relaxed px-4"
                >
                  {config.landingSubtitle || "Get ready to experience a personalized journey full of memories, joy, and a few surprises."}
                </motion.p>
              </div>

              {/* The Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEnter}
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full p-4 px-8 font-semibold text-white transition-transform active:scale-95 shadow-[0_0_30px_rgba(236,72,153,0.3)]"
                >
                  <span className="absolute inset-0 h-full w-full bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600" />
                  <span className="absolute bottom-0 right-0 block w-64 h-64 mb-32 mr-4 transition duration-500 origin-bottom-left transform rotate-45 translate-x-24 bg-pink-500 rounded-full opacity-30 group-hover:rotate-90 ease"></span>
                  
                  <span className="relative flex items-center gap-2 text-base md:text-lg z-10 tracking-wide font-semibold">
                    <span className="animate-[shimmer_3s_infinite] bg-[linear-gradient(110deg,#ffffff,45%,#ffd1e8,55%,#ffffff)] bg-[length:200%_100%] bg-clip-text text-transparent drop-shadow-md">
                      Begin the Journey
                    </span>
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* --- OTHER SCREENS --- */}
        {step === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <IntroCard onStart={() => setStep("game")} />
          </motion.div>
        )}
        {step === "game" && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BalloonGame onComplete={() => setStep("cake")} />
          </motion.div>
        )}
        {step === "cake" && (
          <motion.div key="cake" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BirthdayCake onBlow={() => setStep("gift")} />
          </motion.div>
        )}
        {step === "gift" && (
          <motion.div key="gift" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GiftBox onOpen={() => setStep("gallery")} />
          </motion.div>
        )}
        {step === "gallery" && (
          <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Gallery />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
