// app/components/IntroCard.jsx
"use client";
import { motion } from "framer-motion";
import styles from "./IntroCard.module.css";

export default function IntroCard({ onStart }) {
  return (
    <section className={styles.heroSection}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className={styles.title}>Happy 70th Birthday!</h1>
        <p className={styles.from}>From: Your Loved Ones</p>
        <motion.button
          className={styles.startBtn}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
        >
          Start Surprise
        </motion.button>
      </motion.div>
    </section>
  );
}
