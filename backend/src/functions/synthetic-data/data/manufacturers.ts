/**
 * Manufacturer and Vehicle Model Data Pools
 * 다양한 제조사와 차량 모델 데이터 풀
 */

// 카테고리별 제조사 목록
export const MANUFACTURERS: Record<string, string[]> = {
  battery: [
    'LG Energy Solution', 'Samsung SDI', 'SK On', 'CATL', 'BYD',
    'Panasonic', 'EVE Energy', 'CALB', 'Gotion High-Tech', 'SVOLT',
    'Envision AESC', 'Farasis Energy', 'Guoxuan High-Tech', 'LISHEN',
    'Northvolt', 'Solid Power', 'QuantumScape', 'Sila Nanotechnologies',
    'StoreDot', 'Amprius Technologies'
  ],
  motor: [
    'Nidec', 'Bosch', 'ZF Friedrichshafen', 'BorgWarner', 'Continental',
    'Vitesco Technologies', 'Schaeffler', 'Denso', 'Aisin', 'Valeo',
    'Hitachi Astemo', 'Marelli', 'Dana Incorporated', 'Jing-Jin Electric',
    'Broad-Ocean Motor', 'Tesla Motors', 'Lucid Motors', 'Rivian'
  ],
  inverter: [
    'Infineon Technologies', 'Rohm Semiconductor', 'STMicroelectronics',
    'Texas Instruments', 'ON Semiconductor', 'Wolfspeed', 'Mitsubishi Electric',
    'Fuji Electric', 'Semikron', 'ABB', 'Siemens', 'Delta Electronics',
    'BYD Semiconductor', 'Starpower Semiconductor', 'CR Micro'
  ],
  'body-chassis-frame': [
    'Gestamp', 'Magna International', 'Novelis', 'Constellium', 'Alcoa',
    'Martinrea', 'Tower International', 'Benteler', 'Thyssen Krupp',
    'Norsk Hydro', 'ArcelorMittal', 'POSCO', 'Nippon Steel', 'JFE Steel',
    'Hyundai Steel', 'UACJ Corporation', 'Hindalco'
  ],
  'body-panel': [
    'Gestamp', 'Magna International', 'Martinrea', 'Tower International',
    'Kirchhoff Automotive', 'Metalsa', 'Flex-N-Gate', 'Plastic Omnium',
    'Faurecia', 'Compagnie Plastic Omnium', 'SRG Global', 'ABC Group'
  ],
  'body-door': [
    'Magna International', 'Brose', 'Inteva Products', 'Grupo Antolin',
    'Kiekert', 'Aisin', 'Mitsui Kinzoku', 'Hella', 'Valeo',
    'Strattec Security', 'Southco', 'U-Shin'
  ],
  'body-window': [
    'AGC (Asahi Glass)', 'Saint-Gobain Sekurit', 'Fuyao Glass',
    'Nippon Sheet Glass', 'Guardian Industries', 'Pilkington',
    'Xinyi Glass', 'Central Glass', 'Webasto', 'Inalfa Roof Systems',
    'Yachiyo Industry', 'Inteva Products'
  ]
};

