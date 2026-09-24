import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// 1. ÁUDIO 8-BIT COM WEB AUDIO API (Nativo)
// ==========================================
class RetroAudioSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
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
    if (this.isMuted && this.bgmPlaying) this.stopBGM();
    return this.isMuted;
  }

  playMenuSelect() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.05);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  playMenuConfirm() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const time = now + i * 0.04;
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.07);
    });
  }

  playTextChar() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260 + (Math.random() * 40 - 20), now);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playSlash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    filter.Q.setValueAtTime(3, now);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  playBossHurt() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playPlayerHurt() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);
    oscGain.gain.setValueAtTime(0.35, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playHeal() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [392, 523.25, 659.25, 783.99, 1046.5];
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.06;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.18);
    });
  }

  playAttackStart() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.25);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playVineWarning() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(440, now + 0.08);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playHeartCrack() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.18);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playHeartShatter() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const time = now + i * 0.04;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900 - i * 110, time);
      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(time);
      osc.stop(time + 0.08);
    }
  }

  playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [
      { f: 392, d: 0.1 },
      { f: 523.25, d: 0.1 },
      { f: 659.25, d: 0.1 },
      { f: 783.99, d: 0.14 },
      { f: 659.25, d: 0.08 },
      { f: 783.99, d: 0.35 }
    ];
    let t = this.ctx.currentTime;
    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + n.d);
      t += n.d;
    });
  }

  startBattleBGM() {
    if (this.bgmPlaying || this.isMuted) return;
    this.init();
    if (!this.ctx) return;
    this.bgmPlaying = true;
    const bassline = [110, 110, 146.83, 110, 164.81, 146.83, 110, 130.81, 98, 98, 130.81, 98, 146.83, 130.81, 98, 110];
    let step = 0;
    this.bgmTimer = setInterval(() => {
      if (!this.bgmPlaying || this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(bassline[step % bassline.length], now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
      step++;
    }, 150);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

const audio = new RetroAudioSystem();

// ==========================================
// 2. FÍSICA E CONTROLADOR DE ATAQUES BULLET-HELL
// ==========================================
const ATTACK_TYPES = {
  PETALS: 'petals',
  VINES: 'vines',
  BURST: 'burst',
  SPIRAL: 'spiral',
  FINAL_COMBO: 'final_combo'
};

class AttackController {
  constructor(arenaWidth = 320, arenaHeight = 170) {
    this.width = arenaWidth;
    this.height = arenaHeight;
    this.attackType = ATTACK_TYPES.PETALS;
    this.timeElapsed = 0;
    this.duration = 7.5;
    this.speedMultiplier = 1.0;
    this.projectiles = [];
    this.warnings = [];
    this.lastSpawnTime = 0;
    this.spiralAngle = 0;
  }

  startAttack(type, speedMultiplier = 1.0) {
    this.attackType = type;
    this.speedMultiplier = speedMultiplier;
    this.timeElapsed = 0;
    this.projectiles = [];
    this.warnings = [];
    this.lastSpawnTime = 0;
    this.spiralAngle = 0;
  }

  update(dt, onWarningSound) {
    this.timeElapsed += dt;
    if (this.timeElapsed / this.duration >= 1.0) {
      return { isFinished: true, projectiles: [], warnings: [] };
    }

    if (this.attackType === ATTACK_TYPES.PETALS) {
      if (this.timeElapsed - this.lastSpawnTime >= 0.32 / this.speedMultiplier) {
        this.lastSpawnTime = this.timeElapsed;
        this.projectiles.push({
          id: Math.random(),
          type: 'petal',
          x: 20 + Math.random() * (this.width - 40),
          y: -10,
          vx: (Math.random() - 0.5) * 20,
          vy: 80 + Math.random() * 45,
          radius: 6,
          phase: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI,
          time: 0,
          life: 5.0
        });
      }
    } else if (this.attackType === ATTACK_TYPES.VINES) {
      if (this.timeElapsed - this.lastSpawnTime >= 1.3 / this.speedMultiplier && this.timeElapsed < this.duration - 1.2) {
        this.lastSpawnTime = this.timeElapsed;
        const isHorizontal = Math.random() > 0.5;
        const warnDur = 0.65 / this.speedMultiplier;
        if (isHorizontal) {
          const y = 30 + Math.random() * (this.height - 60);
          this.warnings.push({ id: Math.random(), isHorizontal: true, pos: y, timer: warnDur, thickness: 24 });
          if (onWarningSound) onWarningSound();
          setTimeout(() => {
            this.projectiles.push({ id: Math.random(), type: 'vine_strike', isHorizontal: true, x: 0, y: y - 12, width: this.width, height: 24, growProgress: 0, time: 0, life: 0.5 });
          }, warnDur * 1000);
        } else {
          const x = 30 + Math.random() * (this.width - 60);
          this.warnings.push({ id: Math.random(), isHorizontal: false, pos: x, timer: warnDur, thickness: 24 });
          if (onWarningSound) onWarningSound();
          setTimeout(() => {
            this.projectiles.push({ id: Math.random(), type: 'vine_strike', isHorizontal: false, x: x - 12, y: 0, width: 24, height: this.height, growProgress: 0, time: 0, life: 0.5 });
          }, warnDur * 1000);
        }
      }
    } else if (this.attackType === ATTACK_TYPES.BURST) {
      if (this.timeElapsed - this.lastSpawnTime >= 1.5 / this.speedMultiplier && this.timeElapsed < this.duration - 1.2) {
        this.lastSpawnTime = this.timeElapsed;
        const targetX = 50 + Math.random() * (this.width - 100);
        const targetY = 40 + Math.random() * (this.height - 80);
        this.projectiles.push({
          id: Math.random(),
          type: 'burst_seed',
          x: this.width / 2,
          y: 0,
          vx: (targetX - this.width / 2) / 0.8,
          vy: targetY / 0.8,
          radius: 8,
          time: 0,
          life: 5.0,
          exploded: false
        });
      }
    } else if (this.attackType === ATTACK_TYPES.SPIRAL) {
      if (this.timeElapsed - this.lastSpawnTime >= 0.12 / this.speedMultiplier) {
        this.lastSpawnTime = this.timeElapsed;
        this.spiralAngle += 0.38;
        const speed = 75;
        for (let arm = 0; arm < 2; arm++) {
          const angle = this.spiralAngle + arm * Math.PI;
          this.projectiles.push({
            id: Math.random(),
            type: 'spiral_bullet',
            x: this.width / 2,
            y: 20,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed * 0.75 + 25,
            radius: 5.5,
            time: 0,
            life: 4.5
          });
        }
      }
    } else if (this.attackType === ATTACK_TYPES.FINAL_COMBO) {
      if (this.timeElapsed - this.lastSpawnTime >= 0.35 / this.speedMultiplier) {
        this.lastSpawnTime = this.timeElapsed;
        this.projectiles.push({
          id: Math.random(),
          type: 'petal',
          x: 15 + Math.random() * (this.width - 30),
          y: -10,
          vx: (Math.random() - 0.5) * 30,
          vy: 105 + Math.random() * 50,
          radius: 6,
          phase: Math.random() * Math.PI * 2,
          rotation: Math.random() * Math.PI,
          time: 0,
          life: 4.0
        });
      }
    }

    const alive = [];
    for (const p of this.projectiles) {
      p.time += dt;
      if (p.type === 'petal') {
        p.y += p.vy * dt * this.speedMultiplier;
        p.x += Math.sin(p.time * 5 + p.phase) * (40 * dt) + p.vx * dt;
        p.rotation += 2.5 * dt;
      } else if (p.type === 'burst_seed') {
        p.y += p.vy * dt * this.speedMultiplier;
        p.x += p.vx * dt * this.speedMultiplier;
        if (p.time > 0.8 && !p.exploded) {
          p.exploded = true;
          for (let i = 0; i < 8; i++) {
            const angle = (i * 2 * Math.PI) / 8 + Math.PI / 8;
            this.projectiles.push({
              id: Math.random(),
              type: 'radial_bullet',
              x: p.x,
              y: p.y,
              vx: Math.cos(angle) * 80 * this.speedMultiplier,
              vy: Math.sin(angle) * 80 * this.speedMultiplier,
              radius: 5,
              time: 0,
              life: 4.0
            });
          }
        }
      } else if (p.type === 'radial_bullet' || p.type === 'spiral_bullet') {
        p.x += p.vx * dt * this.speedMultiplier;
        p.y += p.vy * dt * this.speedMultiplier;
      } else if (p.type === 'vine_strike') {
        p.growProgress = Math.min(1.0, (p.growProgress || 0) + dt * 4.5);
      }

      if (p.time < (p.life || 6.0) && p.x >= -30 && p.x <= this.width + 30 && p.y >= -30 && p.y <= this.height + 30) {
        if (!(p.exploded && p.type === 'burst_seed')) alive.push(p);
      }
    }
    this.projectiles = alive;

    this.warnings = this.warnings.filter(w => {
      w.timer -= dt;
      return w.timer > 0;
    });

    return { isFinished: false, projectiles: this.projectiles, warnings: this.warnings };
  }
}

// ==========================================
// 3. COMPONENTE PRINCIPAL DO JOGO (Export Default)
// ==========================================
export default function FloweryBattle() {
  const [gameState, setGameState] = useState('TITLE');
  const [turnState, setTurnState] = useState('PLAYER_MENU');
  const [isMuted, setIsMuted] = useState(false);

  const [playerHp, setPlayerHp] = useState(20);
  const [bossHp, setBossHp] = useState(100);
  const [mercyProgress, setMercyProgress] = useState(0);

  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [submenuIndex, setSubmenuIndex] = useState(0);
  const [inventory, setInventory] = useState([
    { id: 'snack', name: 'Snack', desc: 'Restaura 10 de HP.', heal: 10 },
    { id: 'candy', name: 'Healing Candy', desc: 'Restaura todo o HP.', heal: 20 },
    { id: 'flower', name: 'Strange Flower', desc: 'Acalma as vinhas (+50 Mercy).', heal: 5, mercy: 50 }
  ]);

  const [talkCount, setTalkCount] = useState(0);
  const [speedMod, setSpeedMod] = useState(1.0);
  const [bossDefMod, setBossDefMod] = useState(1.0);
  const [attackTurnCount, setAttackTurnCount] = useState(0);

  const [flavorText, setFlavorText] = useState('FLOWERY está observando cada movimento seu.');
  const [bossSpeech, setBossSpeech] = useState('Você acha que pode fugir do meu jardim?');
  const [isBossHurt, setIsBossHurt] = useState(false);
  const [damageNumber, setDamageNumber] = useState(null);
  const [showSlash, setShowSlash] = useState(false);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [isInvincible, setIsInvincible] = useState(false);

  const [playerPos, setPlayerPos] = useState({ x: 160, y: 85 });
  const attackControllerRef = useRef(new AttackController(320, 170));
  const keysPressed = useRef({});
  const touchDirection = useRef({ up: false, down: false, left: false, right: false });

  const [soulBroken, setSoulBroken] = useState(false);
  const [soulShattered, setSoulShattered] = useState(false);

  // Timing bar
  const [cursorPos, setCursorPos] = useState(0);
  const [hasStruck, setHasStruck] = useState(false);
  const posRef = useRef(0);
  const dirRef = useRef(1);

  // Typewriter
  const [displayedText, setDisplayedText] = useState('');
  const textIndexRef = useRef(0);

  // Teclado Global
  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.code] = true;
      keysPressed.current[e.key] = true;
      if (e.key === 'Escape' && ['SUBMENU_ACT', 'SUBMENU_ITEM', 'SUBMENU_MERCY'].includes(turnState)) {
        audio.playMenuSelect();
        setTurnState('PLAYER_MENU');
        setFlavorText('O que você fará a seguir?');
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
  }, [turnState]);

  // Typewriter effect
  useEffect(() => {
    setDisplayedText('');
    textIndexRef.current = 0;
    if (!flavorText) return;
    const interval = setInterval(() => {
      textIndexRef.current += 1;
      setDisplayedText(flavorText.slice(0, textIndexRef.current));
      if (textIndexRef.current % 2 === 0) audio.playTextChar();
      if (textIndexRef.current >= flavorText.length) clearInterval(interval);
    }, 28);
    return () => clearInterval(interval);
  }, [flavorText]);

  // Timing Bar loop
  useEffect(() => {
    if (turnState !== 'FIGHT_TIMING') return;
    setHasStruck(false);
    posRef.current = 0;
    dirRef.current = 1;
    let animId;
    let lastT = performance.now();
    const timingLoop = (t) => {
      const dt = (t - lastT) / 1000;
      lastT = t;
      let nextPos = posRef.current + dirRef.current * 120 * dt;
      if (nextPos >= 100) { nextPos = 100; dirRef.current = -1; }
      else if (nextPos <= 0) { nextPos = 0; dirRef.current = 1; }
      posRef.current = nextPos;
      setCursorPos(nextPos);
      animId = requestAnimationFrame(timingLoop);
    };
    animId = requestAnimationFrame(timingLoop);
    return () => cancelAnimationFrame(animId);
  }, [turnState]);

  // Canvas loop esquiva
  const canvasRef = useRef(null);
  useEffect(() => {
    if (turnState !== 'ENEMY_DODGE') return;
    let lastT = performance.now();
    let animId;
    const loop = (t) => {
      const dt = Math.min((t - lastT) / 1000, 0.05);
      lastT = t;

      let dx = 0; let dy = 0;
      if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA'] || touchDirection.current.left) dx -= 1;
      if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD'] || touchDirection.current.right) dx += 1;
      if (keysPressed.current['ArrowUp'] || keysPressed.current['KeyW'] || touchDirection.current.up) dy -= 1;
      if (keysPressed.current['ArrowDown'] || keysPressed.current['KeyS'] || touchDirection.current.down) dy += 1;
      if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }

      setPlayerPos(prev => ({
        x: Math.max(13, Math.min(307, prev.x + dx * 150 * dt)),
        y: Math.max(13, Math.min(157, prev.y + dy * 150 * dt))
      }));

      const { isFinished, projectiles, warnings } = attackControllerRef.current.update(dt, () => audio.playVineWarning());
      if (isFinished) {
        setTurnState('PLAYER_MENU');
        setFlavorText('Flowery está observando atentamente a sua alma.');
        return;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 320, 170);
        for (const w of warnings) {
          ctx.fillStyle = `rgba(239, 68, 68, ${0.3 + 0.3 * Math.sin(t / 60)})`;
          if (w.isHorizontal) ctx.fillRect(0, w.pos - w.thickness / 2, 320, w.thickness);
          else ctx.fillRect(w.pos - w.thickness / 2, 0, w.thickness, 170);
        }
        for (const p of projectiles) {
          if (p.type === 'petal') {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.ellipse(0, 0, p.radius, p.radius * 1.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else if (p.type === 'vine_strike') {
            ctx.fillStyle = '#15803d';
            const prog = p.growProgress || 1;
            if (p.isHorizontal) ctx.fillRect(0, p.y, p.width * prog, p.height);
            else ctx.fillRect(p.x, 0, p.width, p.height * prog);
          } else {
            ctx.fillStyle = p.type === 'radial_bullet' ? '#38bdf8' : '#fb923c';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius || 5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      if (!isInvincible) {
        for (const p of projectiles) {
          const dist = Math.hypot(p.x - playerPos.x, p.y - playerPos.y);
          if (dist < (p.radius || 6) + 5.5) {
            handleHit(4);
            break;
          }
        }
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [turnState, isInvincible, playerPos]);

  const handleHit = (dmg) => {
    audio.playPlayerHurt();
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 300);
    const n = Math.max(0, playerHp - dmg);
    setPlayerHp(n);
    if (n <= 0) {
      audio.stopBGM();
      audio.playHeartCrack();
      setGameState('GAME_OVER');
      setSoulBroken(true);
      setTimeout(() => { audio.playHeartShatter(); setSoulShattered(true); }, 900);
      return;
    }
    setIsInvincible(true);
    setTimeout(() => setIsInvincible(false), 1000);
  };

  const startBattle = () => {
    audio.playMenuConfirm();
    audio.startBattleBGM();
    setGameState('BATTLE');
    setTurnState('PLAYER_MENU');
    setPlayerHp(20);
    setBossHp(100);
    setMercyProgress(0);
    setTalkCount(0);
    setSpeedMod(1.0);
    setBossDefMod(1.0);
    setAttackTurnCount(0);
    setFlavorText('Uma planta misteriosa e ameaçadora bloqueia seu caminho!');
    setBossSpeech('Você parece perdido, humana... ou apenas indefeso?');
  };

  const handleStrike = () => {
    if (hasStruck) return;
    setHasStruck(true);
    audio.playSlash();
    const dist = Math.abs(posRef.current - 50);
    let dmg = 0;
    if (dist <= 4) dmg = Math.floor(28 + Math.random() * 8);
    else if (dist <= 12) dmg = Math.floor(18 + Math.random() * 6);
    else if (dist <= 25) dmg = Math.floor(10 + Math.random() * 6);
    else if (dist <= 40) dmg = Math.floor(4 + Math.random() * 5);

    const finalDmg = Math.floor(dmg * bossDefMod);
    setBossDefMod(1.0);
    setDamageNumber(finalDmg);

    if (finalDmg > 0) {
      setShowSlash(true);
      setIsBossHurt(true);
      audio.playBossHurt();
      const nHp = Math.max(0, bossHp - finalDmg);
      setBossHp(nHp);
      setTimeout(() => { setIsBossHurt(false); setShowSlash(false); }, 500);
      if (nHp <= 0) {
        setTimeout(() => { audio.stopBGM(); audio.playVictory(); setGameState('VICTORY_FIGHT'); }, 800);
        return;
      }
    }

    setTimeout(() => {
      setDamageNumber(null);
      setFlavorText(finalDmg > 0 ? `Você atacou Flowery causando ${finalDmg} de dano!` : 'Você errou o ataque!');
      setTurnState('NARRATIVE_FEEDBACK');
    }, 600);
  };

  const handleAct = (actId) => {
    audio.playMenuConfirm();
    if (actId === 'TALK') {
      const c = talkCount + 1;
      setTalkCount(c);
      if (c === 1) {
        setFlavorText('Você tenta conversar amigavelmente com Flowery.');
        setBossSpeech('Conversar?! Raízes não têm ouvidos para suas desculpas!');
        setMercyProgress(p => Math.min(100, p + 25));
      } else if (c === 2) {
        setFlavorText('Você pergunta por que Flowery está tão solitária.');
        setBossSpeech('Solitária...? O que você sabe sobre mim?! Pare com isso!');
        setMercyProgress(p => Math.min(100, p + 35));
      } else {
        setFlavorText('Você sorri e convida Flowery para ver o sol na superfície.');
        setBossSpeech('O sol...? Eu quase me esqueci de como a luz é quente...');
        setMercyProgress(100);
      }
    } else if (actId === 'OBSERVE') {
      setFlavorText('FLOWERY - ATK 6 DEF 4. Uma criatura botânica que floresceu no escuro.');
      setBossSpeech('O que está olhando?! Nunca viu espinhos?!');
    } else if (actId === 'COMPLIMENT') {
      setFlavorText('Você elogia o brilho vibrante das pétalas de Flowery.');
      setBossSpeech('O-O quê?! Pare com isso... Minhas pétalas são bonitas?');
      setSpeedMod(0.75);
      setMercyProgress(p => Math.min(100, p + 35));
    } else if (actId === 'TAUNT') {
      setFlavorText('Você diz que Flowery se parece com mato de calçada.');
      setBossSpeech('MATO DE CALÇADA?! Vou drenar sua alma agora mesmo!');
      setSpeedMod(1.3);
      setBossDefMod(1.5);
      setMercyProgress(p => Math.min(100, p + 10));
    }
    setTurnState('NARRATIVE_FEEDBACK');
  };

  const handleItem = (item, idx) => {
    audio.playHeal();
    setPlayerHp(p => Math.min(20, p + item.heal));
    if (item.mercy) {
      setMercyProgress(p => Math.min(100, p + item.mercy));
      setBossSpeech('O aroma dessa flor... me traz paz.');
    }
    setFlavorText(`Você usou ${item.name}! Recuperou ${item.heal} HP.`);
    setInventory(inv => inv.filter((_, i) => i !== idx));
    setTurnState('NARRATIVE_FEEDBACK');
  };

  const handleMercy = (action) => {
    audio.playMenuConfirm();
    if (action === 'SPARE') {
      if (mercyProgress >= 100) {
        audio.stopBGM();
        audio.playVictory();
        setGameState('VICTORY_PACIFIST');
      } else {
        setFlavorText('Você tentou poupar Flowery. Mas as raízes continuam tensas! (Use ACT)');
        setBossSpeech('Poupar-me?! Eu ainda não terminei com você!');
        setMercyProgress(p => Math.min(100, p + 15));
        setTurnState('NARRATIVE_FEEDBACK');
      }
    } else {
      setFlavorText('Videiras trancaram todas as saídas! Não há como fugir.');
      setTurnState('NARRATIVE_FEEDBACK');
    }
  };

  const advanceEnemy = () => {
    audio.playAttackStart();
    setTurnState('ENEMY_DODGE');
    setPlayerPos({ x: 160, y: 85 });
    const list = [ATTACK_TYPES.PETALS, ATTACK_TYPES.VINES, ATTACK_TYPES.BURST, ATTACK_TYPES.SPIRAL];
    const at = bossHp < 35 ? ATTACK_TYPES.FINAL_COMBO : list[attackTurnCount % list.length];
    attackControllerRef.current.startAttack(at, speedMod);
    setSpeedMod(1.0);
    setAttackTurnCount(c => c + 1);
  };

  return (
    <div style={{ background: '#050508', color: '#fff', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace' }}>
      <div className={`game-viewport ${isScreenShaking ? 'screen-shake' : ''}`}>
        {/* Top */}
        <div className="top-hud">
          <span>RETRO RPG BATTLE</span>
          <button type="button" className="sound-toggle-btn" onClick={() => setIsMuted(audio.toggleMute())}>
            {isMuted ? '🔇 ÁUDIO: OFF' : '🔊 ÁUDIO: ON'}
          </button>
        </div>

        {/* Boss */}
        <div className="boss-container">
          {gameState === 'BATTLE' && turnState !== 'ENEMY_DODGE' && bossSpeech && (
            <div className="boss-speech-bubble">"{bossSpeech}"</div>
          )}
          {damageNumber !== null && <div className="floating-damage">{damageNumber > 0 ? `-${damageNumber}` : 'MISS'}</div>}
          {showSlash && (
            <svg className="slash-effect" viewBox="0 0 100 100">
              <line x1="10" y1="50" x2="90" y2="50" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
            </svg>
          )}
          <div className={`boss-sprite-wrapper ${isBossHurt ? 'boss-hurt-anim' : 'boss-idle'}`}>
            <svg width="150" height="130" viewBox="0 0 160 140">
              <path d="M 80 135 Q 70 105, 80 85" fill="none" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" />
              {[0, 60, 120, 180, 240, 300].map((angle, idx) => (
                <g key={idx} transform={`rotate(${angle}, 80, 60)`}>
                  <ellipse cx="80" cy="20" rx="15" ry="24" fill="#facc15" stroke="#b45309" strokeWidth="2.5" />
                </g>
              ))}
              <circle cx="80" cy="60" r="28" fill="#ffffff" stroke="#000000" strokeWidth="3.5" />
              <ellipse cx="72" cy="55" rx="4" ry="5.5" fill="#000" />
              <ellipse cx="88" cy="55" rx="4" ry="5.5" fill="#000" />
              <path d="M 70 67 Q 80 77, 90 67" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="boss-hp-section">
            <span>FLOWERY</span>
            <div className="boss-hp-track">
              <div className="boss-hp-fill" style={{ width: `${Math.max(0, (bossHp / 100) * 100)}%` }} />
            </div>
            <span>{bossHp} / 100</span>
          </div>
        </div>

        {/* Arena / Box */}
        <div className={`battle-center-box ${turnState === 'ENEMY_DODGE' ? 'dodge-mode' : ''}`} style={{ maxWidth: turnState === 'ENEMY_DODGE' ? '320px' : '100%', margin: '0 auto' }}>
          {turnState === 'ENEMY_DODGE' ? (
            <div style={{ position: 'relative', width: '320px', height: '170px' }}>
              <canvas ref={canvasRef} width="320" height="170" className="dodge-arena-canvas" />
              <div style={{ position: 'absolute', left: `${playerPos.x - 8}px`, top: `${playerPos.y - 8}px`, width: '16px', height: '16px', pointerEvents: 'none', opacity: isInvincible ? 0.4 : 1 }}>
                <svg width="16" height="16" viewBox="0 0 16 16"><path d="M 8,14 L 2,8 C 0,6 0,3 2,1 C 4,-1 7,1 8,3 C 9,1 12,-1 14,1 C 16,3 16,6 14,8 Z" fill="#f00" /></svg>
              </div>
            </div>
          ) : turnState === 'PLAYER_MENU' ? (
            <div className="dialogue-text"><span className="text-star">*</span>{displayedText}</div>
          ) : turnState === 'FIGHT_TIMING' ? (
            <div className="timing-bar-container">
              <div className="timing-track" onClick={handleStrike}>
                <div className="timing-target-center" /><div className="timing-target-bullseye" />
                <div className="timing-cursor" style={{ left: `${cursorPos}%` }} />
              </div>
              <button type="button" className="timing-strike-btn" onClick={handleStrike} style={{ marginTop: '10px' }}>GOLPEAR (STRIKE)!</button>
            </div>
          ) : turnState === 'SUBMENU_ACT' ? (
            <div className="action-submenu">
              {['TALK', 'OBSERVE', 'COMPLIMENT', 'TAUNT'].map(a => (
                <div key={a} className="action-option-item" onClick={() => handleAct(a)}>* {a}</div>
              ))}
            </div>
          ) : turnState === 'SUBMENU_ITEM' ? (
            <div className="action-submenu">
              {inventory.map((item, idx) => (
                <div key={item.id} className="action-option-item" onClick={() => handleItem(item, idx)}>* {item.name} (+{item.heal} HP)</div>
              ))}
            </div>
          ) : turnState === 'SUBMENU_MERCY' ? (
            <div className="action-submenu">
              <div className={`action-option-item ${mercyProgress >= 100 ? 'yellow-name' : ''}`} onClick={() => handleMercy('SPARE')}>* SPARE (Poupar)</div>
              <div className="action-option-item" onClick={() => handleMercy('FLEE')}>* FLEE (Fugir)</div>
            </div>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div className="dialogue-text"><span className="text-star">*</span>{displayedText}</div>
              <button type="button" className="timing-strike-btn" style={{ alignSelf: 'flex-end' }} onClick={advanceEnemy}>CONTINUAR ▶</button>
            </div>
          )}
        </div>

        {/* Player Status */}
        <div className="player-status-hud">
          <div className="player-info-left"><span>HUMAN</span><span>LV 1</span></div>
          <div className="player-hp-wrapper">
            <span className="hp-label">HP</span>
            <div className="player-hp-bar"><div className="player-hp-fill" style={{ width: `${(playerHp / 20) * 100}%` }} /></div>
            <span className="player-hp-values">{playerHp} / 20</span>
          </div>
          <div className="mercy-indicator"><span>MERCY</span><div className="mercy-bar-mini"><div className="mercy-bar-fill" style={{ width: `${mercyProgress}%` }} /></div><span>{mercyProgress}%</span></div>
        </div>

        {/* Command Menu */}
        <div className="command-menu-grid">
          {['FIGHT', 'ACT', 'ITEM', 'MERCY'].map((cmd, idx) => (
            <button key={cmd} type="button" className={`command-btn ${selectedCommandIndex === idx ? 'selected' : ''}`} onClick={() => {
              setSelectedCommandIndex(idx);
              if (cmd === 'FIGHT') setTurnState('FIGHT_TIMING');
              else if (cmd === 'ACT') setTurnState('SUBMENU_ACT');
              else if (cmd === 'ITEM') setTurnState('SUBMENU_ITEM');
              else setTurnState('SUBMENU_MERCY');
            }}>{cmd}</button>
          ))}
        </div>

        {/* Mobile */}
        <div className="mobile-controls-container">
          <div className="dpad-container">
            <button type="button" className="dpad-btn dpad-up" onMouseDown={() => touchDirection.current.up = true} onMouseUp={() => touchDirection.current.up = false} onTouchStart={() => touchDirection.current.up = true} onTouchEnd={() => touchDirection.current.up = false}>▲</button>
            <button type="button" className="dpad-btn dpad-left" onMouseDown={() => touchDirection.current.left = true} onMouseUp={() => touchDirection.current.left = false} onTouchStart={() => touchDirection.current.left = true} onTouchEnd={() => touchDirection.current.left = false}>◀</button>
            <button type="button" className="dpad-btn dpad-right" onMouseDown={() => touchDirection.current.right = true} onMouseUp={() => touchDirection.current.right = false} onTouchStart={() => touchDirection.current.right = true} onTouchEnd={() => touchDirection.current.right = false}>▶</button>
            <button type="button" className="dpad-btn dpad-down" onMouseDown={() => touchDirection.current.down = true} onMouseUp={() => touchDirection.current.down = false} onTouchStart={() => touchDirection.current.down = true} onTouchEnd={() => touchDirection.current.down = false}>▼</button>
          </div>
          <button type="button" className="action-touch-btn" onClick={() => {
            if (turnState === 'NARRATIVE_FEEDBACK') advanceEnemy();
            else if (['SUBMENU_ACT', 'SUBMENU_ITEM', 'SUBMENU_MERCY'].includes(turnState)) setTurnState('PLAYER_MENU');
          }}>[ OK / VOLTAR ]</button>
        </div>

        {/* Overlays */}
        {gameState === 'TITLE' && (
          <div className="special-screen-overlay">
            <div className="title-screen-logo">FLOWERY</div>
            <p style={{ color: '#ccc' }}>An unusual flower has appeared.</p>
            <button type="button" className="start-battle-btn" onClick={startBattle}>START BATTLE</button>
          </div>
        )}
        {gameState === 'GAME_OVER' && (
          <div className="special-screen-overlay">
            <div className="game-over-title">GAME OVER</div>
            <p style={{ color: '#faa' }}>Mantenha sua determinação...</p>
            <button type="button" className="restart-btn" onClick={startBattle}>TRY AGAIN</button>
          </div>
        )}
        {gameState === 'VICTORY_FIGHT' && (
          <div className="special-screen-overlay">
            <div className="victory-title">VITÓRIA!</div>
            <p>FLOWERY was defeated.</p>
            <button type="button" className="restart-btn" onClick={startBattle}>JOGAR NOVAMENTE</button>
          </div>
        )}
        {gameState === 'VICTORY_PACIFIST' && (
          <div className="special-screen-overlay">
            <div className="victory-title" style={{ color: '#fef08a' }}>AMIZADE CONQUISTADA!</div>
            <p>FLOWERY decidiu ser sua amiga!</p>
            <button type="button" className="restart-btn" onClick={startBattle}>JOGAR NOVAMENTE</button>
          </div>
        )}
      </div>
    </div>
  );
}
