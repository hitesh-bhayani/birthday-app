// app/components/ThemeToggle.jsx
"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    const className = "dark";
    const html = document.documentElement;
    if (dark) {
      html.classList.add(className);
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove(className);
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="fixed top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded-md hover:bg-gray-700 transition"
      aria-label="Toggle dark mode"
    >
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