// 차량 브랜드별 모델 목록
export const VEHICLE_MODELS: Record<string, string[]> = {
  현대: [
    'IONIQ 5', 'IONIQ 6', 'IONIQ 5 N', 'IONIQ 9', 'Kona Electric',
    'Kona Electric N', 'Nexo', 'Porter II Electric', 'Genesis GV60',
    'Genesis G80 Electric', 'Genesis GV70 Electric'
  ],
  기아: [
    'EV6', 'EV6 GT', 'EV9', 'Niro EV', 'Niro Plus', 'Ray EV',
    'Bongo III EV', 'Soul EV', 'e-Niro'
  ],
  Tesla: [
    'Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck',
    'Model S Plaid', 'Model X Plaid', 'Model 3 Highland',
    'Model Y Performance', 'Semi', 'Roadster (2nd Gen)'
  ],
  BMW: [
    'i3', 'i4', 'i5', 'i7', 'iX', 'iX1', 'iX2', 'iX3',
    'i4 M50', 'iX M60', 'i5 M60', 'i7 M70', 'i7 xDrive60'
  ],
  Mercedes: [
    'EQS', 'EQS SUV', 'EQE', 'EQE SUV', 'EQB', 'EQA', 'EQV',
    'EQS 580', 'EQE 350', 'EQS AMG', 'EQE AMG', 'EQG'
  ],
  Audi: [
    'e-tron', 'e-tron S', 'e-tron GT', 'RS e-tron GT', 'Q4 e-tron',
    'Q4 Sportback e-tron', 'Q6 e-tron', 'Q8 e-tron', 'SQ8 e-tron',
    'A6 e-tron'
  ],
  Porsche: [
    'Taycan', 'Taycan 4S', 'Taycan Turbo', 'Taycan Turbo S',
    'Taycan Cross Turismo', 'Taycan Sport Turismo', 'Macan Electric'
  ],
  Volkswagen: [
    'ID.3', 'ID.4', 'ID.5', 'ID.6', 'ID.7', 'ID. Buzz',
    'ID.4 GTX', 'ID.5 GTX', 'e-Golf', 'e-Up'
  ],
  Volvo: [
    'XC40 Recharge', 'C40 Recharge', 'EX30', 'EX40', 'EX60', 'EX90',
    'Polestar 2', 'Polestar 3', 'Polestar 4'
  ],
  Ford: [
    'Mustang Mach-E', 'Mustang Mach-E GT', 'F-150 Lightning',
    'F-150 Lightning Pro', 'E-Transit', 'E-Transit Custom'
  ],
  Chevrolet: [
    'Bolt EV', 'Bolt EUV', 'Equinox EV', 'Blazer EV', 'Silverado EV',
    'Hummer EV', 'Hummer EV SUV', 'Lyriq'
  ],
  Nissan: [
    'Leaf', 'Leaf e+', 'Ariya', 'Ariya e-4ORCE', 'Sakura', 'Townstar EV'
  ],
  Rivian: [
    'R1T', 'R1T Adventure', 'R1S', 'R1S Adventure', 'R2', 'R3', 'EDV'
  ],
  Lucid: [
    'Air Pure', 'Air Touring', 'Air Grand Touring', 'Air Dream Edition',
    'Gravity'
  ],
  BYD: [
    'Han', 'Tang', 'Seal', 'Dolphin', 'Atto 3', 'Song Plus',
    'Qin Plus', 'Yuan Plus', 'Seagull', 'Destroyer 05'
  ],
  NIO: [
    'ES8', 'ES7', 'ES6', 'EC7', 'EC6', 'ET7', 'ET5', 'ET5T', 'EP9'
  ],
  XPeng: [
    'P7', 'P7i', 'P5', 'G3', 'G6', 'G9', 'X9'
  ]
};

// 연도 범위 (2018-2024)
export const YEAR_RANGE = { min: 2018, max: 2024 };

// 부품 상태 및 가중치
export const CONDITIONS: { value: string; weight: number; priceMultiplier: number }[] = [
  { value: 'new', weight: 10, priceMultiplier: 1.0 },
  { value: 'like-new', weight: 15, priceMultiplier: 0.9 },
  { value: 'excellent', weight: 25, priceMultiplier: 0.8 },
  { value: 'good', weight: 30, priceMultiplier: 0.7 },
  { value: 'fair', weight: 15, priceMultiplier: 0.55 },
  { value: 'poor', weight: 5, priceMultiplier: 0.35 }
];

// 배터리 양극재 타입
export const CATHODE_TYPES = ['NCM523', 'NCM622', 'NCM811', 'NCA', 'LFP', 'NCMA', 'LMFP'];

// 재질 데이터 풀
export const MATERIALS: Record<string, { primary: string[]; secondary: string[] }> = {
  battery: {
    primary: ['리튬이온', '리튬인산철(LFP)', '니켈코발트망간(NCM)', '니켈코발트알루미늄(NCA)'],
    secondary: ['알루미늄 케이스', '구리 집전체', '폴리머 분리막', '전해질', '열관리 시스템']
  },
  motor: {
    primary: ['네오디뮴 자석', '구리 코일', '규소강판', '영구자석'],
    secondary: ['알루미늄 하우징', '베어링', '샤프트', '절연체', '냉각 시스템']
  },
  inverter: {
    primary: ['IGBT 모듈', 'SiC MOSFET', 'GaN 트랜지스터'],
    secondary: ['PCB', '방열판', '알루미늄 케이스', '커패시터', '게이트 드라이버']
  },
  'body-chassis-frame': {
    primary: ['고장력강(AHSS)', '알루미늄 6061', '알루미늄 7075', '핫스탬핑강'],
    secondary: ['용접 조인트', '리벳', '접착제', '방청 코팅', '방진 고무']
  },
  'body-panel': {
    primary: ['알루미늄 5754', '알루미늄 6016', '냉연강판', 'CFRP'],
    secondary: ['프라이머', '방청 코팅', '실런트', '완충재']
  },
  'body-door': {
    primary: ['알루미늄 6061', '고장력강(AHSS)', '마그네슘 합금'],
    secondary: ['힌지 어셈블리', '도어 씰', '윈도우 레귤레이터', '잠금장치', '핸들']
  },
  'body-window': {
    primary: ['강화유리', '접합유리', '프라이버시 유리', 'HUD 유리'],
    secondary: ['PVB 필름', 'UV 코팅', '발수 코팅', '고무 몰딩', '프레임']
  }
};

