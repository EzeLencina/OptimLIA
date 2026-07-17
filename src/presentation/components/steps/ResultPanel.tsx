import { useState } from 'react';
import type { GeneratedOutput } from '../../../domain/types';

interface ResultPanelProps {
  output: GeneratedOutput;
  onEdit: () => void;
  onCopy: (text: string) => void;
  onExportJSON: () => void;
}

type TabId = 'title' | 'specs' | 'desc' | 'keywords' | 'full';

const TABS: Array<{ id: TabId; label: string; icon: string }> = [
  { id: 'title', label: 'Titulo', icon: 'fa-heading' },
  { id: 'specs', label: 'Ficha', icon: 'fa-list' },
  { id: 'desc', label: 'Descripcion', icon: 'fa-file-lines' },
  { id: 'keywords', label: 'Keywords', icon: 'fa-tags' },
  { id: 'full', label: 'Todo', icon: 'fa-copy' },
];

export function ResultPanel({ output, onEdit, onCopy, onExportJSON }: ResultPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('title');

  const tabContent: Record<TabId, { title: string; content: string; isHtml?: boolean }> = {
    title: { title: 'Titulo Optimizado', content: output.title },
    specs: { title: 'Ficha Tecnica Completa', content: output.specsText },
    desc: { title: 'Descripcion Optimizada', content: output.descriptionHtml, isHtml: true },
    keywords: { title: 'Palabras Clave', content: output.keywordsText },
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
