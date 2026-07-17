import type { DescriptionData, FeatureItem, FAQItem } from '../../../domain/types';
import { DynamicFieldList } from '../common/DynamicFieldList';

interface DescriptionStepProps {
  description: DescriptionData;
  onUpdate: (field: keyof DescriptionData, value: string | string[] | FeatureItem[] | FAQItem[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function DescriptionStep({ description, onUpdate, onNext, onPrev }: DescriptionStepProps) {
  return (
    <div className="step-panel active">
      <div className="panel-header">
        <h2><i className="fas fa-file-lines" /> Descripcion Optimizada</h2>
        <p>Arma una descripcion profesional con las secciones que MercadoLibre premia y que convencen al comprador de comprar ya.</p>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label>Intro / Beneficio Principal <span className="required">*</span></label>
          <textarea
            value={description.intro}
            onChange={(e) => onUpdate('intro', e.target.value)}
            rows={3}
            placeholder="Breve introduccion. Que problema resuelve? Cual es el beneficio principal?"
          />
          <div className="char-counter">
            {description.intro.length}/200 caracteres (recomendado: 150-200)
          </div>
        </div>

        <div className="form-group full-width">
          <label>Problema que Resuelve (2-3 frases)</label>
          <textarea
            value={description.problem}
            onChange={(e) => onUpdate('problem', e.target.value)}
            rows={3}
            placeholder="Describe el problema que resuelve este producto para el comprador."
          />
        </div>

        <div className="form-group full-width">
          <label>Que Incluye la Caja</label>
          <DynamicFieldList
            items={description.boxContents}
            onChange={(items) => onUpdate('boxContents', items)}
            onAdd={() => ''}
            addLabel="Agregar item"
            renderItem={(item, index) => (
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const updated = [...description.boxContents];
                  updated[index] = e.target.value;
                  onUpdate('boxContents', updated);
                }}
                placeholder="Item incluido (Ej: Auriculares x1)"
              />
            )}
          />
        </div>

        <div className="form-group full-width">
          <label>Caracteristicas Principales (Feature + Beneficio)</label>
          <DynamicFieldList
            items={description.features}
            onChange={(items) => onUpdate('features', items)}
            onAdd={() => ({ name: '', benefit: '' })}
            addLabel="Agregar caracteristica"
            renderItem={(item, index) => (
              <>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => {
                    const updated = [...description.features];
                    updated[index] = { ...updated[index], name: e.target.value };
                    onUpdate('features', updated);
                  }}
                  placeholder="Caracteristica"
                />
                <i className="fas fa-arrow-right" />
                <input
                  type="text"
                  value={item.benefit}
                  onChange={(e) => {
                    const updated = [...description.features];
                    updated[index] = { ...updated[index], benefit: e.target.value };
                    onUpdate('features', updated);
                  }}
                  placeholder="Beneficio para el comprador"
                />
              </>
            )}
          />
        </div>

        <div className="form-group full-width">
          <label>Preguntas Frecuentes</label>
          <DynamicFieldList
            items={description.faqs}
            onChange={(items) => onUpdate('faqs', items)}
            onAdd={() => ({ question: '', answer: '' })}
            addLabel="Agregar pregunta"
            renderItem={(item, index) => (
              <>
                <input
                  type="text"
                  value={item.question}
                  onChange={(e) => {
                    const updated = [...description.faqs];
                    updated[index] = { ...updated[index], question: e.target.value };
                    onUpdate('faqs', updated);
                  }}
                  placeholder="Pregunta del comprador"
                />
                <input
                  type="text"
                  value={item.answer}
                  onChange={(e) => {
                    const updated = [...description.faqs];
                    updated[index] = { ...updated[index], answer: e.target.value };
                    onUpdate('faqs', updated);
                  }}
                  placeholder="Respuesta"
                />
              </>
            )}
          />
        </div>

        <div className="form-group full-width">
          <label>Info de Envio y Garantia</label>
          <textarea
            value={description.shipping}
            onChange={(e) => onUpdate('shipping', e.target.value)}
            rows={3}
            placeholder="Tiempo de entrega, politica de devolucion, cobertura de garantia"
          />
        </div>
      </div>

      <div className="panel-actions">
        <button className="btn btn-secondary" onClick={onPrev}>
          <i className="fas fa-arrow-left" /> Anterior
        </button>
        <button className="btn btn-primary" onClick={onNext}>
          Siguiente <i className="fas fa-arrow-right" />
        </button>
      </div>
    </div>
  );
}
