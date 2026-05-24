"use client";
import { useState, useEffect } from "react";
import IntroCard from "./components/IntroCard";
import BalloonGame from "./components/BalloonGame";
import BirthdayCake from "./components/BirthdayCake";
import GiftBox from "./components/GiftBox";
import Gallery from "./components/Gallery";
import AudioEngine from "./components/AudioEngine";
import LoadingOverlay from "./components/LoadingOverlay";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [step, setStep] = useState("intro"); // intro | game | cake | gift | gallery
  const [loading, setLoading] = useState(false);

  // Show loading overlay briefly on step change
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [step]);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  return (
    <>
      <LoadingOverlay visible={loading} />
      <AnimatePresence mode="wait">
        <motion.main
          key={step}
          className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4"
          variants={pageVariants}
          initial="initial"
          animate="in"
          exit="out"
          transition={{ duration: 0.5 }}
        >
          {/* Central audio manager */}
          <AudioEngine currentStep={step} />
          {step === "intro" && <IntroCard onStart={() => setStep("game")} />}
          {step === "game" && <BalloonGame onComplete={() => setStep("cake")} />}
          {step === "cake" && <BirthdayCake onBlow={() => setStep("gift")} />}
          {step === "gift" && <GiftBox onOpen={() => setStep("gallery")} />}
          {step === "gallery" && <Gallery />}
        </motion.main>
      </AnimatePresence>
    </>
  );
}
