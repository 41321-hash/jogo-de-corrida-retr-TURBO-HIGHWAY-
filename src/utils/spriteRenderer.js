// Renderizador de Sprites Retro 16-Bit Top Gear (SNES)
// Desenha em Canvas 2D sem dependência de imagens externas para garantir 100% de funcionamento offline.

export function drawBackground(ctx, width, height, theme, skyOffset) {
  const horizonY = Math.round(height * 0.44);

  // 1. Gradiente de Céu Retro
  const grad = ctx.createLinearGradient(0, 0, 0, horizonY);
  const colors = theme.skyGradient;
  colors.forEach((c, idx) => {
    grad.addColorStop(idx / (colors.length - 1), c);
  });
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, horizonY);

  // 2. Sol / Lua / Sol Poente Retrô
  const sunX = (width * 0.75 + skyOffset * 0.1) % (width + 200) - 100;
  const sunY = horizonY * 0.45;
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 40);
  sunGrad.addColorStop(0, theme.sunColor);
  sunGrad.addColorStop(0.7, theme.sunColor);
  sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
  ctx.fill();

  // 3. Montanhas ou Linha do Horizonte de Cidades (Parallax Layer 1)

  if (theme.horizonType === 'city' || theme.horizonType === 'cyberpunk') {
    // Skyline com prédios e néon
    const buildingWidth = 36;
    const count = Math.ceil(width / buildingWidth) + 6;
    const startX = -(skyOffset * 0.35) % (buildingWidth * 2) - buildingWidth * 2;

    ctx.fillStyle = theme.horizonType === 'cyberpunk' ? '#181136' : '#141424';
    for (let i = 0; i < count; i++) {
      const bx = startX + i * buildingWidth;
      const bHeight = 35 + ((i * 37) % 55);
      ctx.fillRect(bx, horizonY - bHeight, buildingWidth - 2, bHeight);

      // Janelas brilhantes
      if (i % 2 === 0) {
        ctx.fillStyle = (i % 4 === 0) ? '#f43f5e' : (i % 3 === 0 ? '#38bdf8' : '#facc15');
        for (let row = 0; row < 3; row++) {
          ctx.fillRect(bx + 6, horizonY - bHeight + 8 + row * 10, 4, 4);
          ctx.fillRect(bx + 18, horizonY - bHeight + 8 + row * 10, 4, 4);
        }
        ctx.fillStyle = theme.horizonType === 'cyberpunk' ? '#181136' : '#141424';
      }
    }
  } else {
    // Montanhas / Colinas Tropicais ou Floresta
    const segWidth = 60;
    const count = Math.ceil(width / segWidth) + 4;
    const startX = -(skyOffset * 0.25) % (segWidth * 2) - segWidth * 2;

    ctx.fillStyle = theme.horizonType === 'mountains' ? '#2e1065' : '#142a1e';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    for (let i = 0; i < count; i++) {
      const mx = startX + i * segWidth;
      const mHeight = 45 + ((i * 43) % 45);
      ctx.lineTo(mx + segWidth / 2, horizonY - mHeight);
      ctx.lineTo(mx + segWidth, horizonY);
    }
    ctx.lineTo(width, horizonY);
    ctx.closePath();
    ctx.fill();
  }
}

