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

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 z-10 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24 space-y-4">
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
            Design, personalize, and share gorgeous, immersive interactive surprise cards for your loved ones. Choose an occasion below to start.
          </motion.p>
        </div>

        {/* Portal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          
          {/* Left Column: Creator Templates (Spans 2 columns on desktop) */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <Gift size={18} className="text-pink-400" /> Craft a New Occasion Surprise Card
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {OCCASIONS.map((occ, idx) => (
                <motion.div
                  key={occ.id}
                  onClick={() => router.push(`/wish/create?occasion=${occ.id}`)}
                  whileHover={{ scale: 1.025, y: -2 }}
                  whileTap={{ scale: 0.985 }}
                  className="relative group rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md cursor-pointer transition-all duration-300 hover:border-white/20"
                >
                  {/* Subtle Border Glow */}
                  <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-md pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }} />
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                      {occ.emoji}
                    </div>
                    <h3 className="font-bold text-white text-lg group-hover:text-pink-400 transition-colors">
                      {occ.name}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-xs md:text-sm font-light leading-relaxed">
                    {occ.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Code Gate */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <Key size={18} className="text-purple-400" /> Enter Existing Card Code
            </h2>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md"
            >
              <p className="text-xs text-gray-400 leading-relaxed mb-6 font-light">
                Have a special link code or password? Enter it here to open the surprise experience or manage the configuration.
              </p>

              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setError(""); }}
                    placeholder="Enter Card Code (e.g. mom-70)"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-all text-sm font-semibold tracking-wide text-center"
                  />
                  {error && (
                    <p className="text-red-400 text-[10px] text-center mt-1.5 flex items-center gap-1 justify-center">
                      <ShieldAlert size={10} /> {error}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleOpen("view")}
                    className="flex-1 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 active:scale-95 transition-all text-white shadow-md"
                  >
                    View Card
                  </button>
                  <button
                    onClick={() => handleOpen("edit")}
                    className="flex-1 py-3 rounded-2xl font-bold text-sm bg-white/5 hover:bg-white/10 active:scale-95 transition-all border border-white/10 hover:border-white/20 text-gray-300"
                  >
                    Edit Card
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-black/20 py-6 text-center text-xs text-gray-500 z-10 font-light">
        <p>© 2026 Celebration Craft. Handcrafted with love.</p>
      </footer>
    </div>
  );
}
