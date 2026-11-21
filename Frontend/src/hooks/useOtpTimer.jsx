import { useState, useEffect, useCallback } from "react";

export const useOtpTimer = (initialSeconds = 30) => {
  const [timer, setTimer] = useState(initialSeconds);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const resetTimer = useCallback(
    (seconds = initialSeconds) => {
      setTimer(seconds);
    },
    [initialSeconds]
  );

  return {
    timer,
    canResend: timer === 0,
    resetTimer,
  };
};

export default useOtpTimer;

