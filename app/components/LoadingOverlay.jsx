// app/components/LoadingOverlay.jsx
"use client";
import styles from "./LoadingOverlay.module.css";

export default function LoadingOverlay({ visible }) {
  if (!visible) return null;
  return (
    <div className={styles.overlay} aria-live="polite" aria-label="Loading">
      <div className={styles.spinner}></div>
    </div>
  );
}
