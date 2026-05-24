// app/components/AudioEngine.jsx
"use client";
import { useEffect } from "react";

// Simple placeholder that could manage audio based on current step.
export default function AudioEngine({ currentStep }) {
  useEffect(() => {
    // TODO: implement audio handling (ambient, cinematic, celebration)
    console.log("AudioEngine mounted, step:", currentStep);
  }, [currentStep]);

  return null; // No UI, just manages audio.
}
