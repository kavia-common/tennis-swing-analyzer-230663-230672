import React from "react";
import styles from "./Navbar.module.css";

// PUBLIC_INTERFACE
export default function Navbar({ mode }) {
  /** Top navbar with app title and active mode indicator. */
  return (
    <header className={styles.nav} role="banner">
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logoMark} aria-hidden="true" />
          <div className={styles.titleBlock}>
            <div className={styles.title}>Tennis Swing Analyzer</div>
            <div className={styles.subtitle}>Direction • Angle • Speed</div>
          </div>
        </div>

        <div className={styles.right}>
          <span className={styles.modeLabel}>Mode</span>
          <span
            className={`${styles.pill} ${
              mode === "backend" ? styles.pillPrimary : styles.pillAmber
            }`}
            aria-label={`Active mode: ${mode === "backend" ? "Backend" : "Demo"}`}
            title={
              mode === "backend"
                ? "Backend configured: results come from API"
                : "Demo mode: results are generated locally"
            }
          >
            {mode === "backend" ? "Backend" : "Demo"}
          </span>
        </div>
      </div>
    </header>
  );
}
