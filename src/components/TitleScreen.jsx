import React, { useEffect, useRef, useState } from 'react';
import TurboHighwayLogo from './TurboHighwayLogo';
import { carAudio } from '../utils/carAudio';

export default function TitleScreen({ onStartGame }) {
  const canvasRef = useRef(null);
  const [selectedMenu, setSelectedMenu] = useState('single'); // 'single', 'multiplayer', 'options'
  const [showMultiplayerModal, setShowMultiplayerModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  // Animação retrô suave no Canvas da tela de abertura
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let offset = 0;

    const render = () => {
      offset = (offset + 1.8) % 40;
      const w = canvas.width;
      const h = canvas.height;
      const horizonY = Math.round(h * 0.44);

      // 1. Céu Degradê Synthwave Púrpura / Magenta
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#090514');
      skyGrad.addColorStop(0.3, '#1c0a35');
      skyGrad.addColorStop(0.65, '#4b1552');
      skyGrad.addColorStop(1, '#9b235e');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, horizonY);

      // 2. Sol Retrô Rosa Neon ao Centro
      const sunX = w / 2 + 100;
      const sunY = horizonY - 12;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 65);
      sunGrad.addColorStop(0, '#ff2a85');
      sunGrad.addColorStop(0.7, '#f43f5e');
      sunGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 65, 0, Math.PI * 2);
      ctx.fill();

      // 3. Silhueta dos Prédios da Cidade (Skyline Noturno com Janelas)
      const bWidth = 44;
      const count = Math.ceil(w / bWidth) + 2;
      ctx.fillStyle = '#0f0c1b';
      for (let i = 0; i < count; i++) {
        const bx = i * bWidth - 10;
        const bHeight = 35 + ((i * 47) % 65);
        ctx.fillRect(bx, horizonY - bHeight, bWidth - 4, bHeight);

        // Janelas brilhantes neon
        if (i % 2 === 0) {
          ctx.fillStyle = (i % 4 === 0) ? '#38bdf8' : (i % 6 === 0 ? '#ec4899' : '#facc15');
          for (let row = 0; row < 3; row++) {
            ctx.fillRect(bx + 8, horizonY - bHeight + 10 + row * 12, 5, 5);
            ctx.fillRect(bx + 24, horizonY - bHeight + 10 + row * 12, 5, 5);
          }
          ctx.fillStyle = '#0f0c1b';
        }
      }

      // 4. Terreno Lateral Noturno (Púrpura Escuro com Grid Neon Sutil)
      ctx.fillStyle = '#0b0917';
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // Linhas de perspectiva lateral
      ctx.strokeStyle = '#18132d';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 35) {
        ctx.beginPath();
        ctx.moveTo(x, h);
        ctx.lineTo(w / 2, horizonY);
        ctx.stroke();
      }

      // 5. Estrada em Perspectiva Pseudo-3D
      const roadTopW = 20;
      const roadBottomW = w * 0.94;
      const cx = w / 2;

      // Asfalto
      ctx.fillStyle = '#222330';
      ctx.beginPath();
      ctx.moveTo(cx - roadBottomW / 2, h);
      ctx.lineTo(cx - roadTopW / 2, horizonY);
      ctx.lineTo(cx + roadTopW / 2, horizonY);
      ctx.lineTo(cx + roadBottomW / 2, h);
      ctx.closePath();
      ctx.fill();

      // Zebras Laterais (Curb) Vermelhas e Brancas Animadas
      const curbSteps = 24;
      for (let i = 0; i < curbSteps; i++) {
        const p1 = i / curbSteps;
        const p2 = (i + 1) / curbSteps;
        const y1 = horizonY + (h - horizonY) * (p1 * p1);
        const y2 = horizonY + (h - horizonY) * (p2 * p2);

        const rw1 = roadTopW + (roadBottomW - roadTopW) * (p1 * p1);
        const rw2 = roadTopW + (roadBottomW - roadTopW) * (p2 * p2);

        const isRed = (i + Math.floor(offset / 10)) % 2 === 0;
        ctx.fillStyle = isRed ? '#e11d48' : '#ffffff';

        // Zebra Esquerda
        const curbW1 = Math.max(2, rw1 * 0.08);
        const curbW2 = Math.max(2, rw2 * 0.08);
        ctx.beginPath();
        ctx.moveTo(cx - rw1 / 2 - curbW1, y1);
        ctx.lineTo(cx - rw1 / 2, y1);
        ctx.lineTo(cx - rw2 / 2, y2);
        ctx.lineTo(cx - rw2 / 2 - curbW2, y2);
        ctx.closePath();
        ctx.fill();

        // Zebra Direita
        ctx.beginPath();
        ctx.moveTo(cx + rw1 / 2, y1);
        ctx.lineTo(cx + rw1 / 2 + curbW1, y1);
        ctx.lineTo(cx + rw2 / 2 + curbW2, y2);
        ctx.lineTo(cx + rw2 / 2, y2);
        ctx.closePath();
        ctx.fill();
      }

      // Linha Central Tracejada Amarela
      for (let i = 0; i < 14; i++) {
        const p1 = i / 14;
        const p2 = (i + 0.5) / 14;
        const y1 = horizonY + (h - horizonY) * (p1 * p1);
        const y2 = horizonY + (h - horizonY) * (p2 * p2);
        const lw = Math.max(2, (y2 - horizonY) * 0.04);

        if ((i + Math.floor(offset / 10)) % 2 === 0) {
          ctx.fillStyle = '#facc15';
          ctx.fillRect(cx - lw / 2, y1, lw, y2 - y1);
        }
      }

      // 6. Esportivo Vermelho Central (Idêntico ao da imagem!)
      const carW = 185;
      const carH = 118;
      const carX = cx;
      const carY = h - 55;

      ctx.save();
      ctx.translate(carX, carY);

      // Sombra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.ellipse(0, carH * 0.35, carW * 0.55, carH * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();

      const hw = carW / 2;
      const hh = carH / 2;

      // Pneus
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-hw + 2, hh - 22, 22, 26);
      ctx.fillRect(hw - 24, hh - 22, 22, 26);

      // Retrovisores laterais vermelhos
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(-hw - 8, -hh + 20, 10, 8);
      ctx.fillRect(hw - 2, -hh + 20, 10, 8);
      ctx.strokeStyle = '#050505';
      ctx.lineWidth = 2;
      ctx.strokeRect(-hw - 8, -hh + 20, 10, 8);
      ctx.strokeRect(hw - 2, -hh + 20, 10, 8);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-hw - 6, -hh + 22, 4, 4);
      ctx.fillRect(hw + 2, -hh + 22, 4, 4);

      // Chassi Principal Vermelho
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.moveTo(-hw + 8, hh);
      ctx.lineTo(-hw + 2, -hh + 18);
      ctx.lineTo(-hw + 20, -hh + 2);
      ctx.lineTo(hw - 20, -hh + 2);
      ctx.lineTo(hw - 2, -hh + 18);
      ctx.lineTo(hw - 8, hh);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#09090b';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Vidro Traseiro Escuro com Persiana
      ctx.fillStyle = '#09090c';
      ctx.beginPath();
      ctx.moveTo(-hw + 24, -hh + 5);
      ctx.lineTo(-hw + 18, -hh + 20);
      ctx.lineTo(hw - 18, -hh + 20);
      ctx.lineTo(hw - 24, -hh + 5);
      ctx.closePath();
      ctx.fill();

      // Linhas da Persiana
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      for (let l = 0; l < 3; l++) {
        const ly = -hh + 9 + l * 4;
        ctx.beginPath();
        ctx.moveTo(-hw + 22 - l, ly);
        ctx.lineTo(hw - 22 + l, ly);
        ctx.stroke();
      }

      // Faixa Central Branca (Roof to Bumper)
      const stW = 14;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-stW / 2, -hh + 2, stW, 4);
      ctx.fillRect(-stW / 2, -hh + 20, stW, carH * 0.58);

      // Spoiler Traseiro
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(-hw + 4, -hh + 18, carW - 8, 4);
      ctx.strokeStyle = '#050505';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-hw + 4, -hh + 18, carW - 8, 4);

      // Lanternas Traseiras (Laranja Interno + Vermelho Externo)
      const lW = 28;
      const lH = 11;
      const leftX = -hw + 10;
      const rightX = hw - 10 - lW;
      const lY = hh - 18;

      // Lanterna Esquerda
      ctx.fillStyle = '#f97316'; // Laranja interno
      ctx.fillRect(leftX + lW - 10, lY, 10, lH);
      ctx.fillStyle = '#ef4444'; // Vermelho externo
      ctx.fillRect(leftX, lY, lW - 10, lH);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(leftX, lY, lW, lH);

      // Lanterna Direita
      ctx.fillStyle = '#f97316';
      ctx.fillRect(rightX, lY, 10, lH);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(rightX + 10, lY, lW - 10, lH);
      ctx.strokeRect(rightX, lY, lW, lH);

      // Placa Amarela "TOP-GEAR" / "TURBO-HW"
      ctx.fillStyle = '#09090b';
      ctx.fillRect(-22, hh - 14, 44, 12);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-20, hh - 13, 40, 10);
      ctx.fillStyle = '#000000';
      ctx.font = '900 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TOP-GEAR', 0, hh - 5);

      // Escapamentos
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-hw + 16, hh - 3, carW - 32, 5);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-hw + 18, hh - 2, 8, 4);
      ctx.fillRect(hw - 26, hh - 2, 8, 4);

      ctx.restore();

      // 7. Minimapa no Canto Inferior Esquerdo (Idêntico ao da imagem)
      const mapX = 16;
      const mapY = h - 110;
      const mapW = 100;
      const mapH = 95;

      ctx.save();
      ctx.fillStyle = 'rgba(12, 16, 28, 0.85)';
      ctx.beginPath();
      ctx.roundRect(mapX, mapY, mapW, mapH, 8);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Circuito
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(mapX + 12, mapY + 12, mapW - 24, mapH - 24, 12);
      ctx.stroke();

      // Linha de largada/chegada
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(mapX + mapW / 2 - 2, mapY + 9, 4, 7);

      // Ponto do Jogador no topo esquerdo
      ctx.fillStyle = '#ff0055';
      ctx.beginPath();
      ctx.arc(mapX + 16, mapY + 16, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pontos brancos dos competidores na base
      for (let p = 0; p < 8; p++) {
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(mapX + 24 + p * 8, mapY + mapH - 12, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  // Atalho de teclado para iniciar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        if (!showMultiplayerModal && !showOptionsModal) {
          handleStart();
        }
      }
      if (e.code === 'ArrowLeft') {
        setSelectedMenu((prev) => (prev === 'options' ? 'multiplayer' : 'single'));
      }
      if (e.code === 'ArrowRight') {
        setSelectedMenu((prev) => (prev === 'single' ? 'multiplayer' : 'options'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMultiplayerModal, showOptionsModal]);

  const handleStart = () => {
    carAudio.init();
    carAudio.playHorn();
    onStartGame();
  };

  return (
    <div className="tg-title-screen-container">
      {/* Canvas com cenário retrô de alta performance */}
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="tg-title-canvas"
      />

      {/* Camada Superior de UI Retrô Arcade */}
      <div className="tg-title-ui-overlay">
        {/* LOGO OFICIAL TURBO HIGHWAY */}
        <TurboHighwayLogo size="large" showUrl={true} animated={true} />

        {/* Texto Piscando "PRESS START BUTTON" */}
        <div className="tg-title-press-start" onClick={handleStart}>
          <span className="tg-blink-start-text">PRESS START BUTTON</span>
        </div>

        {/* Menu de Modos Inferior */}
        <div className="tg-title-menu-bar">
          <button
            type="button"
            className={`tg-title-menu-btn ${selectedMenu === 'single' ? 'active' : ''}`}
            onClick={handleStart}
          >
            SINGLE RACE
          </button>
          <span className="tg-menu-separator">|</span>
          <button
            type="button"
            className={`tg-title-menu-btn ${selectedMenu === 'multiplayer' ? 'active' : ''}`}
            onClick={() => {
              carAudio.init();
              setShowMultiplayerModal(true);
            }}
          >
            MULTIPLAYER
          </button>
          <span className="tg-menu-separator">|</span>
          <button
            type="button"
            className={`tg-title-menu-btn ${selectedMenu === 'options' ? 'active' : ''}`}
            onClick={() => {
              carAudio.init();
              setShowOptionsModal(true);
            }}
          >
            OPTIONS
          </button>
        </div>
      </div>

      {/* MODAL MULTIPLAYER */}
      {showMultiplayerModal && (
        <div className="tg-modal-overlay" onClick={() => setShowMultiplayerModal(false)}>
          <div className="tg-results-card" onClick={(e) => e.stopPropagation()}>
            <h1 className="tg-results-title" style={{ color: '#38bdf8' }}>
              🌐 MULTIPLAYER ARENA
            </h1>
            <div className="tg-results-subtitle">
              TURBO HIGHWAY ONLINE & LOCAL SPLIT-SCREEN
            </div>

            <div className="tg-results-podium-box" style={{ textAlign: 'left', fontSize: '13px', lineHeight: '1.6' }}>
              <div style={{ color: '#facc15', marginBottom: '8px', fontWeight: 'bold' }}>
                🎮 MODOS DE DOIS JOGADORES:
              </div>
              <p>• <b>Modo Arcade Atual:</b> Você corre contra 19 pilotos da CPU no Grid Oficial com disputa de Top 3.</p>
              <p>• <b>Split-Screen Local (2P):</b> Em desenvolvimento para tela dividida no mesmo teclado (P1: W/A/S/D | P2: Setas).</p>
              <p>• <b>Salas Online P2P:</b> Em breve conectando pilotos de todo o mundo via WebRTC!</p>
            </div>

            <div className="tg-results-actions">
              <button
                type="button"
                className="tg-start-race-btn"
                onClick={() => {
                  setShowMultiplayerModal(false);
                  handleStart();
                }}
              >
                JOGAR MODO GRID (20 CARROS) ▶
              </button>
              <button
                type="button"
                className="tg-start-race-btn"
                style={{ background: '#334155', marginTop: '6px' }}
                onClick={() => setShowMultiplayerModal(false)}
              >
                VOLTAR AO MENU ◀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL OPTIONS */}
      {showOptionsModal && (
        <div className="tg-modal-overlay" onClick={() => setShowOptionsModal(false)}>
          <div className="tg-results-card" onClick={(e) => e.stopPropagation()}>
            <h1 className="tg-results-title" style={{ color: '#facc15' }}>
              ⚙️ GAME OPTIONS
            </h1>
            <div className="tg-results-subtitle">CONFIGURAÇÕES DE TURBO HIGHWAY</div>

            <div className="tg-results-podium-box" style={{ textAlign: 'left', fontSize: '13px' }}>
              <div className="tg-data-row">
                <span>ÁUDIO DO JOGO:</span>
                <button
                  type="button"
                  style={{
                    padding: '4px 10px',
                    backgroundColor: isMuted ? '#ef4444' : '#22c55e',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    const m = carAudio.toggleMute();
                    setIsMuted(m);
                  }}
                >
                  {isMuted ? 'MUTADO 🔇' : 'ATIVO 🔊'}
                </button>
              </div>

              <div className="tg-data-row" style={{ marginTop: '12px' }}>
                <span>CONTROLES:</span>
                <b>A/D ou ◀ ▶ (Volante)</b>
              </div>
              <div className="tg-data-row">
                <span>ACELERAR:</span>
                <b>W ou ▲</b>
              </div>
              <div className="tg-data-row">
                <span>FREIO:</span>
                <b>S ou ▼</b>
              </div>
              <div className="tg-data-row">
                <span>DISPARAR NITRO:</span>
                <b style={{ color: '#38bdf8' }}>ESPAÇO / SHIFT / N</b>
              </div>
              <div className="tg-data-row">
                <span>BUZINA:</span>
                <b>B ou H</b>
              </div>
            </div>

            <div className="tg-results-actions">
              <button
                type="button"
                className="tg-start-race-btn"
                onClick={() => setShowOptionsModal(false)}
              >
                SALVAR E VOLTAR ✔
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
