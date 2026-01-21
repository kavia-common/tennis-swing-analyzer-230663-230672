import React, { useId, useMemo, useRef, useState } from "react";
import styles from "./UploadCard.module.css";
import VideoPreview from "./VideoPreview";
import { humanFileSize } from "../utils/format";

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime"]; // mp4, mov
const ACCEPTED_EXT = [".mp4", ".mov"];
const MAX_BYTES = 200 * 1024 * 1024; // ~200MB

function isAcceptedFile(file) {
  if (!file) return false;

  // Prefer MIME type, but allow extension fallback for some browsers.
  const typeOk = ACCEPTED_TYPES.includes(file.type);
  const name = (file.name || "").toLowerCase();
  const extOk = ACCEPTED_EXT.some((ext) => name.endsWith(ext));

  return typeOk || extOk;
}

// PUBLIC_INTERFACE
export default function UploadCard({
  file,
  setFile,
  isLoading,
  onAnalyze,
  onReset,
  mode,
  error,
}) {
  /** Upload card with drag-and-drop and file picker. */
  const inputId = useId();
  const inputRef = useRef(null);
  const [localError, setLocalError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const effectiveError = localError || error || "";

  const acceptAttr = useMemo(() => ACCEPTED_EXT.join(","), []);

  function validateAndSetFile(next) {
    setLocalError("");

    if (!next) return;

    if (!isAcceptedFile(next)) {
      setLocalError("Please choose an MP4 or MOV video.");
      return;
    }

    if (next.size > MAX_BYTES) {
      setLocalError(`File too large (${humanFileSize(next.size)}). Max is 200 MB.`);
      return;
    }

    setFile(next);
  }

  function onInputChange(e) {
    const f = e.target.files && e.target.files[0];
    validateAndSetFile(f || null);
  }

  function openPicker() {
    setLocalError("");
    inputRef.current?.click();
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    validateAndSetFile(f || null);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  return (
    <section className={styles.section} aria-labelledby="upload-title">
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 id="upload-title" className={styles.title}>
            Upload your swing video
          </h1>
          <p className={styles.subtitle}>
            Submit an MP4/MOV clip. We’ll estimate <strong>direction</strong>,{" "}
            <strong>angle</strong> and <strong>speed</strong>.
          </p>
        </div>

        <div
          className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ""}`}
          role="button"
          tabIndex={0}
          aria-label="Drag and drop a video file here, or open file picker"
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") openPicker();
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className={styles.dzInner}>
            <div className={styles.icon} aria-hidden="true">
              ⬆
            </div>
            <div className={styles.dzText}>
              <div className={styles.dzTitle}>Drag & drop your video</div>
              <div className={styles.dzHint}>
                or <span className={styles.linkLike}>browse files</span> (MP4/MOV, max 200MB)
              </div>
            </div>
          </div>

          <input
            id={inputId}
            ref={inputRef}
            className={styles.fileInput}
            type="file"
            accept={acceptAttr}
            onChange={onInputChange}
            aria-label="Choose a video file"
          />
        </div>

        {effectiveError ? (
          <div className={styles.error} role="alert" aria-live="assertive">
            {effectiveError}
          </div>
        ) : null}

        {file ? (
          <div className={styles.fileRow}>
            <div className={styles.fileMeta}>
              <div className={styles.fileName}>{file.name}</div>
              <div className={styles.fileInfo}>
                {humanFileSize(file.size)} • {file.type || "video"}
              </div>
            </div>
            <button
              type="button"
              className={styles.smallBtn}
              onClick={onReset}
              disabled={isLoading}
            >
              Remove
            </button>
          </div>
        ) : null}

        <VideoPreview file={file} />

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={onAnalyze}
            disabled={!file || isLoading}
            aria-disabled={!file || isLoading ? "true" : "false"}
          >
            {isLoading ? "Analyzing…" : "Analyze"}
          </button>

          <div className={styles.modeNote} aria-live="polite">
            {mode === "backend" ? (
              <span>
                Backend configured. Results will be fetched from your API.
              </span>
            ) : (
              <span>
                Demo mode active. Results are generated locally if backend isn’t configured or fails.
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
