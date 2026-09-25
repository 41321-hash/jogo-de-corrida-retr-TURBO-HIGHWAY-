import React, { useRef, useEffect, useCallback } from 'react';
import {
  SEGMENT_LENGTH,
  ROAD_WIDTH,
  DRAW_DISTANCE,
  CAMERA_HEIGHT,
  CAMERA_DEPTH,
  TOTAL_LAPS,
  TRACK_THEMES,
  TOP_GEAR_CARS,
  buildTrack,
  initCPURivals
} from '../utils/roadEngine';
import {
  drawBackground,
  drawPlayerCar,
  drawRivalCar,
  drawRoadsideSprite,
  drawRearviewMirror,
  drawMiniMap
} from '../utils/spriteRenderer';
import { carAudio } from '../utils/carAudio';

export default function CarCanvas({
  gameState,
  selectedCarId,
  selectedTrackId,
  transmission,
  keysPressed,
  touchState,
  onHUDUpdate,
  onRaceFinish,
  onGameOver
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(performance.now());

  // Dados do Carro e Pista selecionados
  const carDef = TOP_GEAR_CARS.find((c) => c.id === selectedCarId) || TOP_GEAR_CARS[0];
  const trackTheme = TRACK_THEMES[selectedTrackId] || TRACK_THEMES.vegas;

  // Estados Físicos Mutáveis (Refs de Alto Desempenho 60 FPS)
  const playerRef = useRef({
    x: 0,              // -1.0 a 1.0 (dentro da pista)
    z: 0,              // Distância ao longo da pista
    speed: 0,          // km/h atual
    gear: 1,           // 1, 2, 3, 4
    rpm: 0.2,          // 0.0 a 1.0
    fuel: 100,         // 0 a 100%
    nitros: 4,         // Cargas de Nitro restantes
    isNitroActive: false,
    nitroTimer: 0,
    lap: 1,
    lapStartTime: 0,
    currentLapTime: 0,
    bestLapTime: null,
    totalRaceTime: 0,
    rank: 20,
    isPitStop: false,
    skyOffset: 0
  });

  const segmentsRef = useRef([]);
  const trackLengthRef = useRef(0);
  const rivalsRef = useRef([]);
  const lastFuelAlertTime = useRef(0);

  // Inicializar Pista e Rivais ao iniciar o jogo
  const resetRace = useCallback(() => {
    const segments = buildTrack(selectedTrackId);
    segmentsRef.current = segments;
    const totalLength = segments.length * SEGMENT_LENGTH;
    trackLengthRef.current = totalLength;

    rivalsRef.current = initCPURivals(totalLength);

    playerRef.current = {
      x: 0,
      z: 0,
      speed: 0,
      gear: 1,
      rpm: 0.25,
      fuel: 100,
      nitros: carDef.nitros,
      isNitroActive: false,
      nitroTimer: 0,
      lap: 1,
      lapStartTime: performance.now() / 1000,
      currentLapTime: 0,
      bestLapTime: null,
      totalRaceTime: 0,
      rank: 20,
      isPitStop: false,
      skyOffset: 0
    };
  }, [selectedTrackId, carDef]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      resetRace();
    }
  }, [gameState, resetRace]);

  // Loop Principal de Física e Renderização Retro Pseudo-3D
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    lastTimeRef.current = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = currentTime;

      const player = playerRef.current;
      const segments = segmentsRef.current;
      const trackLength = trackLengthRef.current;
      const rivals = rivalsRef.current;

      if (!segments || segments.length === 0) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      // ----------------------------------------------------
      // 1. PROCESSAR CONTROLES (Teclado & Touch)
      // ----------------------------------------------------
      const isAccelerating =
        keysPressed.current['ArrowUp'] ||
        keysPressed.current['KeyW'] ||
        touchState.current.accel;
      const isBraking =
        keysPressed.current['ArrowDown'] ||
        keysPressed.current['KeyS'] ||
        touchState.current.brake;
      const isSteeringLeft =
        keysPressed.current['ArrowLeft'] ||
        keysPressed.current['KeyA'] ||
        touchState.current.left;
      const isSteeringRight =
        keysPressed.current['ArrowRight'] ||
        keysPressed.current['KeyD'] ||
        touchState.current.right;

      // Disparo de NITRO (Space, Shift, N, ou Touch)
      const wantNitro =
        keysPressed.current['Space'] ||
        keysPressed.current['ShiftLeft'] ||
        keysPressed.current['KeyN'] ||
        touchState.current.nitro;

      if (wantNitro && !player.isNitroActive && player.nitros > 0 && player.speed > 40) {
        player.isNitroActive = true;
        player.nitros -= 1;
        player.nitroTimer = 3.6; // 3.6 segundos de explosão turbo
        carAudio.playNitro();
      }

      if (player.isNitroActive) {
        player.nitroTimer -= dt;
        if (player.nitroTimer <= 0) {
          player.isNitroActive = false;
        }
      }

      // ----------------------------------------------------
      // 2. FÍSICA DE ACELERAÇÃO, CÂMBIO E VELOCIDADE
      // ----------------------------------------------------
      let topSpeed = carDef.maxSpeed;
      if (player.isNitroActive) topSpeed += carDef.nitroBoost;

      // Na grama / fora da pista, o carro é desacelerado
      const isOffRoad = Math.abs(player.x) > 1.05 && !player.isPitStop;
      if (isOffRoad) {
        topSpeed = Math.min(topSpeed, 105);
        if (player.speed > 80 && Math.random() < 0.12) carAudio.playSkid();
      }

      // No Pit Stop, velocidade controlada
      if (player.isPitStop) {
        topSpeed = 70;
      }

      // Aceleração / Frenagem
      const accelRate = (player.isNitroActive ? 140 : 65) * carDef.accel;
      const brakeRate = 180;
      const naturalDecel = 28;

      if (isBraking) {
        player.speed = Math.max(0, player.speed - brakeRate * dt);
      } else if (isAccelerating) {
        if (player.speed < topSpeed) {
          player.speed = Math.min(topSpeed, player.speed + accelRate * dt);
        } else {
          player.speed -= naturalDecel * 0.5 * dt;
        }
      } else {
        player.speed = Math.max(0, player.speed - naturalDecel * dt);
      }

      // Câmbio de Marchas Automático e RPM
      const gearBands = [
        { gear: 1, min: 0, max: 80 },
        { gear: 2, min: 65, max: 155 },
        { gear: 3, min: 140, max: 230 },
        { gear: 4, min: 215, max: 340 }
      ];

      if (transmission === 'auto') {
        let currentGear = 1;
        for (let i = 0; i < gearBands.length; i++) {
          if (player.speed >= gearBands[i].min) {
            currentGear = gearBands[i].gear;
          }
        }
        if (currentGear !== player.gear) {
          player.gear = currentGear;
          carAudio.playGearShift();
        }
      }

      const activeBand = gearBands[player.gear - 1];
      const rpmSpan = activeBand.max - activeBand.min;
      player.rpm = Math.min(1.0, Math.max(0.18, (player.speed - activeBand.min) / rpmSpan));

      // Atualizar sintetizador de áudio do motor
      carAudio.updateEngine(player.rpm, player.gear, player.isNitroActive);

      // ----------------------------------------------------
      // 3. CONSUMO DE COMBUSTÍVEL E ÁREA DE PIT STOP
      // ----------------------------------------------------
      const currentSegmentIndex = Math.floor(player.z / SEGMENT_LENGTH) % segments.length;
      const currentSegment = segments[currentSegmentIndex];

      // Verificar entrada no PIT LANE (Lado direito da pista onde isPitLane === true)
      if (currentSegment && currentSegment.isPitLane && player.x > 0.85 && player.x < 1.95) {
        player.isPitStop = true;
        // Reabastecer rapidamente no Pit Stop
        player.fuel = Math.min(100, player.fuel + dt * 40);
        carAudio.playPitStopRefuel();
      } else {
        player.isPitStop = false;
        // Consumo contínuo de combustível
        const fuelBurn = (player.speed / 180) * carDef.fuelConsumption * dt * 0.65;
        player.fuel = Math.max(0, player.fuel - fuelBurn);
      }

      // Alerta de Combustível Baixo (Low Fuel Beep)
      if (player.fuel < 20 && currentTime - lastFuelAlertTime.current > 1400) {
        lastFuelAlertTime.current = currentTime;
        carAudio.playLowFuelAlert();
      }

      // Pane Seca (Acabou Combustível)
      if (player.fuel <= 0 && player.speed <= 3) {
        carAudio.stopEngine();
        carAudio.stopBGM();
        onGameOver('OUT_OF_FUEL', player.rank, player.lap, player.totalRaceTime);
        return;
      }

      // ----------------------------------------------------
      // 4. DIREÇÃO LATERAL (Volante / Steering)
      // ----------------------------------------------------
      let steerInput = 0;
      if (isSteeringLeft) steerInput -= 1;
      if (isSteeringRight) steerInput += 1;

      // Velocidade afeta sensibilidade
      const steerFactor = (player.speed / 240) * 1.85 * carDef.handling;
      player.x += steerInput * steerFactor * dt;

      // Deslocamento centrífugo da curva da pista
      const curveForce = currentSegment ? currentSegment.curve : 0;
      player.x -= curveForce * (player.speed / 280) * 1.4 * dt;

      // Som de derrapagem ao fazer curvas fechadas em alta velocidade
      if (Math.abs(curveForce) > 1.8 && player.speed > 160 && Math.random() < 0.08) {
        carAudio.playSkid();
      }

      // Limitar deslocamento lateral fora da tela
      player.x = Math.max(-2.3, Math.min(2.3, player.x));

      // ----------------------------------------------------
      // 5. PROGRESSÃO NA PISTA E VOLTAS (Laps)
      // ----------------------------------------------------
      player.z += player.speed * dt * 55;
      player.totalRaceTime += dt;
      player.currentLapTime = (performance.now() / 1000) - player.lapStartTime;

      // Parallax do céu baseado na curva
      player.skyOffset += curveForce * (player.speed / 200) * 3;

      // Cruzou a Linha de Chegada
      if (player.z >= trackLength) {
        player.z -= trackLength;
        const finishedLapTime = player.currentLapTime;

        if (!player.bestLapTime || finishedLapTime < player.bestLapTime) {
          player.bestLapTime = finishedLapTime;
        }

        player.lap += 1;
        player.lapStartTime = performance.now() / 1000;

        // FIM DA CORRIDA (3 Voltas Completas)
        if (player.lap > TOTAL_LAPS) {
          carAudio.stopEngine();
          carAudio.playVictory();
          onRaceFinish(player.rank, player.totalRaceTime, player.bestLapTime);
          return;
        }
      }

      // ----------------------------------------------------
      // 6. RIVAIS DA CPU (Grid de 20 Corredores)
      // ----------------------------------------------------
      rivals.forEach((r) => {
        r.z += r.speed * dt * 55;
        if (r.z >= trackLength) {
          r.z -= trackLength;
          r.lap += 1;
        }

        // Rival oscila levemente na pista para ultrapassar
        r.x += r.steerVx * dt;
        if (r.x > 0.75 || r.x < -0.75) r.steerVx *= -1;

        r.percentComplete = (r.lap - 1) + (r.z / trackLength);

        // Colisão com o Jogador
        const zDiff = Math.abs(player.z - r.z);
        if (zDiff < 140 && Math.abs(player.x - r.x) < 0.28) {
          carAudio.playCrash();
          player.speed = Math.max(40, player.speed - 35);
          if (player.x > r.x) {
            player.x += 0.2;
            r.x -= 0.15;
          } else {
            player.x -= 0.2;
            r.x += 0.15;
          }
        }
      });

      // Calcular Posição do Jogador (Rank 1º ao 20º)
      const playerProgress = (player.lap - 1) + (player.z / trackLength);
      let aheadCount = 0;
      rivals.forEach((r) => {
        if (r.percentComplete > playerProgress) aheadCount++;
      });
      player.rank = aheadCount + 1;

      // Enviar dados para o HUD
      onHUDUpdate({
        speed: player.speed,
        rpm: player.rpm,
        gear: player.gear,
        fuel: player.fuel,
        nitroCount: player.nitros,
        isNitroActive: player.isNitroActive,
        rank: player.rank,
        totalRacers: 20,
        lap: player.lap,
        totalLaps: TOTAL_LAPS,
        lapTime: player.currentLapTime,
        bestLapTime: player.bestLapTime,
        isPitStop: player.isPitStop
      });

      // ----------------------------------------------------
      // 7. RENDERIZAÇÃO GRÁFICA PSEUDO-3D TOP GEAR (Canvas)
      // ALGORITMO PAINTER (DE TRÁS PARA FRENTE - ROBUSTO E SEM SUMIÇO)
      // ----------------------------------------------------
      const w = canvas.width;
      const h = canvas.height;
      const horizonY = Math.round(h * 0.44);

      ctx.clearRect(0, 0, w, h);

      // A. Céu e Horizonte com Parallax
      drawBackground(ctx, w, h, trackTheme, player.skyOffset);

      // B. Parâmetros de Projeção da Câmera
      const startPos = Math.floor(player.z / SEGMENT_LENGTH);
      const playerSegment = segments[startPos % segments.length];
      const camH = CAMERA_HEIGHT;
      const camY = camH + (playerSegment ? playerSegment.p1.world.y : 0);
      const camD = CAMERA_DEPTH;
      const camX = player.x * ROAD_WIDTH;
      const camZ = player.z - 350; // Câmera 350 unidades atrás do carro

      let accumulatedX = 0;
      let accumulatedDx = 0;

      // 1ª Passada: Projetar todos os segmentos à frente e guardar o desvio X acumulado por segmento
      const projected = [];
      const segAccX = []; // desvio lateral acumulado de cada segmento projetado
      for (let n = 0; n < DRAW_DISTANCE; n++) {
        const segIdx = (startPos + n) % segments.length;
        const segment = segments[segIdx];
        const loopOffset = (startPos + n >= segments.length) ? trackLength : 0;

        accumulatedX += accumulatedDx;
        accumulatedDx += segment.curve * 0.035;
        segAccX[n] = accumulatedX;

        // Ponto 1 (Início do Segmento)
        const p1Z = (segment.p1.world.z + loopOffset) - camZ;
        const p1Scale = p1Z > 10 ? camD / p1Z : 0;
        const p1CamX = segment.p1.world.x - (camX - accumulatedX);
        const p1CamY = segment.p1.world.y - camY;
        const p1ScreenX = Math.round((w / 2) + (p1Scale * p1CamX * (w / 2)));
        const p1ScreenY = Math.round(horizonY - (p1Scale * p1CamY * (h / 2)));
        const p1ScreenW = Math.round(p1Scale * ROAD_WIDTH * (w / 2));

        // Ponto 2 (Fim do Segmento)
        const p2Z = (segment.p2.world.z + loopOffset) - camZ;
        const p2Scale = p2Z > 10 ? camD / p2Z : 0;
        const p2CamX = segment.p2.world.x - (camX - accumulatedX - accumulatedDx);
        const p2CamY = segment.p2.world.y - camY;
        const p2ScreenX = Math.round((w / 2) + (p2Scale * p2CamX * (w / 2)));
        const p2ScreenY = Math.round(horizonY - (p2Scale * p2CamY * (h / 2)));
        const p2ScreenW = Math.round(p2Scale * ROAD_WIDTH * (w / 2));

        projected.push({
          n,
          segIdx,
          segment,
          p1: { x: p1ScreenX, y: p1ScreenY, w: p1ScreenW, scale: p1Scale, z: p1Z },
          p2: { x: p2ScreenX, y: p2ScreenY, w: p2ScreenW, scale: p2Scale, z: p2Z },
          worldZ: segment.p1.world.z + loopOffset
        });
      }

      // Projetar posição de tela de cada RIVAL com base na posição Z absoluta
      // Percorre os segmentos projetados para encontrar o intervalo Z em que o rival se encontra.
      const rivalScreenPositions = rivals.map((r) => {
        // Distância Z do rival em relação à câmera (normalizado para loopOffset se necessário)
        let rWorldZ = r.z;
        // Se o rival está atrás da câmera (completou mais voltas ou está atrás por loop)
        let rRelZ = rWorldZ - camZ;
        if (rRelZ < 0) rRelZ += trackLength; // ajuste de loop
        if (rRelZ <= 0) return null; // atrás da câmera

        // Encontrar o segmento projetado que contém este Z
        let found = null;
        for (let pi = 0; pi < projected.length; pi++) {
          const item = projected[pi];
          if (item.p1.z <= 0) continue;
          // Verificar se o rival está neste intervalo Z
          const nextItem = projected[pi + 1];
          if (!nextItem) break;
          if (item.p1.z >= rRelZ && nextItem.p1.z < rRelZ) continue;
          if (rRelZ <= item.p1.z && rRelZ >= item.p2.z) {
            // Interpolar entre p1 e p2
            const t = item.p1.z > item.p2.z
              ? (item.p1.z - rRelZ) / (item.p1.z - item.p2.z)
              : 0;
            const screenX = item.p1.x + (item.p2.x - item.p1.x) * t;
            const screenY = item.p1.y + (item.p2.y - item.p1.y) * t;
            const screenRoadW = item.p1.w + (item.p2.w - item.p1.w) * t;
            const scale = item.p1.scale + (item.p2.scale - item.p1.scale) * t;
            // Offset lateral do rival usando a largura da pista em pixels (screenRoadW * 2 = pista completa)
            // r.x vai de -1 (borda esquerda) a +1 (borda direita)
            const rX = screenX + (r.x * screenRoadW);
            // Posição Y na base do segmento (onde o pneu toca o chão)
            const rY = Math.min(h - 4, screenY);
            found = { rX, rY, scale, roadW: screenRoadW, depth: rRelZ };
            break;
          }
        }
        if (!found) return null;
        return { rival: r, ...found };
      }).filter(Boolean);

      // Ordenar rivais do mais distante para o mais próximo (back-to-front)
      rivalScreenPositions.sort((a, b) => b.depth - a.depth);

      // 2ª Passada: Renderizar de TRÁS para FRENTE (Back-to-Front)
      // Garante que o asfalto, grama e zebras NUNCA sumam, preenchendo até o final da tela!
      for (let i = projected.length - 1; i >= 0; i--) {
        const item = projected[i];
        const { segment, p1, p2 } = item;

        // Se o segmento estiver atrás da câmera ou invertido
        if (p1.z <= 10 || p2.z <= 10) continue;

        // Limites de renderização vertical na tela
        const drawY1 = Math.min(h + 20, p1.y);
        const drawY2 = Math.min(h + 20, p2.y);

        if (drawY1 <= drawY2) continue; // Descida oculta ou fora de vista

        // 1. Grama / Terreno Lateral cobrindo a largura inteira
        ctx.fillStyle = trackTheme[segment.color.grass];
        ctx.fillRect(0, drawY2, w, drawY1 - drawY2 + 1);

        // 2. Zebras / Curbs Laterais (Vermelho e Branco)
        const r1 = Math.max(2, p1.w * 0.16);
        const r2 = Math.max(2, p2.w * 0.16);
        ctx.fillStyle = trackTheme[segment.color.rumble];

        // Zebra Esquerda
        ctx.beginPath();
        ctx.moveTo(p1.x - p1.w - r1, drawY1);
        ctx.lineTo(p1.x - p1.w, drawY1);
        ctx.lineTo(p2.x - p2.w, drawY2);
        ctx.lineTo(p2.x - p2.w - r2, drawY2);
        ctx.closePath();
        ctx.fill();

        // Zebra Direita
        ctx.beginPath();
        ctx.moveTo(p1.x + p1.w, drawY1);
        ctx.lineTo(p1.x + p1.w + r1, drawY1);
        ctx.lineTo(p2.x + p2.w + r2, drawY2);
        ctx.lineTo(p2.x + p2.w, drawY2);
        ctx.closePath();
        ctx.fill();

        // 3. Asfalto da Pista (Cinza Claro / Cinza Escuro Alternado)
        ctx.fillStyle = trackTheme[segment.color.road];
        ctx.beginPath();
        ctx.moveTo(p1.x - p1.w, drawY1);
        ctx.lineTo(p1.x + p1.w, drawY1);
        ctx.lineTo(p2.x + p2.w, drawY2);
        ctx.lineTo(p2.x - p2.w, drawY2);
        ctx.closePath();
        ctx.fill();

        // 4. Linhas Centrais Tracejadas
        if (segment.color.lane !== 'transparent') {
          const l1 = Math.max(1, p1.w * 0.035);
          const l2 = Math.max(1, p2.w * 0.035);
          ctx.fillStyle = trackTheme.laneColor;
          ctx.beginPath();
          ctx.moveTo(p1.x - l1, drawY1);
          ctx.lineTo(p1.x + l1, drawY1);
          ctx.lineTo(p2.x + l2, drawY2);
          ctx.lineTo(p2.x - l2, drawY2);
          ctx.closePath();
          ctx.fill();
        }

        // 5. Linha de Chegada Quadriculada (Checkered Finish Line)
        if (segment.isFinishLine) {
          const numChecks = 12;
          const checkW1 = (p1.w * 2) / numChecks;
          const checkW2 = (p2.w * 2) / numChecks;
          for (let c = 0; c < numChecks; c++) {
            ctx.fillStyle = (c + Math.floor(segment.index / 2)) % 2 === 0 ? '#ffffff' : '#000000';
            ctx.beginPath();
            ctx.moveTo(p1.x - p1.w + c * checkW1, drawY1);
            ctx.lineTo(p1.x - p1.w + (c + 1) * checkW1, drawY1);
            ctx.lineTo(p2.x - p2.w + (c + 1) * checkW2, drawY2);
            ctx.lineTo(p2.x - p2.w + c * checkW2, drawY2);
            ctx.closePath();
            ctx.fill();
          }
        }

        // 6. Faixa de PIT STOP no lado direito
        if (segment.isPitLane) {
          const pitW1 = p1.w * 0.65;
          const pitW2 = p2.w * 0.65;
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.moveTo(p1.x + p1.w + r1, drawY1);
          ctx.lineTo(p1.x + p1.w + r1 + pitW1, drawY1);
          ctx.lineTo(p2.x + p2.w + r2 + pitW2, drawY2);
          ctx.lineTo(p2.x + p2.w + r2, drawY2);
          ctx.closePath();
          ctx.fill();

          // Faixa amarela de divisão do box
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = Math.max(1, 3 * p1.scale);
          ctx.beginPath();
          ctx.moveTo(p1.x + p1.w + r1, drawY1);
          ctx.lineTo(p2.x + p2.w + r2, drawY2);
          ctx.stroke();
        }

        // 7. Sprites de Cenário e Placas deste segmento
        if (segment.sprites && segment.sprites.length > 0) {
          segment.sprites.forEach((spr) => {
            const sprX = p1.x + (p1.scale * spr.offset * ROAD_WIDTH * (w / 2));
            const sprY = p1.y;
            drawRoadsideSprite(ctx, sprX, sprY, p1.scale, spr.type);
          });
        }

        // Rivais são desenhados fora deste loop (após todos os segmentos)
      }

      // C. Carros Rivais da CPU - desenhados por posição de tela calculada (back-to-front)
      rivalScreenPositions.forEach(({ rival, rX, rY, scale, roadW }) => {
        drawRivalCar(ctx, rX, rY, roadW, rival);
      });

      // D. Carro do Jogador (Renderizado na frente com física de inclinação e turbo)
      drawPlayerCar(
        ctx,
        w,
        h,
        carDef,
        player.speed / carDef.maxSpeed,
        steerInput,
        player.isNitroActive,
        isBraking
      );

      // E. Espelho Retrovisor Clássico do Top Gear (Posicionado elegantemente no topo)
      drawRearviewMirror(ctx, w, h, player.z, rivals, trackLength);

      // F. Minimapa da Pista (Canto inferior esquerdo)
      const miniMapSize = Math.min(125, Math.round(w * 0.2));
      drawMiniMap(ctx, 14, h - miniMapSize - 14, miniMapSize, playerProgress, rivals);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    gameState,
    carDef,
    trackTheme,
    transmission,
    keysPressed,
    touchState,
    onHUDUpdate,
    onRaceFinish,
    onGameOver
  ]);

  return (
    <div className="tg-canvas-viewport">
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="tg-render-canvas"
      />
    </div>
  );
}
