import { useState } from 'react';
import type { CompetitorData } from '../../../domain/types';

interface CompetitorInputProps {
  competitors: CompetitorData[];
  onUpdate: (index: number, data: CompetitorData) => void;
  onCompare: () => void;
}

export function CompetitorInput({ competitors, onUpdate, onCompare }: CompetitorInputProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const hasData = competitors.some((c) => c.title.trim() || c.description.trim());

  return (
    <div className="competitor-input">
      <div className="competitor-header">
        <h4><i className="fas fa-users" /> Competidores</h4>
        <p>Pega el titulo y la descripcion de hasta 3 competidores de MercadoLibre para ver en que los superas.</p>
      </div>

      <div className="competitor-list">
        {competitors.map((comp, i) => (
          <div key={i} className={`competitor-card${expanded === i ? ' expanded' : ''}`}>
            <button
              className="competitor-toggle"
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <span className="competitor-number">{i + 1}</span>
              <span className="competitor-label">
                {comp.title.trim() ? comp.title.substring(0, 40) + (comp.title.length > 40 ? '...' : '') : `Competidor ${i + 1}`}
              </span>
              <i className={`fas fa-chevron-${expanded === i ? 'up' : 'down'}`} />
            </button>

            {expanded === i && (
              <div className="competitor-fields">
                <div className="form-group">
                  <label>Titulo del Competidor {i + 1}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Auriculares Bluetooth Inalambricos..."
                    value={comp.title}
                    onChange={(e) => onUpdate(i, { ...comp, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Descripcion del Competidor {i + 1}</label>
                  <textarea
                    className="form-textarea"
                    rows={6}
                    placeholder="Pega la descripcion completa del competidor..."
                    value={comp.description}
                    onChange={(e) => onUpdate(i, { ...comp, description: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        className="btn btn-primary competitor-btn"
        onClick={onCompare}
        disabled={!hasData}
      >
        <i className="fas fa-scale-balanced" /> Comparar
      </button>
    </div>
  );
}
