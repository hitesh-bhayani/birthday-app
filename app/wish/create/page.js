// app/wish/create/page.js
"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Heart, ChevronRight, ChevronLeft, Save, Plus, X, User, MessageSquare, ShieldAlert } from "lucide-react";
import StarField from "../../components/StarField";

const PRESETS = {
  birthday: {
    recipientName: "Mummy",
    age: 70,
    landingTitle: "Happy Birthday",
    landingSubtitle: "Get ready to experience a personalized journey full of memories, joy, and a few surprises.",
    wishCardTitle: "Happy 70th Birthday!",
    wishCardBody1: "Seven decades of incredible stories, boundless wisdom, and a heart that has touched so many lives. Your presence has always been our greatest comfort.",
    wishCardBody2: "You have built a legacy of love and unwavering kindness. Know that you are deeply cherished — not just for what you have done, but for the beautiful person you are.",
    wishCardClosing: "Here's to many more sweet memories to come.",
    giftBoxMessage: "Wishing you endless joy & health!",
    galleryTitle: "Happy 70th Birthday!",
    gallerySubtitle: "A lifetime of memories, and so many more to make. Thank you for being you.",
  },
  anniversary: {
    recipientName: "Mom & Dad",
    age: 25,
    landingTitle: "Happy Anniversary",
    landingSubtitle: "Welcome to a dynamic memory lane celebrating a love story that inspires all of us.",
    wishCardTitle: "Happy 25th Wedding Anniversary!",
    wishCardBody1: "Decades of beautiful partnership, shared laughter, and a love that grows stronger with every passing year. Your journey together is our greatest treasure.",
    wishCardBody2: "You have built a legacy of warmth, trust, and unwavering mutual support. Thank you for showing us what true love, commitment, and family mean.",
    wishCardClosing: "Here's to celebrating your beautiful union today and always.",
    giftBoxMessage: "Wishing you a lifetime of shared adventures and joy!",
    galleryTitle: "Celebrating Your Journey",
    gallerySubtitle: "A history of love, laughter, and so many wonderful chapters together.",
  },
  wedding: {
    recipientName: "Sarah & David",
    age: 0,
    landingTitle: "Happy Wedding Day",
    landingSubtitle: "Step inside a magical celebration of two hearts becoming one.",
    wishCardTitle: "Congratulations On Your Wedding!",
    wishCardBody1: "Today is the beginning of a beautiful new chapter filled with shared dreams, infinite laughter, and a partnership built to stand the test of time.",
    wishCardBody2: "May your home be filled with peace, your hearts be filled with understanding, and your journey together be richer and sweeter each day.",
    wishCardClosing: "Wishing you both a lifetime of happiness, trust, and love.",
    giftBoxMessage: "May your shared life be full of laughter, growth, and endless love!",
    galleryTitle: "A Lifetime of Love",
    gallerySubtitle: "The beautiful moments of today, and the promise of a wonderful tomorrow.",
  },
  engagement: {
    recipientName: "Alex & Jordan",
    age: 0,
    landingTitle: "Happy Engagement",
    landingSubtitle: "Welcome to a special milestone celebrating the promise of forever.",
    wishCardTitle: "Congratulations on Your Engagement!",
    wishCardBody1: "Two beautiful souls taking a major step towards a lifetime of shared moments, supportive partnerships, and wonderful adventures.",
    wishCardBody2: "May this special time of planning and dreaming be filled with laughter and anticipation. We are so excited to celebrate your beautiful love.",
    wishCardClosing: "Here's to a future full of promise, connection, and joy.",
    giftBoxMessage: "Wishing you beautiful memories as you build your future together!",
    galleryTitle: "The Promise of Forever",
    gallerySubtitle: "Steps along the path to forever. We are so happy for both of you.",
  },
  "mother-day": {
    recipientName: "Mom",
    age: 0,
    landingTitle: "Happy Mother's Day",
    landingSubtitle: "Unlock a custom box of love and memories handcrafted just for the best mother.",
    wishCardTitle: "Happy Mother's Day!",
    wishCardBody1: "For the endless warmth, the infinite support, and the love that has guided us through every single season. You are the heart and soul of our family.",
    wishCardBody2: "Your strength inspires us, your kindness comforts us, and your presence is our favorite place to be. Thank you for everything that you do.",
    wishCardClosing: "Wishing you a beautiful day full of the peace and joy you deserve.",
    giftBoxMessage: "To the most wonderful mom — thank you for being our guide and anchor!",
    galleryTitle: "Celebrating You, Mom",
    gallerySubtitle: "A small collection of beautiful chapters. Thank you for being you.",
  },
  "father-day": {
    recipientName: "Dad",
    age: 0,
    landingTitle: "Happy Father's Day",
    landingSubtitle: "Step inside a handcrafted celebration made just for the best dad.",
    wishCardTitle: "Happy Father's Day!",
    wishCardBody1: "For being our solid anchor, our wisest guide, and the strength we could always rely on. Your quiet dedication and support mean the world to us.",
    wishCardBody2: "Thank you for the life lessons, the shared laughs, and for showing us what integrity, work ethic, and unconditional love look like.",
    wishCardClosing: "Here's to celebrating you today and honoring the incredible dad you are.",
    giftBoxMessage: "To the best dad — wishing you health, peace, and endless relaxation!",
    galleryTitle: "Our Rock & Guide",
    gallerySubtitle: "A lifetime of advice, laughs, and adventures. We love you, Dad.",
  }
};

