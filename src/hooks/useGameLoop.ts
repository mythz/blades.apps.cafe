import { useEffect, useRef } from 'react';

export function useGameLoop(callback: (deltaTime: number) => void, isRunning: boolean): void {
  const callbackRef = useRef(callback);

  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isRunning) return;

    let lastTime = performance.now();
    let animationFrameId: number;

    const loop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
      lastTime = currentTime;

      // Cap deltaTime to prevent spiral of death
      const cappedDelta = Math.min(deltaTime, 0.1);

      callbackRef.current(cappedDelta);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRunning]);
}