// 카테고리별 이미지 경로
export const CATEGORY_IMAGES: Record<string, string[]> = {
  battery: [
    '/image/batterypack_1.jpg',
    '/image/batterypack_2.jpeg',
    '/image/batterypack_3.jpg',
    '/image/battery_image/battery_audi_q6_ppe.webp',
    '/image/battery_image/battery_toyota_prius.webp',
    '/image/battery_image/battery_byd_blade.webp',
    '/image/battery_image/battery_rimac_nevera.webp',
    '/image/battery_image/battery_webasto.jpg',
    '/image/battery_image/battery_generic_01.jpeg',
    '/image/battery_image/battery_generic_02.jpeg',
    '/image/battery_image/battery_generic_03.jpeg',
    '/image/battery_image/battery_generic_04.jpeg',
    '/image/battery_image/battery_generic_05.jpeg'
  ],
  motor: [
    '/image/motor_1.jpg',
    '/image/motor_2.jpg',
    '/image/motor_3.jpg'
  ],
  inverter: [
    '/image/inverter_1.jpg',
    '/image/inverter_2.jpg',
    '/image/inverter_3.jpg'
  ],
  'body-chassis-frame': [
    '/image/car_body_1.jpg',
    '/image/car_body_2.jpg',
    '/image/car_body_3.png',
    '/image/parts/body_frame_1.jpg'
  ],
  'body-panel': [
    '/image/car_body_1.jpg',
    '/image/car_body_2.jpg',
    '/image/parts/body_panel_1.jpg'
  ],
  'body-door': [
    '/image/car_body_1.jpg',
    '/image/parts/body_door_1.jpg'
  ],
  'body-window': [
    '/image/car_body_1.jpg',
    '/image/parts/body_window_1.jpg'
  ]
};

/**
 * 랜덤 유틸리티 함수들
 */
export function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function weightedRandomChoice<T extends { value: any; weight: number }>(items: T[]): T['value'] {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item.value;
    }
  }
  return items[items.length - 1].value;
}

export function getRandomImages(category: string, minCount: number = 1, maxCount: number = 3): string[] {
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES['body-panel'];
  const count = randomInt(minCount, Math.min(maxCount, images.length));
  const shuffled = [...images].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getRandomManufacturer(category: string): string {
  const categoryKey = category.startsWith('body-') ? category : category;
  const manufacturers = MANUFACTURERS[categoryKey] || MANUFACTURERS['body-panel'];
  return randomChoice(manufacturers);
}

export function getRandomVehicleModel(): { brand: string; model: string } {
  const brands = Object.keys(VEHICLE_MODELS);
  const brand = randomChoice(brands);
  const model = randomChoice(VEHICLE_MODELS[brand]);
  return { brand, model };
}

export function getRandomYear(): number {
  return randomInt(YEAR_RANGE.min, YEAR_RANGE.max);
}

export function getRandomCondition(): { condition: string; priceMultiplier: number } {
  const condition = weightedRandomChoice(CONDITIONS);
  const item = CONDITIONS.find(c => c.value === condition)!;
  return { condition, priceMultiplier: item.priceMultiplier };
}

export function getRandomMaterial(category: string): { primary: string; secondary: string[] } {
  const categoryKey = category.startsWith('body-') ? category : category;
  const materials = MATERIALS[categoryKey] || MATERIALS['body-panel'];
  return {
    primary: randomChoice(materials.primary),
    secondary: materials.secondary.slice().sort(() => Math.random() - 0.5).slice(0, randomInt(2, 4))
  };
}

export function generateBatteryHealth(): {
  soh: number;
  cathodeType: string;
  cycleCount: number;
  recommendedUse: 'reuse' | 'recycle' | 'refurbish';
} {
  const soh = randomInt(60, 98);
  const cathodeType = randomChoice(CATHODE_TYPES);
  const cycleCount = randomInt(100, 1200);

  let recommendedUse: 'reuse' | 'recycle' | 'refurbish';
  if (soh >= 80) {
    recommendedUse = 'reuse';
  } else if (soh >= 65) {
    recommendedUse = 'refurbish';
  } else {
    recommendedUse = 'recycle';
  }

  return { soh, cathodeType, cycleCount, recommendedUse };
}
