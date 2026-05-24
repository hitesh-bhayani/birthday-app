// app/admin/layout.js
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function AdminLayout({ children }) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_authed");
    if (stored === "1") setAuthed(true);
    setChecking(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": password },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        sessionStorage.setItem("admin_authed", "1");
        sessionStorage.setItem("admin_password", password);
        setAuthed(true);
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch {
      setError("Connection error. Is the server running?");
    }
    setLoading(false);
  };

  if (checking) return null;

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="absolute top-[-10%] left-[-10%] h-[40rem] w-[40rem] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[40rem] w-[40rem] rounded-full bg-pink-600/20 blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-sm"
        >
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 opacity-20 blur-lg" />
          <form
            onSubmit={handleLogin}
            className="relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-pink-500/20 border border-pink-500/30 mx-auto mb-6">
              <Lock className="text-pink-400" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white text-center mb-1">Admin Panel</h1>
            <p className="text-gray-400 text-sm text-center mb-6">Birthday App Control Center</p>

            <div className="relative mb-4">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500/50 focus:bg-white/8 transition-all pr-12"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-sm text-center mb-4"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Verifying..." : "Enter Admin Panel"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
