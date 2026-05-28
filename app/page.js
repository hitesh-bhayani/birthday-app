// app/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Heart, Star, ChevronRight, Gift, Key, ShieldAlert } from "lucide-react";
import StarField from "./components/StarField";

const OCCASIONS = [
  {
    id: "birthday",
    name: "Birthday Surprise",
    desc: "Floating balloons, candles to blow, and custom-wrapped birthday presents.",
    gradient: "from-pink-500 via-purple-500 to-indigo-500",
    glowColor: "rgba(236, 72, 153, 0.4)",
    emoji: "🎂"
  },
  {
    id: "anniversary",
    name: "Anniversary",
    desc: "Rising love hearts, magical sparkler lanterns, and double velvet-ring boxes.",
    gradient: "from-rose-600 via-red-500 to-pink-500",
    glowColor: "rgba(244, 63, 94, 0.4)",
    emoji: "🌹"
  },
  {
    id: "wedding",
    name: "Wedding",
    desc: "Falling white rose petals, sacred wedding candles, and golden treasure chests.",
    gradient: "from-amber-400 via-yellow-500 to-amber-600",
    glowColor: "rgba(234, 179, 8, 0.4)",
    emoji: "🥂"
  },
  {
    id: "engagement",
    name: "Engagement",
    desc: "Golden floating sparkles, romantic sparklers, and sparkling ring boxes.",
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    glowColor: "rgba(245, 158, 11, 0.4)",
    emoji: "💍"
  },
  {
    id: "mother-day",
    name: "Mother's Day",
    desc: "Falling pink cherry blossoms, blooming magical roses, and pastel presents.",
    gradient: "from-pink-400 via-rose-300 to-purple-400",
    glowColor: "rgba(244, 114, 182, 0.4)",
    emoji: "🌸"
  },
  {
    id: "father-day",
    name: "Father's Day",
    desc: "Rising golden stars, beautiful sky lanterns, and dark velvet gift trunks.",
    gradient: "from-blue-500 via-indigo-600 to-cyan-500",
    glowColor: "rgba(59, 130, 246, 0.4)",
    emoji: "👔"
  }
];

export default function PortalHub() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleOpen = (mode) => {
    if (!code) {
      setError("Please enter a valid page code first!");
      return;
    }
    setError("");
    const cleanCode = code.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]/g, "");
    if (mode === "view") {
      router.push(`/wish/${cleanCode}`);
    } else {
      router.push(`/wish/${cleanCode}/edit`);
    }
  };

  return (
    <div className="min-h-screen bg-[#07040d] text-white relative overflow-hidden flex flex-col justify-between">
      {/* Dynamic particles */}
      <StarField />

      {/* Decorative Glow */}
      <div className="absolute top-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-pink-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] left-[50%] -translate-x-1/2 h-[30rem] w-[30rem] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 z-10 w-full flex flex-col items-center">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-xs font-semibold text-pink-300 backdrop-blur-md mb-2"
          >
            <Sparkles size={12} className="animate-spin-slow" /> Custom SURPRISE GREETING PLATFORM
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 drop-shadow-md">
              Celebration Craft
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-gray-400 text-base md:text-xl font-light leading-relaxed px-4"
          >
            Design, personalize, and share gorgeous, immersive interactive surprise cards for your loved ones.
          </motion.p>
        </div>

        {/* Centered Code Entry Gate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="w-full max-w-xl mb-16"
        >
          <div className="relative rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10 backdrop-blur-md shadow-2xl overflow-hidden group">
            {/* Ambient Background Gradient for the card */}
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-pink-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <Key size={22} className="animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  Enter Existing Card Code
                </h2>
                <p className="text-sm text-gray-400 max-w-md font-light leading-relaxed">
                  Enter your unique greeting card code below to unlock your personalized interactive experience, or sign in to edit its contents.
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setError(""); }}
                    placeholder="Enter Card Code (e.g. mom-70)"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-all text-base font-semibold tracking-wide text-center uppercase"
                  />
                  {error && (
                    <p className="text-red-400 text-xs text-center mt-2 flex items-center gap-1 justify-center">
                      <ShieldAlert size={12} /> {error}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={() => handleOpen("view")}
                    className="flex-1 py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 active:scale-95 transition-all text-white shadow-[0_0_20px_rgba(236,72,153,0.3)] flex items-center justify-center gap-2"
                  >
                    <span>View Greeting Card</span>
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={() => handleOpen("edit")}
                    className="flex-1 py-4 rounded-2xl font-bold text-sm bg-white/5 hover:bg-white/10 active:scale-95 transition-all border border-white/10 hover:border-white/20 text-gray-300 flex items-center justify-center gap-2"
                  >
                    <span>Edit / Manage Card</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Soft, Artistic Divider */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex items-center gap-4 w-full max-w-xl mb-16"
        >
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/10 to-white/10" />
          <span className="text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase flex items-center gap-1.5">
            <Sparkles size={12} className="text-pink-500/60" /> or start fresh <Sparkles size={12} className="text-purple-500/60" />
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-white/10 to-white/10" />
        </motion.div>

        {/* Templates Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full space-y-8"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
              <Gift size={24} className="text-pink-400" /> Craft a New Occasion Surprise Card
            </h2>
            <p className="text-gray-400 text-sm max-w-lg mx-auto font-light leading-relaxed">
              Choose one of our premium, handcrafted templates pre-configured with customized assets, physics games, fireworks, and themes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {OCCASIONS.map((occ, idx) => (
              <motion.div
                key={occ.id}
                onClick={() => router.push(`/wish/create?occasion=${occ.id}`)}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="relative group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md cursor-pointer transition-all duration-300 hover:border-white/20 flex flex-col justify-between min-h-[180px] overflow-hidden"
              >
                {/* Custom glowing background behind the template card based on its gradient */}
                <div 
                  className={`absolute -inset-0.5 rounded-3xl bg-gradient-to-br ${occ.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-lg pointer-events-none`} 
                />

                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner group-hover:bg-pink-500/10 group-hover:border-pink-500/30 transition-all duration-300">
                      {occ.emoji}
                    </div>
                    <h3 className="font-bold text-white text-lg group-hover:text-pink-400 transition-colors">
                      {occ.name}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-xs md:text-sm font-light leading-relaxed">
                    {occ.desc}
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs font-semibold text-pink-400 group-hover:text-pink-300 mt-4 relative z-10 transition-colors">
                  <span>Start Crafting</span>
                  <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-black/20 py-6 text-center text-xs text-gray-500 z-10 font-light">
        <p>© 2026 Celebration Craft. Handcrafted with love.</p>
      </footer>
    </div>
  );
}
