import type { SpecData, AdditionalSpec } from '../../../domain/types';
import { DynamicFieldList } from '../common/DynamicFieldList';

interface SpecsStepProps {
  specs: SpecData;
  additionalSpecs: AdditionalSpec[];
  onUpdateSpecs: (field: keyof SpecData, value: string) => void;
  onUpdateAdditional: (specs: AdditionalSpec[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

function calculateSpecsProgress(specs: SpecData, additionalSpecs: AdditionalSpec[]): number {
  const fields = [specs.brand, specs.model, specs.material, specs.color, specs.weight, specs.dimensions, specs.warranty];
  const filled = fields.filter((f) => f.trim()).length;
  const additionalFilled = additionalSpecs.filter((s) => s.name.trim() && s.value.trim()).length;
  return Math.round(((filled + additionalFilled) / 10) * 100);
}

export function SpecsStep({
  specs,
  additionalSpecs,
  onUpdateSpecs,
  onUpdateAdditional,
  onNext,
  onPrev,
}: SpecsStepProps) {
  const progress = calculateSpecsProgress(specs, additionalSpecs);

  return (
    <div className="step-panel active">
      <div className="panel-header">
        <h2><i className="fas fa-list-check" /> Ficha Tecnica</h2>
        <p>Completa todas las especificaciones. Cuantos mas campos llenes, mejor filtras y rankeas en las busquedas de MercadoLibre.</p>
      </div>

      <div className="specs-completeness">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span>{progress}% completado</span>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Marca (en ficha)</label>
          <input type="text" value={specs.brand} onChange={(e) => onUpdateSpecs('brand', e.target.value)} placeholder="Marca exacta" />
        </div>
        <div className="form-group">
          <label>Modelo (en ficha)</label>
          <input type="text" value={specs.model} onChange={(e) => onUpdateSpecs('model', e.target.value)} placeholder="Modelo exacto" />
        </div>
        <div className="form-group">
          <label>Material Principal</label>
          <input type="text" value={specs.material} onChange={(e) => onUpdateSpecs('material', e.target.value)} placeholder="Ej: Plastico ABS, Acero inoxidable" />
        </div>
        <div className="form-group">
          <label>Color</label>
          <input type="text" value={specs.color} onChange={(e) => onUpdateSpecs('color', e.target.value)} placeholder="Ej: Negro, Blanco, Rojo" />
        </div>
        <div className="form-group">
          <label>Peso</label>
          <div className="input-group">
            <input type="number" value={specs.weight} onChange={(e) => onUpdateSpecs('weight', e.target.value)} placeholder="0" />
            <select value={specs.weightUnit} onChange={(e) => onUpdateSpecs('weightUnit', e.target.value)}>
              <option value="g">g</option>
              <option value="kg">kg</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Dimensiones (L x A x An)</label>
          <input type="text" value={specs.dimensions} onChange={(e) => onUpdateSpecs('dimensions', e.target.value)} placeholder="Ej: 20 x 15 x 10 cm" />
        </div>
        <div className="form-group">
          <label>Garantia</label>
          <input type="text" value={specs.warranty} onChange={(e) => onUpdateSpecs('warranty', e.target.value)} placeholder="Ej: 12 meses, 6 meses" />
        </div>
        <div className="form-group">
          <label>Pais de Origen</label>
          <input type="text" value={specs.origin} onChange={(e) => onUpdateSpecs('origin', e.target.value)} placeholder="Ej: China, Argentina" />
        </div>
        <div className="form-group full-width">
          <label>Descripcion Breve</label>
          <textarea value={specs.briefDesc} onChange={(e) => onUpdateSpecs('briefDesc', e.target.value)} rows={2} placeholder="Breve descripcion del producto en una linea" />
        </div>
      </div>

      <h3 className="section-subtitle"><i className="fas fa-plus-circle" /> Atributos Adicionales</h3>
      <DynamicFieldList
        items={additionalSpecs}
        onChange={onUpdateAdditional}
        onAdd={() => ({ name: '', value: '' })}
        addLabel="Agregar atributo"
        renderItem={(item, index) => (
          <>
            <input
              type="text"
              value={item.name}
              onChange={(e) => {
                const updated = [...additionalSpecs];
                updated[index] = { ...updated[index], name: e.target.value };
                onUpdateAdditional(updated);
              }}
              placeholder="Nombre del atributo"
            />
            <input
              type="text"
              value={item.value}
              onChange={(e) => {
                const updated = [...additionalSpecs];
                updated[index] = { ...updated[index], value: e.target.value };
                onUpdateAdditional(updated);
              }}
              placeholder="Valor"
            />
          </>
        )}
      />

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