// Desenhar Carro do Jogador (Visão Traseira Turbo Highway Fiel à Imagem)
export function drawPlayerCar(ctx, width, height, carDef, speedPercent, steer, isNitro, isBraking) {
  const carWidth = Math.round(width * 0.23);
  const carHeight = Math.round(carWidth * 0.64);
  const carX = width / 2;
  const carY = height * 0.88;

  ctx.save();
  ctx.translate(carX, carY);

  // Inclinação nas curvas (Body roll dinâmico de arcade)
  const roll = steer * 0.14;
  ctx.rotate(roll);

  // Sombra suave sob o carro
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.ellipse(0, carHeight * 0.38, carWidth * 0.58, carHeight * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();

  const halfW = carWidth / 2;
  const halfH = carHeight / 2;

  // 1. Pneus Traseiros Largos de Competição
  ctx.fillStyle = '#09090b';
  // Pneu Esquerdo
  ctx.fillRect(-halfW + 2, halfH - 20, 20, 24);
  // Pneu Direito
  ctx.fillRect(halfW - 22, halfH - 20, 20, 24);

  // Sulcos e Calotas esportivas
  ctx.fillStyle = '#475569';
  ctx.fillRect(-halfW + 5, halfH - 14, 14, 12);
  ctx.fillRect(halfW - 19, halfH - 14, 14, 12);

  // 2. Retrovisores Laterais Proeminentes (Como no clássico da imagem!)
  ctx.fillStyle = carDef.color;
  // Retrovisor Esquerdo
  ctx.fillRect(-halfW - 8, -halfH + 18, 10, 7);
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 2;
  ctx.strokeRect(-halfW - 8, -halfH + 18, 10, 7);
  ctx.fillStyle = '#38bdf8'; // Espelho reflexivo
  ctx.fillRect(-halfW - 7, -halfH + 20, 3, 4);

  // Retrovisor Direito
  ctx.fillStyle = carDef.color;
  ctx.fillRect(halfW - 2, -halfH + 18, 10, 7);
  ctx.strokeRect(halfW - 2, -halfH + 18, 10, 7);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(halfW + 4, -halfH + 20, 3, 4);

  // 3. Chassi Principal e Carroceria Aerodinâmica
  ctx.fillStyle = carDef.color;
  ctx.beginPath();
  ctx.moveTo(-halfW + 8, halfH);
  ctx.lineTo(-halfW + 2, -halfH + 16);
  ctx.lineTo(-halfW + 18, -halfH + 2);
  ctx.lineTo(halfW - 18, -halfH + 2);
  ctx.lineTo(halfW - 2, -halfH + 16);
  ctx.lineTo(halfW - 8, halfH);
  ctx.closePath();
  ctx.fill();

  // Borda preta clássica pixel-art
  ctx.strokeStyle = '#050505';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 4. Vidro Traseiro com Moldura Escura
  ctx.fillStyle = '#050508';
  ctx.beginPath();
  ctx.moveTo(-halfW + 22, -halfH + 5);
  ctx.lineTo(-halfW + 16, -halfH + 18);
  ctx.lineTo(halfW - 16, -halfH + 18);
  ctx.lineTo(halfW - 22, -halfH + 5);
  ctx.closePath();
  ctx.fill();

  // Persianas / Linhas Horizontais do Vidro Esportivo
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  for (let l = 0; l < 3; l++) {
    const ly = -halfH + 8 + l * 3.5;
    ctx.beginPath();
    ctx.moveTo(-halfW + 20 - l, ly);
    ctx.lineTo(halfW - 20 + l, ly);
    ctx.stroke();
  }

  // Reflexo de Luz no Vidro
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(-halfW + 26, -halfH + 7, halfW * 0.35, 3);

  // 5. Faixa de Corrida Central Branca (Idêntica à imagem!)
  const stripeW = 12;
  ctx.fillStyle = carDef.accentColor || '#ffffff';
  // Faixa no capô/teto
  ctx.fillRect(-stripeW / 2, -halfH + 2, stripeW, 4);
  // Faixa na tampa traseira até o para-choque
  ctx.fillRect(-stripeW / 2, -halfH + 18, stripeW, carHeight * 0.58);
  // Contorno fino da faixa
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-stripeW / 2, -halfH + 18, stripeW, carHeight * 0.58);

  // 6. Aerofólio / Spoiler Traseiro
  ctx.fillStyle = carDef.color;
  ctx.fillRect(-halfW + 4, -halfH + 16, carWidth - 8, 4);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-halfW + 4, -halfH + 16, carWidth - 8, 4);

  // 7. Lanternas Traseiras Retangulares Bicolores (Vermelho + Âmbar)
  const isLightOn = isBraking;
  const lightW = 24;
  const lightH = 9;

  // Lanterna Esquerda
  const leftLX = -halfW + 10;
  const leftLY = halfH - 16;
  // Parte interna (Seta / Âmbar)
  ctx.fillStyle = '#f97316';
  ctx.fillRect(leftLX + lightW - 8, leftLY, 8, lightH);
  // Parte externa (Freio / Vermelho)
  ctx.fillStyle = isLightOn ? '#ff0033' : '#b91c1c';
  ctx.fillRect(leftLX, leftLY, lightW - 8, lightH);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(leftLX, leftLY, lightW, lightH);

  // Lanterna Direita
  const rightLX = halfW - 10 - lightW;
  const rightLY = halfH - 16;
  // Parte interna (Seta / Âmbar)
  ctx.fillStyle = '#f97316';
  ctx.fillRect(rightLX, rightLY, 8, lightH);
  // Parte externa (Freio / Vermelho)
  ctx.fillStyle = isLightOn ? '#ff0033' : '#b91c1c';
  ctx.fillRect(rightLX + 8, rightLY, lightW - 8, lightH);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(rightLX, rightLY, lightW, lightH);

  // Brilho intenso de freio
  if (isLightOn) {
    ctx.fillStyle = 'rgba(255, 0, 50, 0.45)';
    ctx.beginPath();
    ctx.arc(leftLX + 8, leftLY + 4, 16, 0, Math.PI * 2);
    ctx.arc(rightLX + lightW - 8, rightLY + 4, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  // 8. Placa Traseira Amarela "TURBO-HW"
  ctx.fillStyle = '#09090b';
  ctx.fillRect(-20, halfH - 13, 40, 11);
  ctx.fillStyle = '#facc15'; // Fundo amarelo neon da placa
  ctx.fillRect(-18, halfH - 12, 36, 9);
  ctx.fillStyle = '#09090b'; // Letras pretas
  ctx.font = '900 7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TURBO-HW', 0, halfH - 5);

  // 9. Difusor Traseiro e Escapamentos Duplos
  ctx.fillStyle = '#18181b';
  ctx.fillRect(-halfW + 12, halfH - 4, carWidth - 24, 6);
  // Tubos de escape
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-halfW + 16, halfH - 3, 7, 5);
  ctx.fillRect(halfW - 23, halfH - 3, 7, 5);
  ctx.fillStyle = '#09090b';
  ctx.fillRect(-halfW + 17, halfH - 1, 5, 3);
  ctx.fillRect(halfW - 22, halfH - 1, 5, 3);

  // 10. Chamas Turbo Nitro
  if (isNitro) {
    [-halfW + 19, halfW - 20].forEach((exX) => {
      const flameLen = 22 + Math.random() * 26;
      const gradF = ctx.createLinearGradient(exX, halfH + 2, exX, halfH + 2 + flameLen);
      gradF.addColorStop(0, '#ffffff');
      gradF.addColorStop(0.2, '#38bdf8');
      gradF.addColorStop(0.6, '#ec4899');
      gradF.addColorStop(1, 'rgba(236, 72, 153, 0)');

      ctx.fillStyle = gradF;
      ctx.beginPath();
      ctx.moveTo(exX - 7, halfH + 2);
      ctx.lineTo(exX + 7, halfH + 2);
      ctx.lineTo(exX, halfH + 2 + flameLen);
      ctx.closePath();
      ctx.fill();
    });
  }

  ctx.restore();
}

