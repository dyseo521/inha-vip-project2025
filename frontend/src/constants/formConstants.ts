/**
 * 폼 관련 상수 - SellerDashboard.tsx에서 추출
 * 매 렌더링마다 재생성 방지
 */

export const CATEGORY_OPTIONS = [
  { value: 'battery', label: '배터리' },
  { value: 'motor', label: '모터' },
  { value: 'inverter', label: '인버터' },
  { value: 'charger', label: '충전기' },
  { value: 'electronics', label: '전장 부품' },
  { value: 'body', label: '차체' },
  { value: 'interior', label: '내장재' },
  { value: 'other', label: '기타' },
] as const;

export type CategoryOption = (typeof CATEGORY_OPTIONS)[number];

export const CATEGORY_SPEC_FIELDS: Record<string, { label: string; placeholder: string; key: string }[]> = {
  battery: [
    { key: 'voltage', label: '전압 (V)', placeholder: '예: 400V' },
    { key: 'capacity', label: '용량', placeholder: '예: 85kWh' },
    { key: 'chemistry', label: '셀 종류', placeholder: '예: NCM, LFP, NCA' },
    { key: 'soc', label: 'SOC 범위', placeholder: '예: 0-100%' },
    { key: 'cycles', label: '충방전 사이클', placeholder: '예: 2000 cycles' },
    { key: 'weight', label: '무게', placeholder: '예: 540kg' },
  ],
  motor: [
    { key: 'power', label: '출력', placeholder: '예: 150kW' },
    { key: 'voltage', label: '전압 (V)', placeholder: '예: 400V' },
    { key: 'torque', label: '토크', placeholder: '예: 395Nm' },
    { key: 'rpm', label: '최대 RPM', placeholder: '예: 14000 RPM' },
    { key: 'cooling', label: '냉각 방식', placeholder: '예: 수냉식' },
    { key: 'weight', label: '무게', placeholder: '예: 45kg' },
  ],
  inverter: [
    { key: 'power', label: '출력', placeholder: '예: 100kW' },
    { key: 'voltage', label: '입력 전압 (V)', placeholder: '예: 400V DC' },
    { key: 'phases', label: '상', placeholder: '예: 3상' },
    { key: 'efficiency', label: '효율', placeholder: '예: 95%' },
    { key: 'cooling', label: '냉각 방식', placeholder: '예: 수냉식' },
    { key: 'weight', label: '무게', placeholder: '예: 15kg' },
  ],
  charger: [
    { key: 'power', label: '충전 출력', placeholder: '예: 11kW' },
    { key: 'voltage', label: '전압 범위 (V)', placeholder: '예: 200-450V' },
    { key: 'current', label: '최대 전류 (A)', placeholder: '예: 32A' },
    { key: 'type', label: '충전 타입', placeholder: '예: AC/DC, Type 2' },
    { key: 'efficiency', label: '효율', placeholder: '예: 94%' },
    { key: 'weight', label: '무게', placeholder: '예: 8kg' },
  ],
  electronics: [
    { key: 'voltage', label: '전압 (V)', placeholder: '예: 12V' },
    { key: 'power', label: '소비 전력', placeholder: '예: 500W' },
    { key: 'type', label: '타입', placeholder: '예: BMS, OBC' },
    { key: 'weight', label: '무게', placeholder: '예: 2kg' },
  ],
  body: [
    { key: 'material', label: '재질', placeholder: '예: 알루미늄, 카본파이버' },
    { key: 'dimensions', label: '치수', placeholder: '예: 1200x800x600mm' },
    { key: 'weight', label: '무게', placeholder: '예: 25kg' },
    { key: 'color', label: '색상', placeholder: '예: 흰색' },
  ],
  interior: [
    { key: 'material', label: '재질', placeholder: '예: 가죽, 직물' },
    { key: 'color', label: '색상', placeholder: '예: 검정' },
    { key: 'condition', label: '상태', placeholder: '예: 찢어짐 없음' },
  ],
  other: [
    { key: 'type', label: '타입', placeholder: '부품 타입' },
    { key: 'specifications', label: '사양', placeholder: '주요 사양' },
    { key: 'weight', label: '무게', placeholder: '예: 10kg' },
  ],
};

export const CONDITION_OPTIONS = [
  { value: 'new', label: '신품' },
  { value: 'used', label: '중고' },
  { value: 'refurbished', label: '리퍼' },
  { value: 'for-parts', label: '부품용' },
] as const;

export type ConditionOption = (typeof CONDITION_OPTIONS)[number];
