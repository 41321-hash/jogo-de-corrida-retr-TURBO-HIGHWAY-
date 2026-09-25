import React from 'react';

// 1. Barra Superior Fixa (Header HUD)
export function TopGearHeader({
  rank,
  totalRacers,
  lap,
  totalLaps,
  lapTime,
  bestLapTime,
  isMuted,
  onToggleSound
}) {
  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '00:00.00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="tg-header-bar">
      {/* Posição no Grid (POS 01/20) */}
      <div className="tg-header-card tg-rank-badge">
        <span className="tg-hdr-label">POSITION</span>
        <div className="tg-rank-value">
          <span className="tg-rank-number">{rank.toString().padStart(2, '0')}</span>
          <span className="tg-rank-total">/{totalRacers}</span>
        </div>
      </div>

      {/* Volta Atual (LAP 1/3) */}
      <div className="tg-header-card">
        <span className="tg-hdr-label">LAP</span>
        <span className="tg-lap-number">
          {lap > totalLaps ? 'FINISH' : `${lap} / ${totalLaps}`}
        </span>
      </div>

      {/* Tempo da Volta Atual e Melhor Volta */}
      <div className="tg-header-card tg-time-card">
        <div className="tg-time-row">
          <span className="tg-time-label">TIME:</span>
          <span className="tg-time-value">{formatTime(lapTime)}</span>
        </div>
        <div className="tg-time-row">
          <span className="tg-time-label">BEST:</span>
          <span className="tg-time-best">{bestLapTime ? formatTime(bestLapTime) : '--:--.--'}</span>
        </div>
      </div>

      {/* Botão de Som Mudo / Ativo */}
      <button
        type="button"
        onClick={onToggleSound}
        className="tg-sound-btn"
        title="Alternar Áudio"
      >
        {isMuted ? '🔇 MUTE' : '🔊 SFX+BGM'}
      </button>
    </div>
  );
}

// 2. Painel Inferior do Cockpit Fixo (Speed, RPM, Nitro, Fuel)
export function TopGearCockpit({
  speed,
  rpm,
  gear,
  fuel,
  nitroCount,
  isNitroActive,
  transmission
}) {
  const isLowFuel = fuel < 20;

  return (
    <div className="tg-cockpit-bar">
      {/* Velocímetro Digital */}
      <div className="tg-cockpit-item tg-speed-box">
        <div className="tg-speed-digital">
          {Math.floor(speed)}
          <span className="tg-speed-unit">KM/H</span>
        </div>
        {/* Barra de RPM e Marcha */}
        <div className="tg-rpm-line">
          <span className="tg-rpm-text">RPM</span>
          <div className="tg-rpm-track">
            <div
              className={`tg-rpm-fill ${rpm > 0.85 ? 'tg-redline' : ''}`}
              style={{ width: `${Math.min(100, rpm * 100)}%` }}
            />
          </div>
          <span className="tg-gear-text">
            {transmission === 'manual' ? `G-${gear}` : `A-${gear}`}
          </span>
        </div>
      </div>

      {/* Frascos de NITRO (Top Gear: 4 Cargas de Nitro) */}
      <div className="tg-cockpit-item tg-nitro-box">
        <div className="tg-nitro-title">⚡ NITROS</div>
        <div className="tg-nitro-row">
          {[1, 2, 3, 4].map((i) => {
            const available = i <= nitroCount;
            const active = isNitroActive && i === nitroCount;
            return (
              <div
                key={i}
                className={`tg-bottle ${available ? 'ready' : 'used'} ${active ? 'active-pulse' : ''}`}
                title={available ? 'Nitro Pronto [SPACE]' : 'Esgotado'}
              >
                N₂O
              </div>
            );
          })}
        </div>
      </div>

      {/* Marcador de Combustível (FUEL) */}
      <div className={`tg-cockpit-item tg-fuel-box ${isLowFuel ? 'tg-low-fuel-blink' : ''}`}>
        <div className="tg-fuel-title-row">
          <span>⛽ FUEL</span>
          <span className="tg-fuel-percent">{Math.round(fuel)}%</span>
        </div>
        <div className="tg-fuel-track">
          <div
            className={`tg-fuel-fill ${isLowFuel ? 'low' : ''}`}
            style={{ width: `${Math.max(0, Math.min(100, fuel))}%` }}
          />
        </div>
        {isLowFuel ? (
          <div className="tg-pit-alert">⚠️ PIT IN NA DIREITA!</div>
        ) : (
          <div className="tg-pit-hint">PIT LANE: FAIXA DIREITA</div>
        )}
      </div>
    </div>
  );
}

// 3. Modal de Reabastecimento no Pit Stop
export function TopGearPitStopModal({ isPitStop, fuel }) {
  if (!isPitStop) return null;

  return (
    <div className="tg-pitstop-modal-wrap">
      <div className="tg-pitstop-box">
        <div className="tg-pitstop-title">⛽ PIT STOP SERVICE ⛽</div>
        <div className="tg-pitstop-sub">REFUELING... REABASTECENDO...</div>
        <div className="tg-pitstop-bar">
          <div className="tg-pitstop-fill" style={{ width: `${fuel}%` }} />
        </div>
        <div className="tg-pitstop-fuel-num">{Math.round(fuel)}%</div>
      </div>
    </div>
  );
}

export default {
  TopGearHeader,
  TopGearCockpit,
  TopGearPitStopModal
};