// Desenhar Carro Rival da CPU em 3D
export function drawRivalCar(ctx, x, y, roadW, car) {
  // Tamanho do carro proporcional à largura da pista na tela
  const w = Math.round(roadW * 0.52);  // carro ocupa ~52% da meia-pista
  const h = Math.round(w * 0.65);

  if (w < 3 || h < 3) return;

  ctx.save();
  ctx.translate(x, y);

  // Sombra (chao)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.ellipse(0, 2, w * 0.55, h * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  const hw = w / 2;
  const hh = h / 2;

  // Pneus
  ctx.fillStyle = '#111111';
  ctx.fillRect(-hw - 2, hh * 0.3, hw * 0.25, hh * 0.7);
  ctx.fillRect(hw - hw * 0.25 + 2, hh * 0.3, hw * 0.25, hh * 0.7);

  // Chassi principal
  ctx.fillStyle = car.color;
  ctx.beginPath();
  ctx.moveTo(-hw + 4, hh);
  ctx.lineTo(-hw, 0);
  ctx.lineTo(-hw + hw * 0.35, -hh * 0.7);
  ctx.lineTo(hw - hw * 0.35, -hh * 0.7);
  ctx.lineTo(hw, 0);
  ctx.lineTo(hw - 4, hh);
  ctx.closePath();
  ctx.fill();

  // Borda preta
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = Math.max(1, Math.round(w * 0.04));
  ctx.stroke();

  // Vidro traseiro / teto
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(-hw * 0.55, -hh * 0.5);
  ctx.lineTo(-hw * 0.5, -hh * 0.85);
  ctx.lineTo(hw * 0.5, -hh * 0.85);
  ctx.lineTo(hw * 0.55, -hh * 0.5);
  ctx.closePath();
  ctx.fill();

  // Lanternas traseiras bicolores
  ctx.fillStyle = '#ff2222';
  ctx.fillRect(-hw + 3, hh * 0.15, hw * 0.2, hh * 0.22);
  ctx.fillRect(hw - hw * 0.2 - 3, hh * 0.15, hw * 0.2, hh * 0.22);
  ctx.fillStyle = '#f97316';
  ctx.fillRect(-hw + 3 + hw * 0.2, hh * 0.15, hw * 0.1, hh * 0.22);
  ctx.fillRect(hw - hw * 0.3 - 3, hh * 0.15, hw * 0.1, hh * 0.22);

  // Nome do rival
  if (w > 20) {
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-w * 0.22, -hh * 0.05, w * 0.44, hh * 0.4);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(7, Math.round(w * 0.16))}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(car.name.slice(0, 5), 0, hh * 0.28);
  }

  ctx.restore();
}

