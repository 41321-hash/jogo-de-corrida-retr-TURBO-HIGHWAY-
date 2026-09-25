import React, { useState } from 'react';
import { TOP_GEAR_CARS, TRACK_THEMES } from '../utils/roadEngine';

export function CarSelectModal({
  selectedCar,
  setSelectedCar,
  selectedTrack,
  setSelectedTrack,
  transmission,
  setTransmission,
  onStartRace
}) {
  const currentCar = TOP_GEAR_CARS.find((c) => c.id === selectedCar) || TOP_GEAR_CARS[0];
  const tracks = Object.values(TRACK_THEMES);

  return (
    <div className="tg-modal-overlay">
      <div className="tg-select-window">
        {/* Cabeçalho Top Gear Estilo SNES */}
        <div className="tg-window-header">
          <h1 className="tg-main-title">TOP GEAR</h1>
          <div className="tg-sub-title">CHAMPIONSHIP RACING - 1992 EDITION</div>
        </div>

        <div className="tg-select-body">
          {/* Seção 1: Seleção de Carro */}
          <div className="tg-car-selection-panel">
            <h2 className="tg-section-header">🏎️ SELECT YOUR MACHINE</h2>

            <div className="tg-car-buttons-grid">
              {TOP_GEAR_CARS.map((car) => {
                const isSelected = car.id === currentCar.id;
                return (
                  <button
                    key={car.id}
                    type="button"
                    onClick={() => setSelectedCar(car.id)}
                    className={`tg-car-pick-btn ${isSelected ? 'selected' : ''}`}
                    style={{ borderColor: isSelected ? car.color : '#334155' }}
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

            {/* Ficha Técnica e Gráfico de Barras do Carro */}
            <div className="tg-car-spec-card" style={{ borderLeftColor: currentCar.color }}>
              <div className="tg-car-spec-header">
                <span className="tg-spec-car-name" style={{ color: currentCar.color }}>
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
                  <span>GRIP & ESTABILIDADE</span>
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

            {/* Escolha de Transmissão: Automático ou Manual */}
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
              <div className="tg-ctrl-title">🕹️ CONTROLES:</div>
              <div className="tg-ctrl-text">• <b>◀ ▶ ou A / D</b>: Esterçar volante</div>
              <div className="tg-ctrl-text">• <b>▲ ou W</b>: Acelerar | <b>▼ ou S</b>: Frear</div>
              <div className="tg-ctrl-text">• <b>ESPAÇO ou SHIFT</b>: Disparar NITRO</div>
              <div className="tg-ctrl-text">• <b>B ou H</b>: Buzina | <b>M</b>: Alternar Áudio</div>
              <div className="tg-ctrl-text">• <b>Entrar no PIT STOP</b> à direita para reabastecer combustível!</div>
            </div>
          </div>
        </div>

        {/* Botão Gigante de START RACE */}
        <div className="tg-window-footer">
          <button
            type="button"
            className="tg-start-race-btn"
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
