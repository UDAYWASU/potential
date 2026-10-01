import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  enabled: boolean;
  maxViolations: number;
  onViolation?: (type: string, count: number) => void;
  onLimitReached: () => void;
};

// True for real Fullscreen API mode, or a window that fills the whole screen (F11 mode)
const isFs = () =>
  !!document.fullscreenElement ||
  (window.innerHeight === screen.height && window.innerWidth === screen.width);

export function useExamProctoring({ enabled, maxViolations, onViolation, onLimitReached }: Options) {
  const [violations, setViolations] = useState(0);
  const [warning, setWarning] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(isFs());

  const countRef = useRef(0);
  const lastRef = useRef(0);
  const cbRef = useRef({ onViolation, onLimitReached });
  cbRef.current = { onViolation, onLimitReached };

  const record = useCallback(
    (type: string, message: string) => {
      const now = Date.now();
      if (now - lastRef.current < 1500) return; // one action often fires blur + visibilitychange + fullscreenchange
      lastRef.current = now;

      countRef.current += 1;
      setViolations(countRef.current);
      setWarning(message);
      cbRef.current.onViolation?.(type, countRef.current);

      if (countRef.current >= maxViolations) cbRef.current.onLimitReached();
    },
    [maxViolations],
  );

  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(isFs());
      // Chromium only: makes Esc require a long-press instead of exiting instantly
      await (navigator as any).keyboard?.lock?.(["Escape"]);
    } catch {
      setIsFullscreen(isFs());
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    (navigator as any).keyboard?.unlock?.();
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  // Always keep isFullscreen in sync, regardless of `enabled`
  useEffect(() => {
    const sync = () => setIsFullscreen(isFs());
    sync(); // catch changes that happened before this listener existed
    document.addEventListener("fullscreenchange", sync);
    window.addEventListener("resize", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    setIsFullscreen(isFs()); // resync the moment proctoring starts

    const stop = (e: Event) => e.preventDefault();

    const onVisibility = () => {
      if (document.hidden) record("tab_switch", "You left the test tab.");
    };
    const onBlur = () => record("window_blur", "The test window lost focus.");
    const onFullscreen = () => {
      if (!document.fullscreenElement) record("fullscreen_exit", "You exited full screen mode.");
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      const devtools =
        e.key === "F12" ||
        (mod && e.shiftKey && ["i", "j", "c", "k"].includes(k)) ||
        (e.metaKey && e.altKey && ["i", "j", "c"].includes(k));
      const blocked =
        devtools ||
        e.key === "F5" ||
        e.key === "PrintScreen" ||
        (mod && ["c", "v", "x", "p", "s", "u", "r", "f", "g", "o", "l", "t", "n", "w"].includes(k)) ||
        (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowRight"));

      if (e.key === "PrintScreen") navigator.clipboard?.writeText("").catch(() => {});
      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        if (devtools) record("devtools_shortcut", "Developer tools are not allowed.");
      }
    };

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    // Trap the browser back button
    history.pushState(null, "", location.href);
    const onPopState = () => history.pushState(null, "", location.href);

    document.addEventListener("contextmenu", stop);
    document.addEventListener("copy", stop);
    document.addEventListener("cut", stop);
    document.addEventListener("paste", stop);
    document.addEventListener("dragstart", stop);
    document.addEventListener("drop", stop);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreen);
    window.addEventListener("blur", onBlur);
    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("beforeunload", onBeforeUnload);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("contextmenu", stop);
      document.removeEventListener("copy", stop);
      document.removeEventListener("cut", stop);
      document.removeEventListener("paste", stop);
      document.removeEventListener("dragstart", stop);
      document.removeEventListener("drop", stop);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFullscreen);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("popstate", onPopState);
    };
  }, [enabled, record]);

  return {
    violations,
    warning,
    isFullscreen,
    clearWarning: () => setWarning(null),
    enterFullscreen,
    exitFullscreen,
  };
}