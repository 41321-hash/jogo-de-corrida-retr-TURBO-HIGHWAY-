import React from 'react';
import { carAudio } from '../utils/carAudio';

export default function TouchControls({ touchState }) {
  const handleTouch = (action, isPressed) => {
    touchState.current[action] = isPressed;
    if (action === 'horn' && isPressed) {
      carAudio.playHorn();
    }
  };

  return (
    <div className="touch-controls-grid">
      {/* Botões de Direção Esquerda / Direita */}
      <div className="touch-steering-group">
        <button
          type="button"
          className="touch-btn"
          onMouseDown={() => handleTouch('left', true)}
          onMouseUp={() => handleTouch('left', false)}
          onTouchStart={(e) => { e.preventDefault(); handleTouch('left', true); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouch('left', false); }}
        >
          ◀ ESQ
        </button>

        <button
          type="button"
          className="touch-btn"
          onMouseDown={() => handleTouch('right', true)}
          onMouseUp={() => handleTouch('right', false)}
          onTouchStart={(e) => { e.preventDefault(); handleTouch('right', true); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouch('right', false); }}
        >
          DIR ▶
        </button>
      </div>

      {/* Botões de Ação: Nitro, Freio, Buzina */}
      <div className="touch-actions-group">
        <button
          type="button"
          className="touch-btn touch-btn-brake"
          onMouseDown={() => handleTouch('brake', true)}
          onMouseUp={() => handleTouch('brake', false)}
          onTouchStart={(e) => { e.preventDefault(); handleTouch('brake', true); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouch('brake', false); }}
        >
          🛑 FREIO
        </button>

        <button
          type="button"
          className="touch-btn touch-btn-nitro"
          onMouseDown={() => handleTouch('nitro', true)}
          onMouseUp={() => handleTouch('nitro', false)}
          onTouchStart={(e) => { e.preventDefault(); handleTouch('nitro', true); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouch('nitro', false); }}
        >
          ⚡ NITRO
        </button>
      </div>
    </div>
  );
}
