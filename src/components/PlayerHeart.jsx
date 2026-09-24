import React from 'react';

export default function PlayerHeart({
  x,
  y,
  isInvincible,
  size = 16,
  style = {}
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x - size / 2}px`,
        top: `${y - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        pointerEvents: 'none',
        opacity: isInvincible ? 0.45 : 1,
        transition: 'opacity 0.1s ease',
        zIndex: 10,
        ...style
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        style={{ display: 'block' }}
      >
        <path
          d="M 8,14 L 2,8 C 0,6 0,3 2,1 C 4,-1 7,1 8,3 C 9,1 12,-1 14,1 C 16,3 16,6 14,8 Z"
          fill="#ff0000"
          stroke="#990000"
          strokeWidth="0.8"
        />
        <circle cx="5" cy="4" r="1" fill="#ff9999" />
      </svg>
    </div>
  );
}
