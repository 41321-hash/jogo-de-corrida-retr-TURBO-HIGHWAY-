// Motor de Renderização Pseudo-3D Retro Top Gear (Estilo SNES 1992)
// Baseado na clássica projeção pseudo-3D com curvas, elevação de colinas e objetos escalonados.

export const SEGMENT_LENGTH = 200; // Comprimento de cada fatia da pista
export const ROAD_WIDTH = 2000;     // Largura padrão da pista no mundo 3D
export const DRAW_DISTANCE = 320;   // Quantidade de segmentos visíveis à frente (maior alcance para avistar curvas com clareza)
export const CAMERA_HEIGHT = 1000;  // Altura da câmera acima da pista
export const CAMERA_DEPTH = 0.84;   // Distância focal da câmera
export const TOTAL_LAPS = 3;        // Voltas da corrida

// Paletas de cores autênticas dos cenários com alto contraste
export const TRACK_THEMES = {
  vegas: {
    id: 'vegas',
    name: 'LAS VEGAS HIGHWAY',
    country: 'USA 🇺🇸',
    skyGradient: ['#090514', '#1d0b38', '#4b1552', '#9b235e'],
    sunColor: '#ff2a85',
    horizonType: 'city',
    roadDark: '#242533',       // Asfalto escuro
    roadLight: '#323447',      // Asfalto claro visível
    rumble1: '#e11d48',        // Zebra vermelha neon
    rumble2: '#ffffff',        // Zebra branca
    grassDark: '#100c22',      // Terreno noturno arroxeado
    grassLight: '#181433',     // Terreno noturno iluminado
    laneColor: '#facc15',      // Faixa central amarela
    pitColor: '#1e293b'
  },
  rio: {
    id: 'rio',
    name: 'RIO COASTLINE',
    country: 'BRAZIL 🇧🇷',
    skyGradient: ['#0f172a', '#3b0764', '#b91c1c', '#f97316', '#fde047'],
    sunColor: '#fef08a',
    horizonType: 'mountains',
    roadDark: '#2c3138',
    roadLight: '#3a4049',
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
    roadDark: '#323a47',
    roadLight: '#434e5e',
    rumble1: '#dc2626',
    rumble2: '#f8fafc',
    grassDark: '#12301a',
    grassLight: '#1a4425',
    laneColor: '#e2e8f0',
    pitColor: '#111827'
  },
  tokyo: {
    id: 'tokyo',
    name: 'TOKYO EXPRESSWAY',
    country: 'JAPAN 🇯🇵',
    skyGradient: ['#050811', '#120f2e', '#2c124d', '#701a75'],
    sunColor: '#ec4899',
    horizonType: 'cyberpunk',
    roadDark: '#1f1f2e',
    roadLight: '#2c2c40',
    rumble1: '#06b6d4',        // Zebra ciano néon
    rumble2: '#ec4899',        // Zebra magenta néon
    grassDark: '#0c0e1a',
    grassLight: '#131626',
    laneColor: '#38bdf8',
    pitColor: '#0a0a14'
  }
};