const inputClass = "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-all text-sm";
const textareaClass = `${inputClass} min-h-[90px] resize-y`;

function CreateWizardInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [step, setStep] = useState(1);
  const [occasion, setOccasion] = useState("birthday");
  const [cardId, setCardId] = useState("");
  const [password, setPassword] = useState("");
  const [config, setConfig] = useState({});
  const [signers, setSigners] = useState([{ name: "", role: "" }]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Pull occasion and cardId from URL if present
  useEffect(() => {
    const occ = searchParams.get("occasion");
    if (occ && PRESETS[occ]) {
      setOccasion(occ);
      setConfig(PRESETS[occ]);
    } else {
      setConfig(PRESETS.birthday);
    }
    
    const cid = searchParams.get("cardId");
    if (cid) {
      setCardId(cid);
    }
  }, [searchParams]);

  const handleOccasionChange = (occ) => {
    setOccasion(occ);
    setConfig(PRESETS[occ]);
  };

  const updateField = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateSigner = (idx, field, value) => {
    const next = [...signers];
    next[idx] = { ...next[idx], [field]: value };
    setSigners(next);
  };
  const addSigner = () => setSigners([...signers, { name: "", role: "" }]);
  const removeSigner = (idx) => setSigners(signers.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setError("");
    if (!cardId) {
      setError("Please choose a custom Card ID!");
      return;
    }
    const cleanId = cardId.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]/g, "");
    if (cleanId.length < 3) {
      setError("Card ID must be at least 3 characters long!");
      return;
    }
    if (!password || password.length < 4) {
      setError("Passcode must be at least 4 characters long!");
      return;
    }

    setSaving(true);
    try {
      // Check if page already exists
      const checkRes = await fetch(`/api/config?cardId=${cleanId}`);
      if (checkRes.ok) {
        setError(`Card code "${cleanId}" is already taken! Try another one.`);
        setSaving(false);
        return;
      }

      // Prepare final payload
      const payload = {
        ...config,
        occasion,
        cardId: cleanId,
        editPassword: password,
        signers: signers.filter(s => s.name.trim() !== ""),
        heroImagePath: "", // Starts empty so they can choose their own
        musicPath: "/birthday-music.mp3" // Default fallback
      };

      const res = await fetch(`/api/config?cardId=${cleanId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Log them in immediately
        sessionStorage.setItem(`authed_${cleanId}`, "1");
        sessionStorage.setItem(`edit_password_${cleanId}`, password);
        router.push(`/wish/${cleanId}/edit`);
      } else {
        setError("Failed to create page. Server error.");
      }
    } catch {
      setError("Connection failed. Try again.");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#07040d] text-white relative overflow-hidden flex flex-col justify-between">
      <StarField />

      <div className="absolute top-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-pink-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-xl mx-auto px-4 py-16 z-10 w-full">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 px-2">
          <span className="text-xs text-gray-500 uppercase tracking-widest">Step {step} of 4</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`w-6 h-1 rounded-full transition-all duration-300 ${s <= step ? "bg-pink-500" : "bg-white/10"}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: CHOOSE OCCASION */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Choose Occasion</h1>
                <p className="text-xs md:text-sm text-gray-400 font-light">Select the celebration type to unlock customized visual themes.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {Object.keys(PRESETS).map(key => (
                  <button
                    key={key}
                    onClick={() => handleOccasionChange(key)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-300 ${
                      occasion === key
                        ? "bg-gradient-to-r from-pink-500/20 to-purple-600/20 border-pink-500 shadow-lg text-white"
                        : "bg-white/5 border-white/10 hover:border-white/20 text-gray-400 hover:text-white"
                    }`}
                  >
                    <span className="text-2xl block mb-2">
                      {key === "birthday" ? "🎂" : key === "anniversary" ? "🌹" : key === "wedding" ? "🥂" : key === "engagement" ? "💍" : key === "mother-day" ? "🌸" : "👔"}
                    </span>
                    <span className="font-bold text-sm capitalize">{key.replace("-", " ")}</span>
                  </button>
                ))}
              </div>

              <button onClick={() => setStep(2)} className="w-full py-3.5 rounded-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center gap-2 active:scale-95 transition-all text-sm shadow-md">
                Next Step <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* STEP 2: RECIPIENT & PASSCODE */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Setup Recipient</h1>
                <p className="text-xs md:text-sm text-gray-400 font-light">Provide the name, age, and secure entry details for this surprise card.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">Recipient Name</label>
                  <input className={inputClass} value={config.recipientName || ""} onChange={e => updateField("recipientName", e.target.value)} placeholder="e.g. Mom" />
                </div>

                {occasion === "birthday" && (
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">Age (Optional)</label>
                    <input className={inputClass} type="number" value={config.age || ""} onChange={e => updateField("age", Number(e.target.value))} placeholder="e.g. 70" />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">Choose Card URL Code</label>
                  <input className={inputClass} value={cardId} onChange={e => { setCardId(e.target.value); setError(""); }} placeholder="e.g. mom-70" />
                  <p className="text-[10px] text-gray-500 mt-1">This forms your link: localhost:3000/wish/<strong>{cardId || "mom-70"}</strong></p>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 font-semibold">Secret Editor Passcode</label>
                  <input className={inputClass} type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="e.g. secret" />
                  <p className="text-[10px] text-gray-500 mt-1">Keep this safe! You will need it to upload photos and edit text later.</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 text-xs text-center flex items-center justify-center gap-2">
                  <ShieldAlert size={14} /> {error}
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-2xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-sm flex items-center justify-center gap-2">
                  <ChevronLeft size={16} /> Back
                </button>
                <button onClick={() => setStep(3)} className="flex-1 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center gap-2 active:scale-95 transition-all text-sm shadow-md">
                  Next Step <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CUSTOMIZE GREETINGS */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold mb-1">Customize Wishes</h1>
                <p className="text-xs md:text-sm text-gray-400 font-light">We've pre-filled gorgeous presets. Tweak them to make it perfect.</p>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-semibold">Wishes Header</label>
                  <input className={inputClass} value={config.wishCardTitle || ""} onChange={e => updateField("wishCardTitle", e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-semibold">Body Paragraph 1</label>
                  <textarea className={textareaClass} value={config.wishCardBody1 || ""} onChange={e => updateField("wishCardBody1", e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-semibold">Body Paragraph 2</label>
                  <textarea className={textareaClass} value={config.wishCardBody2 || ""} onChange={e => updateField("wishCardBody2", e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-semibold">Closing Line</label>
                  <input className={inputClass} value={config.wishCardClosing || ""} onChange={e => updateField("wishCardClosing", e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-semibold">Surprise Present Message</label>
                  <input className={inputClass} value={config.giftBoxMessage || ""} onChange={e => updateField("giftBoxMessage", e.target.value)} />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button onClick={() => setStep(2)} className="flex-1 py-3.5 rounded-2xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-sm flex items-center justify-center gap-2">
                  <ChevronLeft size={16} /> Back
                </button>
                <button onClick={() => setStep(4)} className="flex-1 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center gap-2 active:scale-95 transition-all text-sm shadow-md">
                  Next Step <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SIGNERS / SENDERS */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Who is this from?</h1>
                <p className="text-xs md:text-sm text-gray-400 font-light">Add names and roles of the family members sending these wishes.</p>
              </div>

              <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                {signers.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input className={`${inputClass} flex-1`} placeholder="Name" value={s.name} onChange={e => updateSigner(i, "name", e.target.value)} />
                    <input className={`${inputClass} flex-1`} placeholder="Role (e.g. Son)" value={s.role} onChange={e => updateSigner(i, "role", e.target.value)} />
                    <button onClick={() => removeSigner(i)} className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/10">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={addSigner} className="flex items-center gap-2 text-xs text-pink-400 hover:text-pink-300 transition-colors border border-pink-500/20 rounded-xl px-4 py-2 hover:bg-pink-500/5">
                <Plus size={14} /> Add Senders
              </button>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400 text-xs text-center flex items-center justify-center gap-2">
                  <ShieldAlert size={14} /> {error}
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button onClick={() => setStep(3)} className="flex-1 py-3.5 rounded-2xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-sm flex items-center justify-center gap-2">
                  <ChevronLeft size={16} /> Back
                </button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-white flex items-center justify-center gap-2 active:scale-95 transition-all text-sm shadow-md">
                  <Save size={16} /> {saving ? "Generating Card..." : "Generate Card!"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="w-full border-t border-white/5 bg-black/20 py-4 text-center text-xs text-gray-500 z-10 font-light">
        <p>© 2026 Celebration Craft. Handcrafted with love.</p>
      </footer>
    </div>
  );
}

export default function CreateWizard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07040d] text-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
      </div>
    }>
      <CreateWizardInner />
    </Suspense>
  );
}
