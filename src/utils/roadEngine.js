// Motor de Renderização Pseudo-3D Retro Top Gear (Estilo SNES 1992)
// Baseado na clássica projeção pseudo-3D com curvas, elevação de colinas e objetos escalonados.

export const SEGMENT_LENGTH = 200; // Comprimento de cada fatia da pista
export const ROAD_WIDTH = 2000;     // Largura padrão da pista no mundo 3D
export const DRAW_DISTANCE = 220;   // Quantidade de segmentos visíveis à frente (estável e rápido)
export const CAMERA_HEIGHT = 1000;  // Altura da câmera acima da pista
export const CAMERA_DEPTH = 0.84;   // Distância focal da câmera
export const TOTAL_LAPS = 3;        // Voltas da corrida

// Paletas de cores autênticas dos cenários com alto contraste
export const TRACK_THEMES = {
  vegas: {
    id: 'vegas',
    name: 'LAS VEGAS',
    country: 'USA 🇺🇸',
    skyGradient: ['#090514', '#1d0b38', '#4b1552', '#9b235e'],
    sunColor: '#ff2a85',
    horizonType: 'city',
    roadDark: '#2c2e3e',       // Asfalto cinza escuro visível
    roadLight: '#393c50',      // Asfalto cinza claro visível
    rumble1: '#e11d48',        // Zebra vermelha
    rumble2: '#ffffff',        // Zebra branca
    grassDark: '#120f26',      // Terreno noturno arroxeado
    grassLight: '#1b1737',     // Terreno noturno iluminado
    laneColor: '#facc15',      // Faixa central amarela
    pitColor: '#1e293b'
  },
  rio: {
    id: 'rio',
    name: 'RIO DE JANEIRO',
    country: 'BRAZIL 🇧🇷',
    skyGradient: ['#0f172a', '#3b0764', '#b91c1c', '#f97316', '#fde047'],
    sunColor: '#fef08a',
    horizonType: 'mountains',
    roadDark: '#32373e',
    roadLight: '#3f454e',
    rumble1: '#16a34a',        // Zebra verde
    rumble2: '#facc15',        // Zebra amarela
    grassDark: '#14532d',      // Grama tropical
    grassLight: '#166534',     // Grama tropical clara
    laneColor: '#ffffff',
    pitColor: '#1e293b'
  },
  frankfurt: {
    id: 'frankfurt',
    name: 'FRANKFURT AUTOBAHN',
    country: 'GERMANY 🇩🇪',
    skyGradient: ['#0f172a', '#1e293b', '#334155', '#64748b'],
    sunColor: '#cbd5e1',
    horizonType: 'forest',
    roadDark: '#374151',
    roadLight: '#4b5563',
    rumble1: '#dc2626',
    rumble2: '#f8fafc',
    grassDark: '#14371e',
    grassLight: '#1f4e2c',
    laneColor: '#e2e8f0',
    pitColor: '#111827'
  },
  tokyo: {
    id: 'tokyo',
    name: 'TOKYO NIGHTLINE',
    country: 'JAPAN 🇯🇵',
    skyGradient: ['#050811', '#120f2e', '#2c124d', '#701a75'],
    sunColor: '#ec4899',
    horizonType: 'cyberpunk',
    roadDark: '#232334',
    roadLight: '#313148',
    rumble1: '#06b6d4',        // Zebra ciano néon
    rumble2: '#ec4899',        // Zebra magenta néon
    grassDark: '#0e111f',
    grassLight: '#15192c',
    laneColor: '#38bdf8',
    pitColor: '#0a0a14'
  }
};