// Carros esportivos retrô de Turbo Highway
export const TOP_GEAR_CARS = [
  {
    id: 'cannoli',
    name: 'RED TURBO',
    color: '#e11d48', // Vermelho Icônico Turbo Highway
    accentColor: '#ffffff',
    glassColor: '#0f172a',
    maxSpeed: 280,
    accel: 1.15,
    handling: 1.15,
    fuelConsumption: 1.0,
    nitroBoost: 70,
    nitros: 4,
    description: 'O lendário esportivo vermelho da capa de Turbo Highway! Equilíbrio cirúrgico entre velocidade máxima, controle e aceleração turbo.'
  },
  {
    id: 'sidewinder',
    name: 'WHITE LIGHTNING',
    color: '#f8fafc', // Branco Perolizado
    accentColor: '#dc2626',
    glassColor: '#0284c7',
    maxSpeed: 310,
    accel: 0.95,
    handling: 0.92,
    fuelConsumption: 1.35,
    nitroBoost: 85,
    nitros: 4,
    description: 'Velocidade final astronômica para dominar as longas retas da autoestrada. Consome mais combustível.'
  },
  {
    id: 'weasel',
    name: 'SYNTH WEASEL',
    color: '#9333ea', // Roxo Neon Synthwave
    accentColor: '#fbbf24',
    glassColor: '#1e1b4b',
    maxSpeed: 270,
    accel: 1.25,
    handling: 1.38,
    fuelConsumption: 0.75,
    nitroBoost: 60,
    nitros: 4,
    description: 'Controle impecável nas curvas mais longas e consumo supereconômico de combustível. Quase não visita o pit stop.'
  },
  {
    id: 'razor',
    name: 'CYBER RAZOR',
    color: '#06b6d4', // Ciano Elétrico
    accentColor: '#f43f5e',
    glassColor: '#082f49',
    maxSpeed: 290,
    accel: 1.22,
    handling: 1.18,
    fuelConsumption: 1.05,
    nitroBoost: 75,
    nitros: 4,
    description: 'Aceleração brutal e respostas instantâneas no volante. A máquina definitiva do asfalto urbano.'
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

// Construtor de Pistas com Curvas Longas, Fluidas e Visíveis à Distância
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

  // Gera traçados com menos curvas e retas longas de alta velocidade (estilo Autoestrada / TURBO HIGHWAY)
  if (trackId === 'vegas') {
    // Las Vegas Highway: Retas longas de alta velocidade pontuadas por 2 curvas amplas e panorâmicas
    addRoad(60, 200, 60, 0, 0);          // Longa reta de largada
    addRoad(70, 150, 70, 1.8, 120);      // 1ª Curva: Longa, gradual e ampla para a direita
    addRoad(60, 220, 60, 0, -60);        // Longa reta dos cassinos (ideal para atingir velocidade máxima e nitro)
    addRoad(70, 150, 70, -1.9, -60);     // 2ª Curva: Longa e suave para a esquerda
    addRoad(60, 180, 60, 0, 0);          // Reta final com área de boxes e pórtico de chegada
  } else if (trackId === 'rio') {
    // Rio Coastline: Retas litorâneas longas com 2 grandes curvas oceânicas
    addRoad(60, 180, 60, 0, 0);          // Reta litorânea de largada
    addRoad(80, 160, 80, 1.9, 180);      // Curva ampla contornando a orla
    addRoad(60, 200, 60, 0, -180);       // Reta do túnel e serra
    addRoad(80, 160, 80, -1.8, 0);       // Curva panorâmica suave para a esquerda
    addRoad(60, 160, 60, 0, 0);          // Reta final de chegada
  } else if (trackId === 'frankfurt') {
    // Frankfurt Autobahn: A lendária autoestrada alemã, retas gigantescas para ultrapassar os 300 km/h
    addRoad(80, 260, 80, 0, 0);          // Super reta Autobahn
    addRoad(70, 160, 70, 1.4, 100);      // Curva ampla de alta velocidade para a direita
    addRoad(80, 240, 80, 0, -100);       // Segunda super reta do vale
    addRoad(70, 160, 70, -1.4, 0);       // Curva ampla de retorno à esquerda
    addRoad(70, 180, 70, 0, 0);          // Reta final veloz
  } else {
    // Tokyo Expressway: Autoestrada expressa com retas amplas e 2 curvas urbanas estilosas
    addRoad(60, 180, 60, 0, 0);          // Reta da ponte da baía
    addRoad(70, 140, 70, 1.8, 80);       // Curva ampla iluminada em néon à direita
    addRoad(60, 200, 60, 0, -80);        // Longa reta elevada
    addRoad(70, 140, 70, -1.8, 0);       // Curva ampla à esquerda
    addRoad(60, 160, 60, 0, 0);          // Reta final de alta velocidade
  }

  // Marcar a linha de chegada (Finish Line) nos primeiros 4 segmentos
  for (let i = 0; i < 4; i++) {
    if (segments[i]) segments[i].isFinishLine = true;
  }

  // Criar Área de Pit Stop na reta final (últimos 85 segmentos antes da chegada)
  const pitStart = segments.length - 85;
  const pitEnd = segments.length - 25;
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

    // Outdoors do TURBO HIGHWAY
    if (i % 50 === 0 && i > 10) {
      const side = (i % 100 === 0) ? -1.6 : 1.6;
      seg.sprites.push({ type: 'billboard_turbo', offset: side });
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
