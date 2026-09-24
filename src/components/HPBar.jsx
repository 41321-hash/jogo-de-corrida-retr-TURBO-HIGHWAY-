import React from 'react';

export default function HPBar({
  playerName = 'HUMAN',
  lv = 1,
  hp = 20,
  maxHp = 20,
  mercyProgress = 0
}) {
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const mercyPercent = Math.min(100, mercyProgress);

  return (
    <div className="player-status-hud">
      <div className="player-info-left">
        <span className="player-name">{playerName}</span>
        <span className="player-lv">LV {lv}</span>
      </div>

      <div className="player-hp-wrapper">
        <span className="hp-label">HP</span>
        <div className="player-hp-bar">
          <div
            className="player-hp-fill"
            style={{ width: `${hpPercent}%` }}
          />
        </div>
        <span className="player-hp-values">
          {Math.max(0, hp)} / {maxHp}
        </span>
      </div>

      <div className="mercy-indicator">
        <span>MERCY</span>
        <div className="mercy-bar-mini" title={`Progresso de Poupar: ${mercyPercent}%`}>
          <div
            className="mercy-bar-fill"
            style={{
              width: `${mercyPercent}%`,
              backgroundColor: mercyPercent >= 100 ? '#fde047' : '#eab308'
            }}
          />
        </div>
        <span>{mercyPercent}%</span>
      </div>
    </div>
  );
}
