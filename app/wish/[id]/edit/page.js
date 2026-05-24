// app/wish/[id]/edit/page.js
"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette, Image, Music, Settings, Save, Upload, Trash2,
  Plus, X, CheckCircle, AlertCircle, LogOut, ExternalLink,
  User, MessageSquare, Users, Play, Pause, Lock, Eye, EyeOff,
  Camera, Mic, Square, RefreshCw, Radio, ChevronLeft, ChevronRight, Sparkles
} from "lucide-react";
import { getTheme } from "../../../utils/themes";

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

export default function WishEditPage() {
  const params = useParams();
  const router = useRouter();
  const cardId = params.id;

  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [tab, setTab] = useState("content");
  const [config, setConfig] = useState(null);
  const [images, setImages] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [aiFacts, setAiFacts] = useState("");
  const [aiTone, setAiTone] = useState("Deeply Emotional");
  const [pastedJson, setPastedJson] = useState("");
  
  const voiceRef = useRef(null);
  const musicRef = useRef(null);
  const photoInputRef = useRef(null);
  const musicInputRef = useRef(null);
  const voiceInputRef = useRef(null);

  // 📸 Camera State
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraFacing, setCameraFacing] = useState("user");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 🎤 Audio Recorder State
  const [recordingActive, setRecordingActive] = useState(false);
  const [recDuration, setRecDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const recTimerRef = useRef(null);

  const showToast = (message, type = "success") => setToast({ message, type });

  // ── Camera Handlers ──────────────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      showToast("Camera access denied or unavailable", "error");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
    }
    setCameraStream(null);
    setCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === "user" ? "environment" : "user";
    setCameraFacing(nextFacing);
    // Restart camera with new facing mode
    if (cameraActive) {
      setTimeout(() => {
        startCamera();
      }, 150);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Match canvas size to video frame
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Export to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      const file = new File([blob], `captured_${Date.now()}.jpg`, { type: "image/jpeg" });
      await handlePhotoUpload([file]);
      stopCamera();
    }, "image/jpeg", 0.9);
  };

  // ── Voice Recorder Handlers ─────────────────────────────────────────────────
  const startRecording = async () => {
    setAudioChunks([]);
    setRecDuration(0);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        // Stop all media tracks to release microphone
        stream.getTracks().forEach(t => t.stop());
        
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], "voice.mp3", { type: "audio/webm" });
        
        await handleVoiceUpload(file);
      };

      recorder.start();
      setRecordingActive(true);
      
      // Start recording timer
      recTimerRef.current = setInterval(() => {
        setRecDuration(d => d + 1);
      }, 1000);

    } catch (err) {
      console.error("Mic access failed:", err);
      showToast("Microphone access denied or unavailable", "error");
    }
  };

  const stopRecording = (shouldSave) => {
    if (recTimerRef.current) {
      clearInterval(recTimerRef.current);
    }
    
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      if (shouldSave) {
        mediaRecorder.stop();
      } else {
        // Stop without saving
        mediaRecorder.ondataavailable = null;
        mediaRecorder.stop();
        // Stop tracks
        mediaRecorder.stream.getTracks().forEach(t => t.stop());
        showToast("Recording discarded");
      }
    }
    setRecordingActive(false);
  };

  // Cleanup media streams on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
      if (recTimerRef.current) clearInterval(recTimerRef.current);
    };
  }, [cameraStream]);

  const getCardPassword = () => {
    return typeof window !== "undefined" ? sessionStorage.getItem(`edit_password_${cardId}`) || "" : "";
  };

  useEffect(() => {
    const stored = sessionStorage.getItem(`authed_${cardId}`);
    if (stored === "1") {
      setAuthed(true);
      loadCardData();
    }
  }, [cardId]);

  const loadCardData = () => {
    fetch(`/api/config?cardId=${cardId}`)
      .then(r => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setConfig)
      .catch(() => showToast("Failed to load configuration", "error"));

    fetch(`/api/images?cardId=${cardId}`)
      .then(r => r.json())
      .then(setImages);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch(`/api/config?cardId=${cardId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        sessionStorage.setItem(`authed_${cardId}`, "1");
        sessionStorage.setItem(`edit_password_${cardId}`, password);
        setAuthed(true);
        loadCardData();
      } else {
        setLoginError("Incorrect passcode. Please try again.");
      }
    } catch {
      setLoginError("Connection error. Is the server running?");
    }
    setLoginLoading(false);
  };

  const updateField = (key, value) => setConfig(c => ({ ...c, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/config?cardId=${cardId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": getCardPassword() },
      body: JSON.stringify(config),
    });
    showToast(res.ok ? "Changes saved successfully!" : "Save failed. Invalid password?", res.ok ? "success" : "error");
    setSaving(false);
  };

  const handlePhotoUpload = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append("files", f));
    const res = await fetch(`/api/upload/photos?cardId=${cardId}`, { method: "POST", body: fd });
    const data = await res.json();
    if (data.success) {
      const updatedImages = [...images, ...data.saved];
      setImages(updatedImages);
      setConfig(c => ({
        ...c,
        imagesOrder: updatedImages
      }));
      showToast(`${data.saved.length} photo(s) uploaded!`);
    } else {
      showToast("Upload failed", "error");
    }
    setUploading(false);
  };

  const handleDeletePhoto = async (src) => {
    const filename = src.split("/").pop();
    const res = await fetch(`/api/images?cardId=${cardId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename }),
    });
    if (res.ok) {
      const updatedImages = images.filter(i => i !== src);
      setImages(updatedImages);
      setConfig(c => {
        const next = { ...c, imagesOrder: updatedImages };
        if (c.heroImagePath === src) {
          next.heroImagePath = updatedImages.find(i => i !== src) || "";
        }
        return next;
      });
      showToast("Photo deleted");
    } else {
      showToast("Delete failed", "error");
    }
  };

  const moveImage = (index, direction) => {
    const newImages = [...images];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    // Swap images
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    setImages(newImages);
    setConfig(c => ({
      ...c,
      imagesOrder: newImages
    }));
  };

  const handleMoveImage = (e, index, direction) => {
    e.stopPropagation();
    moveImage(index, direction);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const reordered = [...images];
    const draggedItem = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);

    setImages(reordered);
    setConfig(c => ({
      ...c,
      imagesOrder: reordered
    }));
    setDraggedIndex(null);
  };

  const generateAIPrompt = () => {
    if (!config) return "";
    const signersList = (config.signers || []).map(s => `${s.name} (${s.role || 'Family Senders'})`).join(", ");

    return `You are an expert copywriter. Craft a highly personalized premium greeting card in a ${aiTone} tone for my beloved ${config.recipientName || 'recipient'} who is celebrating their ${config.age || '70'}th ${config.occasion || 'birthday'}.
The card is sent by: ${signersList || 'Loving Family'}.

Here are some additional facts/memories/traits about ${config.recipientName || 'them'} to weave into the messages:
${aiFacts || '(No additional facts provided - write a universally beautiful, heartfelt message celebrating their life milestones)'}

Generate a JSON object matching this structure. Follow these key copy rules:
1. Make the text flow like a cohesive, poetic story, not generic greeting templates.
2. Emphasize their wisdom, love, legacy, and the key facts mentioned above.
3. Be highly creative. Avoid overly cheesy clichés. Keep it elegant.

JSON SCHEMA:
{
  "landingTitle": "Happy ${config.age || '70'}th Birthday [Name]",
  "landingSubtitle": "[A short, elegant, warm subtitle inviting them to click to unlock their journey of memories. Keep it under 20 words.]",
  "wishCardTitle": "[A main greeting card heading, e.g. 'A Lifetime of Love']",
  "wishCardBody1": "[A beautiful, deeply moving paragraph about their life, achievements, or legacy. Max 45 words.]",
  "wishCardBody2": "[Another heartwarming paragraph about their kindness, guidance, impact, and value. Max 45 words.]",
  "wishCardClosing": "[Closing warm words, e.g., 'Here\\'s to many more sweet memories to come.']",
  "giftBoxMessage": "[A short sweet surprise sentence inside the virtual present, e.g. 'Wishing you endless joy & health!']",
  "galleryTitle": "[Title for the photo polaroid gallery, e.g., 'Moments in Time']",
  "gallerySubtitle": "[A beautiful, loving subtitle for the gallery, e.g., 'A lifetime of memories, and so many more to make. Thank you for being you.']"
}

IMPORTANT: Reply ONLY with valid JSON. Do not include markdown code block syntax (like \`\`\`json), explanations, or any other characters. Just plain valid JSON matching the schema above.`;
  };

  const handleAIFilesUpload = (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        setPastedJson(text);
        showToast("JSON file loaded successfully!");
      } catch {
        showToast("Error reading file", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleApplyAIJson = () => {
    if (!pastedJson.trim()) {
      showToast("Please paste or upload JSON first", "error");
      return;
    }

    try {
      let cleanText = pastedJson.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```(json)?/, "").replace(/```$/, "").trim();
      }

      const parsed = JSON.parse(cleanText);
      const required = ["landingTitle", "landingSubtitle", "wishCardTitle", "wishCardBody1", "wishCardBody2", "wishCardClosing", "giftBoxMessage", "galleryTitle", "gallerySubtitle"];
      const missing = required.filter(k => !(k in parsed));

      if (missing.length === required.length) {
        showToast("Valid schema fields not found in the JSON", "error");
        return;
      }

      setConfig(prev => ({
        ...prev,
        ...parsed
      }));

      showToast(`AI content patched! ${required.length - missing.length} fields updated. Click "Save All Details" below to apply permanently!`);
    } catch (e) {
      console.error(e);
      showToast("Invalid JSON syntax. Please check for missing quotes or commas.", "error");
    }
  };

  const handleMusicUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/upload/music?cardId=${cardId}`, { method: "POST", body: fd });
    const data = await res.json();
    if (data.success) {
      updateField("musicPath", data.url);
      showToast("Background music updated!");
    } else {
      showToast("Upload failed", "error");
    }
    setUploading(false);
  };

  const handleVoiceUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/upload/voice-note?cardId=${cardId}`, { method: "POST", body: fd });
    const data = await res.json();
    if (data.success) {
      updateField("voiceNotePath", data.url);
      showToast("Voice note uploaded!");
    } else {
      showToast("Upload failed", "error");
    }
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
    { id: "ai", label: "AI Copywriter", icon: Sparkles },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="absolute top-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-pink-600/20 blur-[120px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-sm">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-20 blur-lg" />
          <form onSubmit={handleLogin} className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-pink-500/20 border border-pink-500/30 mx-auto mb-6">
              <Lock className="text-pink-400" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white text-center mb-1">Editor Panel</h1>
            <p className="text-gray-400 text-sm text-center mb-6">Enter Card Passcode for "{cardId}"</p>

            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter passcode"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 transition-all pr-12 text-sm"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <AnimatePresence>
              {loginError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs text-center mb-4">
                  {loginError}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loginLoading || !password}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:opacity-40 transition-all text-sm shadow-md"
            >
              {loginLoading ? "Verifying..." : "Unlock Editor"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

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

      <header className="relative z-10 border-b border-white/10 bg-white/3 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Surprise Hub Editor</h1>
          <p className="text-xs text-gray-400">Editing Card: "{cardId}" ({config.occasion})</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/wish/${cardId}`}
            target="_blank"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors border border-white/10 rounded-full px-4 py-2 hover:border-white/20"
          >
            <ExternalLink size={14} /> View Wish Page
          </a>
          <button
            onClick={() => { sessionStorage.clear(); window.location.reload(); }}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors border border-white/10 rounded-full px-4 py-2 hover:border-red-500/30"
          >
            <LogOut size={14} /> Exit Editor
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
          {tab === "content" && (
            <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <Card title="Recipient Details" icon={User}>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Recipient Name">
                    <input className={inputClass} value={config.recipientName || ""} onChange={e => updateField("recipientName", e.target.value)} />
                  </Field>
                  <Field label="Age (if birthday, optional)">
                    <input className={inputClass} type="number" value={config.age || ""} onChange={e => updateField("age", Number(e.target.value))} />
                  </Field>
                </div>
              </Card>

              <Card title="Landing Slide" icon={Palette}>
                <Field label="Greeting Title">
                  <input className={inputClass} value={config.landingTitle || ""} onChange={e => updateField("landingTitle", e.target.value)} />
                </Field>
                <Field label="Landing Paragraph">
                  <textarea className={textareaClass} value={config.landingSubtitle || ""} onChange={e => updateField("landingSubtitle", e.target.value)} />
                </Field>
              </Card>

              <Card title="Wishes Greeting Card" icon={MessageSquare}>
                <Field label="Greeting Header">
                  <input className={inputClass} value={config.wishCardTitle || ""} onChange={e => updateField("wishCardTitle", e.target.value)} />
                </Field>
                <Field label="First Body Paragraph">
                  <textarea className={textareaClass} value={config.wishCardBody1 || ""} onChange={e => updateField("wishCardBody1", e.target.value)} />
                </Field>
                <Field label="Second Body Paragraph">
                  <textarea className={textareaClass} value={config.wishCardBody2 || ""} onChange={e => updateField("wishCardBody2", e.target.value)} />
                </Field>
                <Field label="Closing Quote">
                  <input className={inputClass} value={config.wishCardClosing || ""} onChange={e => updateField("wishCardClosing", e.target.value)} />
                </Field>
              </Card>

              <Card title="Signatures / Senders" icon={Users}>
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

              <Card title="Present Box & Gallery" icon={MessageSquare}>
                <Field label="Present Surprise Message">
                  <input className={inputClass} value={config.giftBoxMessage || ""} onChange={e => updateField("giftBoxMessage", e.target.value)} />
                </Field>
                <Field label="Gallery Header">
                  <input className={inputClass} value={config.galleryTitle || ""} onChange={e => updateField("galleryTitle", e.target.value)} />
                </Field>
                <Field label="Gallery Description">
                  <input className={inputClass} value={config.gallerySubtitle || ""} onChange={e => updateField("gallerySubtitle", e.target.value)} />
                </Field>
              </Card>

              <button onClick={handleSave} disabled={saving} className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 transition-all flex items-center justify-center gap-3 shadow-lg">
                <Save size={18} /> {saving ? "Saving Changes..." : "Save All Details"}
              </button>
            </motion.div>
          )}

          {tab === "photos" && (
            <motion.div key="photos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <Card title="Add Photos" icon={Upload}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload Zone */}
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handlePhotoUpload(e.dataTransfer.files); }}
                    className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:border-pink-500/50 hover:bg-pink-500/5 transition-all flex flex-col items-center justify-center min-h-[160px]"
                  >
                    <Upload className="mb-2 text-gray-400" size={28} />
                    <p className="text-white font-medium text-sm mb-0.5">{uploading ? "Uploading..." : "Browse or Drop Photos"}</p>
                    <p className="text-[10px] text-gray-500">JPG, PNG, WEBP, HEIC supported</p>
                    <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotoUpload(e.target.files)} />
                  </div>

                  {/* Camera Trigger Zone */}
                  {!cameraActive ? (
                    <div
                      onClick={startCamera}
                      className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:border-pink-500/50 hover:bg-pink-500/5 transition-all flex flex-col items-center justify-center min-h-[160px]"
                    >
                      <Camera className="mb-2 text-pink-400 animate-pulse" size={28} />
                      <p className="text-white font-medium text-sm mb-0.5">Take Photo with Camera</p>
                      <p className="text-[10px] text-gray-500">Capture frame directly from webcam/mobile camera</p>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/60 p-2 flex flex-col items-center justify-center min-h-[160px]">
                      <video ref={videoRef} autoPlay playsInline className="w-full aspect-video rounded-xl object-cover bg-black" />
                      <canvas ref={canvasRef} className="hidden" />

                      {/* Camera Action Buttons Overlay */}
                      <div className="flex gap-2 mt-2 w-full">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <Camera size={12} /> Capture
                        </button>
                        <button
                          type="button"
                          onClick={toggleCameraFacing}
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 transition-colors"
                          title="Switch Camera"
                        >
                          <RefreshCw size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                          title="Cancel"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card title={`Gallery Photos (${images.length})`} icon={Image}>
                {images.length > 0 ? (
                  <>
                    <p className="text-xs text-gray-400 mb-4 bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-2">
                      <Radio size={12} className="text-pink-400 animate-pulse" />
                      <span>💡 <strong>Tip:</strong> Drag and drop any photo to reorder! Tap an image to select it as the primary Hero banner.</span>
                    </p>

                    <Field label="Set Hero Image (shown on Landing page)">
                      <select className={inputClass} value={config.heroImagePath || ""} onChange={e => updateField("heroImagePath", e.target.value)}>
                        <option value="">-- Select Hero Photo --</option>
                        {images.map(src => (
                          <option key={src} value={src}>{src.split("/").pop()}</option>
                        ))}
                      </select>
                    </Field>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                      {images.map((src, index) => (
                        <motion.div
                          layout
                          key={src}
                          draggable
                          onDragStart={e => handleDragStart(e, index)}
                          onDragOver={handleDragOver}
                          onDrop={e => handleDrop(e, index)}
                          className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing ${draggedIndex === index ? "opacity-30 scale-95 border-pink-500/50" : ""} ${config.heroImagePath === src ? "border-pink-500 animate-[pulse_2s_infinite]" : "border-transparent hover:border-white/20"}`}
                          onClick={() => updateField("heroImagePath", src)}
                        >
                          <img src={src} alt="" className="w-full aspect-square object-cover pointer-events-none select-none" />
                          {config.heroImagePath === src && (
                            <div className="absolute top-2 left-2 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full select-none">HERO</div>
                          )}
                          <button
                            onClick={e => { e.stopPropagation(); handleDeletePhoto(src); }}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-400 text-white p-1.5 rounded-full transition-all shadow-md z-10"
                          >
                            <Trash2 size={12} />
                          </button>

                          {/* Reordering Controls Overlay */}
                          <div className="absolute bottom-2 left-2 right-2 flex justify-between opacity-0 group-hover:opacity-100 transition-all gap-1.5 z-10">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={e => handleMoveImage(e, index, -1)}
                              className={`p-1.5 rounded-lg bg-black/60 hover:bg-pink-500 text-white transition-all shadow-md active:scale-95 ${index === 0 ? "opacity-30 cursor-not-allowed hover:bg-black/60" : ""}`}
                              title="Move Earlier"
                            >
                              <ChevronLeft size={12} />
                            </button>
                            <span className="text-[10px] text-white bg-black/60 px-2 py-1 rounded-md backdrop-blur-sm self-center font-medium pointer-events-none select-none">
                              {index + 1}
                            </span>
                            <button
                              type="button"
                              disabled={index === images.length - 1}
                              onClick={e => handleMoveImage(e, index, 1)}
                              className={`p-1.5 rounded-lg bg-black/60 hover:bg-pink-500 text-white transition-all shadow-md active:scale-95 ${index === images.length - 1 ? "opacity-30 cursor-not-allowed hover:bg-black/60" : ""}`}
                              title="Move Later"
                            >
                              <ChevronRight size={12} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <button onClick={handleSave} disabled={saving} className="mt-6 w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 transition-all flex items-center justify-center gap-3">
                      <Save size={16} /> {saving ? "Saving Selection..." : "Save Image Setup"}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-10 text-gray-500 text-sm border border-dashed border-white/10 rounded-2xl">
                    <Camera className="mx-auto mb-2 text-gray-600" size={32} />
                    <p className="font-semibold text-gray-400 mb-0.5">No Photos in Gallery</p>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">Upload files or take pictures with your device's camera above to get started!</p>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {tab === "audio" && (
            <motion.div key="audio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <Card title="Background Audio Track" icon={Music}>
                {config.musicPath && (
                  <audio ref={musicRef} src={config.musicPath} loop onEnded={() => setMusicPlaying(false)} />
                )}
                <p className="text-sm text-gray-400 mb-4">Provide beautiful background atmosphere for the visitor.</p>
                {config.musicPath && (
                  <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <button onClick={() => {
                      if (musicPlaying) { musicRef.current?.pause(); setMusicPlaying(false); }
                      else { musicRef.current?.play(); setMusicPlaying(true); }
                    }} className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${musicPlaying ? "bg-pink-500" : "bg-white/10 hover:bg-white/20"}`}>
                      {musicPlaying ? <Pause size={16} fill="white" className="text-white" /> : <Play size={16} fill="white" className="text-white ml-0.5" />}
                    </button>
                    <div className="overflow-hidden">
                      <p className="text-sm text-white font-medium truncate">{config.musicPath.split("/").pop()}</p>
                      <p className="text-xs text-gray-400">{musicPlaying ? "Playing preview..." : "Click to preview track"}</p>
                    </div>
                  </div>
                )}
                <div
                  onClick={() => musicInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:border-pink-500/50 hover:bg-pink-500/5 transition-all"
                >
                  <Upload className="mx-auto mb-2 text-gray-400" size={28} />
                  <p className="text-white font-medium mb-1">{uploading ? "Uploading..." : "Click to browse new audio track"}</p>
                  <p className="text-xs text-gray-500">MP3 or M4A formats</p>
                  <input ref={musicInputRef} type="file" accept="audio/*" className="hidden" onChange={e => handleMusicUpload(e.target.files[0])} />
                </div>
              </Card>

              <Card title="Voice Note / Personal Message" icon={Music}>
                {config.voiceNotePath && (
                  <audio ref={voiceRef} src={config.voiceNotePath} onEnded={() => setVoicePlaying(false)} />
                )}
                <p className="text-sm text-gray-400 mb-4">A direct voice recording or personal audio greeting to place on the wishes card.</p>
                {config.voiceNotePath && (
                  <div className="flex items-center gap-4 mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <button onClick={() => {
                      if (voicePlaying) { voiceRef.current?.pause(); setVoicePlaying(false); }
                      else { voiceRef.current?.play().catch(() => {}); setVoicePlaying(true); }
                    }} className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${voicePlaying ? "bg-pink-500" : "bg-white/10 hover:bg-white/20"}`}>
                      {voicePlaying ? <Pause size={16} fill="white" className="text-white" /> : <Play size={16} fill="white" className="text-white ml-0.5" />}
                    </button>
                    <div className="overflow-hidden">
                      <p className="text-sm text-white font-medium truncate">{config.voiceNotePath.split("/").pop()}</p>
                      <p className="text-xs text-gray-400">{voicePlaying ? "Playing message..." : "Click to preview voice note"}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* File Upload Zone */}
                  <div
                    onClick={() => voiceInputRef.current?.click()}
                    className="border-2 border-dashed border-white/20 rounded-2xl p-6 text-center cursor-pointer hover:border-pink-500/50 hover:bg-pink-500/5 transition-all flex flex-col items-center justify-center min-h-[140px]"
                  >
                    <Upload className="mb-2 text-gray-400" size={24} />
                    <p className="text-white font-medium text-xs mb-0.5">Click to browse audio file</p>
                    <p className="text-[10px] text-gray-500">MP3, M4A, WAV, AAC formats</p>
                    <input ref={voiceInputRef} type="file" accept="audio/*" className="hidden" onChange={e => handleVoiceUpload(e.target.files[0])} />
                  </div>

                  {/* Mic Recording Zone */}
                  {!recordingActive ? (
                    <div
                      onClick={startRecording}
                      className="border-2 border-dashed border-white/20 rounded-2xl p-6 text-center cursor-pointer hover:border-pink-500/50 hover:bg-pink-500/5 transition-all flex flex-col items-center justify-center min-h-[140px]"
                    >
                      <Mic className="mb-2 text-pink-400 animate-pulse" size={24} />
                      <p className="text-white font-medium text-xs mb-0.5">Record Voice in Browser</p>
                      <p className="text-[10px] text-gray-500">Speak into device mic to capture greeting directly</p>
                    </div>
                  ) : (
                    <div className="relative rounded-2xl border border-pink-500/30 bg-pink-500/5 p-4 flex flex-col items-center justify-center min-h-[140px]">
                      {/* Pulsing indicator */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                        <Radio size={16} className="text-red-400 animate-pulse" />
                        <span className="text-xs font-bold text-red-400 uppercase tracking-widest">RECORDING</span>
                      </div>
                      
                      {/* Timer */}
                      <div className="text-2xl font-bold text-white mb-4 font-mono">
                        {Math.floor(recDuration / 60).toString().padStart(2, "0")}:{Math.floor(recDuration % 60).toString().padStart(2, "0")}
                      </div>

                      {/* Action Controls */}
                      <div className="flex gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => stopRecording(true)}
                          className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-600 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <Square size={10} fill="white" /> Save & Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => stopRecording(false)}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                        >
                          Discard
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {tab === "ai" && (
            <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <Card title="AI Copywriter Assistant" icon={Sparkles}>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  Use your favorite AI (Gemini, Claude, ChatGPT, etc.) to write highly personalized, emotionally resonant greeting card messages! 
                  Just answer a few facts below, copy the prompt, and upload/paste the AI's generated response to instantly auto-fill all text fields.
                </p>

                <div className="space-y-4">
                  {/* Step 1: Input bullet points */}
                  <Field label="Step 1: Tell the AI about the recipient">
                    <p className="text-[11px] text-gray-500 mb-2">Write down some memories, hobbies, personality traits, past jobs, or unique qualities to make the card uniquely theirs.</p>
                    <textarea
                      className={textareaClass}
                      value={aiFacts}
                      onChange={e => setAiFacts(e.target.value)}
                      placeholder="e.g. He worked as an engineer for 40 years. He loves walking in the garden every morning. He has three grandkids he adores. He's always smiling and is a huge fan of old Bollywood music."
                      rows={4}
                    />
                  </Field>

                  {/* Step 2: Tone Selector */}
                  <Field label="Step 2: Choose the Tone/Vibe">
                    <select className={inputClass} value={aiTone} onChange={e => setAiTone(e.target.value)}>
                      <option value="Deeply Emotional & Touching">Deeply Emotional & Touching</option>
                      <option value="Witty, Funny & Playful">Witty, Funny & Playful</option>
                      <option value="Grand, Majestic & Respectful">Grand, Respectful & Honorific</option>
                      <option value="Poetic, Artful & Artistic">Poetic, Artful & Artistic</option>
                      <option value="Short, Sweet & Warm">Short, Sweet & Warm</option>
                    </select>
                  </Field>

                  {/* Step 3: Copy AI Prompt */}
                  <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                        <MessageSquare size={16} className="text-pink-400" />
                        Step 3: Copy Optimized AI Prompt
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generateAIPrompt());
                          showToast("Optimized AI prompt copied to clipboard!");
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-pink-500 hover:bg-pink-400 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
                      >
                        Copy Prompt
                      </button>
                    </div>
                    <textarea
                      className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-[11px] font-mono text-gray-400 h-40 focus:outline-none"
                      readOnly
                      value={generateAIPrompt()}
                    />
                  </div>

                  {/* Step 4: Import AI JSON */}
                  <div className="mt-6 border-t border-white/10 pt-6">
                    <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                      <Upload size={16} className="text-pink-400" />
                      Step 4: Paste or Upload AI JSON output
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">Paste the JSON response from your AI assistant below, or upload the generated `.json` file.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* JSON Textarea Paste */}
                      <textarea
                        className={`${textareaClass} font-mono text-xs`}
                        value={pastedJson}
                        onChange={e => setPastedJson(e.target.value)}
                        placeholder='Paste JSON here (e.g. {"landingTitle": "...", "wishCardTitle": "..."})'
                        rows={6}
                      />

                      {/* JSON File Upload */}
                      <div
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = ".json";
                          input.onchange = (e) => handleAIFilesUpload(e.target.files);
                          input.click();
                        }}
                        className="border-2 border-dashed border-white/20 rounded-2xl p-6 text-center cursor-pointer hover:border-pink-500/50 hover:bg-pink-500/5 transition-all flex flex-col items-center justify-center min-h-[140px]"
                      >
                        <Upload className="mb-2 text-gray-400" size={24} />
                        <p className="text-white font-medium text-xs mb-0.5">Click to upload JSON file</p>
                        <p className="text-[10px] text-gray-500">Supports standard .json file format</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyAIJson}
                      className="w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-md active:scale-95 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      🪄 Auto-Fill & Apply AI Copywriting
                    </button>
                  </div>
                </div>
              </Card>

              {/* Global Save */}
              <button onClick={handleSave} disabled={saving} className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 transition-all flex items-center justify-center gap-3 shadow-lg">
                <Save size={18} /> {saving ? "Saving Changes..." : "Save All Details"}
              </button>
            </motion.div>
          )}

          {tab === "settings" && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <Card title="Change Page Passcode" icon={Settings}>
                <p className="text-sm text-gray-400 mb-4">Set a secure edit password to prevent unauthorized modifications to this greeting.</p>
                <Field label="New Passcode (min 4 characters)">
                  <input
                    className={inputClass}
                    type="password"
                    placeholder="Enter passcode"
                    onChange={e => updateField("newEditPassword", e.target.value)}
                  />
                </Field>
                <button
                  onClick={async () => {
                    if (!config.newEditPassword || config.newEditPassword.length < 4) {
                      showToast("Passcode must be at least 4 characters", "error"); return;
                    }
                    const ok = await saveConfig({ newEditPassword: config.newEditPassword });
                    if (ok) {
                      showToast("Passcode updated successfully! Relogging...");
                      setTimeout(() => { sessionStorage.clear(); window.location.reload(); }, 1800);
                    } else {
                      showToast("Failed to save new passcode", "error");
                    }
                  }}
                  className="py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 transition-all text-sm shadow-md"
                >
                  Update Passcode
                </button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {toast && <Toast key={toast.message} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}

async function saveConfig(data) {
  const cardId = window.location.pathname.split("/")[2];
  const pw = sessionStorage.getItem(`edit_password_${cardId}`) || "";
  const res = await fetch(`/api/config?cardId=${cardId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-password": pw },
    body: JSON.stringify(data),
  });
  return res.ok;
}