// Desenhar Objetos e Placas da Pista
export function drawRoadsideSprite(ctx, x, y, scale, spriteType) {
  ctx.save();
  ctx.translate(x, y);

  if (spriteType === 'billboard_turbo' || spriteType === 'billboard_topgear') {
    const w = Math.round(380 * scale);
    const h = Math.round(180 * scale);
    if (w < 4) { ctx.restore(); return; }

    // Suportes do outdoor
    ctx.fillStyle = '#475569';
    ctx.fillRect(-w * 0.35, 0, Math.max(2, w * 0.08), h * 0.8);
    ctx.fillRect(w * 0.27, 0, Math.max(2, w * 0.08), h * 0.8);

    // Painel do Outdoor Estilo Synthwave
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-w / 2, -h, w, h);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = Math.max(1, 3 * scale);
    ctx.strokeRect(-w / 2, -h, w, h);

    // Logo TURBO HIGHWAY no outdoor
    if (scale > 0.002) {
      ctx.fillStyle = '#facc15';
      ctx.font = `italic 900 ${Math.max(9, Math.round(34 * scale))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('TURBO', 0, -h * 0.55);

      ctx.fillStyle = '#ec4899';
      ctx.font = `bold 900 ${Math.max(8, Math.round(24 * scale))}px sans-serif`;
      ctx.fillText('HIGHWAY', 0, -h * 0.22);
    }
  } else if (spriteType === 'gantry_finish') {
    // Pórtico de Linha de Chegada que cruza a pista inteira
    const w = Math.round(900 * scale);
    const h = Math.round(340 * scale);
    if (w < 8) { ctx.restore(); return; }

    // Pilares
    ctx.fillStyle = '#334155';
    ctx.fillRect(-w * 0.48, -h, w * 0.08, h);
    ctx.fillRect(w * 0.4, -h, w * 0.08, h);

    // Viga Superior
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-w * 0.48, -h, w * 0.96, h * 0.35);

    // Padrão Quadriculado
    const quadW = w * 0.06;
    for (let c = 0; c < 15; c++) {
      ctx.fillStyle = c % 2 === 0 ? '#ffffff' : '#000000';
      ctx.fillRect(-w * 0.45 + c * quadW, -h * 0.95, quadW, h * 0.25);
    }

    if (scale > 0.002) {
      ctx.fillStyle = '#facc15';
      ctx.font = `900 ${Math.max(10, Math.round(32 * scale))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('FINISH LINE', 0, -h * 0.38);
    }
  } else if (spriteType === 'sign_pit_in') {
    // Placa de Entrada do Pit Stop
    const w = Math.round(160 * scale);
    const h = Math.round(130 * scale);
    if (w < 4) { ctx.restore(); return; }

    ctx.fillStyle = '#334155';
    ctx.fillRect(-w * 0.1, 0, w * 0.2, h * 0.7);

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(-w / 2, -h, w, h);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.max(1, 2 * scale);
    ctx.strokeRect(-w / 2, -h, w, h);

    if (scale > 0.002) {
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${Math.max(8, Math.round(24 * scale))}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('PIT IN', 0, -h * 0.5);
      ctx.fillStyle = '#facc15';
      ctx.fillText('⛽ [P]', 0, -h * 0.15);
    }
  } else if (spriteType === 'pit_crew') {
    // Equipe de Mecânicos do Pit Lane
    const w = Math.round(80 * scale);
    const h = Math.round(100 * scale);
    if (w < 3) { ctx.restore(); return; }

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-w * 0.3, -h * 0.7, w * 0.6, h * 0.7);
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(0, -h * 0.85, w * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(w * 0.2, -h * 0.5, w * 0.4, h * 0.5); // Mangueira de combustível
  } else if (spriteType === 'palm') {
    // Palmeira Tropical
    const w = Math.round(180 * scale);
    const h = Math.round(320 * scale);
    if (w < 4) { ctx.restore(); return; }

    // Tronco
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(-w * 0.08, 0);
    ctx.lineTo(w * 0.04, -h * 0.7);
    ctx.lineTo(-w * 0.02, -h);
    ctx.lineTo(-w * 0.1, -h);
    ctx.lineTo(-w * 0.15, 0);
    ctx.closePath();
    ctx.fill();

    // Folhagens verdes curvadas
    ctx.fillStyle = '#15803d';
    for (let angle = 0; angle < 6; angle++) {
      ctx.beginPath();
      ctx.ellipse(-w * 0.06, -h * 0.95, w * 0.45, h * 0.15, (angle * Math.PI) / 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (spriteType === 'pine_tree') {
    // Pinheiro Clássico
    const w = Math.round(160 * scale);
    const h = Math.round(280 * scale);
    if (w < 4) { ctx.restore(); return; }

    ctx.fillStyle = '#451a03';
    ctx.fillRect(-w * 0.1, -h * 0.25, w * 0.2, h * 0.25);

    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.lineTo(w / 2, -h * 0.25);
    ctx.lineTo(-w / 2, -h * 0.25);
    ctx.closePath();
    ctx.fill();
  } else if (spriteType === 'sign_arrow_left' || spriteType === 'sign_arrow_right') {
    // Placa de Curva Acentuada <<< ou >>>
    const w = Math.round(130 * scale);
    const h = Math.round(100 * scale);
    if (w < 3) { ctx.restore(); return; }

    ctx.fillStyle = '#475569';
    ctx.fillRect(-w * 0.1, 0, w * 0.2, h * 0.6);

    ctx.fillStyle = '#eab308';
    ctx.fillRect(-w / 2, -h, w, h);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(1, 2 * scale);
    ctx.strokeRect(-w / 2, -h, w, h);

    if (scale > 0.002) {
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${Math.max(9, Math.round(26 * scale))}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(spriteType === 'sign_arrow_left' ? '◀◀◀' : '▶▶▶', 0, -h * 0.35);
    }
  } else if (spriteType === 'streetlight') {
    // Poste de Iluminação com feixe de luz
    const w = Math.round(100 * scale);
    const h = Math.round(300 * scale);
    if (w < 3) { ctx.restore(); return; }

    ctx.fillStyle = '#64748b';
    ctx.fillRect(-w * 0.06, -h, w * 0.12, h);
    ctx.fillRect(-w * 0.06, -h, w * 0.45, h * 0.06);

    // Lâmpada brilhante
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(w * 0.35, -h + h * 0.05, Math.max(2, 6 * scale), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Renderizar Retrovisor do Top Gear no topo da tela
export function drawRearviewMirror(ctx, width, height, playerZ, rivals, trackLength) {
  const mirrorW = Math.min(220, Math.round(width * 0.32));
  const mirrorH = Math.round(mirrorW * 0.38);
  const mirrorX = (width - mirrorW) / 2;
  const mirrorY = 8;

  ctx.save();

  // Moldura do Retrovisor
  ctx.fillStyle = '#09090b';
  ctx.fillRect(mirrorX, mirrorY, mirrorW, mirrorH);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.strokeRect(mirrorX, mirrorY, mirrorW, mirrorH);

  // Vidro do Retrovisor (Estrada atrás)
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(mirrorX + 3, mirrorY + 3, mirrorW - 6, mirrorH - 6);

  // Linhas da estrada diminuindo
  ctx.strokeStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(mirrorX + mirrorW * 0.3, mirrorY + mirrorH - 4);
  ctx.lineTo(mirrorX + mirrorW * 0.45, mirrorY + mirrorH * 0.3);
  ctx.moveTo(mirrorX + mirrorW * 0.7, mirrorY + mirrorH - 4);
  ctx.lineTo(mirrorX + mirrorW * 0.55, mirrorY + mirrorH * 0.3);
  ctx.stroke();

  // Desenhar carros que estão atrás do jogador (até 1500 unidades atrás)
  rivals.forEach((r) => {
    let distBehind = playerZ - r.z;
    if (distBehind < 0 && distBehind > -trackLength + 1500) {
      distBehind += trackLength;
    }
    if (distBehind > 0 && distBehind < 1800) {
      const relScale = 1 - (distBehind / 1800);
      const rx = mirrorX + mirrorW / 2 + (r.x * mirrorW * 0.25);
      const ry = mirrorY + mirrorH * 0.3 + (relScale * mirrorH * 0.55);
      const rw = Math.max(6, 26 * relScale);
      const rh = Math.max(4, 16 * relScale);

      // Carro rival no espelho
      ctx.fillStyle = r.color;
      ctx.fillRect(rx - rw / 2, ry - rh / 2, rw, rh);
      // Faróis brilhando no espelho
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(rx - rw / 2 + 1, ry, 2, 2);
      ctx.fillRect(rx + rw / 2 - 3, ry, 2, 2);
    }
  });

  // Reflexo diagonal do vidro
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.beginPath();
  ctx.moveTo(mirrorX + 4, mirrorY + 4);
  ctx.lineTo(mirrorX + mirrorW * 0.4, mirrorY + 4);
  ctx.lineTo(mirrorX + mirrorW * 0.2, mirrorY + mirrorH - 4);
  ctx.lineTo(mirrorX + 4, mirrorY + mirrorH - 4);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// Renderizar Minimapa da Pista
export function drawMiniMap(ctx, x, y, size, playerPercent, rivals) {
  ctx.save();
  ctx.translate(x, y);

  // Fundo transparente com borda
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, 0, size, size);

  // Traçado da Pista (Loop Oval/Retrô Estilo Top Gear)
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  const pad = 12;
  const rw = size - pad * 2;
  const rh = size - pad * 2;
  ctx.roundRect(pad, pad, rw, rh, 18);
  ctx.stroke();

  // Ponto de Chegada
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(size / 2 - 2, pad - 4, 4, 8);

  // Função auxiliar para mapear 0..1 no perímetro
  function getMapPos(percent) {
    const p = ((percent % 1) + 1) % 1;
    // Perímetro aproximado do retângulo
    const perim = 2 * (rw + rh);
    const dist = p * perim;
    if (dist < rw) {
      return { x: pad + dist, y: pad };
    } else if (dist < rw + rh) {
      return { x: pad + rw, y: pad + (dist - rw) };
    } else if (dist < 2 * rw + rh) {
      return { x: pad + rw - (dist - (rw + rh)), y: pad + rh };
    } else {
      return { x: pad, y: pad + rh - (dist - (2 * rw + rh)) };
    }
  }

  // Desenhar Rivais (pontos amarelos/brancos)
  rivals.forEach((r) => {
    const pos = getMapPos(r.percentComplete);
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Desenhar Jogador (Ponto Vermelho/Ciano Pulsante)
  const playerPos = getMapPos(playerPercent);
  ctx.fillStyle = '#ff0055';
  ctx.beginPath();
  ctx.arc(playerPos.x, playerPos.y, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}
