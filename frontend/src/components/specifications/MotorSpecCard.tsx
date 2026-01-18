// 모터 사양 표시 컴포넌트
// 출력, 토크, RPM, 효율, 냉각방식, 무게 표시

interface MotorSpecCardProps {
  specs: {
    powerOutputKW?: number;
    torqueNm?: number;
    rpmMax?: number;
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

export default function MotorSpecCard({ specs }: MotorSpecCardProps) {
  const { powerOutputKW, torqueNm, rpmMax, efficiency, coolingType, weight } = specs;

  return (
    <div className="spec-card motor-card">
      <h4 className="spec-card-title">모터 사양</h4>

      <div className="motor-specs-grid">
        {powerOutputKW !== undefined && (
          <div className="spec-cell">
            <span className="spec-label">출력</span>
            <span className="spec-value">{powerOutputKW} kW</span>
          </div>
        )}
        {torqueNm !== undefined && (
          <div className="spec-cell">
            <span className="spec-label">토크</span>
            <span className="spec-value">{torqueNm} Nm</span>
          </div>
        )}
        {rpmMax !== undefined && (
          <div className="spec-cell">
            <span className="spec-label">최대 RPM</span>
            <span className="spec-value">{rpmMax.toLocaleString()}</span>
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
        .motor-card {
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

        .motor-specs-grid {
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
          .motor-specs-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
