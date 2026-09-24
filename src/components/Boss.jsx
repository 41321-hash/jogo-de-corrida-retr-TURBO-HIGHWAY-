import React, { useState, useEffect } from 'react';

export default function Boss({
  hp,
  maxHp,
  bossState,
  speechText,
  isHurt,
  damageNumber,
  showSlash
}) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));

  const getFaceDetails = () => {
    if (bossState === 'DEFEATED') {
      return {
        eyes: 'defeat',
        mouth: 'droop',
        stemColor: '#3a5336',
        petalColor: '#8a782b'
      };
    }
    if (bossState === 'PACIFIED') {
      return {
        eyes: 'peaceful',
        mouth: 'gentle_smile',
        stemColor: '#4ade80',
        petalColor: '#fef08a'
      };
    }
    if (isHurt) {
      return {
        eyes: 'hurt',
        mouth: 'grimace',
        stemColor: '#22c55e',
        petalColor: '#eab308'
      };
    }
    if (bossState === 'ENRAGED' || (hp / maxHp) < 0.3) {
      return {
        eyes: 'angry',
        mouth: 'evil_grin',
        stemColor: '#15803d',
        petalColor: '#f59e0b'
      };
    }
    return {
      eyes: blink ? 'blink' : 'normal',
      mouth: 'smirk',
      stemColor: '#22c55e',
      petalColor: '#facc15'
    };
  };

  const face = getFaceDetails();

  return (
    <div className="boss-container">
      {speechText && (
        <div className="boss-speech-bubble">
          "{speechText}"
        </div>
      )}

      {damageNumber !== null && (
        <div className="floating-damage">
          {damageNumber > 0 ? `-${damageNumber}` : 'MISS'}
        </div>
      )}

      {showSlash && (
        <svg className="slash-effect" viewBox="0 0 100 100">
          <line
            x1="10"
            y1="50"
            x2="90"
            y2="50"
            stroke="#ffffff"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <line
            x1="20"
            y1="50"
            x2="80"
            y2="50"
            stroke="#00ffff"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}

      <div
        className={`boss-sprite-wrapper ${
          isHurt ? 'boss-hurt-anim' :
          bossState === 'ENRAGED' ? 'boss-enraged' : 'boss-idle'
        }`}
      >
        <svg
          width="160"
          height="140"
          viewBox="0 0 160 140"
          style={{ overflow: 'visible', filter: 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.25))' }}
        >
          <path
            d={bossState === 'DEFEATED' ? "M 80 135 Q 75 110, 80 95" : "M 80 135 Q 70 105, 80 85"}
            fill="none"
            stroke={face.stemColor}
            strokeWidth="8"
            strokeLinecap="round"
          />

          <path
            d="M 75 115 Q 50 110, 45 125 Q 65 130, 75 120"
            fill={face.stemColor}
            stroke="#052e16"
            strokeWidth="2"
          />
          <path
            d="M 85 110 Q 110 105, 115 118 Q 95 125, 85 115"
            fill={face.stemColor}
            stroke="#052e16"
            strokeWidth="2"
          />

          <g transform={bossState === 'DEFEATED' ? "translate(0, 10)" : ""}>
            {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
              <g key={idx} transform={`rotate(${angle}, 80, 60)`}>
                <ellipse
                  cx="80"
                  cy="20"
                  rx="15"
                  ry="24"
                  fill={face.petalColor}
                  stroke="#b45309"
                  strokeWidth="2.5"
                />
                <path
                  d="M 80 36 L 80 16"
                  stroke="#d97706"
                  strokeWidth="1.5"
                />
              </g>
            ))}

            <circle
              cx="80"
              cy="60"
              r="28"
              fill="#ffffff"
              stroke="#000000"
              strokeWidth="3.5"
            />

            {face.eyes === 'blink' ? (
              <g stroke="#000000" strokeWidth="3" strokeLinecap="round">
                <line x1="68" y1="56" x2="76" y2="56" />
                <line x1="84" y1="56" x2="92" y2="56" />
              </g>
            ) : face.eyes === 'hurt' ? (
              <g stroke="#000000" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <path d="M 68 53 L 74 57 L 68 61" />
                <path d="M 92 53 L 86 57 L 92 61" />
              </g>
            ) : face.eyes === 'angry' ? (
              <g>
                <line x1="66" y1="50" x2="78" y2="56" stroke="#000" strokeWidth="3" />
                <line x1="94" y1="50" x2="82" y2="56" stroke="#000" strokeWidth="3" />
                <circle cx="72" cy="57" r="4.5" fill="#dc2626" />
                <circle cx="88" cy="57" r="4.5" fill="#dc2626" />
                <circle cx="71" cy="56" r="1.5" fill="#ffffff" />
                <circle cx="87" cy="56" r="1.5" fill="#ffffff" />
              </g>
            ) : face.eyes === 'peaceful' ? (
              <g stroke="#000000" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <path d="M 68 58 Q 72 52, 76 58" />
                <path d="M 84 58 Q 88 52, 92 58" />
              </g>
            ) : face.eyes === 'defeat' ? (
              <g stroke="#666" strokeWidth="2.5">
                <line x1="68" y1="52" x2="76" y2="60" />
                <line x1="76" y1="52" x2="68" y2="60" />
                <line x1="84" y1="52" x2="92" y2="60" />
                <line x1="92" y1="52" x2="84" y2="60" />
              </g>
            ) : (
              <g>
                <ellipse cx="72" cy="55" rx="4" ry="5.5" fill="#000000" />
                <ellipse cx="88" cy="55" rx="4" ry="5.5" fill="#000000" />
                <circle cx="71" cy="53" r="1.5" fill="#ffffff" />
                <circle cx="87" cy="53" r="1.5" fill="#ffffff" />
              </g>
            )}

            {face.mouth === 'gentle_smile' ? (
              <path
                d="M 72 68 Q 80 75, 88 68"
                fill="none"
                stroke="#000000"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ) : face.mouth === 'evil_grin' ? (
              <g>
                <path
                  d="M 68 67 Q 80 82, 92 67 Z"
                  fill="#000000"
                  stroke="#000000"
                  strokeWidth="1.5"
                />
                <path d="M 72 67 L 75 72 L 78 67 L 81 72 L 84 67 L 87 72 L 90 67" stroke="#ffffff" strokeWidth="1.5" fill="none" />
              </g>
            ) : face.mouth === 'grimace' ? (
              <path
                d="M 70 72 L 90 70"
                stroke="#000000"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ) : face.mouth === 'droop' ? (
              <path
                d="M 72 73 Q 80 67, 88 73"
                fill="none"
                stroke="#555555"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M 70 67 Q 80 77, 90 67"
                fill="none"
                stroke="#000000"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            )}
          </g>
        </svg>
      </div>

      <div className="boss-hp-section">
        <span>FLOWERY</span>
        <div className="boss-hp-track">
          <div className="boss-hp-fill" style={{ width: `${hpPercent}%` }} />
        </div>
        <span>{Math.max(0, hp)} / {maxHp}</span>
      </div>
    </div>
  );
}