// Carros clássicos do Top Gear SNES
export const TOP_GEAR_CARS = [
  {
    id: 'cannoli',
    name: 'THE CANNOLI',
    color: '#e11d48', // Vermelho Icônico
    accentColor: '#ffffff',
    glassColor: '#0f172a',
    maxSpeed: 275,
    accel: 1.15,
    handling: 1.1,
    fuelConsumption: 1.0,
    nitroBoost: 65,
    nitros: 4,
    description: 'O clássico supercarro vermelho de Top Gear. Excelente equilíbrio de velocidade, aceleração e estabilidade.'
  },
  {
    id: 'sidewinder',
    name: 'SIDEWINDER',
    color: '#f8fafc', // Branco Perolizado
    accentColor: '#dc2626',
    glassColor: '#0284c7',
    maxSpeed: 305,
    accel: 0.95,
    handling: 0.9,
    fuelConsumption: 1.35,
    nitroBoost: 80,
    nitros: 4,
    description: 'Velocidade máxima avassaladora nas retas. Consome mais combustível, perfeito para pilotos audaciosos!'
  },
  {
    id: 'weasel',
    name: 'PURPLE WEASEL',
    color: '#9333ea', // Roxo Top Gear
    accentColor: '#fbbf24',
    glassColor: '#1e1b4b',
    maxSpeed: 265,
    accel: 1.25,
    handling: 1.35,
    fuelConsumption: 0.75,
    nitroBoost: 55,
    nitros: 4,
    description: 'Grip impressionante nas curvas e economia de combustível notável. Raramente precisa parar no Pit Stop.'
  },
  {
    id: 'razor',
    name: 'CYBER RAZOR',
    color: '#06b6d4', // Ciano / Azul Elétrico
    accentColor: '#f43f5e',
    glassColor: '#082f49',
    maxSpeed: 285,
    accel: 1.2,
    handling: 1.15,
    fuelConsumption: 1.05,
    nitroBoost: 70,
    nitros: 4,
    description: 'Resposta de aceleração turbo e controle de curvas ultra ágil. A máquina definitiva das pistas urbanas.'
  }
];

// Nomes clássicos dos rivais da CPU
export const CPU_RIVAL_NAMES = [
  'Cannoli', 'Paul', 'Dale', 'Alan', 'Mike',
  'Richie', 'Geoff', 'Steve', 'Dave', 'Rob',
  'Tony', 'Mark', 'Gary', 'Brian', 'Frank',
  'Kevin', 'Jason', 'Chris', 'Alex'
];

export const CPU_CAR_COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#e2e8f0', '#64748b', '#a855f7'
];

