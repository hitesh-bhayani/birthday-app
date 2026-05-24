// app/components/GiftBox.jsx
"use client";
import { motion } from "framer-motion";
import styles from "./GiftBox.module.css";

export default function GiftBox({ onOpen }) {
  const handleDragEnd = (event, info) => {
    // Open if dragged sufficiently
    if (Math.abs(info.offset.x) > 100 || Math.abs(info.offset.y) > 100) {
      if (onOpen) onOpen();
    }
  };

  return (
    <section className={styles.container}>
      <motion.div
        className={styles.box}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        🎁
      </motion.div>
      <p className={styles.instruction}>Drag the gift box to open it</p>
    </section>
  );
}
