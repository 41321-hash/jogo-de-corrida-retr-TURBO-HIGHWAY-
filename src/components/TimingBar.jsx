import React, { useState, useEffect, useRef } from 'react';
import { audio } from '../utils/audio';

export default function TimingBar({ onStrike }) {
  const [cursorPos, setCursorPos] = useState(0);
  const [hasStruck, setHasStruck] = useState(false);
  const posRef = useRef(0);
  const dirRef = useRef(1);
  const speedRef = useRef(120);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(performance.now());

  useEffect(() => {
    lastTimeRef.current = performance.now();

    const loop = (time) => {
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (!hasStruck) {
        let nextPos = posRef.current + dirRef.current * speedRef.current * dt;
        if (nextPos >= 100) {
          nextPos = 100;
          dirRef.current = -1;
        } else if (nextPos <= 0) {
          nextPos = 0;
          dirRef.current = 1;
        }
        posRef.current = nextPos;
        setCursorPos(nextPos);
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);

    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        triggerStrike();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasStruck]);

  const triggerStrike = () => {
    if (hasStruck) return;
    setHasStruck(true);
    cancelAnimationFrame(animFrameRef.current);

    const currentPos = posRef.current;
    const distFromCenter = Math.abs(currentPos - 50);

    let damage = 0;
    if (distFromCenter <= 3.5) {
      damage = Math.floor(28 + Math.random() * 8);
    } else if (distFromCenter <= 10) {
      damage = Math.floor(20 + Math.random() * 6);
    } else if (distFromCenter <= 22) {
      damage = Math.floor(12 + Math.random() * 6);
    } else if (distFromCenter <= 38) {
      damage = Math.floor(5 + Math.random() * 5);
    } else {
      damage = 0;
    }

    audio.playSlash();

    setTimeout(() => {
      onStrike(damage);
    }, 550);
  };

  return (
    <div className="timing-bar-container">
      <div className="timing-track" onClick={triggerStrike}>
        <div className="timing-target-center" />
        <div className="timing-target-bullseye" />

        <div
          className="timing-cursor"
          style={{
            left: `${cursorPos}%`,
            backgroundColor: hasStruck ? '#ffff00' : '#ffffff'
          }}
        />
      </div>

      <div className="timing-instructions">
        Pressione <b>ESPAÇO</b>, <b>ENTER</b> ou clique para acertar!
      </div>

      <button
        type="button"
        className="timing-strike-btn"
        onClick={triggerStrike}
        disabled={hasStruck}
      >
        ATACAR! (STRIKE)
      </button>
    </div>
  );
}
