/**
 * Lightweight API client for the Tennis Swing Analyzer frontend.
 * - Resolves backend base URL from env vars
 * - Calls /analyze with multipart/form-data
 * - Normalizes response keys defensively
 */

const DEFAULT_ANALYZE_PATH = "/analyze";

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Resolve backend base URL from env vars. Returns empty string when not configured. */
  const base =
    (process.env.REACT_APP_API_BASE || "").trim() ||
    (process.env.REACT_APP_BACKEND_URL || "").trim();

  // Normalize: remove trailing slashes for safe URL join
  return base.replace(/\/+$/, "");
}

function coerceNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function normalizeDirection(raw) {
  if (!raw) return "neutral";
  const s = String(raw).toLowerCase().trim();
  if (s.includes("fore")) return "forehand";
  if (s.includes("back")) return "backhand";
  if (s.includes("neutral")) return "neutral";
  return String(raw).trim();
}

function pickFirst(obj, keys) {
  for (const k of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null) {
      return obj[k];
    }
  }
  return undefined;
}

// PUBLIC_INTERFACE
export function normalizeAnalysisResponse(payload) {
  /**
   * Normalize backend response (tolerate alternative keys).
   * Expected normalized shape:
   * { direction: string, angle: number|null, speed: number|null, feedback: string }
   */
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid JSON response (expected an object).");
  }

  const directionRaw = pickFirst(payload, [
    "direction",
    "swing_direction",
    "swingDirection",
    "swing_type",
    "swingType",
  ]);

  const angleRaw = pickFirst(payload, ["angle", "swing_angle", "swingAngle", "degrees", "deg"]);
  const speedRaw = pickFirst(payload, ["speed", "swing_speed", "swingSpeed", "velocity", "mph", "kph"]);

  const feedbackRaw = pickFirst(payload, ["feedback", "message", "notes", "validation", "comment"]);

  const angle = coerceNumber(angleRaw);
  const speed = coerceNumber(speedRaw);

  return {
    direction: normalizeDirection(directionRaw),
    angle,
    speed,
    feedback: feedbackRaw ? String(feedbackRaw) : "",
    _raw: payload,
  };
}

// PUBLIC_INTERFACE
export async function analyzeVideoFile(file, { signal } = {}) {
  /** Upload the provided video file to the backend /analyze endpoint. */
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    const err = new Error("No backend configured");
    err.code = "NO_BACKEND";
    throw err;
  }

  const url = `${baseUrl}${DEFAULT_ANALYZE_PATH}`;
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(url, {
    method: "POST",
    body: form,
    signal,
  });

  if (!res.ok) {
    let bodyText = "";
    try {
      bodyText = await res.text();
    } catch {
      // ignore
    }
    const err = new Error(`Request failed (${res.status})`);
    err.code = "HTTP_ERROR";
    err.status = res.status;
    err.details = bodyText;
    throw err;
  }

  let json;
  try {
    json = await res.json();
  } catch (e) {
    const err = new Error("Failed to parse JSON response");
    err.code = "BAD_JSON";
    err.cause = e;
    throw err;
  }

  return normalizeAnalysisResponse(json);
}

function hashStringToInt(str) {
  // Deterministic simple hash (not cryptographic)
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// PUBLIC_INTERFACE
export function demoAnalyzeVideoFile(file) {
  /**
   * Demo mode analysis to keep UI functional without a backend.
   * Deterministic based on filename.
   */
  const seed = hashStringToInt(file?.name || "demo");
  const directions = ["forehand", "backhand", "neutral"];
  const direction = directions[seed % directions.length];

  // Plausible values
  const angle = 10 + (seed % 36); // 10..45 degrees
  const speed = 55 + (seed % 46); // 55..100 mph

  const feedbackOptions = {
    forehand: "Good shoulder rotation. Keep your wrist stable through contact for cleaner topspin.",
    backhand: "Nice unit turn. Try to finish higher to improve depth and control.",
    neutral: "Balanced swing path. Focus on timing and consistent contact point.",
  };

  return Promise.resolve({
    direction,
    angle,
    speed,
    feedback: feedbackOptions[direction] || "Solid swing. Keep practicing consistent footwork.",
    _demo: true,
  });
}
