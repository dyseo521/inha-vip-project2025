import type { Dimensions } from '@shared/index';

// 치수 정보 표시 컴포넌트
// 길이, 너비, 높이를 시각적으로 표현

interface DimensionsCardProps {
  dimensions: Dimensions;
  weight?: number; // kg
}

export default function DimensionsCard({ dimensions, weight }: DimensionsCardProps) {
  const { length, width, height, unit } = dimensions;

  return (
    <div className="spec-card dimensions-card">
      <h4 className="spec-card-title">치수</h4>

      <div className="dimensions-display">
        <div className="dimension-item">
          <span className="dimension-value">{length.toLocaleString()}{unit}</span>
          <span className="dimension-label">길이</span>
        </div>
        <span className="dimension-separator">×</span>
        <div className="dimension-item">
          <span className="dimension-value">{width.toLocaleString()}{unit}</span>
          <span className="dimension-label">너비</span>
        </div>
        <span className="dimension-separator">×</span>
        <div className="dimension-item">
          <span className="dimension-value">{height.toLocaleString()}{unit}</span>
          <span className="dimension-label">높이</span>
        </div>
      </div>

      {weight !== undefined && (
        <div className="weight-display">
          <span className="weight-label">무게:</span>
          <span className="weight-value">{weight} kg</span>
        </div>
      )}

      <style>{`
        .dimensions-card {
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

        .dimensions-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
        }

        .dimension-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }

        .dimension-value {
          color: #1f2937;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .dimension-label {
          color: #6b7280;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .dimension-separator {
          color: #9ca3af;
          font-size: 1.25rem;
          font-weight: 300;
        }

        .weight-display {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .weight-label {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .weight-value {
          color: #1f2937;
          font-size: 0.875rem;
          font-weight: 600;
        }

        @media (max-width: 480px) {
          .dimensions-display {
            gap: 0.5rem;
          }

          .dimension-value {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
