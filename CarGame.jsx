import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// 1. ÁUDIO DO CARRO (Web Audio API 8-Bit)
// ==========================================
class CarAudioSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.engineOsc = null;
    this.engineGain = null;
    this.bgmTimer = null;
    this.bgmPlaying = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopEngine();
      this.stopBGM();
    }
    return this.isMuted;
  }

  startEngine() {
    if (this.isMuted || this.engineOsc) return;
    this.init();
    if (!this.ctx) return;
    this.engineOsc = this.ctx.createOscillator();
    this.engineGain = this.ctx.createGain();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    this.engineGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    this.engineOsc.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);
    this.engineOsc.start();
  }

  updateEnginePitch(speedPercent) {
    if (this.isMuted || !this.engineOsc || !this.ctx) return;
    this.engineOsc.frequency.setTargetAtTime(40 + speedPercent * 160, this.ctx.currentTime, 0.08);
  }

  stopEngine() {
    if (this.engineOsc) {
      try { this.engineOsc.stop(); this.engineOsc.disconnect(); } catch (e) {}
      this.engineOsc = null;
    }
  }

  playSkid() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(8, now);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  playNitro() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  playHorn() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [349.23, 440].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  playFuelCollect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [392, 523.25, 659.25, 783.99].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = now + idx * 0.05;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.15);
    });
  }

  playCoinCollect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  playCrash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(50, now + 0.5);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  startRaceBGM() {
    if (this.bgmPlaying || this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    this.bgmPlaying = true;
    const bass = [110, 110, 130.81, 110, 146.83, 110, 164.81, 146.83];
    const lead = [440, 0, 523.25, 0, 659.25, 587.33, 523.25, 440];
    let step = 0;
    this.bgmTimer = setInterval(() => {
      if (!this.bgmPlaying || this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const bOsc = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bOsc.type = 'sawtooth';
      bOsc.frequency.setValueAtTime(bass[step % bass.length] / 2, now);
      bGain.gain.setValueAtTime(0.04, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      bOsc.connect(bGain);
      bGain.connect(this.ctx.destination);
      bOsc.start(now);
      bOsc.stop(now + 0.13);

      const note = lead[step % lead.length];
      if (note > 0) {
        const lOsc = this.ctx.createOscillator();
        const lGain = this.ctx.createGain();
        lOsc.type = 'square';
        lOsc.frequency.setValueAtTime(note, now);
        lGain.gain.setValueAtTime(0.035, now);
        lGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        lOsc.connect(lGain);
        lGain.connect(this.ctx.destination);
        lOsc.start(now);
        lOsc.stop(now + 0.14);
      }
      step++;
    }, 130);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

const audio = new CarAudioSystem();

// ==========================================
// 2. COMPONENTE PRINCIPAL DO JOGO DE CARRO
// ==========================================
export default function CarGame() {
  const [gameState, setGameState] = useState('MENU');
  const [gameOverReason, setGameOverReason] = useState('CRASH');
  const [isMuted, setIsMuted] = useState(false);

  const [speed, setSpeed] = useState(0);
  const [fuel, setFuel] = useState(100);
  const [nitro, setNitro] = useState(60);
  const [isNitroActive, setIsNitroActive] = useState(false);
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showNearMiss, setShowNearMiss] = useState(false);
  const [isScreenShaking, setIsScreenShaking] = useState(false);

  const keysPressed = useRef({});
  const touchState = useRef({ left: false, right: false, accel: false, brake: false, nitro: false });
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(performance.now());

  const playerRef = useRef({ x: 180, y: 430, width: 38, height: 64, vx: 0, skidTimer: 0 });
  const roadOffsetRef = useRef(0);
  const trafficRef = useRef([]);
  const itemsRef = useRef([]);
  const obstaclesRef = useRef([]);
  const particlesRef = useRef([]);

  const roadWidth = 280;
  const canvasWidth = 360;
  const canvasHeight = 540;
  const roadLeft = (canvasWidth - roadWidth) / 2;

  // Carregar recorde salvo
  useEffect(() => {
    try {
      const saved = localStorage.getItem('turbo_drift_highscore');
      if (saved) setHighScore(parseInt(saved, 10));
    } catch (e) {}
  }, []);

  // Teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.code] = true;
      keysPressed.current[e.key] = true;
      if ((e.code === 'KeyB' || e.code === 'KeyH') && gameState === 'PLAYING') {
        audio.playHorn();
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

  // Iniciar Jogo
  const startGame = () => {
    audio.init();
    audio.startEngine();
    audio.startRaceBGM();

    playerRef.current.x = canvasWidth / 2;
    playerRef.current.y = 430;
    playerRef.current.vx = 0;
    playerRef.current.skidTimer = 0;
    trafficRef.current = [];
    itemsRef.current = [];
    obstaclesRef.current = [];
    particlesRef.current = [];
    roadOffsetRef.current = 0;

    setSpeed(120);
    setFuel(100);
    setNitro(60);
    setIsNitroActive(false);
    setScore(0);
    setDistance(0);
    setGameState('PLAYING');
  };

  const endGame = (reason, finalScore) => {
    setGameOverReason(reason);
    setGameState('GAME_OVER');
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 400);

    audio.stopEngine();
    audio.stopBGM();

    if (finalScore > highScore) {
      setHighScore(finalScore);
      try { localStorage.setItem('turbo_drift_highscore', finalScore.toString()); } catch (e) {}
    }
  };

  // Loop de Animação e Física (60 FPS)
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    lastTimeRef.current = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = currentTime;

      const player = playerRef.current;

      // 1. Velocidade
      let targetSpeed = 120;
      const isAccel = keysPressed.current['ArrowUp'] || keysPressed.current['KeyW'] || touchState.current.accel;
      const isBraking = keysPressed.current['ArrowDown'] || keysPressed.current['KeyS'] || touchState.current.brake;
      const wantNitro = (keysPressed.current['Space'] || keysPressed.current['ShiftLeft'] || touchState.current.nitro) && nitro > 5;

      if (wantNitro && !isNitroActive) {
        setIsNitroActive(true);
        audio.playNitro();
      }

      if (isNitroActive) {
        if (nitro > 0) {
          targetSpeed = 240;
          setNitro(prev => Math.max(0, prev - dt * 25));
        } else {
          setIsNitroActive(false);
        }
      } else if (isBraking) {
        targetSpeed = 40;
      } else if (isAccel) {
        targetSpeed = 170;
      }

      const newSpeed = speed + (targetSpeed - speed) * 3.5 * dt;
      setSpeed(newSpeed);
      audio.updateEnginePitch(newSpeed / 160);

      // 2. Combustível
      const currentFuel = Math.max(0, fuel - (newSpeed / 120) * 2.8 * dt);
      setFuel(currentFuel);
      if (currentFuel <= 0) {
        endGame('OUT_OF_FUEL', score);
        return;
      }

      setDistance(prev => prev + (newSpeed * dt * 0.28));
      setScore(prev => prev + Math.floor(newSpeed * dt * 0.5));

      // 3. Direção
      let steerInput = 0;
      if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA'] || touchState.current.left) steerInput -= 1;
      if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD'] || touchState.current.right) steerInput += 1;

      if (player.skidTimer > 0) {
        player.skidTimer -= dt;
        steerInput += Math.sin(currentTime / 50) * 1.5;
        particlesRef.current.push({
          x: player.x - 12 + Math.random() * 24,
          y: player.y + 28,
          vx: (Math.random() - 0.5) * 30,
          vy: 60,
          radius: 6 + Math.random() * 6,
          color: 'rgba(200, 200, 200, 0.6)',
          life: 0.35
        });
      }

      player.vx = steerInput * 240;
      player.x += player.vx * dt;

      const minX = roadLeft + player.width / 2 + 6;
      const maxX = roadLeft + roadWidth - player.width / 2 - 6;
      if (player.x < minX) { player.x = minX; player.vx = 0; }
      else if (player.x > maxX) { player.x = maxX; player.vx = 0; }

      if (isNitroActive) {
        particlesRef.current.push({
          x: player.x - 8 + (Math.random() > 0.5 ? 16 : 0),
          y: player.y + 32,
          vx: (Math.random() - 0.5) * 15,
          vy: 180 + Math.random() * 40,
          radius: 5 + Math.random() * 4,
          color: Math.random() > 0.4 ? '#00ffff' : '#ff00aa',
          life: 0.2
        });
      }

      roadOffsetRef.current = (roadOffsetRef.current + newSpeed * 3.8 * dt) % 120;

      // Spawns
      if (Math.random() < 0.035) {
        const lanes = [roadLeft + 45, roadLeft + roadWidth / 2, roadLeft + roadWidth - 45];
        const laneX = lanes[Math.floor(Math.random() * lanes.length)];
        const tooClose = trafficRef.current.some(c => Math.abs(c.y - (-80)) < 120 && Math.abs(c.x - laneX) < 40);
        if (!tooClose) {
          const isTruck = Math.random() > 0.75;
          const colors = ['#3b82f6', '#eab308', '#22c55e', '#a855f7'];
          trafficRef.current.push({
            id: Math.random(),
            x: laneX,
            y: -90,
            width: isTruck ? 44 : 36,
            height: isTruck ? 95 : 60,
            speed: isTruck ? 55 : (70 + Math.random() * 40),
            color: isTruck ? '#94a3b8' : colors[Math.floor(Math.random() * colors.length)],
            nearMissChecked: false
          });
        }
      }

      if (Math.random() < 0.02) {
        itemsRef.current.push({
          id: Math.random(),
          type: Math.random() > 0.65 ? 'fuel' : 'coin',
          x: roadLeft + 30 + Math.random() * (roadWidth - 60),
          y: -40,
          radius: 12
        });
      }

      if (Math.random() < 0.008) {
        obstaclesRef.current.push({
          id: Math.random(),
          x: roadLeft + 35 + Math.random() * (roadWidth - 70),
          y: -40,
          width: 36,
          height: 24
        });
      }

      // Tráfego
      const activeTraffic = [];
      for (const car of trafficRef.current) {
        car.y += (newSpeed - car.speed) * 3.8 * dt;

        if (!car.nearMissChecked && car.y > player.y - 40 && car.y < player.y + 40) {
          const dx = Math.abs(car.x - player.x);
          if (dx > 36 && dx < 62) {
            car.nearMissChecked = true;
            setScore(p => p + 500);
            setNitro(p => Math.min(100, p + 15));
            setShowNearMiss(true);
            setTimeout(() => setShowNearMiss(false), 800);
          }
        }

        const hitX = Math.abs(car.x - player.x) < (car.width + player.width) / 2 - 6;
        const hitY = Math.abs(car.y - player.y) < (car.height + player.height) / 2 - 8;
        if (hitX && hitY) {
          audio.playCrash();
          endGame('CRASH', score);
          return;
        }

        if (car.y < canvasHeight + 120 && car.y > -150) activeTraffic.push(car);
      }
      trafficRef.current = activeTraffic;

      // Itens
      const activeItems = [];
      for (const it of itemsRef.current) {
        it.y += newSpeed * 3.8 * dt;
        if (Math.hypot(it.x - player.x, it.y - player.y) < it.radius + player.width / 2) {
          if (it.type === 'fuel') {
            audio.playFuelCollect();
            setFuel(p => Math.min(100, p + 30));
          } else {
            audio.playCoinCollect();
            setScore(p => p + 250);
            setNitro(p => Math.min(100, p + 10));
          }
        } else if (it.y < canvasHeight + 50) activeItems.push(it);
      }
      itemsRef.current = activeItems;

      // Obstáculos
      const activeObs = [];
      for (const obs of obstaclesRef.current) {
        obs.y += newSpeed * 3.8 * dt;
        if (Math.abs(obs.x - player.x) < (obs.width + player.width) / 2 - 8 &&
            Math.abs(obs.y - player.y) < (obs.height + player.height) / 2 - 6 &&
            player.skidTimer <= 0) {
          player.skidTimer = 0.9;
          audio.playSkid();
        } else if (obs.y < canvasHeight + 50) activeObs.push(obs);
      }
      obstaclesRef.current = activeObs;

      // Partículas
      const activeParts = [];
      for (const p of particlesRef.current) {
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.life > 0) activeParts.push(p);
      }
      particlesRef.current = activeParts;

      // Desenho
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Terreno
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Asfalto
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(roadLeft, 0, roadWidth, canvasHeight);

        // Zebras
        const stripeH = 30;
        const offset = roadOffsetRef.current % (stripeH * 2);
        for (let y = -stripeH * 2; y < canvasHeight + stripeH * 2; y += stripeH) {
          const isRed = Math.floor((y - offset) / stripeH) % 2 === 0;
          ctx.fillStyle = isRed ? '#ef4444' : '#ffffff';
          ctx.fillRect(roadLeft - 8, y + offset, 8, stripeH);
          ctx.fillRect(roadLeft + roadWidth, y + offset, 8, stripeH);
        }

        // Faixas tracejadas
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.setLineDash([25, 25]);
        ctx.lineDashOffset = -roadOffsetRef.current;
        ctx.beginPath();
        ctx.moveTo(roadLeft + roadWidth / 3, 0); ctx.lineTo(roadLeft + roadWidth / 3, canvasHeight);
        ctx.moveTo(roadLeft + (roadWidth / 3) * 2, 0); ctx.lineTo(roadLeft + (roadWidth / 3) * 2, canvasHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        // Óleo
        for (const obs of obstaclesRef.current) {
          ctx.fillStyle = '#090d16';
          ctx.beginPath();
          ctx.ellipse(obs.x, obs.y, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Itens
        for (const it of itemsRef.current) {
          if (it.type === 'fuel') {
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(it.x - 10, it.y - 12, 20, 24);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('GAS', it.x - 8, it.y + 4);
          } else {
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(it.x, it.y, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px monospace';
            ctx.fillText('$', it.x - 4, it.y + 4);
          }
        }

        // Tráfego
        for (const c of trafficRef.current) {
          ctx.save();
          ctx.translate(c.x, c.y);
          ctx.fillStyle = c.color;
          ctx.fillRect(-c.width / 2, -c.height / 2, c.width, c.height);
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-c.width / 2 + 4, -c.height / 2 + 10, c.width - 8, c.height * 0.25);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-c.width / 2 + 4, c.height / 2 - 5, 8, 4);
          ctx.fillRect(c.width / 2 - 12, c.height / 2 - 5, 8, 4);
          ctx.restore();
        }

        // Partículas
        for (const p of particlesRef.current) {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius || 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Player
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate((player.vx / 240) * 0.12);

        // Luz dos faróis
        const grad = ctx.createLinearGradient(0, -player.height / 2, 0, -player.height / 2 - 140);
        grad.addColorStop(0, 'rgba(255, 255, 200, 0.45)');
        grad.addColorStop(1, 'rgba(255, 255, 200, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-12, -player.height / 2);
        ctx.lineTo(-45, -player.height / 2 - 140);
        ctx.lineTo(45, -player.height / 2 - 140);
        ctx.lineTo(12, -player.height / 2);
        ctx.fill();

        // Carro
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, -player.height / 2, 8, player.height);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-player.width / 2 + 5, -player.height / 2 + 14, player.width - 10, 15);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-player.width / 2 + 3, -player.height / 2, 8, 4);
        ctx.fillRect(player.width / 2 - 11, -player.height / 2, 8, 4);
        ctx.fillStyle = isBraking ? '#ff0000' : '#b91c1c';
        ctx.fillRect(-player.width / 2 + 4, player.height / 2 - 4, 8, 4);
        ctx.fillRect(player.width / 2 - 12, player.height / 2 - 4, 8, 4);
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameState, speed, fuel, nitro, isNitroActive, score, distance]);

  return (
    <div style={{ background: '#0b0c10', color: '#fff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace' }}>
      <div className={`car-game-container ${isScreenShaking ? 'screen-shake' : ''}`}>
        {/* HUD */}
        <div className="arcade-hud">
          <div><div style={{ fontSize: '10px', color: '#8da4c4' }}>SCORE</div><div style={{ fontSize: '16px', color: '#66fcf1' }}>{score.toString().padStart(6, '0')}</div></div>
          <div><div style={{ fontSize: '10px', color: '#8da4c4' }}>BEST</div><div style={{ fontSize: '16px', color: '#ffe600' }}>{highScore.toString().padStart(6, '0')}</div></div>
          <div><div style={{ fontSize: '10px', color: '#8da4c4' }}>DIST</div><div style={{ fontSize: '16px', color: '#39ff14' }}>{Math.floor(distance)}m</div></div>
          <button type="button" onClick={() => setIsMuted(audio.toggleMute())} style={{ background: '#1c2430', border: '1px solid #415573', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>

        {/* Barras */}
        <div className="gauges-section">
          <div className="gauge-card">
            <div className="gauge-header"><span style={{ color: '#22c55e' }}>⛽ COMBUSTÍVEL</span><span>{Math.round(fuel)}%</span></div>
            <div className="gauge-bar-track"><div className="fuel-fill" style={{ width: `${fuel}%` }} /></div>
          </div>
          <div className="gauge-card">
            <div className="gauge-header"><span style={{ color: '#00ffff' }}>⚡ NITRO</span><span>{Math.round(nitro)}%</span></div>
            <div className="gauge-bar-track"><div className="nitro-fill" style={{ width: `${nitro}%` }} /></div>
          </div>
        </div>

        {/* Canvas */}
        <div className="track-canvas-wrapper">
          <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} className="game-canvas" />
          <div className="speedometer-floating">
            <span className="speed-number">{Math.round(speed)}</span>
            <span className="speed-unit">KM/H</span>
          </div>

          {showNearMiss && <div className="near-miss-banner">🔥 RASPÃO! +500 PTS 🔥</div>}

          {gameState === 'MENU' && (
            <div className="modal-overlay">
              <h1 className="arcade-title">TURBO HIGHWAY</h1>
              <div className="arcade-subtitle">RETRO RACING 8-BIT</div>
              <div className="instructions-card">
                <p>• <b>Setas ◀ ▶ ou A / D</b>: Virar o carro</p>
                <p>• <b>Seta ▲ / W</b>: Acelerar mais</p>
                <p>• <b>Seta ▼ / S</b>: Frear</p>
                <p>• <b>ESPAÇO ou SHIFT</b>: Ativar NITRO</p>
                <p>• <b>B ou H</b>: Buzina</p>
                <p style={{ marginTop: '6px' }}>• Colete galões de gasolina (GAS) e moedas ($)!</p>
              </div>
              <button type="button" className="arcade-btn-primary" onClick={startGame}>INICIAR CORRIDA ▶</button>
            </div>
          )}

          {gameState === 'GAME_OVER' && (
            <div className="modal-overlay">
              <h1 className="arcade-title" style={{ color: '#ef4444' }}>
                {gameOverReason === 'CRASH' ? 'BATIDA!' : 'PANE SECA!'}
              </h1>
              <div className="arcade-subtitle">
                {gameOverReason === 'CRASH' ? 'Você bateu no tráfego!' : 'Seu combustível acabou!'}
              </div>
              <div className="game-over-stats">
                <div className="stat-row"><span>SCORE:</span><span className="stat-row-value">{score}</span></div>
                <div className="stat-row"><span>DISTÂNCIA:</span><span className="stat-row-value">{Math.floor(distance)}m</span></div>
                <div className="stat-row"><span>RECORDE:</span><span className="stat-row-value" style={{ color: '#ffe600' }}>{highScore}</span></div>
              </div>
              <button type="button" className="arcade-btn-primary" onClick={startGame}>JOGAR NOVAMENTE 🔄</button>
            </div>
          )}
        </div>

        {/* Touch */}
        <div className="touch-controls-grid">
          <div className="touch-steering-group">
            <button type="button" className="touch-btn" onMouseDown={() => touchState.current.left = true} onMouseUp={() => touchState.current.left = false} onTouchStart={(e) => { e.preventDefault(); touchState.current.left = true; }} onTouchEnd={(e) => { e.preventDefault(); touchState.current.left = false; }}>◀ ESQ</button>
            <button type="button" className="touch-btn" onMouseDown={() => touchState.current.right = true} onMouseUp={() => touchState.current.right = false} onTouchStart={(e) => { e.preventDefault(); touchState.current.right = true; }} onTouchEnd={(e) => { e.preventDefault(); touchState.current.right = false; }}>DIR ▶</button>
          </div>
          <div className="touch-actions-group">
            <button type="button" className="touch-btn touch-btn-brake" onMouseDown={() => touchState.current.brake = true} onMouseUp={() => touchState.current.brake = false} onTouchStart={(e) => { e.preventDefault(); touchState.current.brake = true; }} onTouchEnd={(e) => { e.preventDefault(); touchState.current.brake = false; }}>🛑 FREIO</button>
            <button type="button" className="touch-btn touch-btn-nitro" onMouseDown={() => touchState.current.nitro = true} onMouseUp={() => touchState.current.nitro = false} onTouchStart={(e) => { e.preventDefault(); touchState.current.nitro = true; }} onTouchEnd={(e) => { e.preventDefault(); touchState.current.nitro = false; }}>⚡ NITRO</button>
          </div>
        </div>
      </div>
    </div>
  );
}
