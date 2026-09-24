import React, { useRef, useEffect } from 'react';
import { carAudio } from '../utils/carAudio';

export default function CarCanvas({
  gameState,
  speed,
  setSpeed,
  fuel,
  setFuel,
  nitro,
  setNitro,
  isNitroActive,
  setIsNitroActive,
  score,
  setScore,
  distance,
  setDistance,
  keysPressed,
  touchState,
  onGameOver,
  onNearMiss
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(performance.now());

  // Estado do Jogador
  const playerRef = useRef({
    x: 160,
    y: 430,
    width: 38,
    height: 64,
    vx: 0,
    skidTimer: 0,
    isInvulnerable: 0
  });

  // Entidades da Pista
  const roadOffsetRef = useRef(0);
  const trafficRef = useRef([]);
  const itemsRef = useRef([]); // Moedas e combustível
  const obstaclesRef = useRef([]); // Poças de óleo
  const particlesRef = useRef([]); // Fumaça e fogo do escapamento

  const roadWidth = 280;
  const canvasWidth = 360;
  const canvasHeight = 540;
  const roadLeft = (canvasWidth - roadWidth) / 2;

  // Inicializar entidades
  useEffect(() => {
    if (gameState === 'PLAYING') {
      playerRef.current.x = canvasWidth / 2;
      playerRef.current.y = 430;
      playerRef.current.vx = 0;
      playerRef.current.skidTimer = 0;
      trafficRef.current = [];
      itemsRef.current = [];
      obstaclesRef.current = [];
      particlesRef.current = [];
      roadOffsetRef.current = 0;
    }
  }, [gameState]);

  // Loop Principal de Física e Renderização (60 FPS)
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    lastTimeRef.current = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = currentTime;

      const player = playerRef.current;

      // 1. Atualizar Velocidade (Aceleração / Freio / Nitro)
      let targetSpeed = 120; // km/h padrão
      const isAccelerating = keysPressed.current['ArrowUp'] || keysPressed.current['KeyW'] || touchState.current.accel;
      const isBraking = keysPressed.current['ArrowDown'] || keysPressed.current['KeyS'] || touchState.current.brake;
      const wantNitro = (keysPressed.current['Space'] || keysPressed.current['ShiftLeft'] || touchState.current.nitro) && nitro > 5;

      if (wantNitro && !isNitroActive) {
        setIsNitroActive(true);
        carAudio.playNitro();
      }

      if (isNitroActive) {
        if (nitro > 0) {
          targetSpeed = 240; // Super velocidade
          setNitro((prev) => Math.max(0, prev - dt * 25));
        } else {
          setIsNitroActive(false);
        }
      } else if (isBraking) {
        targetSpeed = 40;
      } else if (isAccelerating) {
        targetSpeed = 170;
      }

      // Interpolar velocidade suavemente
      const newSpeed = speed + (targetSpeed - speed) * 3.5 * dt;
      setSpeed(newSpeed);
      carAudio.updateEnginePitch(newSpeed / 160);

      // 2. Consumo de Combustível e Distância
      const fuelConsumption = (newSpeed / 120) * 2.8 * dt;
      const currentFuel = Math.max(0, fuel - fuelConsumption);
      setFuel(currentFuel);

      if (currentFuel <= 0) {
        carAudio.stopEngine();
        onGameOver('OUT_OF_FUEL', score, distance);
        return;
      }

      setDistance((prev) => prev + (newSpeed * dt * 0.28));
      setScore((prev) => prev + Math.floor(newSpeed * dt * 0.5));

      // 3. Movimento Lateral do Carro (Direção)
      let steerInput = 0;
      if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA'] || touchState.current.left) steerInput -= 1;
      if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD'] || touchState.current.right) steerInput += 1;

      // Se passou na poça de óleo, derrapa temporariamente
      if (player.skidTimer > 0) {
        player.skidTimer -= dt;
        steerInput += Math.sin(currentTime / 50) * 1.5;
        // Fumaça dos pneus
        particlesRef.current.push({
          x: player.x - 12 + Math.random() * 24,
          y: player.y + 28,
          vx: (Math.random() - 0.5) * 30,
          vy: 60,
          radius: 6 + Math.random() * 6,
          color: 'rgba(200, 200, 200, 0.6)',
          life: 0.35,
          maxLife: 0.35
        });
      }

      const steerSpeed = 240;
      player.vx = steerInput * steerSpeed;
      player.x += player.vx * dt;

      // Limitar carro dentro da pista e zebras
      const minX = roadLeft + player.width / 2 + 6;
      const maxX = roadLeft + roadWidth - player.width / 2 - 6;

      if (player.x < minX) {
        player.x = minX;
        player.vx = 0;
      } else if (player.x > maxX) {
        player.x = maxX;
        player.vx = 0;
      }

      // Fogo no escapamento com Nitro
      if (isNitroActive) {
        particlesRef.current.push({
          x: player.x - 8 + (Math.random() > 0.5 ? 16 : 0),
          y: player.y + 32,
          vx: (Math.random() - 0.5) * 15,
          vy: 180 + Math.random() * 40,
          radius: 5 + Math.random() * 4,
          color: Math.random() > 0.4 ? '#00ffff' : '#ff00aa',
          life: 0.2,
          maxLife: 0.2
        });
      }

      // 4. Rolagem da Pista
      roadOffsetRef.current = (roadOffsetRef.current + newSpeed * 3.8 * dt) % 120;

      // 5. Gerar Tráfego de Carros
      if (Math.random() < 0.035) {
        const lanes = [
          roadLeft + 45,
          roadLeft + roadWidth / 2,
          roadLeft + roadWidth - 45
        ];
        const laneX = lanes[Math.floor(Math.random() * lanes.length)];

        // Evitar sobreposição no spawn
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
            isTruck,
            color: isTruck ? '#94a3b8' : colors[Math.floor(Math.random() * colors.length)],
            nearMissChecked: false
          });
        }
      }

      // 6. Gerar Itens (Combustível e Moedas)
      if (Math.random() < 0.02) {
        const itemX = roadLeft + 30 + Math.random() * (roadWidth - 60);
        const isFuel = Math.random() > 0.65;
        itemsRef.current.push({
          id: Math.random(),
          type: isFuel ? 'fuel' : 'coin',
          x: itemX,
          y: -40,
          radius: 12
        });
      }

      // 7. Gerar Poças de Óleo
      if (Math.random() < 0.008) {
        const oilX = roadLeft + 35 + Math.random() * (roadWidth - 70);
        obstaclesRef.current.push({
          id: Math.random(),
          x: oilX,
          y: -40,
          width: 36,
          height: 24
        });
      }

      // 8. Atualizar Posição do Tráfego
      const activeTraffic = [];
      for (const car of trafficRef.current) {
        // Velocidade relativa em relação ao jogador
        const relativeSpeed = (newSpeed - car.speed) * 3.8;
        car.y += relativeSpeed * dt;

        // Detector de "Near Miss" (passar raspando sem bater)
        if (!car.nearMissChecked && car.y > player.y - 40 && car.y < player.y + 40) {
          const dx = Math.abs(car.x - player.x);
          if (dx > 36 && dx < 62) {
            car.nearMissChecked = true;
            setScore(prev => prev + 500);
            setNitro(prev => Math.min(100, prev + 15));
            onNearMiss();
          }
        }

        // Colisão com Carro do Tráfego
        const hitX = Math.abs(car.x - player.x) < (car.width + player.width) / 2 - 6;
        const hitY = Math.abs(car.y - player.y) < (car.height + player.height) / 2 - 8;

        if (hitX && hitY) {
          carAudio.playCrash();
          carAudio.stopEngine();
          onGameOver('CRASH', score, distance);
          return;
        }

        if (car.y < canvasHeight + 120 && car.y > -150) {
          activeTraffic.push(car);
        }
      }
      trafficRef.current = activeTraffic;

      // 9. Atualizar Itens e Coleta
      const activeItems = [];
      for (const item of itemsRef.current) {
        item.y += newSpeed * 3.8 * dt;

        const dist = Math.hypot(item.x - player.x, item.y - player.y);
        if (dist < item.radius + player.width / 2) {
          if (item.type === 'fuel') {
            carAudio.playFuelCollect();
            setFuel(prev => Math.min(100, prev + 30));
          } else {
            carAudio.playCoinCollect();
            setScore(prev => prev + 250);
            setNitro(prev => Math.min(100, prev + 10));
          }
        } else if (item.y < canvasHeight + 50) {
          activeItems.push(item);
        }
      }
      itemsRef.current = activeItems;

      // 10. Atualizar Poças de Óleo
      const activeObstacles = [];
      for (const obs of obstaclesRef.current) {
        obs.y += newSpeed * 3.8 * dt;

        const hitX = Math.abs(obs.x - player.x) < (obs.width + player.width) / 2 - 8;
        const hitY = Math.abs(obs.y - player.y) < (obs.height + player.height) / 2 - 6;

        if (hitX && hitY && player.skidTimer <= 0) {
          player.skidTimer = 0.9; // Derrapagem por quase 1s
          carAudio.playSkid();
        } else if (obs.y < canvasHeight + 50) {
          activeObstacles.push(obs);
        }
      }
      obstaclesRef.current = activeObstacles;

      // 11. Atualizar Partículas
      const activeParticles = [];
      for (const p of particlesRef.current) {
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.radius = Math.max(1, p.radius - dt * 4);
        if (p.life > 0) activeParticles.push(p);
      }
      particlesRef.current = activeParticles;

      // 12. RENDERIZAR CANVAS
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Grama / Terreno lateral
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Pista Asfalto
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(roadLeft, 0, roadWidth, canvasHeight);

        // Zebras nas Bordas da Pista (Vermelho e Branco)
        const stripeH = 30;
        const offset = roadOffsetRef.current % (stripeH * 2);

        for (let y = -stripeH * 2; y < canvasHeight + stripeH * 2; y += stripeH) {
          const isRed = Math.floor((y - offset) / stripeH) % 2 === 0;
          ctx.fillStyle = isRed ? '#ef4444' : '#ffffff';

          // Zebra Esquerda
          ctx.fillRect(roadLeft - 8, y + offset, 8, stripeH);
          // Zebra Direita
          ctx.fillRect(roadLeft + roadWidth, y + offset, 8, stripeH);
        }

        // Linhas tracejadas da pista (3 Faixas)
        const laneX1 = roadLeft + roadWidth / 3;
        const laneX2 = roadLeft + (roadWidth / 3) * 2;
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.setLineDash([25, 25]);
        ctx.lineDashOffset = -roadOffsetRef.current;

        ctx.beginPath();
        ctx.moveTo(laneX1, 0);
        ctx.lineTo(laneX1, canvasHeight);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(laneX2, 0);
        ctx.lineTo(laneX2, canvasHeight);
        ctx.stroke();

        ctx.setLineDash([]); // Reset line dash

        // Poças de Óleo
        for (const obs of obstaclesRef.current) {
          ctx.fillStyle = '#090d16';
          ctx.beginPath();
          ctx.ellipse(obs.x, obs.y, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#1e1b4b';
          ctx.stroke();
        }

        // Itens: Combustível e Moedas
        for (const item of itemsRef.current) {
          if (item.type === 'fuel') {
            // Galão de combustível verde
            ctx.fillStyle = '#22c55e';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.fillRect(item.x - 10, item.y - 12, 20, 24);
            ctx.strokeRect(item.x - 10, item.y - 12, 20, 24);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('GAS', item.x, item.y + 4);
          } else {
            // Moeda Dourada Brilhante
            ctx.fillStyle = '#facc15';
            ctx.strokeStyle = '#ca8a04';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(item.x, item.y, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('$', item.x, item.y + 4);
          }
        }

        // Tráfego
        for (const car of trafficRef.current) {
          ctx.save();
          ctx.translate(car.x, car.y);

          // Sombra do carro
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(-car.width / 2 + 3, -car.height / 2 + 5, car.width, car.height);

          // Chassi do carro de tráfego
          ctx.fillStyle = car.color;
          ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2;
          ctx.strokeRect(-car.width / 2, -car.height / 2, car.width, car.height);

          // Pára-brisa
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-car.width / 2 + 4, -car.height / 2 + 10, car.width - 8, car.height * 0.25);

          // Lanternas traseiras vermelhas
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-car.width / 2 + 4, car.height / 2 - 5, 8, 4);
          ctx.fillRect(car.width / 2 - 12, car.height / 2 - 5, 8, 4);

          ctx.restore();
        }

        // Partículas (Fogo e Fumaça)
        for (const p of particlesRef.current) {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Carro do Jogador (Esportivo Vermelho com Faixas Brancas)
        ctx.save();
        ctx.translate(player.x, player.y);

        // Inclinação ao virar (Leve rotação para estética arcade)
        const rollAngle = (player.vx / steerSpeed) * 0.12;
        ctx.rotate(rollAngle);

        // Faróis Iluminando a Pista (Luzes à frente)
        const grad = ctx.createLinearGradient(0, -player.height / 2, 0, -player.height / 2 - 140);
        grad.addColorStop(0, 'rgba(255, 255, 200, 0.45)');
        grad.addColorStop(1, 'rgba(255, 255, 200, 0.0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-12, -player.height / 2);
        ctx.lineTo(-45, -player.height / 2 - 140);
        ctx.lineTo(45, -player.height / 2 - 140);
        ctx.lineTo(12, -player.height / 2);
        ctx.closePath();
        ctx.fill();

        // Sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(-player.width / 2 + 4, -player.height / 2 + 6, player.width, player.height);

        // Corpo Principal do Carro
        ctx.fillStyle = '#dc2626'; // Vermelho Ferrari
        ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-player.width / 2, -player.height / 2, player.width, player.height);

        // Faixa de Corrida Central
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, -player.height / 2, 8, player.height);

        // Vidro Dianteiro (Pára-brisa)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-player.width / 2 + 5, -player.height / 2 + 14, player.width - 10, 15);

        // Vidro Traseiro
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-player.width / 2 + 6, player.height / 2 - 20, player.width - 12, 10);

        // Faróis Dianteiros Amarelos
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-player.width / 2 + 3, -player.height / 2, 8, 4);
        ctx.fillRect(player.width / 2 - 11, -player.height / 2, 8, 4);

        // Lanternas Traseiras
        ctx.fillStyle = isBraking ? '#ff0000' : '#b91c1c';
        ctx.fillRect(-player.width / 2 + 4, player.height / 2 - 4, 8, 4);
        ctx.fillRect(player.width / 2 - 12, player.height / 2 - 4, 8, 4);

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, speed, fuel, nitro, isNitroActive, score, distance, onGameOver, onNearMiss]);

  return (
    <div className="track-canvas-wrapper">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="game-canvas"
      />

      {/* Velocímetro Flutuante */}
      <div className="speedometer-floating">
        <span className="speed-number">{Math.round(speed)}</span>
        <span className="speed-unit">KM/H</span>
      </div>
    </div>
  );
}
