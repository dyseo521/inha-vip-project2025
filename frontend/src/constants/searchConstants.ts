/**
 * 검색 페이지 상수 - BuyerSearch.tsx에서 추출
 * 매 렌더링마다 재생성 방지
 */

export const CATEGORIES = [
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

export type CategoryType = (typeof CATEGORIES)[number];

export const EXAMPLE_CASES = [
  {
    query: 'ESS 에너지 저장 시스템에 사용할 배터리를 찾고 있어요. 60kWh 이상이면 좋겠습니다.',
    result: {
      name: 'Tesla Model S 배터리 팩',
      capacity: '85kWh',
      score: 0.94,
    },
  },
  {
    query: '전기 트럭 개조 프로젝트를 위한 고성능 모터가 필요합니다.',
    result: {
      name: 'Nissan Leaf 구동 모터',
      power: '110kW',
      score: 0.89,
    },
  },
  {
    query: '태양광 연계 ESS 구축용 인버터를 구하고 있습니다. 3상 전력 지원 필요.',
    result: {
      name: 'BMW i3 인버터',
      type: '3상 AC/DC',
      score: 0.92,
    },
  },
  {
    query: '소형 전기차 DIY 프로젝트. 20kWh 정도의 배터리면 충분할 것 같아요.',
    result: {
      name: 'Renault Zoe 배터리 모듈',
      capacity: '22kWh',
      score: 0.88,
    },
  },
  {
    query: '전기 보트 전환 프로젝트를 진행 중입니다. 방수 처리된 모터가 필요해요.',
    result: {
      name: 'Chevrolet Bolt 구동 모터',
      power: '150kW',
      score: 0.85,
    },
  },
] as const;

export type ExampleCase = (typeof EXAMPLE_CASES)[number];

export const CATHODE_TYPES = ['NCM Ni 80%', 'NCM Ni 60%', 'NCA', 'LFP'] as const;

export type CathodeType = (typeof CATHODE_TYPES)[number];
