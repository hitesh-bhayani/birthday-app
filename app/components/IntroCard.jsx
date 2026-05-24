// app/components/IntroCard.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Star, Quote, Play, Pause } from "lucide-react";
import { useConfig } from "../context/ConfigContext";

export default function IntroCard({ onStart }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState(null);
  const voiceAudioRef = useRef(null);
  const config = useConfig();

  // Check if a voice note recording exists
  useEffect(() => {
    fetch('/api/voice-note')
      .then(r => r.json())
      .then(data => { if (data.exists) setVoiceNoteUrl(data.url); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleOrientation = (e) => {
      if (!e.beta || !e.gamma) return;
      // Clamp values to prevent extreme flipping
      let y = e.beta - 45; // Assume 45deg is normal holding position
      let x = e.gamma;
      y = Math.min(Math.max(y, -15), 15);
      x = Math.min(Math.max(x, -15), 15);
      // Map to subtle rotations
      setTilt({ x: x * 0.5, y: -y * 0.5 });
    };

    // Request permission for iOS 13+ devices
    const requestPermission = () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
              window.addEventListener('deviceorientation', handleOrientation);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };
    
    requestPermission();

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const toggleVoice = () => {
    if (!voiceAudioRef.current) return;
    if (isVoicePlaying) {
      voiceAudioRef.current.pause();
      setIsVoicePlaying(false);
    } else {
      voiceAudioRef.current.currentTime = 0;
      voiceAudioRef.current.play().catch(() => {});
      setIsVoicePlaying(true);
    }
  };

  // When voice ends
  const handleVoiceEnd = () => setIsVoicePlaying(false);

  // Staggered text animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section className="relative flex flex-col items-center justify-center w-full px-4 pt-16 md:pt-20 pb-10 z-10 min-h-[100dvh] perspective-1000">
      {/* Outer wrapper for continuous floating animation */}
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative max-w-2xl w-full"
      >
        {/* Magical Rotating Glow Border */}
        <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 opacity-30 blur-lg no-print animate-spin-slow pointer-events-none" style={{ animationDuration: '8s' }} />

        <motion.div
          id="printable-card"
          className="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[2rem] p-6 md:p-16 w-full text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
          animate={{ opacity: 1, scale: 1, rotateX: tilt.y, rotateY: tilt.x }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
        >
          {/* Decorative floating shapes inside the card */}
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-8 left-8 text-yellow-300/30 no-print">
            <Star size={24} fill="currentColor" />
          </motion.div>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-12 right-6 md:right-10 text-pink-300/30 no-print">
            <Star size={32} fill="currentColor" />
          </motion.div>
          <Quote className="absolute top-10 left-10 md:left-20 text-white/5 rotate-180 w-12 h-12 md:w-16 md:h-16 no-print pointer-events-none" />

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            className="relative z-10"
          >
            <h1 className="text-2xl md:text-5xl font-extrabold mb-4 md:mb-10 tracking-tight print-text-accent">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-indigo-400 drop-shadow-lg print-text-accent">
                {config.wishCardTitle || "Happy 70th Birthday!"}
              </span>
            </h1>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mb-4 md:mb-8 space-y-3 md:space-y-6 relative z-10"
          >
            <motion.p variants={itemVariants} className="text-xs md:text-lg text-gray-200 font-light leading-relaxed print-text-dark tracking-wide">
              {config.wishCardBody1 || "Seven decades of incredible stories..."}
            </motion.p>
            <motion.p variants={itemVariants} className="text-xs md:text-lg text-gray-200 font-light leading-relaxed print-text-dark tracking-wide">
              {config.wishCardBody2 || "You have built a legacy of love..."}
            </motion.p>
            <motion.div variants={itemVariants} className="mt-2 md:mt-6">
              <div className="w-16 md:w-24 h-[1px] bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto mb-3 opacity-50 no-print" />
              <p className="text-xs md:text-base text-pink-300 font-serif italic mb-3">
                {config.wishCardClosing || "Here's to many more sweet memories to come."}
              </p>
              {/* Name chips */}
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">With all our love</p>
              <div className="flex flex-wrap justify-center gap-2">
                {(config.signers || [
                  { name: "Jhankar", role: "Daughter" },
                  { name: "Hitesh", role: "Son-in-law" },
                  { name: "Dhruv", role: "Grandson" },
                ]).map(({ name, role }, idx) => {
                  const colors = [
                    "from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-300",
                    "from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-300",
                    "from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-300",
                  ];
                  const color = colors[idx % colors.length];
                  return (
                    <div key={name} className={`flex flex-col items-center px-4 py-2 rounded-2xl border bg-gradient-to-br ${color} backdrop-blur-sm`}>
                      <span className="font-bold text-sm md:text-base tracking-wide">{name}</span>
                      <span className="text-[10px] md:text-xs opacity-60 font-light">{role}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>

          {/* Voice Note Player — only shown if a recording is in /public/voice-notes/ */}
          {voiceNoteUrl && (
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.8 } } }}
            initial="hidden"
            animate="show"
            transition={{ delay: 1.2 }}
            className="relative z-10 mb-6 no-print"
          >
            {/* Hidden audio element - src dynamically set from /public/voice-notes/ */}
            <audio ref={voiceAudioRef} src={voiceNoteUrl || ''} onEnded={handleVoiceEnd} />

            <div className="flex flex-col items-center gap-3">
              <div className="w-16 md:w-24 h-[1px] bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto opacity-40" />
              <p className="text-xs text-gray-400 tracking-widest uppercase">A message for you</p>
              <button
                onClick={toggleVoice}
                className="group relative flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-3 hover:bg-white/10 transition-all backdrop-blur-md"
              >
                {/* Pulsing glow when playing */}
                {isVoicePlaying && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-pink-500/20 pointer-events-none" />
                )}
                <span className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  isVoicePlaying
                    ? 'bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.7)]'
                    : 'bg-white/10 group-hover:bg-white/20'
                } transition-all`}>
                  {isVoicePlaying
                    ? <Pause size={14} fill="white" className="text-white" />
                    : <Play size={14} fill="white" className="text-white ml-0.5" />
                  }
                </span>
                {/* Animated waveform bars */}
                <span className="flex items-center gap-[3px] h-5">
                  {[1, 1.5, 0.8, 1.8, 1.2, 1.6, 0.7, 1.4, 1, 1.7].map((h, i) => (
                    <span
                      key={i}
                      className={`w-[3px] rounded-full transition-all ${
                        isVoicePlaying ? 'bg-pink-400' : 'bg-white/40'
                      }`}
                      style={{
                        height: isVoicePlaying ? `${h * 14}px` : '6px',
                        animationDelay: `${i * 0.1}s`,
                        animation: isVoicePlaying ? `wave ${0.6 + i * 0.07}s ease-in-out infinite alternate` : 'none',
                      }}
                    />
                  ))}
                </span>
                <span className="text-xs text-gray-300 font-medium">
                  {isVoicePlaying ? 'Playing...' : 'Play Voice Note'}
                </span>
              </button>
            </div>
          </motion.div>
          )} {/* end voiceNoteUrl conditional */}
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="flex flex-col items-center justify-center gap-3 relative z-10 no-print"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStart}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-3 md:p-4 px-8 md:px-10 font-bold text-white transition-all bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-400 hover:via-purple-400 hover:to-indigo-400 text-sm md:text-base shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              <span className="relative z-10 flex items-center gap-2 tracking-wide font-semibold">
                <span className="animate-[shimmer_3s_infinite] bg-[linear-gradient(110deg,#ffffff,45%,#ffd1e8,55%,#ffffff)] bg-[length:200%_100%] bg-clip-text text-transparent drop-shadow-md">
                  Unwrap Surprise
                </span>
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
