// app/components/Gallery.jsx
"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { ChevronRight, ChevronLeft, X, Play, Pause, Maximize, Share2 } from "lucide-react";
import { playPartyPopperSound } from "../utils/audioFX";
import { useConfig } from "../context/ConfigContext";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const config = useConfig();

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleShare = async () => {
    const shareTitle = config?.galleryTitle || 'Celebration Cards';
    const shareText = `Check out this beautiful interactive ${config?.occasion || 'birthday'} celebration!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback for desktop: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Massive celebration confetti on load
  useEffect(() => {
    playPartyPopperSound();
    const duration = 5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 8,
        angle: 270,
        spread: 120,
        origin: { x: Math.random(), y: -0.1 },
        colors: ['#a855f7', '#ec4899', '#3b82f6', '#facc15'],
        gravity: 0.8,
        scalar: 0.8
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  // Load image filenames from the public/uploads/[cardId]/images folder via API
  useEffect(() => {
    if (!config) return;
    const fetchImages = async () => {
      try {
        const url = config.cardId ? `/api/images?cardId=${config.cardId}` : '/api/images';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch images');
        const data = await res.json();
        setImages(data);
      } catch (error) {
        console.error('Error loading images:', error);
        setImages([]);
      }
    };
    fetchImages();
  }, [config]);

  // Auto-play slideshow
  useEffect(() => {
    let timer;
    if (isSlideshow && isPlaying && images.length > 0) {
      timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 3500);
    }
    return () => clearTimeout(timer);
  }, [isSlideshow, currentIndex, images.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="relative flex flex-col items-center justify-start w-full px-4 py-16 z-10 min-h-screen">
      
      {/* Full-screen Slideshow */}
      <AnimatePresence>
        {isSlideshow && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsSlideshow(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors bg-white/10 p-2 rounded-full backdrop-blur-md z-50"
            >
              <X size={28} />
            </button>

            {/* Image Viewer */}
            <div className="relative w-full max-w-5xl h-[75vh] flex items-center justify-center px-4 md:px-16">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={images[currentIndex]}
                  initial={{ opacity: 0, x: 100, scale: 0.9, rotate: 3 }}
                  animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, x: -100, scale: 0.9, rotate: -3 }}
                  transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-[0_0_50px_rgba(255,255,255,0.15)] border border-white/10"
                  alt={`Slideshow ${currentIndex}`}
                />
              </AnimatePresence>
            </div>

            {/* Unified Control Bar */}
            <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 border border-white/10 px-6 py-3 rounded-full backdrop-blur-xl">
              <button 
                onClick={prevSlide}
                className="text-gray-300 hover:text-white transition-all hover:scale-110"
              >
                <ChevronLeft size={28} />
              </button>

              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white bg-pink-500 hover:bg-pink-400 p-2 rounded-full transition-all hover:scale-110 shadow-[0_0_15px_rgba(236,72,153,0.5)]"
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
              </button>

              <button 
                onClick={nextSlide}
                className="text-gray-300 hover:text-white transition-all hover:scale-110"
              >
                <ChevronRight size={28} />
              </button>

              <div className="w-[1px] h-6 bg-white/20 mx-2" />

              <div className="text-gray-300 font-medium text-sm w-12 text-center">
                {currentIndex + 1} / {images.length}
              </div>

              <div className="w-[1px] h-6 bg-white/20 mx-2" />

              <button 
                onClick={toggleFullscreen}
                className="text-gray-300 hover:text-white transition-all hover:scale-110"
                title="Fullscreen"
              >
                <Maximize size={22} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="text-center mb-16 max-w-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="inline-block rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-sm font-medium text-pink-300 backdrop-blur-sm mb-4">
          ✨ The Best is Yet to Come
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-indigo-400 mb-4 tracking-tight">
          {config.galleryTitle || "Happy 70th Birthday!"}
        </h2>
        <p className="text-lg text-gray-300 font-light leading-relaxed">
          {config.gallerySubtitle || "A lifetime of memories, and so many more to make. Thank you for being you."}
        </p>
      </motion.div>

      {/* Start Slideshow Button (Moved to top) */}
      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mb-12"
        >
          <motion.button
            animate={{ 
              scale: [1, 1.05, 1],
              boxShadow: [
                "0px 0px 20px rgba(236,72,153,0.4)",
                "0px 0px 40px rgba(168,85,247,0.6)",
                "0px 0px 20px rgba(236,72,153,0.4)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            onClick={() => {
              setCurrentIndex(0);
              setIsSlideshow(true);
            }}
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full p-4 px-10 font-bold text-white shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all active:scale-95 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:via-purple-400 hover:to-indigo-400"
          >
            <span className="relative z-10 flex items-center gap-3 text-lg tracking-wide">
              <Play className="w-5 h-5 fill-white" /> Start Slideshow
            </span>
          </motion.button>
        </motion.div>
      )}

      {/* Floating Polaroid Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10 max-w-7xl mx-auto w-full mb-10">
        {images.length > 0
          ? images.map((src, i) => {
              // Calculate random rotation between -6 and 6 degrees for the polaroid effect
              const rotation = (i % 2 === 0 ? 1 : -1) * (2 + (i % 4));
              const delay = i * 0.1;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, delay, type: "spring", bounce: 0.4 }}
                  whileHover={{ 
                    scale: 1.08, 
                    rotate: 0, 
                    zIndex: 40,
                    transition: { duration: 0.3 }
                  }}
                  className="relative group bg-white p-3 pb-12 rounded-sm shadow-xl"
                  style={{ rotate: `${rotation}deg` }}
                  onClick={() => {
                    setCurrentIndex(i);
                    setIsSlideshow(true);
                  }}
                >
                  <div className="relative w-full aspect-square overflow-hidden bg-gray-200 cursor-pointer">
                    <img 
                      src={src} 
                      alt={`Memory ${i}`} 
                      className="w-full h-full object-cover grayscale-[30%] sepia-[10%] group-hover:grayscale-0 group-hover:sepia-0 transition-all duration-500"
                      loading="lazy"
                    />
                  </div>
                  {/* Tape piece effect */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-white/40 backdrop-blur-md rotate-[-2deg] shadow-sm border border-white/20 opacity-70" />
                </motion.div>
              );
            })
          : Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1, type: "spring" }}
                className="relative bg-white/10 p-3 pb-12 rounded-sm shadow-xl border border-white/20 animate-pulse"
                style={{ rotate: `${(i % 2 === 0 ? 1 : -1) * (2 + (i % 4))}deg` }}
              >
                <div className="w-full aspect-square bg-gray-700/50 rounded-sm" />
              </motion.div>
            ))}
      </div>

      {/* Share Button (Marketing/Virality) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="flex flex-col md:flex-row items-center gap-4 mb-20"
      >
        <button
          onClick={handleShare}
          className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full p-4 px-8 font-semibold text-pink-300 border border-pink-500/30 bg-pink-500/10 transition-all hover:bg-pink-500 hover:text-white backdrop-blur-md"
        >
          <Share2 className="w-5 h-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          Share the Celebration
        </button>

        <button
          onClick={() => window.location.reload()}
          className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-4 px-8 font-semibold text-white transition-all bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-md active:scale-95"
        >
          <span className="relative z-10 flex items-center gap-2 tracking-wide font-semibold">
            <span className="animate-[shimmer_3s_infinite] bg-[linear-gradient(110deg,#ffffff,45%,#ffd1e8,55%,#ffffff)] bg-[length:200%_100%] bg-clip-text text-transparent">
              Replay the Journey
            </span>
          </span>
        </button>
      </motion.div>
    </section>
  );
}
