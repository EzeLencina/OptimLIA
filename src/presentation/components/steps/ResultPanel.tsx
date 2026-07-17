import { useState } from 'react';
import type { GeneratedOutput, SeoAnalysis, CopywritingAnalysis, ImageAnalysis } from '../../../domain/types';

interface ResultPanelProps {
  output: GeneratedOutput;
  seoAnalysis: SeoAnalysis | null;
  copyAnalysis: CopywritingAnalysis | null;
  imageAnalysis: ImageAnalysis | null;
  onEdit: () => void;
  onCopy: (text: string) => void;
  onExportJSON: () => void;
}

type TabId = 'title' | 'specs' | 'desc' | 'keywords' | 'seo' | 'copy' | 'images' | 'full';

const TABS: Array<{ id: TabId; label: string; icon: string }> = [
  { id: 'title', label: 'Titulo', icon: 'fa-heading' },
  { id: 'specs', label: 'Ficha', icon: 'fa-list' },
  { id: 'desc', label: 'Descripcion', icon: 'fa-file-lines' },
  { id: 'keywords', label: 'Keywords', icon: 'fa-tags' },
  { id: 'seo', label: 'SEO', icon: 'fa-magnifying-glass-chart' },
  { id: 'copy', label: 'Copywriting', icon: 'fa-pen-fancy' },
  { id: 'images', label: 'Imagenes', icon: 'fa-images' },
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

type AnalysisTabId = 'seo' | 'copy' | 'images';

export function ResultPanel({ output, seoAnalysis, copyAnalysis, imageAnalysis, onEdit, onCopy, onExportJSON }: ResultPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('title');

  const tabContent: Record<TabId, { title: string; content: string; isHtml?: boolean }> = {
    title: { title: 'Titulo Optimizado', content: output.title },
    specs: { title: 'Ficha Tecnica Completa', content: output.specsText },
    desc: { title: 'Descripcion Optimizada', content: output.descriptionHtml, isHtml: true },
    keywords: { title: 'Palabras Clave', content: output.keywordsText },
    seo: { title: 'Analisis SEO', content: '' },
    copy: { title: 'Analisis de Copywriting', content: '' },
    images: { title: 'Analisis de Imagenes', content: '' },
    full: { title: 'Publicacion Completa (Todo en uno)', content: output.fullText },
  };

  const current = tabContent[activeTab];
  const isAnalysisTab = (activeTab as AnalysisTabId) in { seo: 1, copy: 1, images: 1 };

  const renderAnalysisTab = () => {
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
