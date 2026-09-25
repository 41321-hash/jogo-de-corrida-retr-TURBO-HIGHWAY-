import React, { useState, useEffect, useRef } from 'react';
import CarCanvas from './components/CarCanvas';
import { TopGearHeader, TopGearCockpit, TopGearPitStopModal } from './components/TopGearHUD';
import CarSelectModal from './components/CarSelectModal';
import TouchControls from './components/TouchControls';
import { carAudio } from './utils/carAudio';
import { TOP_GEAR_CARS, TRACK_THEMES } from './utils/roadEngine';

export default function App() {
  const [gameState, setGameState] = useState('CAR_SELECT'); // CAR_SELECT, PLAYING, FINISHED, GAME_OVER
  const [selectedCar, setSelectedCar] = useState('cannoli');
  const [selectedTrack, setSelectedTrack] = useState('vegas');
  const [transmission, setTransmission] = useState('auto');
  const [isMuted, setIsMuted] = useState(false);

  // Status transmitidos do Loop 3D para o HUD
  const [hudData, setHudData] = useState({
    speed: 0,
    rpm: 0.2,
    gear: 1,
    fuel: 100,
    nitroCount: 4,
    isNitroActive: false,
    rank: 20,
    totalRacers: 20,
    lap: 1,
    totalLaps: 3,
    lapTime: 0,
    bestLapTime: null,
    isPitStop: false
  });

  // Resultados Finais
  const [raceResults, setRaceResults] = useState({
    rank: 20,
    totalTime: 0,
    bestLap: 0,
    qualified: false,
    reason: ''
  });

  // Inputs
  const keysPressed = useRef({});
  const touchState = useRef({
    left: false,
    right: false,
    accel: false,
    brake: false,
    nitro: false
  });

  // Monitorar teclas do teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.code] = true;
      keysPressed.current[e.key] = true;

      // Buzina na tecla B ou H
      if ((e.code === 'KeyB' || e.code === 'KeyH') && gameState === 'PLAYING') {
        carAudio.playHorn();
      }

      // Mudo na tecla M
      if (e.code === 'KeyM') {
        const muted = carAudio.toggleMute();
        setIsMuted(muted);
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.code] = false;
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const toggleSound = () => {
    const muted = carAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleStartRace = () => {
    carAudio.init();
    carAudio.startEngine();
    carAudio.startRaceBGM(selectedTrack);
    setGameState('PLAYING');
  };

  const handleRaceFinish = (finalRank, totalRaceTime, bestLapTime) => {
    const qualified = finalRank <= 3;
    setRaceResults({
      rank: finalRank,
      totalTime: totalRaceTime,
      bestLap: bestLapTime,
      qualified: qualified,
      reason: qualified ? 'QUALIFIED FOR NEXT STAGE!' : 'FAILED TO QUALIFY (TOP 3 REQUIRED)'
    });
    setGameState('FINISHED');
  };

  const handleGameOver = (reason, rank, lap, totalRaceTime) => {
    setRaceResults({
      rank: rank,
      totalTime: totalRaceTime,
      bestLap: null,
      qualified: false,
      reason: reason === 'OUT_OF_FUEL' ? 'PANE SECA! COMBUSTÍVEL ESGOTADO!' : 'DISQUALIFIED'
    });
    setGameState('GAME_OVER');
  };

  const formatRaceTime = (seconds) => {
    if (!seconds || seconds <= 0) return '00:00.00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const currentCarDef = TOP_GEAR_CARS.find((c) => c.id === selectedCar) || TOP_GEAR_CARS[0];
  const currentTrackDef = TRACK_THEMES[selectedTrack] || TRACK_THEMES.vegas;

  return (
    <div className="topgear-app-container">
      {/* 1. SELEÇÃO DE CARRO E PISTA INICIAL */}
      {gameState === 'CAR_SELECT' && (
        <CarSelectModal
          selectedCar={selectedCar}
          setSelectedCar={setSelectedCar}
          selectedTrack={selectedTrack}
          setSelectedTrack={setSelectedTrack}
          transmission={transmission}
          setTransmission={setTransmission}
          onStartRace={handleStartRace}
        />
      )}

      {/* 2. ESTRUTURA DO JOGO EM EXECUÇÃO (LAYOUT SEM SOBREPOSIÇÃO) */}
      {gameState === 'PLAYING' && (
        <div className="topgear-game-layout">
          {/* A. Barra Superior Fixa: Posição, Volta, Cronômetro, Áudio */}
          <TopGearHeader
            rank={hudData.rank}
            totalRacers={hudData.totalRacers}
            lap={hudData.lap}
            totalLaps={hudData.totalLaps}
            lapTime={hudData.lapTime}
            bestLapTime={hudData.bestLapTime}
            isMuted={isMuted}
            onToggleSound={toggleSound}
          />

          {/* B. Área Central do Canvas 3D (Flex: 1, visibilidade máxima) */}
          <div className="topgear-canvas-area">
            <CarCanvas
              gameState={gameState}
              selectedCarId={selectedCar}
              selectedTrackId={selectedTrack}
              transmission={transmission}
              keysPressed={keysPressed}
              touchState={touchState}
              onHUDUpdate={setHudData}
              onRaceFinish={handleRaceFinish}
              onGameOver={handleGameOver}
            />

            {/* Modal de Reabastecimento no Pit Stop */}
            <TopGearPitStopModal
              isPitStop={hudData.isPitStop}
              fuel={hudData.fuel}
            />
          </div>

          {/* C. Painel Inferior do Cockpit Fixo (Velocímetro, RPM, Nitros, Combustível) */}
          <TopGearCockpit
            speed={hudData.speed}
            rpm={hudData.rpm}
            gear={hudData.gear}
            fuel={hudData.fuel}
            nitroCount={hudData.nitroCount}
            isNitroActive={hudData.isNitroActive}
            transmission={transmission}
          />

          {/* D. Barra de Controles Touch (Fixa na base, sem sobrepor o cockpit) */}
          <TouchControls touchState={touchState} />
        </div>
      )}

      {/* 3. TELA DE CHEGADA / PODIUM (FINISHED) */}
      {gameState === 'FINISHED' && (
        <div className="tg-modal-overlay">
          <div className="tg-results-card">
            <h1
              className="tg-results-title"
              style={{ color: raceResults.qualified ? '#facc15' : '#ef4444' }}
            >
              {raceResults.qualified ? '🏆 QUALIFIED! 🏆' : 'RACE FINISHED'}
            </h1>
            <div className="tg-results-subtitle">{raceResults.reason}</div>

            <div className="tg-results-podium-box">
              <div className="tg-podium-rank">
                <span className="tg-podium-label">POSIÇÃO FINAL</span>
                <span className="tg-podium-number" style={{ color: raceResults.qualified ? '#38bdf8' : '#ffffff' }}>
                  {raceResults.rank}º / 20
                </span>
              </div>

              <div className="tg-results-data-table">
                <div className="tg-data-row">
                  <span>CIRCUITO:</span>
                  <b>{currentTrackDef.name} ({currentTrackDef.country})</b>
                </div>
                <div className="tg-data-row">
                  <span>CARRO:</span>
                  <b style={{ color: currentCarDef.color }}>{currentCarDef.name}</b>
                </div>
                <div className="tg-data-row">
                  <span>TEMPO TOTAL:</span>
                  <b>{formatRaceTime(raceResults.totalTime)}</b>
                </div>
                <div className="tg-data-row">
                  <span>MELHOR VOLTA:</span>
                  <b style={{ color: '#4ade80' }}>
                    {raceResults.bestLap ? formatRaceTime(raceResults.bestLap) : '--:--.--'}
                  </b>
                </div>
              </div>
            </div>

            <div className="tg-results-actions">
              <button
                type="button"
                className="tg-start-race-btn"
                onClick={() => {
                  carAudio.stopBGM();
                  setGameState('CAR_SELECT');
                }}
              >
                MENU PRINCIPAL / TROCAR CARRO 🔄
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TELA DE GAME OVER (PANE SECA) */}
      {gameState === 'GAME_OVER' && (
        <div className="tg-modal-overlay">
          <div className="tg-results-card" style={{ borderColor: '#ef4444' }}>
            <h1 className="tg-results-title" style={{ color: '#ef4444' }}>
              ⚠️ PANE SECA! ⚠️
            </h1>
            <div className="tg-results-subtitle">
              Seu carro ficou sem combustível antes de entrar no Pit Stop!
            </div>

            <div className="tg-results-podium-box">
              <div className="tg-results-data-table">
                <div className="tg-data-row">
                  <span>POSIÇÃO NO MOMENTO:</span>
                  <b>{raceResults.rank}º LUGAR</b>
                </div>
                <div className="tg-data-row">
                  <span>DICA TOP GEAR:</span>
                  <b style={{ color: '#facc15' }}>
                    Fique atento ao alerta "PIT IN" e entre na faixa do lado direito da pista para reabastecer!
                  </b>
                </div>
              </div>
            </div>

            <div className="tg-results-actions">
              <button
                type="button"
                className="tg-start-race-btn"
                style={{ background: 'linear-gradient(135deg, #ef4444, #991b1b)' }}
                onClick={() => {
                  carAudio.stopBGM();
                  setGameState('CAR_SELECT');
                }}
              >
                TENTAR NOVAMENTE 🔄
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
