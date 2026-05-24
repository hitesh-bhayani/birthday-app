// app/wish/[id]/page.js
"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, Star, ChevronRight, Volume2, VolumeX, Music, ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";

import IntroCard from "../../components/IntroCard";
import BalloonGame from "../../components/BalloonGame";
import BirthdayCake from "../../components/BirthdayCake";
import GiftBox from "../../components/GiftBox";
import Gallery from "../../components/Gallery";
import StarField from "../../components/StarField";
import { useConfig } from "../../context/ConfigContext";
import { getTheme } from "../../utils/themes";

export default function DynamicWishPage() {
  const [step, setStep] = useState("gateway");
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef(null);
  const config = useConfig();
  const theme = getTheme(config?.occasion);

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

  if (!mounted) return null;

  return (
    <main 
      onClick={handleGlobalClick}
      className={`relative flex flex-col items-center justify-center overflow-x-hidden bg-gradient-to-b ${theme.gradient} text-white font-sans ${step === "gallery" ? "min-h-[100dvh] overflow-y-auto" : "h-[100dvh] overflow-hidden"}`}
    >
      
      {/* Magical Star Field Background */}
      <StarField />

      {/* Invisible Native Audio Player */}
      <audio 
        ref={audioRef}
        src={config.musicPath || "/birthday-music.mp3"}
        loop
      />

      {/* Floating Music Button (Shows up on all screens except gateway) */}
      <AnimatePresence>
        {step !== "gateway" && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={toggleMusic}
            className="fixed top-6 right-6 z-50 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 active:scale-95 transition-all text-white flex items-center justify-center no-print"
          >
            {isPlaying ? (
              <div className="relative flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-pink-400" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-500 animate-ping" />
              </div>
            ) : (
              <VolumeX className="w-5 h-5 text-gray-400" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating Back Button */}
      <AnimatePresence>
        {step !== "gateway" && step !== "landing" && step !== "gallery" && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={handleBack}
            className="fixed top-6 left-6 z-50 flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 text-gray-300 hover:text-white font-medium text-xs md:text-sm active:scale-95 transition-all no-print"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </motion.button>
        )}
      </AnimatePresence>

      {/* STAGE MACHINE */}
      <AnimatePresence mode="wait">
        
        {/* GATEWAY SCREEN */}
        {step === "gateway" && (
          <motion.div
            key="gateway"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 w-full h-full flex flex-col items-center justify-center px-4"
          >
            <div className="text-center max-w-md space-y-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-2xl backdrop-blur-md mb-4"
              >
                <Heart className="w-10 h-10 md:w-12 md:h-12 text-pink-500 fill-pink-500 animate-pulse" />
              </motion.div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                A Surprise Awaits
              </h1>
              <p className="text-sm md:text-base text-gray-400 font-light leading-relaxed">
                Someone special has handcrafted a magical digital journey just for you. Unlock below.
              </p>

              {/* Slider Unlock Mechanism */}
              <div className="pt-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative w-72 md:w-80 h-16 bg-white/5 border border-white/10 rounded-full p-1.5 flex items-center justify-between shadow-inner backdrop-blur-md mx-auto"
                >
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs md:text-sm font-semibold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 animate-pulse">
                      SLIDE TO OPEN
                    </span>
                  </div>
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 210 }}
                    dragElastic={0.1}
                    dragMomentum={false}
                    onDragEnd={(event, info) => {
                      if (info.offset.x > 170) {
                        handleGatewayUnlock();
                      }
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-[0_0_20px_rgba(236,72,153,0.4)] flex items-center justify-center cursor-grab active:cursor-grabbing text-white"
                  >
                    <ChevronRight className="w-6 h-6 animate-pulse" />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* LANDING / GREETING SCREEN */}
        {step === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 w-full h-full flex flex-col items-center justify-center"
          >
            <div className="absolute top-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-pink-600/10 blur-[120px] pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative z-10 flex flex-col items-center w-full max-w-2xl px-4 py-6 md:px-6 md:py-12"
            >
              {/* Recipient Image */}
              {config.heroImagePath && (
                <motion.div
                  whileHover={{ scale: 1.02, rotate: -1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative group mb-6 md:mb-10"
                >
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-70 blur-md transition duration-1000 group-hover:opacity-100 group-hover:duration-200" />
                  <div className="relative rounded-xl border border-white/10 bg-black/50 p-2 shadow-2xl backdrop-blur-sm">
                    <div className="overflow-hidden rounded-lg">
                      <Image
                        src={config.heroImagePath}
                        alt={config.recipientName || "Surprise"}
                        width={320}
                        height={320}
                        className="w-48 h-48 md:w-80 md:h-80 aspect-square object-cover transition-transform duration-700 group-hover:scale-105"
                        priority
                      />
                    </div>
                  </div>
                </motion.div>
              )}

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
                    {config.landingTitle || "For Someone Special"}
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

              {/* Begin Journey CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="w-full flex justify-center"
              >
                <button
                  onClick={handleEnter}
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-4 px-8 font-semibold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all hover:shadow-[0_0_40px_rgba(236,72,153,0.5)] active:scale-95"
                >
                  {/* CSS Shimmer Effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  <span className="relative z-10 flex items-center gap-2">
                    Begin the Journey <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* INTRO CARD / WISH CARD */}
        {step === "intro" && (
          <motion.div key="intro" className="w-full" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <IntroCard onStart={() => setStep("game")} />
          </motion.div>
        )}

        {/* STAGE 2 GAME */}
        {step === "game" && (
          <motion.div key="game" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BalloonGame onComplete={() => setStep("cake")} />
          </motion.div>
        )}

        {/* STAGE 3 CEREMONY (CAKE / LANTERN) */}
        {step === "cake" && (
          <motion.div key="cake" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <BirthdayCake onBlow={() => setStep("gift")} />
          </motion.div>
        )}

        {/* STAGE 4 SURPRISE PRESENT */}
        {step === "gift" && (
          <motion.div key="gift" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GiftBox onOpen={() => setStep("gallery")} />
          </motion.div>
        )}

        {/* STAGE 5 POLAROID SLIDESHOW GALLERY */}
        {step === "gallery" && (
          <motion.div key="gallery" className="w-full" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <Gallery />
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}
