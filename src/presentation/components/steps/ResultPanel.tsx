import { useState } from 'react';
import type {
  GeneratedOutput,
  SeoAnalysis,
  CopywritingAnalysis,
  ImageAnalysis,
  ComparisonAnalysis,
  CompetitorData,
  AdsMetrics,
  ScoreBreakdown,
  ScoreInterpretation,
  ActionItem,
  PublicationFormData,
} from '../../../domain/types';
import { CompetitorInput } from '../common/CompetitorInput';
import { AdsMetricsInput } from '../common/AdsMetricsInput';
import { compareWithCompetitors } from '../../../domain/services/comparison.service';
import { interpretScores } from '../../../domain/services/interpretation.service';
import { generateActionPlan } from '../../../domain/services/action-plan.service';

interface ResultPanelProps {
  output: GeneratedOutput;
  score: ScoreBreakdown;
  formData: PublicationFormData;
  seoAnalysis: SeoAnalysis | null;
  copyAnalysis: CopywritingAnalysis | null;
  imageAnalysis: ImageAnalysis | null;
  onEdit: () => void;
  onCopy: (text: string) => void;
  onExportJSON: () => void;
}

type TabId = 'resumen' | 'acciones' | 'title' | 'specs' | 'desc' | 'keywords' | 'seo' | 'copy' | 'images' | 'compare' | 'ads' | 'full';

const TABS: Array<{ id: TabId; label: string; icon: string }> = [
  { id: 'resumen', label: 'Resumen', icon: 'fa-clipboard-list' },
  { id: 'acciones', label: 'Acciones', icon: 'fa-list-check' },
  { id: 'title', label: 'Titulo', icon: 'fa-heading' },
  { id: 'specs', label: 'Ficha', icon: 'fa-list' },
  { id: 'desc', label: 'Descripcion', icon: 'fa-file-lines' },
  { id: 'keywords', label: 'Keywords', icon: 'fa-tags' },
  { id: 'seo', label: 'SEO', icon: 'fa-magnifying-glass-chart' },
  { id: 'copy', label: 'Copywriting', icon: 'fa-pen-fancy' },
  { id: 'images', label: 'Imagenes', icon: 'fa-images' },
  { id: 'compare', label: 'Comparar', icon: 'fa-scale-balanced' },
  { id: 'ads', label: 'Ads', icon: 'fa-chart-line' },
  { id: 'full', label: 'Todo', icon: 'fa-copy' },
];

