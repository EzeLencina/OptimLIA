import type { ProductData } from '../../../domain/types';
import { ML_CATEGORIES, TITLE_MAX_LENGTH } from '../../../domain/constants';
import { generateTitle } from '../../../domain/services/title.service';

interface ProductStepProps {
  product: ProductData;
  onUpdate: (field: keyof ProductData, value: string) => void;
  onNext: () => void;
}

export function ProductStep({ product, onUpdate, onNext }: ProductStepProps) {
  const title = generateTitle(product);
  const charCount = title.length;
  const counterClass = charCount > 55 ? 'error' : charCount > 45 ? 'warning' : '';

  return (
    <div className="step-panel active">
      <div className="panel-header">
        <h2><i className="fas fa-box" /> Datos del Producto</h2>
        <p>Ingresa la informacion basica de tu producto para generar una publicacion optimizada.</p>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label>Nombre del Producto <span className="required">*</span></label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => onUpdate('name', e.target.value)}
            placeholder="Ej: Auriculares Bluetooth Inalambricos"
            maxLength={TITLE_MAX_LENGTH}
          />
          <div className={`char-counter ${counterClass}`}>
            {charCount}/{TITLE_MAX_LENGTH} caracteres
          </div>
        </div>

        <div className="form-group">
          <label>Marca <span className="required">*</span></label>
          <input
            type="text"
            value={product.brand}
            onChange={(e) => onUpdate('brand', e.target.value)}
            placeholder="Ej: Samsung, Sony, Apple"
          />
        </div>

        <div className="form-group">
          <label>Modelo</label>
          <input
            type="text"
            value={product.model}
            onChange={(e) => onUpdate('model', e.target.value)}
            placeholder="Ej: Galaxy Buds2 Pro"
          />
        </div>

        <div className="form-group">
          <label>Categoria ML <span className="required">*</span></label>
          <select
            value={product.category}
            onChange={(e) => onUpdate('category', e.target.value)}
          >
            <option value="">Seleccionar categoria...</option>
            {ML_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Categoria Especifica</label>
          <input
            type="text"
            value={product.subcategory}
            onChange={(e) => onUpdate('subcategory', e.target.value)}
            placeholder="Ej: Audifonos, Parlantes, Smartwatch"
          />
        </div>

        <div className="form-group">
          <label>Condicion <span className="required">*</span></label>
          <div className="radio-group">
            {[
              { value: 'new', label: 'Nuevo' },
              { value: 'used', label: 'Usado' },
              { value: 'refurbished', label: 'Reacondicionado' },
            ].map((opt) => (
              <label key={opt.value} className="radio-label">
                <input
                  type="radio"
                  name="condition"
                  value={opt.value}
                  checked={product.condition === opt.value}
                  onChange={(e) => onUpdate('condition', e.target.value as ProductData['condition'])}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group full-width">
          <label>Atributo Clave</label>
          <input
            type="text"
            value={product.attribute}
            onChange={(e) => onUpdate('attribute', e.target.value)}
            placeholder="Ej: 40h bateria, Resistente al agua IPX7, Pantalla AMOLED"
          />
        </div>

        <div className="form-group full-width">
          <label>Uso / Compatibilidad</label>
          <input
            type="text"
            value={product.usage}
            onChange={(e) => onUpdate('usage', e.target.value)}
            placeholder="Ej: Compatible con Android/iOS, Uso deportivo, Para cocina"
          />
        </div>

        <div className="form-group full-width">
          <label>Codigo Universal (EAN/UPC/ISBN)</label>
          <input
            type="text"
            value={product.ean}
            onChange={(e) => onUpdate('ean', e.target.value)}
            placeholder="Ej: 8806091234567"
          />
        </div>
      </div>

      <div className="title-preview-box">
        <h4>Vista Previa del Titulo Generado</h4>
        <div className="generated-title">
          {title || '[Producto] [Marca] [Modelo] [Atributo] [Uso]'}
        </div>
        <div className="title-breakdown">
          <span className="tag tag-product">{product.name || 'Producto'}</span>
          <span className="tag tag-brand">{product.brand || 'Marca'}</span>
          <span className="tag tag-model">{product.model || 'Modelo'}</span>
          <span className="tag tag-attr">{product.attribute || 'Atributo'}</span>
          <span className="tag tag-use">{product.usage || 'Uso'}</span>
        </div>
      </div>

      <div className="panel-actions">
        <div />
        <button className="btn btn-primary" onClick={onNext}>
          Siguiente <i className="fas fa-arrow-right" />
        </button>
      </div>
    </div>
  );
}
