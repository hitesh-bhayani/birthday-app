// app/context/ConfigContext.js
"use client";
import { createContext, useContext, useEffect, useState } from "react";

const DEFAULT_CONFIG = {
  occasion: "birthday",
  recipientName: "Mummy",
  age: 70,
  heroImagePath: "/original_images/PREM2902.JPG",
  landingTitle: "Happy Birthday",
  landingSubtitle: "Get ready to experience a personalized journey full of memories, joy, and a few surprises.",
  wishCardTitle: "Happy 70th Birthday!",
  wishCardBody1: "Seven decades of incredible stories, boundless wisdom, and a heart that has touched so many lives. Your presence has always been our greatest comfort.",
  wishCardBody2: "You have built a legacy of love and unwavering kindness. Know that you are deeply cherished — not just for what you have done, but for the beautiful person you are.",
  wishCardClosing: "Here's to many more sweet memories to come.",
  signers: [
    { name: "Jhankar", role: "Daughter" },
    { name: "Hitesh", role: "Son-in-law" },
    { name: "Dhruv", role: "Grandson" },
  ],
  giftBoxMessage: "Wishing you endless joy & health!",
  galleryTitle: "Happy 70th Birthday!",
  gallerySubtitle: "A lifetime of memories, and so many more to make. Thank you for being you.",
  musicPath: "/birthday-music.mp3",
};

const ConfigContext = createContext(DEFAULT_CONFIG);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect cardId from path /wish/[id] or /wish/[id]/edit or query search ?cardId=xxx
    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    let cardId = searchParams.get("cardId");
    
    if (!cardId) {
      const match = pathname.match(/\/wish\/([a-zA-Z0-9_-]+)/);
      if (match) {
        cardId = match[1];
      }
    }

    const url = cardId ? `/api/config?cardId=${cardId}` : "/api/config";

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setConfig({ ...DEFAULT_CONFIG, ...data });
      })
      .catch(() => {
        // Fall back to defaults (or empty state if not on default path)
        setConfig(DEFAULT_CONFIG);
      });
  }, []);

  return (
    <ConfigContext.Provider value={config || DEFAULT_CONFIG}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  return useContext(ConfigContext);
}
