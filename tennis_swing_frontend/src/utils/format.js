// PUBLIC_INTERFACE
export function formatAngle(angle) {
  /** Format angle value for UI. */
  if (angle == null || !Number.isFinite(Number(angle))) return "—";
  return `${Math.round(Number(angle))}°`;
}

// PUBLIC_INTERFACE
export function formatSpeed(speed, unit = "mph") {
  /** Format speed value for UI. */
  if (speed == null || !Number.isFinite(Number(speed))) return "—";
  return `${Math.round(Number(speed))} ${unit}`;
}

// PUBLIC_INTERFACE
export function humanFileSize(bytes) {
  /** Human-friendly file size formatting. */
  if (!Number.isFinite(bytes)) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let idx = 0;
  while (size >= 1024 && idx < units.length - 1) {
    size /= 1024;
    idx += 1;
  }
  return `${size.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}
