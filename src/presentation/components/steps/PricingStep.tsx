import type { PricingData, PriceCalculation } from '../../../domain/types';

interface PricingStepProps {
  pricing: PricingData;
  priceCalc: PriceCalculation;
  onUpdate: (field: keyof PricingData, value: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const formatCurrency = (value: number) =>
  '$' + value.toLocaleString('es-AR');

export function PricingStep({ pricing, priceCalc, onUpdate, onNext, onPrev }: PricingStepProps) {
  return (
    <div className="step-panel active">
      <div className="panel-header">
        <h2><i className="fas fa-tags" /> Condiciones de Venta</h2>
        <p>Define precio, envio y tipo de publicacion para ganar margen y vender mas sin regalar rentabilidad.</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Costo del Producto (ARS)</label>
          <div className="input-group">
            <span className="input-prefix">$</span>
            <input
              type="number"
              value={pricing.productCost}
              onChange={(e) => onUpdate('productCost', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <div className="form-group">
          <label>Comision ML (%)</label>
          <input
            type="number"
            value={pricing.commission}
            onChange={(e) => onUpdate('commission', e.target.value)}
            placeholder="13"
          />
        </div>
        <div className="form-group">
          <label>Costo de Envio (ARS)</label>
          <div className="input-group">
            <span className="input-prefix">$</span>
            <input
              type="number"
              value={pricing.shippingCost}
              onChange={(e) => onUpdate('shippingCost', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <div className="form-group">
          <label>Margen de Ganancia (%)</label>
          <input
            type="number"
            value={pricing.margin}
            onChange={(e) => onUpdate('margin', e.target.value)}
            placeholder="30"
          />
        </div>
        <div className="form-group">
          <label>Gasto Fijo por Venta (ARS)</label>
          <div className="input-group">
            <span className="input-prefix">$</span>
            <input
              type="number"
              value={pricing.fixedCost}
              onChange={(e) => onUpdate('fixedCost', e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <div className="price-result">
        <div className="price-card suggested">
          <h4>Precio Sugerido de Venta</h4>
          <div className="price-value">{formatCurrency(priceCalc.suggestedPrice)}</div>
          <span className="price-label">Incluye todos los costos + margen</span>
        </div>
        <div className="price-card profit">
          <h4>Ganancia Neta por Unidad</h4>
          <div className="price-value">{formatCurrency(priceCalc.netProfit)}</div>
        </div>
        <div className="price-card roi">
          <h4>ROI</h4>
          <div className="price-value">{priceCalc.roi}%</div>
        </div>
      </div>

      <div className="form-grid" style={{ marginTop: 24 }}>
        <div className="form-group">
          <label>Tipo de Publicacion</label>
          <select value={pricing.publicationType} onChange={(e) => onUpdate('publicationType', e.target.value)}>
            <option value="premium">Premium (mayor alcance)</option>
            <option value="clasica">Clasica (menor costo)</option>
          </select>
        </div>
        <div className="form-group">
          <label>Cuotas Sin Interes</label>
          <select value={pricing.installments} onChange={(e) => onUpdate('installments', e.target.value)}>
            <option value="1">1 cuota (contado)</option>
            <option value="3">3 cuotas sin interes</option>
            <option value="6">6 cuotas sin interes</option>
            <option value="12">12 cuotas sin interes</option>
            <option value="18">18 cuotas sin interes</option>
          </select>
        </div>
        <div className="form-group">
          <label>Tipo de Envio</label>
          <select value={pricing.shippingType} onChange={(e) => onUpdate('shippingType', e.target.value)}>
            <option value="full">MercadoLibre Full</option>
            <option value="flex">MercadoLibre Flex</option>
            <option value="free">Envio Gratis</option>
            <option value="paid">Envio por cuenta del comprador</option>
          </select>
        </div>
        <div className="form-group">
          <label>Stock Inicial</label>
          <input
            type="number"
            value={pricing.stock}
            onChange={(e) => onUpdate('stock', e.target.value)}
            placeholder="10"
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
