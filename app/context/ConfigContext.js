// app/context/ConfigContext.js
"use client";
import { createContext, useContext, useEffect, useState } from "react";

const DEFAULT_CONFIG = {
  occasion: "birthday",
  recipientName: "Friend",
  age: 0,
  heroImagePath: "",
  landingTitle: "Happy Birthday",
  landingSubtitle: "Get ready to experience a personalized journey full of memories, joy, and a few surprises.",
  wishCardTitle: "Best Wishes!",
  wishCardBody1: "Wishing you a wonderful celebration filled with joy, laughter, and beautiful moments. You deserve all the happiness in the world.",
  wishCardBody2: "May this special occasion bring you closer to your dreams and fill your heart with peace, warmth, and endless smiles.",
  wishCardClosing: "Celebrating you today and always.",
  signers: [],
  giftBoxMessage: "Wishing you endless joy & health!",
  galleryTitle: "Moments & Memories",
  gallerySubtitle: "A beautiful collection of shared chapters and special highlights.",
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
        // If it was a specific cardId (and not "default"), set notFound state
        if (cardId && cardId !== "default") {
          setConfig({ notFound: true });
        } else {
          setConfig(DEFAULT_CONFIG);
        }
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
