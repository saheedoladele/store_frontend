import { useEffect, useRef, useState, useCallback } from "react";

interface UseIdleTimeoutOptions {
  warningTime?: number; // Time in milliseconds before showing warning (default: 2 minutes)
  logoutTime?: number; // Time in milliseconds before auto-logout (default: 3 minutes)
  onWarning?: () => void;
  onLogout?: () => void;
  enabled?: boolean; // Whether the idle timeout is enabled
}

export const useIdleTimeout = ({
  warningTime = 2 * 60 * 1000, // 2 minutes
  logoutTime = 3 * 60 * 1000, // 3 minutes
  onWarning,
  onLogout,
  enabled = true,
}: UseIdleTimeoutOptions) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimers = useCallback(() => {
    if (!enabled) return;

    const now = Date.now();
    lastActivityRef.current = now;

    // Clear existing timers
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    // Hide warning if it was showing
    setShowWarning(false);
    setTimeRemaining(0);

    // Set warning timer (2 minutes)
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
      const timeUntilLogout = logoutTime - warningTime;
      setTimeRemaining(timeUntilLogout);

      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1000;
          if (newTime <= 0) {
            // Clear interval when time reaches 0
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            return 0;
          }
          return newTime;
        });
      }, 1000);

      // Call onWarning callback
      if (onWarning) {
        onWarning();
      }
    }, warningTime);

    // Set logout timer (3 minutes total)
    logoutTimerRef.current = setTimeout(() => {
      // Clear countdown interval if it exists
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setShowWarning(false);
      setTimeRemaining(0);
      
      if (onLogout) {
        onLogout();
      }
    }, logoutTime);
  }, [enabled, warningTime, logoutTime, onWarning, onLogout]);

  const handleActivity = useCallback(() => {
    if (!enabled) return;
    resetTimers();
  }, [enabled, resetTimers]);

  const handleStayLoggedIn = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  const handleLogout = useCallback(() => {
    // Clear all timers
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setShowWarning(false);
    setTimeRemaining(0);

    if (onLogout) {
      onLogout();
    }
  }, [onLogout]);

  useEffect(() => {
    if (!enabled) {
      // Clear timers if disabled
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      setShowWarning(false);
      setTimeRemaining(0);
      return;
    }

    // Initialize timers
    resetTimers();

    // Track user activity events
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });

      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [enabled, handleActivity, resetTimers]);

  return {
    showWarning,
    timeRemaining,
    handleStayLoggedIn,
    handleLogout,
  };
};
