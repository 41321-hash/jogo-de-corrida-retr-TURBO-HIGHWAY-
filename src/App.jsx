import React, { useState, useEffect, useRef } from 'react';
import CarCanvas from './components/CarCanvas';
import Dashboard from './components/Dashboard';
import TouchControls from './components/TouchControls';
import { carAudio } from './utils/carAudio';

export default function App() {
  const [gameState, setGameState] = useState('MENU'); // MENU, PLAYING, GAME_OVER
  const [gameOverReason, setGameOverReason] = useState('CRASH'); // CRASH ou OUT_OF_FUEL
  const [isMuted, setIsMuted] = useState(false);

  // Status de Corrida
  const [speed, setSpeed] = useState(0);
  const [fuel, setFuel] = useState(100);
  const [nitro, setNitro] = useState(60);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showNearMiss, setShowNearMiss] = useState(false);
  const [isScreenShaking, setIsScreenShaking] = useState(false);

  // Inputs
  const keysPressed = useRef({});
  const touchState = useRef({ left: false, right: false, accel: false, brake: false, nitro: false });

  // Carregar recorde do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('turbo_drift_highscore');
      if (saved) setHighScore(parseInt(saved, 10));
    } catch (e) {}
  }, []);

  // Monitorar teclas de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.code] = true;
      keysPressed.current[e.key] = true;

      // Buzina na tecla B ou H
      if ((e.code === 'KeyB' || e.code === 'KeyH') && gameState === 'PLAYING') {
        carAudio.playHorn();
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

  const startGame = () => {
    carAudio.init();
    carAudio.startEngine();
    carAudio.startRaceBGM();

    setSpeed(120);
    setFuel(100);
    setNitro(60);
    setIsNitroActive(false);
    setScore(0);
    setDistance(0);
    setGameState('PLAYING');
  };

  const handleGameOver = (reason, finalScore, finalDist) => {
    setGameOverReason(reason);
    setGameState('GAME_OVER');
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 400);

    carAudio.stopEngine();
    carAudio.stopBGM();

    if (finalScore > highScore) {
      setHighScore(finalScore);
      try {
        localStorage.setItem('turbo_drift_highscore', finalScore.toString());
      } catch (e) {}
    }
  };

  const triggerNearMiss = () => {
    setShowNearMiss(true);
    setTimeout(() => setShowNearMiss(false), 800);
  };

  return (
    <div className={`car-game-container ${isScreenShaking ? 'screen-shake' : ''}`}>
      {/* Dashboard Superior */}
      <Dashboard
        score={score}
        highScore={highScore}
        distance={distance}
        fuel={fuel}
        nitro={nitro}
        isMuted={isMuted}
        onToggleSound={toggleSound}
      />

      {/* Área da Pista / Canvas */}
      <div style={{ position: 'relative', flex: 1, display: 'flex', minHeight: 0 }}>
        <CarCanvas
          gameState={gameState}
          speed={speed}
          setSpeed={setSpeed}
          fuel={fuel}
          setFuel={setFuel}
          nitro={nitro}
          setNitro={setNitro}
          isNitroActive={isNitroActive}
          setIsNitroActive={setIsNitroActive}
          score={score}
          setScore={setScore}
          distance={distance}
          setDistance={setDistance}
          keysPressed={keysPressed}
          touchState={touchState}
          onGameOver={handleGameOver}
          onNearMiss={triggerNearMiss}
        />

        {/* Efeito Visual de Raspão (Near Miss) */}
        {showNearMiss && (
          <div className="near-miss-banner">
            🔥 RASPÃO! +500 PTS 🔥
          </div>
        )}

        {/* TELA DE MENU INICIAL */}
        {gameState === 'MENU' && (
          <div className="modal-overlay">
            <h1 className="arcade-title">TURBO HIGHWAY</h1>
            <div className="arcade-subtitle">RETRO RACING 8-BIT</div>

            <div className="instructions-card">
              <p><b>🕹️ CONTROLES (PC):</b></p>
              <p>• <b>Setas ◀ ▶ ou A / D</b>: Virar o carro</p>
              <p>• <b>Seta ▲ / W</b>: Acelerar mais rápido</p>
              <p>• <b>Seta ▼ / S</b>: Frear</p>
              <p>• <b>ESPAÇO ou SHIFT</b>: Ativar NITRO</p>
              <p>• <b>B ou H</b>: Buzinar</p>
              <p style={{ marginTop: '8px' }}><b>⛽ OBJETIVOS:</b></p>
              <p>• Colete galões de gasolina (GAS) para não parar!</p>
              <p>• Pegue moedas ($) e passe raspando para encher o Nitro!</p>
              <p>• Cuidado com caminhões lentos e poças de óleo!</p>
            </div>

            <button
              type="button"
              className="arcade-btn-primary"
              onClick={startGame}
            >
              INICIAR CORRIDA ▶
            </button>
          </div>
        )}

        {/* TELA DE GAME OVER */}
        {gameState === 'GAME_OVER' && (
          <div className="modal-overlay">
            <h1 className="arcade-title" style={{ color: '#ef4444', textShadow: '0 0 20px #ef4444' }}>
              {gameOverReason === 'CRASH' ? 'BATIDA!' : 'PANE SECA!'}
            </h1>
            <div className="arcade-subtitle" style={{ color: '#fca5a5' }}>
              {gameOverReason === 'CRASH'
                ? 'Seu carro colidiu no tráfego!'
                : 'Seu combustível acabou no meio da rodovia!'}
            </div>

            <div className="game-over-stats">
              <div className="stat-row">
                <span>PONTUAÇÃO FINAL:</span>
                <span className="stat-row-value">{score}</span>
              </div>
              <div className="stat-row">
                <span>DISTÂNCIA PERCORRIDA:</span>
                <span className="stat-row-value">{Math.floor(distance)} metros</span>
              </div>
              <div className="stat-row">
                <span>RECORDE (BEST):</span>
                <span className="stat-row-value" style={{ color: '#ffe600' }}>
                  {highScore}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="arcade-btn-primary"
              onClick={startGame}
            >
              CORRER NOVAMENTE 🔄
            </button>
          </div>
        )}
      </div>

      {/* Controles Touch para Mobile */}
      <TouchControls touchState={touchState} />
    </div>
  );
}
