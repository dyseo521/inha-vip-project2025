import type { BatteryHealthInfo } from '@shared/index';

// 배터리 사양 표시 컴포넌트
// SOH, 용량, 전압, 양극재, 사이클, 보증 정보 등을 표시

interface BatterySpecCardProps {
  // specifications에서 가져온 배터리 관련 필드
  specs: {
    batterySoh?: number;
    capacity?: number;
    voltage?: number;
    cathodeType?: string;
    cycleCount?: number;
    warrantyMonths?: number;
  };
  // 별도 batteryHealth 객체 (있을 경우)
  batteryHealth?: BatteryHealthInfo;
}

// 권장 용도 한글 매핑
const recommendedUseMap: Record<string, string> = {
  reuse: '재사용',
  recycle: '재활용',
  dispose: '폐기',
};

export default function BatterySpecCard({ specs, batteryHealth }: BatterySpecCardProps) {
  // specs와 batteryHealth에서 값 병합 (batteryHealth 우선)
  const soh = batteryHealth?.soh ?? specs.batterySoh;
  const capacity = specs.capacity;
  const voltage = specs.voltage;
  const cathodeType = batteryHealth?.cathodeType ?? specs.cathodeType;
  const cycleCount = batteryHealth?.cycleCount ?? specs.cycleCount;
  const warrantyMonths = specs.warrantyMonths;
  const recommendedUse = batteryHealth?.recommendedUse;
  const suitableApplications = batteryHealth?.suitableApplications;

  // SOH에 따른 상태 색상
  const getSohColor = (sohValue: number): string => {
    if (sohValue >= 80) return '#059669'; // 초록 (우수)
    if (sohValue >= 60) return '#f59e0b'; // 주황 (양호)
    return '#dc2626'; // 빨강 (주의)
  };

  const getSohLabel = (sohValue: number): string => {
    if (sohValue >= 80) return '우수';
    if (sohValue >= 60) return '양호';
    return '주의';
  };

  return (
    <div className="spec-card battery-card">
      <h4 className="spec-card-title">배터리 사양</h4>

      {/* 주요 스펙 그리드 */}
      <div className="battery-specs-grid">
        {soh !== undefined && (
          <div className="spec-cell soh-cell">
            <span className="spec-label">SOH</span>
            <span
              className="spec-value soh-value"
              style={{ color: getSohColor(soh) }}
            >
              {soh}%
            </span>
            <span
              className="soh-badge"
              style={{ backgroundColor: getSohColor(soh) }}
            >
              {getSohLabel(soh)}
            </span>
          </div>
        )}
        {capacity !== undefined && (
          <div className="spec-cell">
            <span className="spec-label">용량</span>
            <span className="spec-value">{capacity} kWh</span>
          </div>
        )}
        {voltage !== undefined && (
          <div className="spec-cell">
            <span className="spec-label">전압</span>
            <span className="spec-value">{voltage}V</span>
          </div>
        )}
        {cathodeType && (
          <div className="spec-cell">
            <span className="spec-label">양극재</span>
            <span className="spec-value">{cathodeType}</span>
          </div>
        )}
        {cycleCount !== undefined && (
          <div className="spec-cell">
            <span className="spec-label">사이클</span>
            <span className="spec-value">{cycleCount.toLocaleString()}회</span>
          </div>
        )}
        {warrantyMonths !== undefined && (
          <div className="spec-cell">
            <span className="spec-label">보증</span>
            <span className="spec-value">{warrantyMonths}개월</span>
          </div>
        )}
      </div>

      {/* 권장 용도 */}
      {(recommendedUse || suitableApplications) && (
        <div className="recommended-use">
          <span className="use-label">권장 용도:</span>
          <span className="use-value">
            {recommendedUse && recommendedUseMap[recommendedUse]}
            {suitableApplications && suitableApplications.length > 0 && (
              <span className="applications">
                ({suitableApplications.join(', ')})
              </span>
            )}
          </span>
        </div>
      )}

      <style>{`
        .battery-card {
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

        .battery-specs-grid {
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

        .soh-cell {
          position: relative;
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

        .soh-value {
          font-size: 1.125rem;
        }

        .soh-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          color: white;
          font-size: 0.625rem;
          font-weight: 600;
          padding: 0.125rem 0.375rem;
          border-radius: 3px;
        }

        .recommended-use {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .use-label {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .use-value {
          color: #059669;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .applications {
          color: #6b7280;
          font-weight: 400;
          margin-left: 0.25rem;
        }

        @media (max-width: 640px) {
          .battery-specs-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
