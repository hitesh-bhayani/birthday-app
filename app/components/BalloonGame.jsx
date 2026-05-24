// app/components/BalloonGame.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import styles from "./BalloonGame.module.css";

export default function BalloonGame({ onComplete }) {
  const [popped, setPopped] = useState(0);
  const target = 8;
  const balloonRefs = useRef([]);

  // Apply floating animation using GSAP
  useEffect(() => {
    balloonRefs.current.forEach((balloon, i) => {
      if (!balloon) return;
      const tl = gsap.timeline({ repeat: -1, yoyo: true, delay: i * 0.2 });
      tl.to(balloon, { y: -30, duration: 2, ease: "sine.inOut" })
        .to(balloon, { y: 20, duration: 2, ease: "sine.inOut" });
    });
  }, []);

  const handlePop = (idx) => {
    setPopped((prev) => {
      const newCount = prev + 1;
      // Remove balloon after pop animation
      const ball = balloonRefs.current[idx];
      if (ball) {
        gsap.to(ball, { scale: 0, opacity: 0, duration: 0.4 });
      }
      return newCount;
    });
  };

  // Call onComplete when target reached
  useEffect(() => {
    if (popped >= target && onComplete) {
      onComplete();
    }
  }, [popped, target, onComplete]);

  const balloons = Array.from({ length: 12 }).map((_, i) => (
    <motion.div
      key={i}
      className={styles.balloon}
      ref={(el) => (balloonRefs.current[i] = el)}
      whileHover={{ scale: 1.1 }}
      onClick={() => handlePop(i)}
    />
  ));

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Pop {target - popped} more balloons!</h2>
      <div className={styles.grid}>{balloons}</div>
    </section>
  );
}
