import React from 'react';
import TurboHighwayLogo from './TurboHighwayLogo';
import { TOP_GEAR_CARS, TRACK_THEMES } from '../utils/roadEngine';

export function CarSelectModal({
  selectedCar,
  setSelectedCar,
  selectedTrack,
  setSelectedTrack,
  transmission,
  setTransmission,
  customColor,
  setCustomColor,
  customAccent,
  setCustomAccent,
  onStartRace,
  onBackToTitle
}) {
  const currentCar = TOP_GEAR_CARS.find((c) => c.id === selectedCar) || TOP_GEAR_CARS[0];
  const tracks = Object.values(TRACK_THEMES);

  // Paleta de cores para personalização do carro
  const colorOptions = [
    { label: 'Vermelho Turbo', hex: '#e11d48' },
    { label: 'Ciano Neon', hex: '#06b6d4' },
    { label: 'Roxo Synth', hex: '#9333ea' },
    { label: 'Branco Pérola', hex: '#f8fafc' },
    { label: 'Amarelo F1', hex: '#eab308' },
    { label: 'Verde Arcade', hex: '#10b981' },
    { label: 'Laranja Óxido', hex: '#ea580c' },
    { label: 'Preto Meia-Noite', hex: '#18181b' }
  ];

  const stripeOptions = [
    { label: 'Branco', hex: '#ffffff' },
    { label: 'Amarelo', hex: '#facc15' },
    { label: 'Ciano', hex: '#38bdf8' },
    { label: 'Vermelho', hex: '#ef4444' },
    { label: 'Preto', hex: '#09090b' }
  ];

  const activeColor = customColor || currentCar.color;
  const activeAccent = customAccent || currentCar.accentColor;

  return (
    <div className="tg-modal-overlay">
      <div className="tg-select-window">
        {/* Cabeçalho Oficial TURBO HIGHWAY (Exatamente o mesmo logo do título, sem mudar) */}
        <div className="tg-window-header" style={{ padding: '6px 12px', display: 'flex', justifyContent: 'center' }}>
          <TurboHighwayLogo size="medium" showUrl={false} animated={false} />
        </div>

        <div className="tg-select-body">
          {/* Seção 1: Seleção de Carro & Personalização */}
          <div className="tg-car-selection-panel">
            <h2 className="tg-section-header">🏎️ SELECT & CUSTOMIZE MACHINE</h2>

            <div className="tg-car-buttons-grid">
              {TOP_GEAR_CARS.map((car) => {
                const isSelected = car.id === currentCar.id;
                return (
                  <button
                    key={car.id}
                    type="button"
                    onClick={() => {
                      setSelectedCar(car.id);
                      setCustomColor(null); // Resetar customização ao trocar carro base
                      setCustomAccent(null);
                    }}
                    className={`tg-car-pick-btn ${isSelected ? 'selected' : ''}`}
                    style={{ borderColor: isSelected ? activeColor : '#334155' }}
                  >
                    <div
                      className="tg-car-swatch"
                      style={{ backgroundColor: car.color, border: `2px solid ${car.accentColor}` }}
                    />
                    <div className="tg-car-pick-info">
                      <span className="tg-car-pick-name">{car.name}</span>
                      <span className="tg-car-pick-speed">{car.maxSpeed} KM/H</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Painel de Personalização de Pintura */}
            <div style={{
              backgroundColor: '#111827',
              borderRadius: '6px',
              padding: '8px 10px',
              marginBottom: '10px',
              border: '1px solid #1e293b'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#facc15', marginBottom: '6px' }}>
                🎨 PINTURA DA CARROCERIA:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {colorOptions.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.label}
                    onClick={() => setCustomColor(c.hex)}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: c.hex,
                      border: activeColor === c.hex ? '3px solid #38bdf8' : '2px solid #000',
                      cursor: 'pointer',
                      transform: activeColor === c.hex ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: activeColor === c.hex ? '0 0 8px #38bdf8' : 'none'
                    }}
                  />
                ))}
              </div>

              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#38bdf8', marginTop: '8px', marginBottom: '6px' }}>
                🏁 FAIXA DE CORRIDA:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {stripeOptions.map((s) => (
                  <button
                    key={s.hex}
                    type="button"
                    title={s.label}
                    onClick={() => setCustomAccent(s.hex)}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      backgroundColor: s.hex,
                      border: activeAccent === s.hex ? '2px solid #facc15' : '1px solid #334155',
                      cursor: 'pointer',
                      transform: activeAccent === s.hex ? 'scale(1.15)' : 'scale(1)'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Ficha Técnica do Carro */}
            <div className="tg-car-spec-card" style={{ borderLeftColor: activeColor }}>
              <div className="tg-car-spec-header">
                <span className="tg-spec-car-name" style={{ color: activeColor }}>
                  {currentCar.name}
                </span>
                <span className="tg-spec-nitro-tag">⚡ {currentCar.nitros} NITROS</span>
              </div>
              <p className="tg-car-desc">{currentCar.description}</p>

              <div className="tg-stats-bars">
                <div className="tg-stat-item">
                  <span>VELOCIDADE MÁXIMA ({currentCar.maxSpeed} km/h)</span>
                  <div className="tg-bar-slot">
                    <div
                      className="tg-bar-core"
                      style={{ width: `${(currentCar.maxSpeed / 320) * 100}%`, backgroundColor: '#38bdf8' }}
                    />
                  </div>
                </div>

                <div className="tg-stat-item">
                  <span>ACELERAÇÃO / ARRANCADA</span>
                  <div className="tg-bar-slot">
                    <div
                      className="tg-bar-core"
                      style={{ width: `${(currentCar.accel / 1.35) * 100}%`, backgroundColor: '#4ade80' }}
                    />
                  </div>
                </div>

                <div className="tg-stat-item">
                  <span>GRIP & ESTABILIDADE (CURVAS LONGAS)</span>
                  <div className="tg-bar-slot">
                    <div
                      className="tg-bar-core"
                      style={{ width: `${(currentCar.handling / 1.4) * 100}%`, backgroundColor: '#facc15' }}
                    />
                  </div>
                </div>

                <div className="tg-stat-item">
                  <span>ECONOMIA DE COMBUSTÍVEL</span>
                  <div className="tg-bar-slot">
                    <div
                      className="tg-bar-core"
                      style={{ width: `${(1 / currentCar.fuelConsumption) * 80}%`, backgroundColor: '#fb7185' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção 2: Pista & Câmbio */}
          <div className="tg-track-transmission-panel">
            {/* Escolha da Pista */}
            <h2 className="tg-section-header">🏁 SELECT CIRCUIT</h2>
            <div className="tg-tracks-list">
              {tracks.map((track) => {
                const isSelected = track.id === selectedTrack;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => setSelectedTrack(track.id)}
                    className={`tg-track-btn ${isSelected ? 'selected' : ''}`}
                  >
                    <div className="tg-track-country">{track.country}</div>
                    <div className="tg-track-name">{track.name}</div>
                  </button>
                );
              })}
            </div>

            {/* Escolha de Transmissão */}
            <h2 className="tg-section-header" style={{ marginTop: '14px' }}>⚙️ TRANSMISSION</h2>
            <div className="tg-trans-options">
              <button
                type="button"
                className={`tg-trans-btn ${transmission === 'auto' ? 'selected' : ''}`}
                onClick={() => setTransmission('auto')}
              >
                AUTOMATIC (Recomendado)
              </button>
              <button
                type="button"
                className={`tg-trans-btn ${transmission === 'manual' ? 'selected' : ''}`}
                onClick={() => setTransmission('manual')}
              >
                MANUAL (1-4 Gears)
              </button>
            </div>

            {/* Controles Resumidos */}
            <div className="tg-controls-summary">
              <div className="tg-ctrl-title">🕹️ GUIA DE PILOTAGEM:</div>
              <div className="tg-ctrl-text">• <b>◀ ▶ ou A / D</b>: Contornar as curvas longas</div>
              <div className="tg-ctrl-text">• <b>▲ ou W</b>: Acelerar | <b>▼ ou S</b>: Frear</div>
              <div className="tg-ctrl-text">• <b>ESPAÇO ou SHIFT</b>: Disparar NITRO</div>
              <div className="tg-ctrl-text">• <b>B ou H</b>: Buzina | <b>M</b>: Alternar Áudio</div>
              <div className="tg-ctrl-text">• <b>Entrar no PIT STOP</b> à direita para reabastecer combustível!</div>
            </div>
          </div>
        </div>

        {/* Rodapé com Botões de Ação */}
        <div className="tg-window-footer" style={{ display: 'flex', gap: '10px' }}>
          {onBackToTitle && (
            <button
              type="button"
              className="tg-start-race-btn"
              style={{ flex: '0 0 25%', background: '#334155' }}
              onClick={onBackToTitle}
            >
              ◀ MENU
            </button>
          )}

          <button
            type="button"
            className="tg-start-race-btn"
            style={{ flex: '1' }}
            onClick={onStartRace}
          >
            START RACE ▶ [QUALIFY TOP 3]
          </button>
        </div>
      </div>
    </div>
  );
}
export default CarSelectModal;
