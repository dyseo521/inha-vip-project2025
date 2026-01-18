// 인버터 사양 표시 컴포넌트
// 정격전압, 정격전류, 효율, 냉각방식, 무게 표시

interface InverterSpecCardProps {
  specs: {
    voltageRating?: number;
    currentRating?: number;
    efficiency?: number;
    coolingType?: string;
    weight?: number;
  };
}

// 냉각 방식 한글 매핑
const coolingTypeMap: Record<string, string> = {
  liquid: '수냉식',
  air: '공냉식',
  oil: '오일 냉각',
};

export default function InverterSpecCard({ specs }: InverterSpecCardProps) {
  const { voltageRating, currentRating, efficiency, coolingType, weight } = specs;

  return (
    <div className="spec-card inverter-card">
      <h4 className="spec-card-title">인버터 사양</h4>

      <div className="inverter-specs-grid">
        {voltageRating !== undefined && (
          <div className="spec-cell">
            <span className="spec-label">정격전압</span>
            <span className="spec-value">{voltageRating}V</span>
          </div>
        )}
        {currentRating !== undefined && (
          <div className="spec-cell">
            <span className="spec-label">정격전류</span>
            <span className="spec-value">{currentRating}A</span>
          </div>
        )}
        {efficiency !== undefined && (
          <div className="spec-cell">
            <span className="spec-label">효율</span>
            <span className="spec-value efficiency-value">{efficiency}%</span>
          </div>
        )}
        {coolingType && (
          <div className="spec-cell">
            <span className="spec-label">냉각방식</span>
            <span className="spec-value">{coolingTypeMap[coolingType] || coolingType}</span>
          </div>
        )}
        {weight !== undefined && (
          <div className="spec-cell">
            <span className="spec-label">무게</span>
            <span className="spec-value">{weight} kg</span>
          </div>
        )}
      </div>

      <style>{`
        .inverter-card {
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

        .inverter-specs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .spec-cell {
          background: #f9fafb;
          padding: 0.875rem;
          border-radius: 6px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .spec-label {
          color: #6b7280;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .spec-value {
          color: #1f2937;
          font-size: 1rem;
          font-weight: 700;
        }

        .efficiency-value {
          color: #059669;
        }

        @media (max-width: 640px) {
          .inverter-specs-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
