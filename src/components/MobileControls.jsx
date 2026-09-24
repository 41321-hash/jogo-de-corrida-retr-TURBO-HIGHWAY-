import React from 'react';

export default function MobileControls({
  touchDirection,
  onActionPress,
  onBackPress
}) {
  const handleTouchStart = (dir) => {
    touchDirection.current[dir] = true;
  };

  const handleTouchEnd = (dir) => {
    touchDirection.current[dir] = false;
  };

  return (
    <div className="mobile-controls-container">
      <div className="dpad-container">
        <button
          type="button"
          className="dpad-btn dpad-up"
          onMouseDown={() => handleTouchStart('up')}
          onMouseUp={() => handleTouchEnd('up')}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart('up'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('up'); }}
        >
          ▲
        </button>
        <button
          type="button"
          className="dpad-btn dpad-left"
          onMouseDown={() => handleTouchStart('left')}
          onMouseUp={() => handleTouchEnd('left')}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart('left'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('left'); }}
        >
          ◀
        </button>
        <button
          type="button"
          className="dpad-btn dpad-right"
          onMouseDown={() => handleTouchStart('right')}
          onMouseUp={() => handleTouchEnd('right')}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart('right'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('right'); }}
        >
          ▶
        </button>
        <button
          type="button"
          className="dpad-btn dpad-down"
          onMouseDown={() => handleTouchStart('down')}
          onMouseUp={() => handleTouchEnd('down')}
          onTouchStart={(e) => { e.preventDefault(); handleTouchStart('down'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('down'); }}
        >
          ▼
        </button>
      </div>

      <div className="mobile-action-btns">
        <button
          type="button"
          className="action-touch-btn"
          onClick={onActionPress}
        >
          [ OK / AÇÃO ]
        </button>
        <button
          type="button"
          className="action-touch-btn"
          onClick={onBackPress}
        >
          [ VOLTAR ]
        </button>
      </div>
    </div>
  );
}
