import { useState } from 'react';
import type { GeneratedOutput, SeoAnalysis } from '../../../domain/types';

interface ResultPanelProps {
  output: GeneratedOutput;
  seoAnalysis: SeoAnalysis | null;
  onEdit: () => void;
  onCopy: (text: string) => void;
  onExportJSON: () => void;
}

type TabId = 'title' | 'specs' | 'desc' | 'keywords' | 'seo' | 'full';

const TABS: Array<{ id: TabId; label: string; icon: string }> = [
  { id: 'title', label: 'Titulo', icon: 'fa-heading' },
  { id: 'specs', label: 'Ficha', icon: 'fa-list' },
  { id: 'desc', label: 'Descripcion', icon: 'fa-file-lines' },
  { id: 'keywords', label: 'Keywords', icon: 'fa-tags' },
  { id: 'seo', label: 'SEO', icon: 'fa-magnifying-glass-chart' },
  { id: 'full', label: 'Todo', icon: 'fa-copy' },
];

function SeoReport({ analysis }: { analysis: SeoAnalysis }) {
  return (
    <div className="seo-report">
      {analysis.strengths.length > 0 && (
        <div className="seo-section">
          <h4 className="seo-section-title seo-strengths">
            <i className="fas fa-check-circle" /> Fortalezas
          </h4>
          <ul>
            {analysis.strengths.map((s, i) => (
              <li key={i} className="seo-item seo-ok">{s}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.weaknesses.length > 0 && (
        <div className="seo-section">
          <h4 className="seo-section-title seo-weaknesses">
            <i className="fas fa-triangle-exclamation" /> Debilidades
          </h4>
          <ul>
            {analysis.weaknesses.map((w, i) => (
              <li key={i} className="seo-item seo-warn">{w}</li>
            ))}
          </ul>
        </div>
      )}

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

      {analysis.recommendations.length > 0 && (
        <div className="seo-section">
          <h4 className="seo-section-title seo-recommendations">
            <i className="fas fa-lightbulb" /> Recomendaciones
          </h4>
          <ul>
            {analysis.recommendations.map((r, i) => (
              <li key={i} className="seo-item seo-rec">{r}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.strengths.length === 0 && analysis.weaknesses.length === 0 && (
        <div className="seo-empty">
          <i className="fas fa-info-circle" />
          <p>Completa los campos del formulario para obtener un analisis SEO detallado.</p>
        </div>
      )}
    </div>
  );
}

export function ResultPanel({ output, seoAnalysis, onEdit, onCopy, onExportJSON }: ResultPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('title');

  const tabContent: Record<TabId, { title: string; content: string; isHtml?: boolean }> = {
    title: { title: 'Titulo Optimizado', content: output.title },
    specs: { title: 'Ficha Tecnica Completa', content: output.specsText },
    desc: { title: 'Descripcion Optimizada', content: output.descriptionHtml, isHtml: true },
    keywords: { title: 'Palabras Clave', content: output.keywordsText },
    seo: { title: 'Analisis SEO', content: '' },
    full: { title: 'Publicacion Completa (Todo en uno)', content: output.fullText },
  };

  const current = tabContent[activeTab];

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
        {activeTab === 'seo' ? (
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
