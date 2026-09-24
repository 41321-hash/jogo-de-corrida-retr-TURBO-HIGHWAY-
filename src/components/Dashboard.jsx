import React from 'react';

export default function Dashboard({
  score,
  highScore,
  distance,
  fuel,
  nitro,
  isMuted,
  onToggleSound
}) {
  return (
    <div>
      {/* HUD Superior: Pontos, Recorde e Distância */}
      <div className="arcade-hud">
        <div className="hud-stat-box">
          <span className="hud-stat-label">SCORE</span>
          <span className="hud-stat-value">{score.toString().padStart(6, '0')}</span>
        </div>

        <div className="hud-stat-box">
          <span className="hud-stat-label">BEST</span>
          <span className="hud-stat-value" style={{ color: '#ffe600' }}>
            {highScore.toString().padStart(6, '0')}
          </span>
        </div>

        <div className="hud-stat-box">
          <span className="hud-stat-label">DISTÂNCIA</span>
          <span className="hud-stat-value" style={{ color: '#39ff14' }}>
            {Math.floor(distance)}m
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleSound}
          className="sound-toggle-btn"
          style={{ background: '#1c2430', border: '1px solid #415573' }}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>

      {/* Indicadores de Barras: Combustível e Nitro */}
      <div className="gauges-section">
        <div className="gauge-card">
          <div className="gauge-header">
            <span style={{ color: '#22c55e' }}>⛽ COMBUSTÍVEL</span>
            <span>{Math.round(fuel)}%</span>
          </div>
          <div className="gauge-bar-track">
            <div className="fuel-fill" style={{ width: `${fuel}%` }} />
          </div>
        </div>

        <div className="gauge-card">
          <div className="gauge-header">
            <span style={{ color: '#00ffff' }}>⚡ NITRO TURBO</span>
            <span>{Math.round(nitro)}%</span>
          </div>
          <div className="gauge-bar-track">
            <div className="nitro-fill" style={{ width: `${nitro}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
