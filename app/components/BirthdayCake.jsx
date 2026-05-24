// app/components/BirthdayCake.jsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./BirthdayCake.module.css";

export default function BirthdayCake({ onBlow }) {
  const handleClick = () => {
    if (onBlow) onBlow();
  };

  return (
    <section className={styles.container}>
      <motion.div
        className={styles.cake}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Simple SVG cake */}
        <svg viewBox="0 0 200 200" className={styles.svg}>
          <rect width="150" height="80" x="25" y="80" fill="#ff6b6b" rx="10" />
          <rect width="150" height="20" x="25" y="60" fill="#ff4d4d" rx="5" />
          <circle cx="65" cy="50" r="6" fill="#fff" />
          <circle cx="95" cy="50" r="6" fill="#fff" />
          <circle cx="125" cy="50" r="6" fill="#fff" />
          <circle cx="155" cy="50" r="6" fill="#fff" />
        </svg>
      </motion.div>
      <p className={styles.instruction}>Click the cake to blow out the candles</p>
    </section>
  );
}
