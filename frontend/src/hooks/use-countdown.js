'use client';

import { useState, useEffect, useCallback } from 'react';
export function useCountdown({
  initialMinutes,
  onExpire,
  isStarted = true
}) {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  useEffect(() => {
    if (!isStarted) return;
    
    if (totalSeconds <= 0) {
      onExpire?.();
      return;
    }
    const interval = setInterval(() => {
      setTotalSeconds(prev => {
        if (prev <= 1) {
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [totalSeconds, onExpire, isStarted]);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isExpired = totalSeconds <= 0;
  const isWarning = totalSeconds <= 120 && totalSeconds > 60;
  const isCritical = totalSeconds <= 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return {
    minutes,
    seconds,
    totalSeconds,
    isExpired,
    isWarning,
    isCritical,
    formattedTime
  };
}
export function useBookingTimer(expiresAt, onExpire) {
  const calculateRemaining = useCallback(() => {
    if (!expiresAt) return 0;
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    return Math.max(0, Math.floor((expiry - now) / 1000));
  }, [expiresAt]);
  const [totalSeconds, setTotalSeconds] = useState(calculateRemaining);
  useEffect(() => {
    setTotalSeconds(calculateRemaining());
  }, [calculateRemaining]);
  useEffect(() => {
    if (totalSeconds <= 0) {
      onExpire?.();
      return;
    }
    const interval = setInterval(() => {
      setTotalSeconds(prev => {
        if (prev <= 1) {
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [totalSeconds, onExpire]);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isExpired = totalSeconds <= 0;
  const isWarning = totalSeconds <= 120 && totalSeconds > 60;
  const isCritical = totalSeconds <= 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return {
    minutes,
    seconds,
    totalSeconds,
    isExpired,
    isWarning,
    isCritical,
    formattedTime
  };
}