function ReportSection({ title, icon, colorClass, items }: {
  title: string;
  icon: string;
  colorClass: string;
  items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <div className="seo-section">
      <h4 className={`seo-section-title ${colorClass}`}>
        <i className={`fas ${icon}`} /> {title}
      </h4>
      <ul>
        {items.map((s, i) => (
          <li key={i} className={`seo-item ${
            colorClass === 'seo-strengths' ? 'seo-ok' :
            colorClass === 'seo-weaknesses' ? 'seo-warn' : 'seo-rec'
          }`}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

function AnalysisReport({ strengths, weaknesses, recommendations, emptyMsg }: {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  emptyMsg: string;
}) {
  if (strengths.length === 0 && weaknesses.length === 0) {
    return (
      <div className="seo-empty">
        <i className="fas fa-info-circle" />
        <p>{emptyMsg}</p>
      </div>
    );
  }
  return (
    <div className="seo-report">
      <ReportSection title="Fortalezas" icon="fa-check-circle" colorClass="seo-strengths" items={strengths} />
      <ReportSection title="Debilidades" icon="fa-triangle-exclamation" colorClass="seo-weaknesses" items={weaknesses} />
      <ReportSection title="Recomendaciones" icon="fa-lightbulb" colorClass="seo-recommendations" items={recommendations} />
    </div>
  );
}

function SeoReport({ analysis }: { analysis: SeoAnalysis }) {
  return (
    <div className="seo-report">
      <ReportSection title="Fortalezas" icon="fa-check-circle" colorClass="seo-strengths" items={analysis.strengths} />
      <ReportSection title="Debilidades" icon="fa-triangle-exclamation" colorClass="seo-weaknesses" items={analysis.weaknesses} />
      {analysis.missing_keywords.length > 0 && (
        <div className="seo-section">
          <h4 className="seo-section-title seo-missing">
            <i className="fas fa-ban" /> Keywords Faltantes
          </h4>
          <div className="seo-tag-list">
            {analysis.missing_keywords.map((k, i) => (
              <span key={i} className="seo-tag seo-tag-missing">{k}</span>
            ))}
          </div>
        </div>
      )}
      {analysis.repeated_words.length > 0 && (
        <div className="seo-section">
          <h4 className="seo-section-title seo-repeated">
            <i className="fas fa-clone" /> Palabras Repetidas
          </h4>
          <div className="seo-tag-list">
            {analysis.repeated_words.map((r, i) => (
              <span key={i} className="seo-tag seo-tag-repeated">{r}</span>
            ))}
          </div>
        </div>
      )}
      <ReportSection title="Recomendaciones" icon="fa-lightbulb" colorClass="seo-recommendations" items={analysis.recommendations} />
      {analysis.strengths.length === 0 && analysis.weaknesses.length === 0 && (
        <div className="seo-empty">
          <i className="fas fa-info-circle" />
          <p>Completa los campos del formulario para obtener un analisis SEO detallado.</p>
        </div>
      )}
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    critica: '#F23D4F',
    alta: '#F5A623',
    media: '#3483FA',
    baja: '#00A650',
  };
  return (
    <span className="action-badge" style={{ background: colors[priority] || colors.baja }}>
      {priority}
    </span>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const labels: Record<string, string> = { facil: 'Facil', media: 'Media', dificil: 'Dificil' };
  const icons: Record<string, string> = { facil: 'fa-circle', media: 'fa-circle-half-stroke', dificil: 'fa-circle' };
  return (
    <span className={`action-difficulty action-diff-${difficulty}`}>
      <i className={`fas ${icons[difficulty]}`} /> {labels[difficulty]}
    </span>
  );
}

function ActionPlanReport({ actions }: { actions: ActionItem[] }) {
  if (actions.length === 0) {
    return (
      <div className="seo-empty">
        <i className="fas fa-check-circle" />
        <p>No hay acciones pendientes. Tu publicacion esta optimizada.</p>
      </div>
    );
  }

  const totalTime = actions.reduce((acc, a) => {
    const match = a.time.match(/(\d+)/);
    return acc + (match ? parseInt(match[1]) : 0);
  }, 0);

  return (
    <div className="action-plan">
      <div className="action-summary-bar">
        <div className="action-stat">
          <span className="action-stat-num">{actions.length}</span>
          <span className="action-stat-label">acciones</span>
        </div>
        <div className="action-stat">
          <span className="action-stat-num">~{totalTime} min</span>
          <span className="action-stat-label">tiempo total</span>
        </div>
        <div className="action-stat">
          <span className="action-stat-num">{actions.filter((a) => a.priority === 'critica').length}</span>
          <span className="action-stat-label">criticas</span>
        </div>
      </div>

      <div className="action-list">
        {actions.map((item, i) => (
          <div key={i} className={`action-card action-${item.priority}`}>
            <div className="action-card-header">
              <span className="action-number">{i + 1}</span>
              <PriorityBadge priority={item.priority} />
              <span className="action-area">{item.area}</span>
            </div>
            <p className="action-text">{item.action}</p>
            <div className="action-meta">
              <span className="action-time"><i className="fas fa-clock" /> {item.time}</span>
              <DifficultyBadge difficulty={item.difficulty} />
              <span className="action-impact"><i className="fas fa-bolt" /> Impacto {item.impact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InterpretationReport({ interpretation }: { interpretation: ScoreInterpretation }) {
  return (
    <div className="interpretation-report">
      <div className="interp-summary">
        <p>{interpretation.summary}</p>
      </div>

      <div className="interp-categories">
        <h4><i className="fas fa-chart-bar" /> Desglose por Categoria</h4>
        <div className="interp-cat-list">
          {interpretation.categories.map((cat, i) => (
            <div key={i} className="interp-cat">
              <div className="interp-cat-header">
                <span className="interp-cat-name">{cat.name}</span>
                <span className="interp-cat-score">
                  <strong>{cat.score}</strong>/{cat.max}
                  <span className="interp-cat-weight">({cat.weight})</span>
                </span>
              </div>
              <div className="interp-cat-bar">
                <div
                  className="interp-cat-fill"
                  style={{
                    width: `${cat.score}%`,
                    background: cat.score >= 80 ? '#00A650' : cat.score >= 50 ? '#3483FA' : cat.score >= 30 ? '#F5A623' : '#F23D4F',
                  }}
                />
              </div>
              <p className="interp-cat-explanation">{cat.explanation}</p>
            </div>
          ))}
        </div>
      </div>

      {interpretation.strengths.length > 0 && (
        <div className="interp-section">
          <h4><i className="fas fa-check-circle interp-green" /> Puntos Fuertes</h4>
          <ul>
            {interpretation.strengths.map((s, i) => (
              <li key={i} className="interp-item interp-ok">{s}</li>
            ))}
          </ul>
        </div>
      )}

      {interpretation.problems.length > 0 && (
        <div className="interp-section">
          <h4><i className="fas fa-triangle-exclamation interp-red" /> Problemas</h4>
          <ul>
            {interpretation.problems.map((p, i) => (
              <li key={i} className="interp-item interp-warn">{p}</li>
            ))}
          </ul>
        </div>
      )}

      {interpretation.priority_actions.length > 0 && (
        <div className="interp-section">
          <h4><i className="fas fa-bolt interp-orange" /> Acciones Prioritarias</h4>
          <ul>
            {interpretation.priority_actions.map((a, i) => (
              <li key={i} className="interp-item interp-action">{a}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="interp-confidence">
        <i className="fas fa-shield-halved" />
        <span><strong>Nivel de confianza:</strong> {interpretation.confidence}</span>
      </div>
    </div>
  );
}

function ComparisonReport({ analysis }: { analysis: ComparisonAnalysis }) {
  const hasData = analysis.strengths.length > 0 || analysis.weaknesses.length > 0 ||
    analysis.missing.length > 0 || analysis.excess.length > 0;

  if (!hasData) {
    return (
      <div className="seo-empty">
        <i className="fas fa-info-circle" />
        <p>No hay datos suficientes para la comparacion.</p>
      </div>
    );
  }

  return (
    <div className="seo-report">
      <ReportSection title="Fortalezas vs Competidores" icon="fa-check-circle" colorClass="seo-strengths" items={analysis.strengths} />
      <ReportSection title="Debilidades vs Competidores" icon="fa-triangle-exclamation" colorClass="seo-weaknesses" items={analysis.weaknesses} />
      <ReportSection title="Que Falta" icon="fa-ban" colorClass="seo-missing" items={analysis.missing} />
      <ReportSection title="Que Sobra" icon="fa-trash-can" colorClass="seo-repeated" items={analysis.excess} />

      {analysis.different_keywords.length > 0 && (
        <div className="seo-section">
          <h4 className="seo-section-title seo-missing">
            <i className="fas fa-tags" /> Keywords Diferentes
          </h4>
          <div className="seo-tag-list">
            {analysis.different_keywords.map((k, i) => (
              <span key={i} className="seo-tag seo-tag-missing">{k}</span>
            ))}
          </div>
        </div>
      )}

      {analysis.different_benefits.length > 0 && (
        <div className="seo-section">
          <h4 className="seo-section-title seo-weaknesses">
            <i className="fas fa-star" /> Beneficios Diferentes
          </h4>
          <ul>
            {analysis.different_benefits.map((b, i) => (
              <li key={i} className="seo-item seo-warn">{b}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.missing_attributes.length > 0 && (
        <div className="seo-section">
          <h4 className="seo-section-title seo-missing">
            <i className="fas fa-list-check" /> Atributos Faltantes
          </h4>
          <div className="seo-tag-list">
            {analysis.missing_attributes.map((a, i) => (
              <span key={i} className="seo-tag seo-tag-repeated">{a}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type AnalysisTabId = 'seo' | 'copy' | 'images' | 'compare' | 'ads' | 'resumen' | 'acciones';

export function ResultPanel({ output, score, formData, seoAnalysis, copyAnalysis, imageAnalysis, onEdit, onCopy, onExportJSON }: ResultPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('resumen');
  const [competitors, setCompetitors] = useState<CompetitorData[]>([
    { title: '', description: '' },
    { title: '', description: '' },
    { title: '', description: '' },
  ]);
  const [comparisonResult, setComparisonResult] = useState<ComparisonAnalysis | null>(null);
  const [adsMetrics, setAdsMetrics] = useState<AdsMetrics>({
    impressions: '',
    clicks: '',
    sales: '',
    ctr: '',
    roas: '',
    acos: '',
    conversion: '',
  });

  const interpretation: ScoreInterpretation | null =
    seoAnalysis && copyAnalysis && imageAnalysis
      ? interpretScores(score, seoAnalysis, copyAnalysis, imageAnalysis)
      : null;

  const handleUpdateCompetitor = (index: number, data: CompetitorData) => {
    setCompetitors((prev) => {
      const next = [...prev];
      next[index] = data;
      return next;
    });
    setComparisonResult(null);
  };

  const handleCompare = () => {
    const result = compareWithCompetitors(output, competitors);
    setComparisonResult(result);
  };

  const handleUpdateAds = (field: keyof AdsMetrics, value: string) => {
    setAdsMetrics((prev) => ({ ...prev, [field]: value }));
  };

  const tabContent: Record<TabId, { title: string; content: string; isHtml?: boolean }> = {
    resumen: { title: 'Resumen de la Publicacion', content: '' },
    acciones: { title: 'Plan de Acciones', content: '' },
    title: { title: 'Titulo Optimizado', content: output.title },
    specs: { title: 'Ficha Tecnica Completa', content: output.specsText },
    desc: { title: 'Descripcion Optimizada', content: output.descriptionHtml, isHtml: true },
    keywords: { title: 'Palabras Clave', content: output.keywordsText },
    seo: { title: 'Analisis SEO', content: '' },
    copy: { title: 'Analisis de Copywriting', content: '' },
    images: { title: 'Analisis de Imagenes', content: '' },
    compare: { title: 'Comparacion con Competidores', content: '' },
    ads: { title: 'Analisis de Mercado Ads', content: '' },
    full: { title: 'Publicacion Completa (Todo en uno)', content: output.fullText },
  };

  const current = tabContent[activeTab];
  const isAnalysisTab = (activeTab as AnalysisTabId) in { seo: 1, copy: 1, images: 1, compare: 1 };

  const renderAnalysisTab = () => {
    if (activeTab === 'resumen') {
      return (
        <div className="output-box">
          <h4>{current.title}</h4>
          {interpretation ? (
            <InterpretationReport interpretation={interpretation} />
          ) : (
            <div className="seo-empty">
              <i className="fas fa-spinner fa-spin" />
              <p>Generando interpretacion...</p>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'acciones') {
      const actions = (seoAnalysis && copyAnalysis && imageAnalysis)
        ? generateActionPlan(score, formData, seoAnalysis, copyAnalysis, imageAnalysis)
        : null;
      return (
        <div className="output-box">
          <h4>{current.title}</h4>
          {actions ? (
            <ActionPlanReport actions={actions} />
          ) : (
            <div className="seo-empty">
              <i className="fas fa-spinner fa-spin" />
              <p>Generando plan de acciones...</p>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'seo') {
      return (
        <div className="output-box">
          <h4>{current.title}</h4>
          {seoAnalysis ? (
            <SeoReport analysis={seoAnalysis} />
          ) : (
            <div className="seo-empty">
              <i className="fas fa-spinner fa-spin" />
              <p>Generando analisis SEO...</p>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'copy') {
      return (
        <div className="output-box">
          <h4>{current.title}</h4>
          {copyAnalysis ? (
            <AnalysisReport
              strengths={copyAnalysis.strengths}
              weaknesses={copyAnalysis.weaknesses}
              recommendations={copyAnalysis.recommendations}
              emptyMsg="Completa la descripcion para obtener un analisis de copywriting."
            />
          ) : (
            <div className="seo-empty">
              <i className="fas fa-spinner fa-spin" />
              <p>Generando analisis de copywriting...</p>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'images') {
      return (
        <div className="output-box">
          <h4>{current.title}</h4>
          {imageAnalysis ? (
            <AnalysisReport
              strengths={imageAnalysis.strengths}
              weaknesses={imageAnalysis.weaknesses}
              recommendations={imageAnalysis.recommendations}
              emptyMsg="Completa el checklist de fotos para obtener un analisis visual."
            />
          ) : (
            <div className="seo-empty">
              <i className="fas fa-spinner fa-spin" />
              <p>Generando analisis de imagenes...</p>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'compare') {
      return (
        <div className="output-box">
          <h4>{current.title}</h4>
          <CompetitorInput
            competitors={competitors}
            onUpdate={handleUpdateCompetitor}
            onCompare={handleCompare}
          />
          {comparisonResult && (
            <div className="comparison-result">
              <hr className="separator" />
              <ComparisonReport analysis={comparisonResult} />
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'ads') {
      return (
        <div className="output-box">
          <h4>{current.title}</h4>
          <AdsMetricsInput metrics={adsMetrics} onUpdate={handleUpdateAds} />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="step-panel active">
      <div className="panel-header">
        <h2><i className="fas fa-check-circle" /> Publicacion Generada</h2>
        <p>Tu publicacion optimizada esta lista. Copia y pega directamente en MercadoLibre.</p>
      </div>

      <div className="output-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`fas ${tab.icon}`} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="output-panel active">
        {isAnalysisTab ? (
          renderAnalysisTab()
        ) : (
          <div className="output-box">
            <h4>{current.title}</h4>
            {current.isHtml ? (
              <div
                className="output-content html-output"
                dangerouslySetInnerHTML={{ __html: current.content }}
              />
            ) : (
              <div className="output-content">{current.content}</div>
            )}
            <button className="btn-copy" onClick={() => onCopy(current.content)}>
              <i className="fas fa-copy" /> Copiar
            </button>
          </div>
        )}
      </div>

      <div className="panel-actions">
        <button className="btn btn-secondary" onClick={onEdit}>
          <i className="fas fa-arrow-left" /> Editar
        </button>
        <button className="btn btn-primary" onClick={() => onCopy(output.fullText)}>
          <i className="fas fa-copy" /> Copiar Todo
        </button>
        <button className="btn btn-outline" onClick={onExportJSON}>
          <i className="fas fa-download" /> Exportar JSON
        </button>
      </div>
    </div>
  );
}
