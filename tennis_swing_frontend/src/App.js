import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import UploadCard from "./components/UploadCard";
import ResultsPanel from "./components/ResultsPanel";

import { analyzeVideoFile, demoAnalyzeVideoFile, getApiBaseUrl } from "./api/client";

const SPEED_UNIT = "mph";

// PUBLIC_INTERFACE
function App() {
  /** Main single-page app: upload -> analyze -> results (backend or demo fallback). */
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [mode, setMode] = useState(() => (getApiBaseUrl() ? "backend" : "demo"));

  const abortRef = useRef(null);

  const backendConfigured = useMemo(() => Boolean(getApiBaseUrl()), []);

  useEffect(() => {
    // Keep mode aligned on first render
    setMode(backendConfigured ? "backend" : "demo");
  }, [backendConfigured]);

  const reset = useCallback(() => {
    abortRef.current?.abort?.();
    abortRef.current = null;
    setFile(null);
    setResult(null);
    setErrorMsg("");
    setIsLoading(false);
    setMode(backendConfigured ? "backend" : "demo");
  }, [backendConfigured]);

  const analyze = useCallback(async () => {
    if (!file || isLoading) return;

    setErrorMsg("");
    setIsLoading(true);
    setResult(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Try backend when configured
      if (getApiBaseUrl()) {
        const r = await analyzeVideoFile(file, { signal: controller.signal });
        setResult(r);
        setMode("backend");
        return;
      }

      // No backend configured => demo mode
      const r = await demoAnalyzeVideoFile(file);
      setResult(r);
      setMode("demo");
    } catch (e) {
      // If backend fails, fall back to demo mode so UI remains functional.
      // Also show a gentle warning in error area.
      const msg =
        e?.name === "AbortError"
          ? "Analysis cancelled."
          : e?.code === "NO_BACKEND"
          ? "No backend configured. Using Demo Analysis."
          : "Request failed. Using Demo Analysis.";

      // If user aborted, do not run demo automatically unless they retry.
      if (e?.name === "AbortError") {
        setErrorMsg(msg);
        return;
      }

      try {
        const demo = await demoAnalyzeVideoFile(file);
        setResult(demo);
        setMode("demo");
        setErrorMsg(msg);
      } catch {
        setErrorMsg("Unable to analyze in demo mode. Please try a different file.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [file, isLoading]);

  return (
    <div className="App">
      <Navbar mode={mode} />

      <main className="main" role="main">
        <UploadCard
          file={file}
          setFile={(f) => {
            setErrorMsg("");
            setResult(null);
            setFile(f);
          }}
          isLoading={isLoading}
          onAnalyze={analyze}
          onReset={reset}
          mode={mode}
          error={errorMsg}
        />

        <ResultsPanel result={result} error={errorMsg && !result ? errorMsg : ""} isLoading={isLoading} speedUnit={SPEED_UNIT} />

        <div className="footerNote">
          {backendConfigured ? (
            <span>
              Backend URL detected via <code>REACT_APP_API_BASE</code> or <code>REACT_APP_BACKEND_URL</code>.
            </span>
          ) : (
            <span>
              No backend configured. The app will run in Demo mode by default.
            </span>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