// Construtor de Pistas Customizadas
export function buildTrack(trackId = 'vegas') {
  const segments = [];

  function addSegment(curve, y, sprites = [], isPitLane = false, isFinishLine = false) {
    const n = segments.length;
    segments.push({
      index: n,
      p1: {
        world: { x: 0, y: (n === 0 ? 0 : segments[n - 1].p2.world.y), z: n * SEGMENT_LENGTH },
        camera: {},
        screen: {}
      },
      p2: {
        world: { x: 0, y: y, z: (n + 1) * SEGMENT_LENGTH },
        camera: {},
        screen: {}
      },
      curve: curve,
      sprites: sprites,
      isPitLane: isPitLane,
      isFinishLine: isFinishLine,
      color: {
        rumble: Math.floor(n / 3) % 2 ? 'rumble1' : 'rumble2',
        road: Math.floor(n / 3) % 2 ? 'roadLight' : 'roadDark',
        grass: Math.floor(n / 3) % 2 ? 'grassLight' : 'grassDark',
        lane: Math.floor(n / 3) % 2 ? 'laneColor' : 'transparent'
      }
    });
  }

  function addRoad(enter, hold, leave, curve, targetRelY) {
    const startY = segments.length === 0 ? 0 : segments[segments.length - 1].p2.world.y;
    const endY = startY + targetRelY;
    const total = enter + hold + leave;

    for (let n = 0; n < enter; n++) {
      const currentY = startY + ((endY - startY) * (n / total));
      addSegment(curve * (n / enter), currentY);
    }
    for (let n = 0; n < hold; n++) {
      const currentY = startY + ((endY - startY) * ((enter + n) / total));
      addSegment(curve, currentY);
    }
    for (let n = 0; n < leave; n++) {
      const currentY = startY + ((endY - startY) * ((enter + hold + n) / total));
      addSegment(curve * (1 - (n / leave)), currentY);
    }
  }

  // Gera traçados equilibrados onde o relevo é suave e o circuito fecha perfeitamente em Y = 0
  if (trackId === 'vegas') {
    // Las Vegas: Retas velozes, chicanes neon e Pit Stop
    addRoad(40, 60, 40, 0, 0);          // Reta de largada
    addRoad(30, 45, 30, 1.8, 300);      // Curva aberta à direita com subida leve
    addRoad(25, 40, 25, -1.6, -300);    // Curva à esquerda descendo
    addRoad(40, 70, 40, 0, 0);          // Reta dos cassinos
    addRoad(25, 40, 25, -2.0, 250);     // Curva fechada para esquerda
    addRoad(30, 45, 30, 1.9, -250);     // Curva para a direita
    addRoad(40, 60, 40, 0, 0);          // Reta final
  } else if (trackId === 'rio') {
    // Rio de Janeiro: Curvas litorâneas e morros tropicais suaves
    addRoad(30, 40, 30, 0, 0);
    addRoad(35, 50, 35, -2.2, 450);     // Subida de morro
    addRoad(30, 40, 30, 2.0, -450);     // Descida
    addRoad(25, 35, 25, 2.4, 250);      // Curva à beira mar
    addRoad(30, 50, 30, 0, -250);
    addRoad(25, 40, 25, -2.3, 0);
    addRoad(35, 60, 35, 1.5, 0);
    addRoad(40, 60, 40, 0, 0);
  } else if (trackId === 'frankfurt') {
    // Frankfurt: Autobahn, retas longas com suaves ondulações
    addRoad(50, 90, 50, 0, 0);
    addRoad(30, 40, 30, 1.2, 350);
    addRoad(30, 40, 30, 0, -350);
    addRoad(35, 45, 35, -1.4, 300);
    addRoad(35, 45, 35, 0, -300);
    addRoad(45, 80, 45, 1.5, 0);
    addRoad(40, 70, 40, 0, 0);
  } else {
    // Tokyo: Chicanes rápidas estilo arcade
    addRoad(30, 40, 30, 0, 0);
    addRoad(20, 30, 20, 2.2, 150);
    addRoad(20, 30, 20, -2.2, -150);
    addRoad(25, 35, 25, 2.0, 0);
    addRoad(35, 55, 35, 0, 0);
    addRoad(20, 30, 20, -2.4, 200);
    addRoad(25, 35, 25, 1.9, -200);
    addRoad(40, 60, 40, 0, 0);
  }

  // Marcar a linha de chegada (Finish Line) nos primeiros 4 segmentos
  for (let i = 0; i < 4; i++) {
    if (segments[i]) segments[i].isFinishLine = true;
  }

  // Criar Área de Pit Stop na reta final (últimos 70 segmentos antes da chegada)
  const pitStart = segments.length - 75;
  const pitEnd = segments.length - 20;
  for (let i = pitStart; i < pitEnd; i++) {
    if (segments[i]) segments[i].isPitLane = true;
  }

  // Adicionar Sprites e Placas ao longo da pista
  const totalSegs = segments.length;
  for (let i = 0; i < totalSegs; i++) {
    const seg = segments[i];

    // Pórtico de chegada
    if (i === 1) {
      seg.sprites.push({ type: 'gantry_finish', offset: 0 });
    }

    // Placas de Pit Stop antes da entrada do box
    if (i === pitStart - 10) {
      seg.sprites.push({ type: 'sign_pit_in', offset: 1.5 });
    }
    if (i >= pitStart && i <= pitEnd && i % 10 === 0) {
      seg.sprites.push({ type: 'pit_crew', offset: 1.7 });
    }

    // Placas de aviso de curva
    if (seg.curve > 1.7 && i % 18 === 0) {
      seg.sprites.push({ type: 'sign_arrow_right', offset: -1.35 });
    } else if (seg.curve < -1.7 && i % 18 === 0) {
      seg.sprites.push({ type: 'sign_arrow_left', offset: 1.35 });
    }

    // Outdoors do Top Gear
    if (i % 60 === 0 && i > 10) {
      const side = (i % 120 === 0) ? -1.6 : 1.6;
      seg.sprites.push({ type: 'billboard_topgear', offset: side });
    }

    // Vegetação e postes de iluminação
    if (i % 6 === 0) {
      const side = (i % 12 === 0) ? -1.45 : 1.45;
      if (trackId === 'vegas' || trackId === 'tokyo') {
        seg.sprites.push({ type: (i % 18 === 0 ? 'palm' : 'streetlight'), offset: side });
      } else if (trackId === 'rio') {
        seg.sprites.push({ type: (i % 12 === 0 ? 'palm' : 'tropical_rock'), offset: side });
      } else {
        seg.sprites.push({ type: 'pine_tree', offset: side });
      }
    }
  }

  return segments;
}

// Inicializar os 19 carros da CPU para compor o grid de 20 corredores
export function initCPURivals(totalTrackLength) {
  const rivals = [];
  for (let i = 0; i < 19; i++) {
    const laneOffset = ((i % 3) - 1) * 0.52 + (Math.random() * 0.15 - 0.075);
    const initialZ = 1200 + (19 - i) * 650;
    rivals.push({
      id: i + 1,
      name: CPU_RIVAL_NAMES[i % CPU_RIVAL_NAMES.length],
      z: initialZ,
      x: laneOffset,
      speed: 180 + Math.random() * 55, // km/h
      baseSpeed: 210 + Math.random() * 45,
      color: CPU_CAR_COLORS[i % CPU_CAR_COLORS.length],
      lap: 1,
      percentComplete: 0,
      width: 80,
      height: 48,
      steerVx: (Math.random() - 0.5) * 0.2
    });
  }
  return rivals;
}
