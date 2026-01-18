import type { MaterialComposition } from '@shared/index';

// 소재 구성 정보 표시 컴포넌트
// 소재 이름, 합금 번호, 성분 비율, 물성치 등을 시각적으로 표현

interface MaterialCompositionCardProps {
  material: MaterialComposition;
}

export default function MaterialCompositionCard({ material }: MaterialCompositionCardProps) {
  // 프로그레스 바 최대값 계산 (가장 높은 비율 기준)
  const maxPercentage = material.percentage
    ? Math.max(...Object.values(material.percentage))
    : 100;

  return (
    <div className="spec-card material-card">
      <h4 className="spec-card-title">소재 구성</h4>

      {/* 주요 소재 정보 */}
      <div className="primary-material">
        <span className="material-name">{material.primary}</span>
        {material.secondary && material.secondary.length > 0 && (
          <span className="material-alloy">({material.secondary.join(', ')})</span>
        )}
        {material.alloyNumber && (
          <span className="alloy-badge">합금 #{material.alloyNumber}</span>
        )}
      </div>

      {/* 성분 비율 프로그레스 바 */}
      {material.percentage && Object.keys(material.percentage).length > 0 && (
        <div className="composition-section">
          <h5 className="section-subtitle">성분 비율</h5>
          <div className="composition-bars">
            {Object.entries(material.percentage)
              .sort(([, a], [, b]) => b - a) // 높은 비율 순 정렬
              .map(([element, percent]) => (
                <div key={element} className="composition-bar-item">
                  <div className="bar-label">
                    <span className="element-name">{element}</span>
                    <span className="element-percent">{percent}%</span>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${(percent / maxPercentage) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 물성치 그리드 */}
      {(material.tensileStrengthMPa || material.yieldStrengthMPa ||
        material.elasticModulusGPa || material.elongationPercent ||
        material.hardness || material.density) && (
        <div className="properties-section">
          <h5 className="section-subtitle">물성</h5>
          <div className="properties-grid">
            {material.tensileStrengthMPa && (
              <div className="property-cell">
                <span className="property-label">인장강도</span>
                <span className="property-value">{material.tensileStrengthMPa} MPa</span>
              </div>
            )}
            {material.yieldStrengthMPa && (
              <div className="property-cell">
                <span className="property-label">항복강도</span>
                <span className="property-value">{material.yieldStrengthMPa} MPa</span>
              </div>
            )}
            {material.elasticModulusGPa && (
              <div className="property-cell">
                <span className="property-label">탄성계수</span>
                <span className="property-value">{material.elasticModulusGPa} GPa</span>
              </div>
            )}
            {material.elongationPercent && (
              <div className="property-cell">
                <span className="property-label">연신율</span>
                <span className="property-value">{material.elongationPercent}%</span>
              </div>
            )}
            {material.hardness && (
              <div className="property-cell">
                <span className="property-label">경도</span>
                <span className="property-value">{material.hardness}</span>
              </div>
            )}
            {material.density && (
              <div className="property-cell">
                <span className="property-label">밀도</span>
                <span className="property-value">{material.density} g/cm³</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 추가 정보 (융점, 재활용률) */}
      {(material.meltingPoint || material.recyclability) && (
        <div className="extra-info">
          {material.meltingPoint && (
            <span className="extra-item">융점: {material.meltingPoint}°C</span>
          )}
          {material.recyclability && (
            <span className="extra-item recyclability">재활용률: {material.recyclability}%</span>
          )}
        </div>
      )}

      <style>{`
        .material-card {
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

        .primary-material {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .material-name {
          color: #1f2937;
          font-size: 1.125rem;
          font-weight: 700;
        }

        .material-alloy {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .alloy-badge {
          background: #dbeafe;
          color: #1d4ed8;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .section-subtitle {
          margin: 0 0 0.75rem 0;
          color: #6b7280;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .composition-section {
          margin-bottom: 1rem;
        }

        .composition-bars {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .composition-bar-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .bar-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.8125rem;
        }

        .element-name {
          color: #374151;
          font-weight: 500;
        }

        .element-percent {
          color: #6b7280;
        }

        .bar-track {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #0055f4, #3b82f6);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .properties-section {
          margin-bottom: 1rem;
        }

        .properties-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .property-cell {
          background: #f9fafb;
          padding: 0.75rem;
          border-radius: 6px;
          text-align: center;
        }

        .property-label {
          display: block;
          color: #6b7280;
          font-size: 0.75rem;
          margin-bottom: 0.25rem;
        }

        .property-value {
          color: #1f2937;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .extra-info {
          display: flex;
          gap: 1.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e7eb;
        }

        .extra-item {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .extra-item.recyclability {
          color: #059669;
          font-weight: 500;
        }

        @media (max-width: 640px) {
          .properties-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
