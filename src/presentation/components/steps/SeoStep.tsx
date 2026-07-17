import type { KeywordData, KeywordAnalysis } from '../../../domain/types';

interface SeoStepProps {
  keywords: KeywordData;
  keywordAnalysis: KeywordAnalysis[];
  onUpdate: (field: keyof KeywordData, value: string) => void;
  onGenerate: () => void;
  onPrev: () => void;
}

export function SeoStep({ keywords, keywordAnalysis, onUpdate, onGenerate, onPrev }: SeoStepProps) {
  return (
    <div className="step-panel active">
      <div className="panel-header">
        <h2><i className="fas fa-magnifying-glass-chart" /> SEO y Palabras Clave</h2>
        <p>Elige las palabras clave correctas para que tu publicacion aparezca donde el comprador realmente busca.</p>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label>Keyword Principal</label>
          <input
            type="text"
            value={keywords.primary}
            onChange={(e) => onUpdate('primary', e.target.value)}
            placeholder="La palabra mas buscada de tu producto"
          />
          <div className="hint">Busca en el buscador de ML y observa las sugerencias automaticas.</div>
        </div>
        <div className="form-group">
          <label>Keyword Secundaria 1</label>
          <input
            type="text"
            value={keywords.secondary1}
            onChange={(e) => onUpdate('secondary1', e.target.value)}
            placeholder="Variacion o sinonimo"
          />
        </div>
        <div className="form-group">
          <label>Keyword Secundaria 2</label>
          <input
            type="text"
            value={keywords.secondary2}
            onChange={(e) => onUpdate('secondary2', e.target.value)}
            placeholder="Complemento o uso"
          />
        </div>
        <div className="form-group">
          <label>Keyword Secundaria 3</label>
          <input
            type="text"
            value={keywords.secondary3}
            onChange={(e) => onUpdate('secondary3', e.target.value)}
            placeholder="Categoria relacionada"
          />
        </div>
        <div className="form-group">
          <label>Long-tail Keyword 1</label>
          <input
            type="text"
            value={keywords.longtail1}
            onChange={(e) => onUpdate('longtail1', e.target.value)}
            placeholder="Frase de busqueda especifica"
          />
        </div>
        <div className="form-group">
          <label>Long-tail Keyword 2</label>
          <input
            type="text"
            value={keywords.longtail2}
            onChange={(e) => onUpdate('longtail2', e.target.value)}
            placeholder="Otra frase de busqueda"
          />
        </div>
      </div>

      <div className="keyword-analysis">
        <h4>Analisis de Palabras Clave en Titulo</h4>
        <div className="kw-tags">
          {keywordAnalysis.length === 0 && (
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              Ingresa palabras clave para analizarlas.
            </span>
          )}
          {keywordAnalysis.map((kw, i) => (
            <span
              key={i}
              className={`kw-tag ${kw.foundInTitle ? 'found' : 'missing'}`}
            >
              {kw.keyword}
            </span>
          ))}
        </div>
      </div>

      <div className="panel-actions">
        <button className="btn btn-secondary" onClick={onPrev}>
          <i className="fas fa-arrow-left" /> Anterior
        </button>
        <button className="btn btn-success" onClick={onGenerate}>
          <i className="fas fa-wand-magic-sparkles" /> Generar Publicacion Completa
        </button>
      </div>
    </div>
  );
}
