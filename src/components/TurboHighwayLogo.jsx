import React from 'react';

export default function TurboHighwayLogo({ size = 'large', showUrl = false, animated = true }) {
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  const logoWidth = isLarge ? '340px' : (isSmall ? '160px' : '230px');

  return (
    <div className={`tg-title-logo-box ${animated ? 'logo-float-anim' : ''}`} style={{ margin: isLarge ? '6px 0' : '2px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img
        src="/turbo_highway_logo.png"
        onError={(e) => {
          // Fallback caso caminho relativo
          if (!e.target.dataset.triedFallback) {
            e.target.dataset.triedFallback = 'true';
            e.target.src = './turbo_highway_logo.png';
          }
        }}
        alt="TURBO HIGHWAY"
        style={{
          width: logoWidth,
          maxWidth: '90vw',
          height: 'auto',
          objectFit: 'contain',
          filter: 'drop-shadow(0 0 14px rgba(6, 182, 212, 0.8)) drop-shadow(0 0 4px rgba(56, 189, 248, 0.9))',
          imageRendering: 'crisp-edges'
        }}
      />
      {showUrl && (
        <div
          className="tg-title-url-tag"
          style={{
            fontSize: isLarge ? '13px' : '10px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            color: '#f1f5f9',
            textShadow: '0 0 8px rgba(255, 255, 255, 0.9), 0 0 15px #38bdf8',
            marginTop: '2px'
          }}
        >
          turbo-highway.vercel.app
        </div>
      )}
    </div>
  );
}
