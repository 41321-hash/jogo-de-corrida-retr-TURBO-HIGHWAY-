// Sintetizador de Áudio Retro Top Gear (SNES 1992) via Web Audio API
// 100% autônomo, sem arquivos externos de áudio, funciona offline.

class TopGearAudioSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.engineOsc = null;
    this.engineSubOsc = null;
    this.engineGain = null;
    this.engineFilter = null;
    this.bgmTimer = null;
    this.bgmPlaying = false;
    this.currentTrackTheme = 'vegas'; // 'vegas', 'rio', 'menu'
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
    } else {
      this.startEngine();
      this.startRaceBGM(this.currentTrackTheme);
    }
    return this.isMuted;
  }

  // ==========================================
  // MOTOR MULTI-CAMADA (Com Câmbio e RPM)
  // ==========================================
  startEngine() {
    if (this.isMuted || this.engineOsc) return;
    this.init();
    if (!this.ctx) return;

    // Oscilador principal de serra (ronco do motor)
    this.engineOsc = this.ctx.createOscillator();
    this.engineSubOsc = this.ctx.createOscillator();
    this.engineGain = this.ctx.createGain();
    this.engineFilter = this.ctx.createBiquadFilter();

    this.engineOsc.type = 'sawtooth';
    this.engineSubOsc.type = 'triangle';

    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(380, this.ctx.currentTime);
    this.engineFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);

    this.engineGain.gain.setValueAtTime(0.09, this.ctx.currentTime);

    this.engineOsc.connect(this.engineFilter);
    this.engineSubOsc.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);

    this.engineOsc.frequency.setValueAtTime(55, this.ctx.currentTime);
    this.engineSubOsc.frequency.setValueAtTime(27.5, this.ctx.currentTime);

    this.engineOsc.start();
    this.engineSubOsc.start();
  }

  updateEngine(rpmRatio, gear, isNitro) {
    if (this.isMuted || !this.engineOsc || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Frequência base por marcha e RPM
    // rpmRatio varia de 0.2 a 1.15
    const baseFreq = 48 + gear * 8 + rpmRatio * 180 + (isNitro ? 70 : 0);
    this.engineOsc.frequency.setTargetAtTime(baseFreq, now, 0.05);
    this.engineSubOsc.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.05);

    // Filtro abre com o aumento de rotações
    const filterFreq = 300 + rpmRatio * 900 + (isNitro ? 500 : 0);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.06);

    // Volume levemente elevado durante nitro
    this.engineGain.gain.setTargetAtTime(isNitro ? 0.13 : 0.085, now, 0.05);
  }

  stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch (e) {}
      this.engineOsc = null;
    }
    if (this.engineSubOsc) {
      try {
        this.engineSubOsc.stop();
        this.engineSubOsc.disconnect();
      } catch (e) {}
      this.engineSubOsc = null;
    }
  }

  // ==========================================
  // EFEITOS ESPECIAIS (SFX)
  // ==========================================

  // Pneus cantando / Derrapagem em curvas
  playSkid() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.2);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200 + Math.random() * 300, now);
    filter.Q.setValueAtTime(10, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  // Troca de Marcha (Shift clunk)
  playGearShift() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Som potente de NITRO BOOST (Whoosh + Rocket)
  playNitro() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Explosão / Foguete
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.5);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.25);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);

    // Tom ascendente do turbo
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.4);

    oscGain.gain.setValueAtTime(0.18, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  // Batida / Colisão com Carro Rival ou Placa
  playCrash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.4);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  // Alerta de Combustível Baixo (Pit In / Low Fuel beep)
  playLowFuelAlert() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now); // A5

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Pit Stop: Reabastecimento contínuo
  playPitStopRefuel() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [659.25, 880, 1046.5]; // E5, A5, C6
    const f = freqs[Math.floor(Math.random() * freqs.length)];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, now);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Buzina do Carro
  playHorn() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [392, 493.88].forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    });
  }

  // Vitória / Fim de Corrida
  playVictory() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.15, t: 0 },    // C5
      { f: 523.25, d: 0.15, t: 0.15 }, // C5
      { f: 523.25, d: 0.15, t: 0.3 },  // C5
      { f: 659.25, d: 0.3, t: 0.45 },  // E5
      { f: 783.99, d: 0.25, t: 0.75 }, // G5
      { f: 1046.5, d: 0.6, t: 1.0 }    // C6
    ];

    notes.forEach((n) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      gain.gain.setValueAtTime(0.2, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.d);
    });
  }

  // ==========================================
  // TRILHA SONORA OFICIAL TOP GEAR (SNES 1992)
  // Reconstrução Sintetizada do Tema Lendário de Barry Leitch
  // ==========================================
  startRaceBGM(track = 'vegas') {
    if (this.bgmPlaying || this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    this.bgmPlaying = true;
    this.currentTrackTheme = track;

    // Arpeggio de baixo icônico do Top Gear (Am / F / G / Em)
    // 16 passos por compasso em andamento rápido arcade (144 BPM => aprox 104ms por semicolcheia)
    // Notas em Hertz:
    // A1=55, C2=65.4, E2=82.4, G2=98, A2=110, B2=123.5, C3=130.8, D3=146.8, E3=164.8
    const bassAm = [55, 110, 82.4, 110, 65.4, 110, 82.4, 110, 55, 110, 82.4, 110, 98, 110, 82.4, 110];
    const bassF  = [43.65, 87.3, 65.4, 87.3, 55, 87.3, 65.4, 87.3, 43.65, 87.3, 65.4, 87.3, 77.78, 87.3, 65.4, 87.3];
    const bassG  = [49, 98, 73.4, 98, 58.27, 98, 73.4, 98, 49, 98, 73.4, 98, 87.3, 98, 73.4, 98];
    const bassEm = [41.2, 82.4, 61.74, 82.4, 49, 82.4, 61.74, 82.4, 41.2, 82.4, 61.74, 82.4, 73.4, 82.4, 61.74, 82.4];

    const fullBass = [...bassAm, ...bassF, ...bassG, ...bassEm];

    // Melodia icônica do sintetizador Top Gear
    // 64 passos (4 compassos)
    // E4=329.63, G4=392, A4=440, B4=493.88, C5=523.25, D5=587.33, E5=659.25
    const leadNotes = new Array(64).fill(0);
    // Compasso 1 (Am)
    leadNotes[0] = 440; // A4
    leadNotes[4] = 523.25; // C5
    leadNotes[6] = 587.33; // D5
    leadNotes[8] = 659.25; // E5
    leadNotes[12] = 587.33; // D5
    leadNotes[14] = 523.25; // C5
    // Compasso 2 (F)
    leadNotes[16] = 440; // A4
    leadNotes[20] = 392; // G4
    leadNotes[24] = 440; // A4
    leadNotes[28] = 523.25; // C5
    // Compasso 3 (G)
    leadNotes[32] = 587.33; // D5
    leadNotes[36] = 659.25; // E5
    leadNotes[40] = 783.99; // G5
    leadNotes[44] = 659.25; // E5
    // Compasso 4 (Em)
    leadNotes[48] = 587.33; // D5
    leadNotes[52] = 523.25; // C5
    leadNotes[56] = 493.88; // B4
    leadNotes[60] = 392; // G4

    // Acordes synth pad (sustentados a cada 16 passos)
    const padChords = [
      [220, 261.63, 329.63], // Am
      [174.61, 220, 261.63], // F
      [196, 246.94, 293.66], // G
      [164.81, 196, 246.94]  // Em
    ];

    let step = 0;
    const stepDuration = 0.105; // 105ms

    this.bgmTimer = setInterval(() => {
      if (!this.bgmPlaying || this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const currentStep = step % 64;

      // 1. Baixo Rítmico (Sawtooth com filtro punchy)
      const bFreq = fullBass[currentStep];
      if (bFreq) {
        const bOsc = this.ctx.createOscillator();
        const bFilter = this.ctx.createBiquadFilter();
        const bGain = this.ctx.createGain();

        bOsc.type = 'sawtooth';
        bOsc.frequency.setValueAtTime(bFreq, now);

        bFilter.type = 'lowpass';
        bFilter.frequency.setValueAtTime(650, now);
        bFilter.frequency.exponentialRampToValueAtTime(180, now + stepDuration);

        bGain.gain.setValueAtTime(0.08, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration);

        bOsc.connect(bFilter);
        bFilter.connect(bGain);
        bGain.connect(this.ctx.destination);

        bOsc.start(now);
        bOsc.stop(now + stepDuration);
      }

      // 2. Lead Sintetizador Top Gear (Square wave retro)
      const lFreq = leadNotes[currentStep];
      if (lFreq > 0) {
        const lOsc = this.ctx.createOscillator();
        const lFilter = this.ctx.createBiquadFilter();
        const lGain = this.ctx.createGain();

        lOsc.type = 'square';
        lOsc.frequency.setValueAtTime(lFreq, now);

        lFilter.type = 'bandpass';
        lFilter.frequency.setValueAtTime(1400, now);
        lFilter.Q.setValueAtTime(4, now);

        lGain.gain.setValueAtTime(0.055, now);
        lGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 3.5);

        lOsc.connect(lFilter);
        lFilter.connect(lGain);
        lGain.connect(this.ctx.destination);

        lOsc.start(now);
        lOsc.stop(now + stepDuration * 3.8);
      }

      // 3. Synth Chord Pads (a cada 16 passos)
      if (currentStep % 16 === 0) {
        const chordIdx = Math.floor(currentStep / 16) % padChords.length;
        const chord = padChords[chordIdx];
        chord.forEach((freq) => {
          const pOsc = this.ctx.createOscillator();
          const pGain = this.ctx.createGain();
          pOsc.type = 'sawtooth';
          pOsc.frequency.setValueAtTime(freq, now);

          pGain.gain.setValueAtTime(0.015, now);
          pGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 15);

          pOsc.connect(pGain);
          pGain.connect(this.ctx.destination);

          pOsc.start(now);
          pOsc.stop(now + stepDuration * 15.5);
        });
      }

      // 4. Bateria Arcade (Bumbo em 0, 4, 8, 12; Caixa em 4, 12; Hi-hat em todos)
      // Hi-hat
      if (currentStep % 2 === 0) {
        const hBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.03), this.ctx.sampleRate);
        const hData = hBuffer.getChannelData(0);
        for (let i = 0; i < hData.length; i++) hData[i] = Math.random() * 2 - 1;

        const hNoise = this.ctx.createBufferSource();
        hNoise.buffer = hBuffer;
        const hFilter = this.ctx.createBiquadFilter();
        hFilter.type = 'highpass';
        hFilter.frequency.setValueAtTime(7000, now);

        const hGain = this.ctx.createGain();
        hGain.gain.setValueAtTime(currentStep % 4 === 0 ? 0.035 : 0.02, now);
        hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        hNoise.connect(hFilter);
        hFilter.connect(hGain);
        hGain.connect(this.ctx.destination);
        hNoise.start(now);
      }

      // Bumbo (Kick) nos tempos fortes (0, 4, 8, 12 de cada 16)
      if (currentStep % 4 === 0) {
        const kOsc = this.ctx.createOscillator();
        const kGain = this.ctx.createGain();
        kOsc.type = 'sine';
        kOsc.frequency.setValueAtTime(130, now);
        kOsc.frequency.exponentialRampToValueAtTime(35, now + 0.09);

        kGain.gain.setValueAtTime(0.12, now);
        kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        kOsc.connect(kGain);
        kGain.connect(this.ctx.destination);
        kOsc.start(now);
        kOsc.stop(now + 0.09);
      }

      // Caixa (Snare) nos contratempos (4 e 12 de cada 16)
      if (currentStep % 8 === 4) {
        const sBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.08), this.ctx.sampleRate);
        const sData = sBuffer.getChannelData(0);
        for (let i = 0; i < sData.length; i++) sData[i] = Math.random() * 2 - 1;

        const sNoise = this.ctx.createBufferSource();
        sNoise.buffer = sBuffer;
        const sFilter = this.ctx.createBiquadFilter();
        sFilter.type = 'bandpass';
        sFilter.frequency.setValueAtTime(2200, now);

        const sGain = this.ctx.createGain();
        sGain.gain.setValueAtTime(0.08, now);
        sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        sNoise.connect(sFilter);
        sFilter.connect(sGain);
        sGain.connect(this.ctx.destination);
        sNoise.start(now);
      }

      step++;
    }, Math.floor(stepDuration * 1000));
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const carAudio = new TopGearAudioSystem();
