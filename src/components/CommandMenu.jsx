import React, { useEffect } from 'react';
import { audio } from '../utils/audio';

export const COMMANDS = ['FIGHT', 'ACT', 'ITEM', 'MERCY'];

export default function CommandMenu({
  selectedCommandIndex,
  setSelectedCommandIndex,
  onSelectCommand,
  disabled,
  mercyProgress
}) {
  const isMercyReady = mercyProgress >= 100;

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.code === 'KeyA') {
        audio.playMenuSelect();
        setSelectedCommandIndex((prev) => (prev > 0 ? prev - 1 : COMMANDS.length - 1));
      } else if (e.key === 'ArrowRight' || e.code === 'KeyD') {
        audio.playMenuSelect();
        setSelectedCommandIndex((prev) => (prev < COMMANDS.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        audio.playMenuConfirm();
        onSelectCommand(COMMANDS[selectedCommandIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, selectedCommandIndex, setSelectedCommandIndex, onSelectCommand]);

  return (
    <div className="command-menu-grid">
      {COMMANDS.map((cmd, idx) => {
        const isSelected = selectedCommandIndex === idx;
        const isMercyBtn = cmd === 'MERCY';

        return (
          <button
            key={cmd}
            type="button"
            className={`command-btn ${isSelected ? 'selected' : ''}`}
            style={{
              borderColor: isMercyBtn && isMercyReady ? '#facc15' : undefined,
              color: isMercyBtn && isMercyReady ? '#facc15' : undefined,
              boxShadow: isMercyBtn && isMercyReady ? '0 0 12px rgba(250, 204, 21, 0.5)' : undefined
            }}
            onClick={() => {
              if (disabled) return;
              setSelectedCommandIndex(idx);
              audio.playMenuConfirm();
              onSelectCommand(cmd);
            }}
            onMouseEnter={() => {
              if (!disabled && selectedCommandIndex !== idx) {
                audio.playMenuSelect();
                setSelectedCommandIndex(idx);
              }
            }}
            disabled={disabled}
          >
            <span className="btn-heart" />
            <span>{cmd}</span>
          </button>
        );
      })}
    </div>
  );
}
