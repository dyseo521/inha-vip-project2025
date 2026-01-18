// 기타 사양 표시 컴포넌트
// 미리 정의되지 않은 key-value 쌍을 그리드 형태로 표시

interface GenericSpecCardProps {
  // 표시할 key-value 쌍 배열
  items: Array<{ key: string; value: string | number }>;
  title?: string;
}

// 키 이름 한글 매핑
const keyLabelMap: Record<string, string> = {
  weight: '무게',
  warrantyMonths: '보증 기간',
  coolingType: '냉각방식',
  efficiency: '효율',
  liquid: '수냉식',
  air: '공냉식',
};

// 단위 매핑
const unitMap: Record<string, string> = {
  weight: 'kg',
  warrantyMonths: '개월',
  efficiency: '%',
};

export default function GenericSpecCard({ items, title = '기타 사양' }: GenericSpecCardProps) {
  if (items.length === 0) return null;

  const formatValue = (key: string, value: string | number): string => {
    // 문자열 값에 대한 한글 매핑
    if (typeof value === 'string' && keyLabelMap[value]) {
      return keyLabelMap[value];
    }

    // 숫자 값에 단위 추가
    const unit = unitMap[key];
    if (unit && typeof value === 'number') {
      return `${value}${unit}`;
    }

    return String(value);
  };

  return (
    <div className="spec-card generic-card">
      <h4 className="spec-card-title">{title}</h4>

      <div className="generic-specs-list">
        {items.map(({ key, value }) => (
          <div key={key} className="spec-row">
            <span className="spec-key">{keyLabelMap[key] || key}</span>
            <span className="spec-val">{formatValue(key, value)}</span>
          </div>
        ))}
      </div>

      <style>{`
        .generic-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1.25rem;
        }

        .spec-card-title {
          margin: 0 0 1rem 0;
          color: #1f2937;
          font-size: 1rem;
          font-weight: 600;
        }

        .generic-specs-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .spec-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: #f9fafb;
          border-radius: 6px;
        }

        .spec-key {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .spec-val {
          color: #1f2937;
          font-size: 0.875rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
