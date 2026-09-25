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
    <div className="tg-touch-bar">
      {/* Botões de Direção Esquerda / Direita */}
      <div className="tg-touch-group tg-touch-steer">
        <button
          type="button"
          className="tg-touch-btn tg-touch-left"
          onMouseDown={() => handleTouch('left', true)}
          onMouseUp={() => handleTouch('left', false)}
          onTouchStart={(e) => { e.preventDefault(); handleTouch('left', true); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouch('left', false); }}
        >
          ◀ ESQ
        </button>

        <button
          type="button"
          className="tg-touch-btn tg-touch-right"
          onMouseDown={() => handleTouch('right', true)}
          onMouseUp={() => handleTouch('right', false)}
          onTouchStart={(e) => { e.preventDefault(); handleTouch('right', true); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouch('right', false); }}
        >
          DIR ▶
        </button>
      </div>

      {/* Botão de Buzina Central */}
      <button
        type="button"
        className="tg-touch-btn tg-touch-horn"
        onClick={() => carAudio.playHorn()}
      >
        📢
      </button>

      {/* Botões de Nitro, Freio e Acelerador */}
      <div className="tg-touch-group tg-touch-pedals">
        <button
          type="button"
          className="tg-touch-btn tg-touch-brake"
          onMouseDown={() => handleTouch('brake', true)}
          onMouseUp={() => handleTouch('brake', false)}
          onTouchStart={(e) => { e.preventDefault(); handleTouch('brake', true); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouch('brake', false); }}
        >
          🛑 FREIO
        </button>

        <button
          type="button"
          className="tg-touch-btn tg-touch-nitro"
          onMouseDown={() => handleTouch('nitro', true)}
          onMouseUp={() => handleTouch('nitro', false)}
          onTouchStart={(e) => { e.preventDefault(); handleTouch('nitro', true); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouch('nitro', false); }}
        >
          ⚡ NITRO
        </button>

        <button
          type="button"
          className="tg-touch-btn tg-touch-accel"
          onMouseDown={() => handleTouch('accel', true)}
          onMouseUp={() => handleTouch('accel', false)}
          onTouchStart={(e) => { e.preventDefault(); handleTouch('accel', true); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouch('accel', false); }}
        >
          🚀 ACELERAR
        </button>
      </div>
    </div>
  );
}
