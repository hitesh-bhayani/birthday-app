// app/admin/page.js
"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette, Image, Music, Settings, Save, Upload, Trash2,
  Plus, X, CheckCircle, AlertCircle, LogOut, ExternalLink,
  User, MessageSquare, Users, Play, Pause,
} from "lucide-react";

// ─── Utility ────────────────────────────────────────────────────────────────
function getPassword() {
  return typeof window !== "undefined" ? sessionStorage.getItem("admin_password") || "" : "";
}

async function saveConfig(data) {
  const res = await fetch("/api/config", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-password": getPassword() },
    body: JSON.stringify(data),
  });
  return res.ok;
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 20, x: "-50%" }}
      className={`fixed bottom-6 left-1/2 z-[200] flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl border text-sm font-medium ${
        type === "success"
          ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
          : "bg-red-500/20 border-red-500/30 text-red-300"
      }`}
    >
      {type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {message}
    </motion.div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function Card({ title, icon: Icon, children }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/30">
          <Icon size={18} className="text-pink-400" />
        </div>
        <h2 className="text-white font-semibold text-lg">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-all text-sm";
const textareaClass = `${inputClass} min-h-[90px] resize-y`;

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState("content");
  const [config, setConfig] = useState(null);
  const [images, setImages] = useState([]);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const voiceRef = useRef(null);
  const musicRef = useRef(null);
  const photoInputRef = useRef(null);
  const musicInputRef = useRef(null);
  const voiceInputRef = useRef(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  useEffect(() => {
    fetch("/api/config").then(r => r.json()).then(setConfig);
    fetch("/api/images").then(r => r.json()).then(setImages);
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const updateField = (key, value) => setConfig(c => ({ ...c, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    const ok = await saveConfig(config);
    showToast(ok ? "Changes saved successfully!" : "Save failed. Check your connection.", ok ? "success" : "error");
    setSaving(false);
  };

  const handlePhotoUpload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append("files", f));
    const res = await fetch("/api/upload/photos", { method: "POST", body: fd });
    const data = await res.json();
    if (data.success) {
      setImages(prev => [...prev, ...data.saved]);
      showToast(`${data.saved.length} photo(s) uploaded!`);
    } else {
      showToast("Upload failed", "error");
    }
    setUploading(false);
  };

  const handleDeletePhoto = async (src) => {
    const filename = src.split("/").pop();
    const res = await fetch("/api/images", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });
    if (res.ok) {
      setImages(prev => prev.filter(i => i !== src));
      if (config.heroImagePath === src) updateField("heroImagePath", images.find(i => i !== src) || "");
      showToast("Photo deleted");
    } else {
      showToast("Delete failed", "error");
    }
  };

  const handleMusicUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload/music", { method: "POST", body: fd });
    const data = await res.json();
    showToast(data.success ? "Background music updated!" : "Upload failed", data.success ? "success" : "error");
    setUploading(false);
  };

  const handleVoiceUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload/voice-note", { method: "POST", body: fd });
    const data = await res.json();
    showToast(data.success ? "Voice note uploaded!" : "Upload failed", data.success ? "success" : "error");
    setUploading(false);
  };

  const updateSigner = (idx, field, value) => {
    const next = [...(config.signers || [])];
    next[idx] = { ...next[idx], [field]: value };
    updateField("signers", next);
  };
  const addSigner = () => updateField("signers", [...(config.signers || []), { name: "", role: "" }]);
  const removeSigner = (idx) => updateField("signers", (config.signers || []).filter((_, i) => i !== idx));

  const TABS = [
    { id: "content", label: "Content", icon: Palette },
    { id: "photos", label: "Photos", icon: Image },
    { id: "audio", label: "Audio", icon: Music },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (!config) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-pink-600/15 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-white/3 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Birthday App Admin</h1>
          <p className="text-xs text-gray-400">Control panel — changes reflect immediately on the app</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors border border-white/10 rounded-full px-4 py-2 hover:border-white/20"
          >
            <ExternalLink size={14} /> Preview App
          </a>
          <button
            onClick={() => { sessionStorage.clear(); window.location.reload(); }}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors border border-white/10 rounded-full px-4 py-2 hover:border-red-500/30"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Tab Bar */}
        <div className="flex gap-2 mb-8 bg-white/5 border border-white/10 rounded-2xl p-1.5 w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === id
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ── CONTENT TAB ─────────────────────────────────────────────── */}
          {tab === "content" && (
            <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <Card title="Recipient" icon={User}>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Name">
                    <input className={inputClass} value={config.recipientName || ""} onChange={e => updateField("recipientName", e.target.value)} placeholder="e.g. Mummy" />
                  </Field>
                  <Field label="Age">
                    <input className={inputClass} type="number" value={config.age || ""} onChange={e => updateField("age", Number(e.target.value))} placeholder="e.g. 70" />
                  </Field>
                </div>
              </Card>

              <Card title="Landing Screen" icon={Palette}>
                <Field label="Main Title">
                  <input className={inputClass} value={config.landingTitle || ""} onChange={e => updateField("landingTitle", e.target.value)} placeholder="Happy Birthday" />
                </Field>
                <Field label="Subtitle">
                  <textarea className={textareaClass} value={config.landingSubtitle || ""} onChange={e => updateField("landingSubtitle", e.target.value)} />
                </Field>
              </Card>

              <Card title="Wishes Card" icon={MessageSquare}>
                <Field label="Card Title">
                  <input className={inputClass} value={config.wishCardTitle || ""} onChange={e => updateField("wishCardTitle", e.target.value)} placeholder="Happy 70th Birthday!" />
                </Field>
                <Field label="First Paragraph">
                  <textarea className={textareaClass} value={config.wishCardBody1 || ""} onChange={e => updateField("wishCardBody1", e.target.value)} />
                </Field>
                <Field label="Second Paragraph">
                  <textarea className={textareaClass} value={config.wishCardBody2 || ""} onChange={e => updateField("wishCardBody2", e.target.value)} />
                </Field>
                <Field label="Closing Line">
                  <input className={inputClass} value={config.wishCardClosing || ""} onChange={e => updateField("wishCardClosing", e.target.value)} />
                </Field>
              </Card>

              <Card title="Signers" icon={Users}>
                <div className="space-y-3 mb-4">
                  {(config.signers || []).map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <input className={`${inputClass} flex-1`} placeholder="Name" value={s.name} onChange={e => updateSigner(i, "name", e.target.value)} />
                      <input className={`${inputClass} flex-1`} placeholder="Role (e.g. Daughter)" value={s.role} onChange={e => updateSigner(i, "role", e.target.value)} />
                      <button onClick={() => removeSigner(i)} className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/10">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addSigner} className="flex items-center gap-2 text-sm text-pink-400 hover:text-pink-300 transition-colors border border-pink-500/30 rounded-xl px-4 py-2 hover:bg-pink-500/10">
                  <Plus size={14} /> Add Signer
                </button>
              </Card>

              <Card title="Gift Box & Gallery" icon={MessageSquare}>
                <Field label="Gift Box Surprise Message">
                  <input className={inputClass} value={config.giftBoxMessage || ""} onChange={e => updateField("giftBoxMessage", e.target.value)} />
                </Field>
                <Field label="Gallery Heading">
                  <input className={inputClass} value={config.galleryTitle || ""} onChange={e => updateField("galleryTitle", e.target.value)} />
                </Field>
                <Field label="Gallery Subtitle">
                  <input className={inputClass} value={config.gallerySubtitle || ""} onChange={e => updateField("gallerySubtitle", e.target.value)} />
                </Field>
              </Card>

              <button onClick={handleSave} disabled={saving} className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:opacity-50 transition-all flex items-center justify-center gap-3 text-base shadow-lg">
                <Save size={18} /> {saving ? "Saving..." : "Save All Changes"}
              </button>
            </motion.div>
          )}

          {/* ── PHOTOS TAB ──────────────────────────────────────────────── */}
          {tab === "photos" && (
            <motion.div key="photos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <Card title="Upload Photos" icon={Upload}>
                <div
                  onClick={() => photoInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handlePhotoUpload(e.dataTransfer.files); }}
                  className="border-2 border-dashed border-white/20 rounded-2xl p-10 text-center cursor-pointer hover:border-pink-500/50 hover:bg-pink-500/5 transition-all"
                >
                  <Upload className="mx-auto mb-3 text-gray-400" size={32} />
                  <p className="text-white font-medium mb-1">{uploading ? "Uploading..." : "Drop photos here or click to browse"}</p>
                  <p className="text-xs text-gray-500">JPG, PNG, HEIC — multiple files supported</p>
                  <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotoUpload(e.target.files)} />
                </div>
              </Card>

              <Card title={`Gallery Photos (${images.length})`} icon={Image}>
                <Field label="Hero Image (shown on Landing screen)">
                  <select className={inputClass} value={config.heroImagePath || ""} onChange={e => updateField("heroImagePath", e.target.value)}>
                    {images.map(src => (
                      <option key={src} value={src}>{src.split("/").pop()}</option>
                    ))}
                  </select>
                </Field>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                  {images.map(src => (
                    <div key={src} className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${config.heroImagePath === src ? "border-pink-500" : "border-transparent hover:border-white/20"}`}
                      onClick={() => updateField("heroImagePath", src)}>
                      <img src={src} alt="" className="w-full aspect-square object-cover" />
                      {config.heroImagePath === src && (
                        <div className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">HERO</div>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); handleDeletePhoto(src); }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-400 text-white p-1.5 rounded-full transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <button onClick={handleSave} disabled={saving} className="mt-6 w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                  <Save size={16} /> {saving ? "Saving..." : "Save Hero Image Selection"}
                </button>
              </Card>
            </motion.div>
          )}

          {/* ── AUDIO TAB ───────────────────────────────────────────────── */}
          {tab === "audio" && (
            <motion.div key="audio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <Card title="Background Music" icon={Music}>
                <audio ref={musicRef} src="/birthday-music.mp3" loop onEnded={() => setMusicPlaying(false)} />
                <p className="text-sm text-gray-400 mb-4">This plays throughout the entire birthday experience.</p>
                <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  <button onClick={() => {
                    if (musicPlaying) { musicRef.current?.pause(); setMusicPlaying(false); }
                    else { musicRef.current?.play(); setMusicPlaying(true); }
                  }} className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${musicPlaying ? "bg-pink-500" : "bg-white/10 hover:bg-white/20"}`}>
                    {musicPlaying ? <Pause size={16} fill="white" className="text-white" /> : <Play size={16} fill="white" className="text-white ml-0.5" />}
                  </button>
                  <div>
                    <p className="text-sm text-white font-medium">birthday-music.mp3</p>
                    <p className="text-xs text-gray-400">{musicPlaying ? "Playing preview..." : "Click to preview"}</p>
                  </div>
                </div>
                <div
                  onClick={() => musicInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleMusicUpload(e.dataTransfer.files[0]); }}
                  className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:border-pink-500/50 hover:bg-pink-500/5 transition-all"
                >
                  <Upload className="mx-auto mb-2 text-gray-400" size={28} />
                  <p className="text-white font-medium mb-1">{uploading ? "Uploading..." : "Drop new music here or click to browse"}</p>
                  <p className="text-xs text-gray-500">MP3 or M4A recommended</p>
                  <input ref={musicInputRef} type="file" accept="audio/*" className="hidden" onChange={e => handleMusicUpload(e.target.files[0])} />
                </div>
              </Card>

              <Card title="Voice Note" icon={Music}>
                <audio ref={voiceRef} src="/voice-notes/message.mp3" onEnded={() => setVoicePlaying(false)} />
                <p className="text-sm text-gray-400 mb-4">A personal recorded message played on the Wishes Card. Upload a file to enable the player.</p>
                <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  <button onClick={() => {
                    if (voicePlaying) { voiceRef.current?.pause(); setVoicePlaying(false); }
                    else { voiceRef.current?.play().catch(() => {}); setVoicePlaying(true); }
                  }} className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${voicePlaying ? "bg-pink-500" : "bg-white/10 hover:bg-white/20"}`}>
                    {voicePlaying ? <Pause size={16} fill="white" className="text-white" /> : <Play size={16} fill="white" className="text-white ml-0.5" />}
                  </button>
                  <div>
                    <p className="text-sm text-white font-medium">voice-notes/message.mp3</p>
                    <p className="text-xs text-gray-400">{voicePlaying ? "Playing preview..." : "Click to preview current recording"}</p>
                  </div>
                </div>
                <div
                  onClick={() => voiceInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleVoiceUpload(e.dataTransfer.files[0]); }}
                  className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:border-pink-500/50 hover:bg-pink-500/5 transition-all"
                >
                  <Upload className="mx-auto mb-2 text-gray-400" size={28} />
                  <p className="text-white font-medium mb-1">{uploading ? "Uploading..." : "Drop recording here or click to browse"}</p>
                  <p className="text-xs text-gray-500">MP3, M4A, WAV, AAC supported</p>
                  <input ref={voiceInputRef} type="file" accept="audio/*" className="hidden" onChange={e => handleVoiceUpload(e.target.files[0])} />
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── SETTINGS TAB ────────────────────────────────────────────── */}
          {tab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <Card title="Change Admin Password" icon={Settings}>
                <p className="text-sm text-gray-400 mb-4">After changing, you will need to log in again with the new password.</p>
                <Field label="New Password (min 6 characters)">
                  <input
                    className={inputClass}
                    type="password"
                    placeholder="Enter new password"
                    onChange={e => updateField("newAdminPassword", e.target.value)}
                  />
                </Field>
                <button
                  onClick={async () => {
                    if (!config.newAdminPassword || config.newAdminPassword.length < 6) {
                      showToast("Password must be at least 6 characters", "error"); return;
                    }
                    const ok = await saveConfig({ newAdminPassword: config.newAdminPassword });
                    if (ok) {
                      showToast("Password changed! Please log in again.");
                      setTimeout(() => { sessionStorage.clear(); window.location.reload(); }, 2000);
                    } else {
                      showToast("Failed to change password", "error");
                    }
                  }}
                  className="py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 transition-all"
                >
                  Change Password
                </button>
              </Card>

              <Card title="Danger Zone" icon={AlertCircle}>
                <p className="text-sm text-gray-400 mb-4">Reset all content to the original defaults. This cannot be undone.</p>
                <button
                  onClick={async () => {
                    if (!confirm("Are you sure? This will reset ALL text content to defaults.")) return;
                    const defaults = {
                      recipientName: "Mummy", age: 70,
                      heroImagePath: "/original_images/PREM2902.JPG",
                      landingTitle: "Happy Birthday",
                      landingSubtitle: "Get ready to experience a personalized journey full of memories, joy, and a few surprises.",
                      wishCardTitle: "Happy 70th Birthday!",
                      wishCardBody1: "Seven decades of incredible stories, boundless wisdom, and a heart that has touched so many lives. Your presence has always been our greatest comfort.",
                      wishCardBody2: "You have built a legacy of love and unwavering kindness. Know that you are deeply cherished — not just for what you have done, but for the beautiful person you are.",
                      wishCardClosing: "Here's to many more sweet memories to come.",
                      signers: [{ name: "Jhankar", role: "Daughter" }, { name: "Hitesh", role: "Son-in-law" }, { name: "Dhruv", role: "Grandson" }],
                      giftBoxMessage: "Wishing you endless joy & health!",
                      galleryTitle: "Happy 70th Birthday!",
                      gallerySubtitle: "A lifetime of memories, and so many more to make. Thank you for being you.",
                      musicPath: "/birthday-music.mp3",
                    };
                    const ok = await saveConfig(defaults);
                    if (ok) { setConfig(prev => ({ ...prev, ...defaults })); showToast("Reset to defaults!"); }
                    else showToast("Reset failed", "error");
                  }}
                  className="py-3 px-6 rounded-xl font-semibold text-red-300 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all"
                >
                  Reset to Defaults
                </button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key={toast.message} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
