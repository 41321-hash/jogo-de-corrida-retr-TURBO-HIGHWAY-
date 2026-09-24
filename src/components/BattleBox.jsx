import React, { useRef, useEffect } from 'react';
import PlayerHeart from './PlayerHeart';
import { audio } from '../utils/audio';

export default function BattleBox({
  isDodgeMode,
  attackController,
  playerPos,
  setPlayerPos,
  isInvincible,
  onPlayerHit,
  onDodgeEnd,
  keysPressed,
  touchDirection,
  children
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const boxWidth = 320;
  const boxHeight = 170;

  useEffect(() => {
    if (!isDodgeMode || !attackController) return;

    lastTimeRef.current = performance.now();

    const loop = (time) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      let dx = 0;
      let dy = 0;

      if (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA'] || touchDirection.current.left) dx -= 1;
      if (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD'] || touchDirection.current.right) dx += 1;
      if (keysPressed.current['ArrowUp'] || keysPressed.current['KeyW'] || touchDirection.current.up) dy -= 1;
      if (keysPressed.current['ArrowDown'] || keysPressed.current['KeyS'] || touchDirection.current.down) dy += 1;

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      const moveSpeed = 150;
      setPlayerPos((prev) => {
        const heartHalf = 7;
        const newX = Math.max(heartHalf + 6, Math.min(boxWidth - heartHalf - 6, prev.x + dx * moveSpeed * dt));
        const newY = Math.max(heartHalf + 6, Math.min(boxHeight - heartHalf - 6, prev.y + dy * moveSpeed * dt));
        return { x: newX, y: newY };
      });

      const { isFinished, projectiles, warnings } = attackController.update(dt, () => {
        audio.playVineWarning();
      });

      if (isFinished) {
        onDodgeEnd();
        return;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, boxWidth, boxHeight);

        for (const w of warnings) {
          ctx.fillStyle = `rgba(239, 68, 68, ${0.3 + 0.3 * Math.sin(time / 60)})`;
          if (w.isHorizontal) {
            ctx.fillRect(0, w.pos - w.thickness / 2, boxWidth, w.thickness);
            ctx.strokeStyle = '#f87171';
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(0, w.pos - w.thickness / 2, boxWidth, w.thickness);
            ctx.setLineDash([]);
          } else {
            ctx.fillRect(w.pos - w.thickness / 2, 0, w.thickness, boxHeight);
            ctx.strokeStyle = '#f87171';
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(w.pos - w.thickness / 2, 0, w.thickness, boxHeight);
            ctx.setLineDash([]);
          }
        }

        for (const p of projectiles) {
          if (p.type === 'petal') {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.fillStyle = '#facc15';
            ctx.strokeStyle = '#b45309';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.radius, p.radius * 1.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else if (p.type === 'vine_strike') {
            ctx.fillStyle = '#15803d';
            ctx.strokeStyle = '#14532d';
            ctx.lineWidth = 2;
            const progress = p.growProgress || 1;
            if (p.isHorizontal) {
              const currentW = p.width * progress;
              ctx.fillRect(0, p.y, currentW, p.height);
              ctx.strokeRect(0, p.y, currentW, p.height);
              ctx.fillStyle = '#22c55e';
              for (let sp = 10; sp < currentW; sp += 20) {
                ctx.beginPath();
                ctx.moveTo(sp, p.y);
                ctx.lineTo(sp + 6, p.y - 4);
                ctx.lineTo(sp + 12, p.y);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(sp, p.y + p.height);
                ctx.lineTo(sp + 6, p.y + p.height + 4);
                ctx.lineTo(sp + 12, p.y + p.height);
                ctx.fill();
              }
            } else {
              const currentH = p.height * progress;
              ctx.fillRect(p.x, 0, p.width, currentH);
              ctx.strokeRect(p.x, 0, p.width, currentH);
              ctx.fillStyle = '#22c55e';
              for (let sp = 10; sp < currentH; sp += 20) {
                ctx.beginPath();
                ctx.moveTo(p.x, sp);
                ctx.lineTo(p.x - 4, sp + 6);
                ctx.lineTo(p.x, sp + 12);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(p.x + p.width, sp);
                ctx.lineTo(p.x + p.width + 4, sp + 6);
                ctx.lineTo(p.x + p.width, sp + 12);
                ctx.fill();
              }
            }
          } else if (p.type === 'burst_seed') {
            ctx.fillStyle = '#4ade80';
            ctx.strokeStyle = '#166534';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else if (p.type === 'radial_bullet' || p.type === 'spiral_bullet') {
            ctx.fillStyle = p.type === 'radial_bullet' ? '#38bdf8' : '#fb923c';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
        }
      }

      if (!isInvincible) {
        const heartRadius = 5.5;
        for (const p of projectiles) {
          let collided = false;

          if (p.type === 'vine_strike') {
            const hx = playerPos.x;
            const hy = playerPos.y;
            if (p.isHorizontal) {
              collided = hx >= 0 && hx <= p.width * (p.growProgress || 1) &&
                         hy >= p.y - heartRadius && hy <= p.y + p.height + heartRadius;
            } else {
              collided = hy >= 0 && hy <= p.height * (p.growProgress || 1) &&
                         hx >= p.x - heartRadius && hx <= p.x + p.width + heartRadius;
            }
          } else {
            const dist = Math.hypot(p.x - playerPos.x, p.y - playerPos.y);
            if (dist < (p.radius || 6) + heartRadius) {
              collided = true;
            }
          }

          if (collided) {
            onPlayerHit(4);
            break;
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isDodgeMode, isInvincible, playerPos, onDodgeEnd, onPlayerHit, attackController]);

  const handleTouchMove = (e) => {
    if (!isDodgeMode || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const rawX = touch.clientX - rect.left;
    const rawY = touch.clientY - rect.top;

    const heartHalf = 7;
    const scaleX = boxWidth / rect.width;
    const scaleY = boxHeight / rect.height;

    const x = Math.max(heartHalf + 6, Math.min(boxWidth - heartHalf - 6, rawX * scaleX));
    const y = Math.max(heartHalf + 6, Math.min(boxHeight - heartHalf - 6, rawY * scaleY));

    setPlayerPos({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className={`battle-center-box ${isDodgeMode ? 'dodge-mode' : ''}`}
      style={{
        maxWidth: isDodgeMode ? `${boxWidth}px` : '100%',
        margin: '0 auto'
      }}
      onTouchMove={handleTouchMove}
    >
      {isDodgeMode ? (
        <div style={{ position: 'relative', width: `${boxWidth}px`, height: `${boxHeight}px` }}>
          <canvas
            ref={canvasRef}
            width={boxWidth}
            height={boxHeight}
            className="dodge-arena-canvas"
          />
          <PlayerHeart
            x={playerPos.x}
            y={playerPos.y}
            isInvincible={isInvincible}
          />
        </div>
      ) : (
        children
      )}
    </div>
  );
}
