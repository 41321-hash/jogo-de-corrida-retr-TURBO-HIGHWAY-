// Sistema de Padrões de Ataque de Esquiva Bullet-Hell

export const ATTACK_TYPES = {
  PETALS: 'petals',
  VINES: 'vines',
  BURST: 'burst',
  SPIRAL: 'spiral',
  FINAL_COMBO: 'final_combo'
};

export class AttackController {
  constructor(arenaWidth = 320, arenaHeight = 180) {
    this.width = arenaWidth;
    this.height = arenaHeight;
    this.attackType = ATTACK_TYPES.PETALS;
    this.timeElapsed = 0;
    this.duration = 7.5; // segundos por turno de esquiva
    this.speedMultiplier = 1.0;
    this.projectiles = [];
    this.warnings = []; // Áreas de aviso de raízes
    this.lastSpawnTime = 0;
    this.spiralAngle = 0;
    this.burstFired = false;
  }

  startAttack(type, speedMultiplier = 1.0) {
    this.attackType = type;
    this.speedMultiplier = speedMultiplier;
    this.timeElapsed = 0;
    this.projectiles = [];
    this.warnings = [];
    this.lastSpawnTime = 0;
    this.spiralAngle = 0;
    this.burstFired = false;
  }

  update(dt, onWarningSound) {
    this.timeElapsed += dt;
    const progress = this.timeElapsed / this.duration;

    if (progress >= 1.0) {
      return { isFinished: true, projectiles: [], warnings: [] };
    }

    switch (this.attackType) {
      case ATTACK_TYPES.PETALS:
        this.updatePetals(dt);
        break;
      case ATTACK_TYPES.VINES:
        this.updateVines(dt, onWarningSound);
        break;
      case ATTACK_TYPES.BURST:
        this.updateBurst(dt);
        break;
      case ATTACK_TYPES.SPIRAL:
        this.updateSpiral(dt);
        break;
      case ATTACK_TYPES.FINAL_COMBO:
        this.updateCombo(dt, onWarningSound);
        break;
      default:
        this.updatePetals(dt);
    }

    const currentProjectiles = [];
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
          this.spawnRadialBullets(p.x, p.y, 8, 85 * this.speedMultiplier);
        }
      } else if (p.type === 'radial_bullet' || p.type === 'spiral_bullet') {
        p.x += p.vx * dt * this.speedMultiplier;
        p.y += p.vy * dt * this.speedMultiplier;
      } else if (p.type === 'vine_strike') {
        p.growProgress = Math.min(1.0, p.growProgress + dt * 4.5);
      }

      const isAlive = p.time < (p.life || 6.0) &&
                      p.x >= -30 && p.x <= this.width + 30 &&
                      p.y >= -30 && p.y <= this.height + 30;

      if (isAlive && !(p.exploded && p.type === 'burst_seed')) {
        currentProjectiles.push(p);
      }
    }
    this.projectiles = currentProjectiles;

    this.warnings = this.warnings.filter(w => {
      w.timer -= dt;
      return w.timer > 0;
    });

    return {
      isFinished: false,
      projectiles: this.projectiles,
      warnings: this.warnings,
      timeLeft: Math.max(0, this.duration - this.timeElapsed)
    };
  }

  updatePetals(dt) {
    const spawnInterval = 0.32 / this.speedMultiplier;
    if (this.timeElapsed - this.lastSpawnTime >= spawnInterval) {
      this.lastSpawnTime = this.timeElapsed;
      const x = 20 + Math.random() * (this.width - 40);
      this.projectiles.push({
        id: Math.random(),
        type: 'petal',
        x: x,
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
  }

  updateVines(dt, onWarningSound) {
    const interval = 1.3 / this.speedMultiplier;
    if (this.timeElapsed - this.lastSpawnTime >= interval && this.timeElapsed < this.duration - 1.2) {
      this.lastSpawnTime = this.timeElapsed;
      const isHorizontal = Math.random() > 0.5;
      const warningDuration = 0.65 / this.speedMultiplier;

      if (isHorizontal) {
        const y = 30 + Math.random() * (this.height - 60);
        this.warnings.push({
          id: Math.random(),
          isHorizontal: true,
          pos: y,
          timer: warningDuration,
          maxTimer: warningDuration,
          thickness: 24
        });
        if (onWarningSound) onWarningSound();

        setTimeout(() => {
          this.projectiles.push({
            id: Math.random(),
            type: 'vine_strike',
            isHorizontal: true,
            x: 0,
            y: y - 12,
            width: this.width,
            height: 24,
            growProgress: 0,
            time: 0,
            life: 0.5
          });
        }, warningDuration * 1000);
      } else {
        const x = 30 + Math.random() * (this.width - 60);
        this.warnings.push({
          id: Math.random(),
          isHorizontal: false,
          pos: x,
          timer: warningDuration,
          maxTimer: warningDuration,
          thickness: 24
        });
        if (onWarningSound) onWarningSound();

        setTimeout(() => {
          this.projectiles.push({
            id: Math.random(),
            type: 'vine_strike',
            isHorizontal: false,
            x: x - 12,
            y: 0,
            width: 24,
            height: this.height,
            growProgress: 0,
            time: 0,
            life: 0.5
          });
        }, warningDuration * 1000);
      }
    }
  }

  updateBurst(dt) {
    const interval = 1.5 / this.speedMultiplier;
    if (this.timeElapsed - this.lastSpawnTime >= interval && this.timeElapsed < this.duration - 1.2) {
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
  }

  spawnRadialBullets(cx, cy, count = 8, speed = 80) {
    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count + (Math.PI / 8);
      this.projectiles.push({
        id: Math.random(),
        type: 'radial_bullet',
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 5,
        time: 0,
        life: 4.0
      });
    }
  }

  updateSpiral(dt) {
    const interval = 0.12 / this.speedMultiplier;
    if (this.timeElapsed - this.lastSpawnTime >= interval) {
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
  }

  updateCombo(dt, onWarningSound) {
    const petalInterval = 0.35 / this.speedMultiplier;
    if (this.timeElapsed - this.lastSpawnTime >= petalInterval) {
      this.lastSpawnTime = this.timeElapsed;
      const x = 15 + Math.random() * (this.width - 30);
      this.projectiles.push({
        id: Math.random(),
        type: 'petal',
        x: x,
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

    if (Math.floor(this.timeElapsed) !== Math.floor(this.timeElapsed - dt) &&
        Math.floor(this.timeElapsed) % 2 === 0 &&
        this.timeElapsed < this.duration - 1.5) {
      const isHorizontal = Math.random() > 0.5;
      const warningDuration = 0.5;

      if (isHorizontal) {
        const y = 30 + Math.random() * (this.height - 60);
        this.warnings.push({
          id: Math.random(),
          isHorizontal: true,
          pos: y,
          timer: warningDuration,
          maxTimer: warningDuration,
          thickness: 26
        });
        if (onWarningSound) onWarningSound();
        setTimeout(() => {
          this.projectiles.push({
            id: Math.random(),
            type: 'vine_strike',
            isHorizontal: true,
            x: 0,
            y: y - 13,
            width: this.width,
            height: 26,
            growProgress: 0,
            time: 0,
            life: 0.55
          });
        }, warningDuration * 1000);
      } else {
        const x = 30 + Math.random() * (this.width - 60);
        this.warnings.push({
          id: Math.random(),
          isHorizontal: false,
          pos: x,
          timer: warningDuration,
          maxTimer: warningDuration,
          thickness: 26
        });
        if (onWarningSound) onWarningSound();
        setTimeout(() => {
          this.projectiles.push({
            id: Math.random(),
            type: 'vine_strike',
            isHorizontal: false,
            x: x - 13,
            y: 0,
            width: 26,
            height: this.height,
            growProgress: 0,
            time: 0,
            life: 0.55
          });
        }, warningDuration * 1000);
      }
    }
  }
}
