import React, { useState, useEffect, useRef } from 'react';
import { audio } from '../utils/audio';

export default function DialogueBox({ text, onComplete }) {
  const [displayedText, setDisplayedText] = useState('');
  const textIndexRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    setDisplayedText('');
    textIndexRef.current = 0;

    if (timerRef.current) clearInterval(timerRef.current);

    if (!text) return;

    timerRef.current = setInterval(() => {
      textIndexRef.current += 1;
      const nextText = text.slice(0, textIndexRef.current);
      setDisplayedText(nextText);

      if (textIndexRef.current % 2 === 0) {
        audio.playTextChar();
      }

      if (textIndexRef.current >= text.length) {
        clearInterval(timerRef.current);
        if (onComplete) onComplete();
      }
    }, 28);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text]);

  const handleSkip = () => {
    if (textIndexRef.current < text.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      textIndexRef.current = text.length;
      setDisplayedText(text);
      if (onComplete) onComplete();
    }
  };

  return (
    <div
      className="dialogue-text"
      onClick={handleSkip}
      style={{ cursor: 'pointer', height: '100%', overflowY: 'auto' }}
    >
      <span className="text-star">*</span>
      {displayedText}
    </div>
  );
}
