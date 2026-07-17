import type { AdsMetrics, AdsAnalysisItem } from '../../../domain/types';
import { analyzeAds } from '../../../domain/services/ads-analysis.service';
import { useState } from 'react';

interface AdsMetricsInputProps {
  metrics: AdsMetrics;
  onUpdate: (field: keyof AdsMetrics, value: string) => void;
}

const INITIAL_METRICS: AdsMetrics = {
  impressions: '',
  clicks: '',
  sales: '',
  ctr: '',
  roas: '',
  acos: '',
  conversion: '',
};

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    alta: '#F23D4F',
    media: '#F5A623',
    baja: '#00A650',
  };
  return (
    <span
      className="ads-priority-badge"
      style={{ background: colors[priority] || colors.baja }}
    >
      {priority}
    </span>
  );
}

export function AdsMetricsInput({ metrics, onUpdate }: AdsMetricsInputProps) {
  const [analysis, setAnalysis] = useState<AdsAnalysisItem[] | null>(null);

  const handleAnalyze = () => {
    const result = analyzeAds(metrics);
    setAnalysis(result);
  };

  const hasData = Object.values(metrics).some((v) => v.trim() !== '');

  return (
    <div className="ads-input">
      <div className="ads-header">
        <h4><i className="fas fa-chart-line" /> Metricas de Mercado Ads</h4>
        <p>Ingresá las metricas de tu campana para obtener un diagnostico</p>
      </div>

      <div className="ads-grid">
        <div className="form-group">
          <label>Impresiones</label>
          <input
            type="number"
            className="form-input"
            placeholder="Ej: 15000"
            value={metrics.impressions}
            onChange={(e) => onUpdate('impressions', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Clicks</label>
          <input
            type="number"
            className="form-input"
            placeholder="Ej: 350"
            value={metrics.clicks}
            onChange={(e) => onUpdate('clicks', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Ventas</label>
          <input
            type="number"
            className="form-input"
            placeholder="Ej: 12"
            value={metrics.sales}
            onChange={(e) => onUpdate('sales', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>CTR (%)</label>
          <input
            type="number"
            step="0.01"
            className="form-input"
            placeholder="Ej: 2.3"
            value={metrics.ctr}
            onChange={(e) => onUpdate('ctr', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>ROAS</label>
          <input
            type="number"
            step="0.1"
            className="form-input"
            placeholder="Ej: 3.5"
            value={metrics.roas}
            onChange={(e) => onUpdate('roas', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>ACOS (%)</label>
          <input
            type="number"
            step="0.1"
            className="form-input"
            placeholder="Ej: 15"
            value={metrics.acos}
            onChange={(e) => onUpdate('acos', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Conversion (%)</label>
          <input
            type="number"
            step="0.01"
            className="form-input"
            placeholder="Ej: 3.4"
            value={metrics.conversion}
            onChange={(e) => onUpdate('conversion', e.target.value)}
          />
        </div>
      </div>

      <button
        className="btn btn-primary ads-btn"
        onClick={handleAnalyze}
        disabled={!hasData}
      >
        <i className="fas fa-stethoscope" /> Diagnosticar
      </button>

      {analysis && (
        <div className="ads-results">
          <h4><i className="fas fa-clipboard-list" /> Diagnostico</h4>
          <div className="ads-results-list">
            {analysis.map((item, i) => (
              <div key={i} className="ads-result-card">
                <div className="ads-result-header">
                  <PriorityBadge priority={item.priority} />
                  <span className="ads-result-problem">{item.problem}</span>
                </div>
                <div className="ads-result-details">
                  <div className="ads-detail">
                    <span className="ads-detail-label">Impacto:</span>
                    <span>{item.impact}</span>
                  </div>
                  <div className="ads-detail">
                    <span className="ads-detail-label">Accion:</span>
                    <span>{item.action}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="ads-json-output">
            <h5><i className="fas fa-code" /> JSON de salida</h5>
            <pre className="ads-json">
              {JSON.stringify(analysis, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
