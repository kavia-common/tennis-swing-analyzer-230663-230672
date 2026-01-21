import React, { useEffect, useMemo } from "react";
import styles from "./VideoPreview.module.css";

// PUBLIC_INTERFACE
export default function VideoPreview({ file }) {
  /** Render a lightweight preview for a selected local video file. */
  const url = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  if (!file || !url) return null;

  return (
    <div className={styles.wrap} aria-label="Selected video preview">
      <video className={styles.video} src={url} controls preload="metadata" />
    </div>
  );
}
