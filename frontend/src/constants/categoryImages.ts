import type { Part } from '@shared/index';

/**
 * 카테고리 매핑 (한글 -> 영문)
 */
export const categoryMap: Record<string, string> = {
  '배터리': 'battery',
  '모터': 'motor',
  '인버터': 'inverter',
  '충전기': 'charger',
  '전장 부품': 'electronics',
  '차체': 'body',
  '차체-섀시/프레임': 'body-chassis-frame',
  '차체-패널': 'body-panel',
  '차체-도어': 'body-door',
  '차체-창/유리': 'body-window',
  '내장재': 'interior',
  '기타': 'other',
};

/**
 * 역방향 카테고리 매핑 (영문 -> 한글)
 */
export const categoryMapReverse: Record<string, string> = {
  'battery': '배터리',
  'motor': '모터',
  'inverter': '인버터',
  'charger': '충전기',
  'electronics': '전장 부품',
  'body': '차체',
  'body-chassis-frame': '차체-섀시/프레임',
  'body-panel': '차체-패널',
  'body-door': '차체-도어',
  'body-window': '차체-창/유리',
  'interior': '내장재',
  'other': '기타',
};

/**
 * 카테고리별 기본 이미지
 */
export const categoryDefaultImages: Record<string, string> = {
  'battery': '/image/batterypack_1.jpg',
  'motor': '/image/motor_1.jpg',
  'inverter': '/image/inverter_1.png',
  'charger': '/image/batterypack_1.jpg',
  'electronics': '/image/inverter_1.png',
  'body': '/image/car_body_1.jpg',
  'body-chassis-frame': '/image/car_body_1.jpg',
  'body-panel': '/image/car_body_2.jpg',
  'body-door': '/image/car_body_3.png',
  'body-window': '/image/car_body_1.jpg',
  'interior': '/image/car_body_1.jpg',
  'other': '/image/car_body_1.jpg',
};

/**
 * 이미지 URL 가져오기 헬퍼 함수
 */
export const getPartImageUrl = (part: Part, index: number = 0): string => {
  if (part.images && part.images.length > index && part.images[index]) {
    return part.images[index];
  }
  return categoryDefaultImages[part.category] || '/image/car_body_1.jpg';
};

/**
 * Mock 데이터를 Part 타입으로 변환
 */
export const convertMockPartToPart = (mockPart: any): Part => {
  const categoryEng = Object.entries(categoryMap).find(
    ([kor, _]) => mockPart.category === kor
  )?.[1] || 'other';

  return {
    partId: mockPart.id,
    name: mockPart.name,
    category: categoryEng as any,
    manufacturer: mockPart.manufacturer,
    model: mockPart.model,
    year: mockPart.year,
    condition: mockPart.condition || 'used',
    price: mockPart.price,
    quantity: mockPart.quantity,
    sellerId: mockPart.seller?.company || 'demo-seller',
    description: mockPart.description,
    images: mockPart.images,
    createdAt: mockPart.createdAt || new Date().toISOString(),
    updatedAt: mockPart.updatedAt || new Date().toISOString(),
    specifications: mockPart.specifications,
    useCases: mockPart.useCases,
  };
};

/**
 * 한글 카테고리 목록
 */
export const categoryLabels = [
  'all',
  '배터리',
  '모터',
  '인버터',
  '충전기',
  '전장 부품',
  '차체-섀시/프레임',
  '차체-패널',
  '차체-도어',
  '차체-창/유리',
  '내장재',
  '기타',
] as const;

/**
 * 카테고리 라벨 가져오기 (all -> 전체)
 */
export const getCategoryLabel = (category: string): string => {
  if (category === 'all') return '전체';
  return categoryMapReverse[category] || category;
};
