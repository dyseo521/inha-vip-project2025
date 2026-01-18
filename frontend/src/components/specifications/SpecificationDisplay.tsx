import type { PartSpecifications, BatteryHealthInfo, PartCategory } from '@shared/index';
import MaterialCompositionCard from './MaterialCompositionCard';
import DimensionsCard from './DimensionsCard';
import BatterySpecCard from './BatterySpecCard';
import MotorSpecCard from './MotorSpecCard';
import InverterSpecCard from './InverterSpecCard';
import GenericSpecCard from './GenericSpecCard';

// 상세 사양 표시 메인 컴포넌트
// 카테고리와 specifications 내용에 따라 적절한 카드 컴포넌트로 분기

// 확장된 specifications 타입 (mockParts에서 사용하는 추가 필드 포함)
interface ExtendedSpecifications extends PartSpecifications {
  batterySoh?: number;
  capacity?: number;
  voltage?: number;
  cathodeType?: string;
  cycleCount?: number;
  warrantyMonths?: number;
  powerOutputKW?: number;
  torqueNm?: number;
  rpmMax?: number;
  efficiency?: number;
  coolingType?: string;
  voltageRating?: number;
  currentRating?: number;
}

interface SpecificationDisplayProps {
  // PartSpecifications 또는 확장된 specifications 모두 허용
  specifications: PartSpecifications | ExtendedSpecifications;
  batteryHealth?: BatteryHealthInfo;
  category: PartCategory | string;
}

// 배터리 관련 필드 키
const batteryFields = ['batterySoh', 'capacity', 'voltage', 'cathodeType', 'cycleCount', 'warrantyMonths'];

// 모터 관련 필드 키
const motorFields = ['powerOutputKW', 'torqueNm', 'rpmMax', 'efficiency', 'coolingType'];

// 인버터 관련 필드 키
const inverterFields = ['voltageRating', 'currentRating', 'efficiency', 'coolingType'];

// 카테고리 체크 유틸리티
const isBatteryCategory = (category: string): boolean =>
  category === 'battery' || category === '배터리';

const isMotorCategory = (category: string): boolean =>
  category === 'motor' || category === '모터';

const isInverterCategory = (category: string): boolean =>
  category === 'inverter' || category === '인버터';

export default function SpecificationDisplay({
  specifications,
  batteryHealth,
  category,
}: SpecificationDisplayProps) {
  // 타입 안전하게 확장된 필드에 접근하기 위해 Record로 캐스팅
  const specs = specifications as ExtendedSpecifications & Record<string, unknown>;

  // 처리된 필드를 추적 (나중에 GenericSpecCard에서 제외)
  const processedFields = new Set<string>();

  // 배터리 사양 추출
  const hasBatterySpecs = batteryFields.some((field) => field in specs);
  const batterySpecs = hasBatterySpecs
    ? {
        batterySoh: specs.batterySoh,
        capacity: specs.capacity,
        voltage: specs.voltage,
        cathodeType: specs.cathodeType,
        cycleCount: specs.cycleCount,
        warrantyMonths: specs.warrantyMonths,
      }
    : null;
  if (batterySpecs) {
    batteryFields.forEach((f) => processedFields.add(f));
  }

  // 모터 사양 추출
  const hasMotorSpecs = motorFields.some((field) => field in specs);
  const motorSpecs = hasMotorSpecs
    ? {
        powerOutputKW: specs.powerOutputKW,
        torqueNm: specs.torqueNm,
        rpmMax: specs.rpmMax,
        efficiency: specs.efficiency,
        coolingType: specs.coolingType,
        weight: specs.weight,
      }
    : null;
  if (motorSpecs) {
    motorFields.forEach((f) => processedFields.add(f));
    processedFields.add('weight');
  }

  // 인버터 사양 추출
  const hasInverterSpecs = inverterFields.some((field) => field in specs);
  const inverterSpecs = hasInverterSpecs
    ? {
        voltageRating: specs.voltageRating,
        currentRating: specs.currentRating,
        efficiency: specs.efficiency,
        coolingType: specs.coolingType,
        weight: specs.weight,
      }
    : null;
  if (inverterSpecs) {
    inverterFields.forEach((f) => processedFields.add(f));
    processedFields.add('weight');
  }

  // materialComposition 체크
  const materialComposition = specs.materialComposition;
  if (materialComposition) {
    processedFields.add('materialComposition');
  }

  // dimensions 체크
  const dimensions = specs.dimensions;
  if (dimensions) {
    processedFields.add('dimensions');
  }

  // weight (dimensions에서 사용 시)
  const weight = specs.weight;
  if (dimensions && weight !== undefined) {
    processedFields.add('weight');
  }

  // 처리되지 않은 나머지 필드 수집 (GenericSpecCard용)
  const remainingItems: Array<{ key: string; value: string | number }> = [];
  for (const [key, value] of Object.entries(specs)) {
    if (processedFields.has(key)) continue;
    if (value === null || value === undefined) continue;

    // 객체나 배열은 건너뜀 (이미 다른 카드에서 처리)
    if (typeof value === 'object') continue;

    remainingItems.push({ key, value: value as string | number });
  }

  // 카테고리에 따른 렌더링 순서 결정
  const renderCards = () => {
    const cards: JSX.Element[] = [];

    // 배터리 카테고리: 배터리 사양 우선
    if (isBatteryCategory(category) && batterySpecs) {
      cards.push(
        <BatterySpecCard
          key="battery"
          specs={batterySpecs}
          batteryHealth={batteryHealth}
        />
      );
    }

    // 모터 카테고리: 모터 사양 우선
    if (isMotorCategory(category) && motorSpecs) {
      cards.push(<MotorSpecCard key="motor" specs={motorSpecs} />);
    }

    // 인버터 카테고리: 인버터 사양 우선
    if (isInverterCategory(category) && inverterSpecs) {
      cards.push(<InverterSpecCard key="inverter" specs={inverterSpecs} />);
    }

    // 차체 카테고리 또는 materialComposition이 있는 경우
    if (materialComposition) {
      cards.push(
        <MaterialCompositionCard key="material" material={materialComposition} />
      );
    }

    // dimensions가 있는 경우
    if (dimensions) {
      cards.push(
        <DimensionsCard
          key="dimensions"
          dimensions={dimensions}
          weight={weight}
        />
      );
    }

    // 배터리 스펙이 있지만 배터리 카테고리가 아닌 경우에도 표시
    if (!isBatteryCategory(category) && batterySpecs) {
      cards.push(
        <BatterySpecCard
          key="battery"
          specs={batterySpecs}
          batteryHealth={batteryHealth}
        />
      );
    }

    // 모터 스펙이 있지만 모터 카테고리가 아닌 경우에도 표시
    if (!isMotorCategory(category) && motorSpecs) {
      cards.push(<MotorSpecCard key="motor" specs={motorSpecs} />);
    }

    // 인버터 스펙이 있지만 인버터 카테고리가 아닌 경우에도 표시
    if (!isInverterCategory(category) && inverterSpecs) {
      cards.push(<InverterSpecCard key="inverter" specs={inverterSpecs} />);
    }

    // 나머지 필드가 있으면 GenericSpecCard로 표시
    if (remainingItems.length > 0) {
      cards.push(<GenericSpecCard key="generic" items={remainingItems} />);
    }

    return cards;
  };

  const cards = renderCards();

  // 아무 카드도 없으면 null 반환
  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="specification-display">
      {cards}

      <style>{`
        .specification-display {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
}
