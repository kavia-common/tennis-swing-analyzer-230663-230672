import React from "react";
import styles from "./ResultsPanel.module.css";
import { formatAngle, formatSpeed } from "../utils/format";

function Badge({ label, value, tone = "primary" }) {
  return (
    <div className={`${styles.badge} ${styles[`tone_${tone}`]}`}>
      <div className={styles.badgeLabel}>{label}</div>
      <div className={styles.badgeValue}>{value}</div>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function ResultsPanel({ result, error, isLoading, speedUnit = "mph" }) {
  /** Display analysis results (or states). */
  return (
    <section className={styles.section} aria-labelledby="results-title">
      <div className={styles.header}>
        <h2 id="results-title" className={styles.title}>
          Results
        </h2>
        <p className={styles.help}>
          Direction, angle and speed will appear here after analysis.
        </p>
      </div>

      <div
        className={styles.panel}
        role="status"
        aria-live="polite"
        aria-busy={isLoading ? "true" : "false"}
      >
        {isLoading ? (
          <div className={styles.stateRow}>
            <div className={styles.spinner} aria-hidden="true" />
            <div>
              <div className={styles.stateTitle}>Analyzing video…</div>
              <div className={styles.stateHint}>This may take a few seconds.</div>
            </div>
          </div>
        ) : error ? (
          <div className={styles.errorBox} role="alert">
            <div className={styles.errorTitle}>Analysis failed</div>
            <div className={styles.errorMsg}>{error}</div>
          </div>
        ) : result ? (
          <>
            <div className={styles.badges} role="list" aria-label="Analysis summary">
              <div role="listitem">
                <Badge
                  label="Direction"
                  value={String(result.direction || "neutral")}
                  tone="primary"
                />
              </div>
              <div role="listitem">
                <Badge label="Angle" value={formatAngle(result.angle)} tone="amber" />
              </div>
              <div role="listitem">
                <Badge
                  label="Speed"
                  value={formatSpeed(result.speed, speedUnit)}
                  tone="success"
                />
              </div>
            </div>

            <div className={styles.details}>
              <div className={styles.detailsTitle}>Feedback</div>
              <div className={styles.detailsBody}>
                {result.feedback
                  ? result.feedback
                  : "No additional feedback was provided. Try another clip for more context."}
              </div>
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            Upload a tennis swing video and click <strong>Analyze</strong> to get started.
          </div>
        )}
      </div>
    </section>
  );
}
