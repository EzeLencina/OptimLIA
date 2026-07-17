import type { AdsMetrics, AdsAnalysisItem } from '../types';

function num(val: string): number {
  const n = parseFloat(val.replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function hasData(metrics: AdsMetrics): boolean {
  return num(metrics.impressions) > 0 || num(metrics.clicks) > 0 || num(metrics.sales) > 0;
}

function analyzeCTR(ctr: number, impressions: number, clicks: number): AdsAnalysisItem | null {
  if (impressions === 0 && clicks === 0) return null;

  const calculatedCTR = impressions > 0 ? (clicks / impressions) * 100 : ctr;

  if (calculatedCTR < 0.5) {
    return {
      problem: `CTR muy bajo (${calculatedCTR.toFixed(2)}%). La publicacion apenas recibe clicks frente a las impresiones.`,
      impact: 'Alto. Pocas visitas significan pocas ventas posibles. MercadoLibre ademas penaliza las publicaciones con CTR bajo.',
      priority: 'alta',
      action: 'Mejora la foto principal (fondo blanco, 80% de encuadre), ajusta el titulo con palabras clave y revisa que el precio sea competitivo.',
    };
  }

  if (calculatedCTR < 1) {
    return {
      problem: `CTR por debajo del promedio (${calculatedCTR.toFixed(2)}%). Hay margen claro de mejora.`,
      impact: 'Medio. Estas perdiendo impresiones que podrian convertirse en visitas y luego en ventas.',
      priority: 'media',
      action: 'Optimiza la imagen principal y el titulo. Prueba fotos lifestyle o infografias como imagen de portada.',
    };
  }

  return null;
}

function analyzeROAS(roas: number): AdsAnalysisItem | null {
  if (roas === 0) return null;

  if (roas < 1.5) {
    return {
      problem: `ROAS critico (${roas.toFixed(1)}x). Por cada $1 invertido recuperas menos de $1.50.`,
      impact: 'Critico. La campana esta perdiendo dinero directamente en cada venta atribuida.',
      priority: 'alta',
      action: 'Pausa la campana de inmediato. Revisa precio de venta, costo de envio y margen. Sube el precio o reduce el presupuesto antes de seguir invirtiendo.',
    };
  }

  if (roas < 3) {
    return {
      problem: `ROAS debil (${roas.toFixed(1)}x). La campana apenas es rentable.`,
      impact: 'Alto. El retorno no justifica la inversion publicitaria a largo plazo.',
      priority: 'alta',
      action: 'Optimiza la publicacion (descripcion, fotos, keywords) antes de escalar. Baja pujas en keywords de bajo rendimiento.',
    };
  }

  return null;
}

function analyzeACOS(acos: number): AdsAnalysisItem | null {
  if (acos === 0) return null;

  if (acos > 40) {
    return {
      problem: `ACOS extremadamente alto (${acos.toFixed(1)}%). Gastas mas de $0.40 en publicidad por cada $1 de venta.`,
      impact: 'Critico. El costo publicitario esta devorando las ganancias de la operacion.',
      priority: 'alta',
      action: 'Revisa el margen del producto. Si tu margen es 30% y el ACOS es 40%, cada venta da perdida. Ajusta pujas y excluye keywords irrelevantes.',
    };
  }

  if (acos > 20) {
    return {
      problem: `ACOS elevado (${acos.toFixed(1)}%). La publicidad consume una parte significativa de las ganancias.`,
      impact: 'Medio-Alto. Reduce la rentabilidad neta de cada venta.',
      priority: 'media',
      action: 'Optimiza la segmentacion, excluye keywords de bajo rendimiento y mejora la conversion de la publicacion.',
    };
  }

  return null;
}

function analyzeConversion(conversion: number, clicks: number, sales: number): AdsAnalysisItem | null {
  if (clicks === 0 && sales === 0) return null;

  const calculated = clicks > 0 ? (sales / clicks) * 100 : conversion;

  if (calculated < 1) {
    return {
      problem: `Conversion muy baja (${calculated.toFixed(2)}%). Los visitantes no compran.`,
      impact: 'Alto. Estas pagando por clicks que no se convierten en ventas.',
      priority: 'alta',
      action: 'Revisa la publicacion: precio, envio gratis, garantia, fotos y descripcion. Asegurate de que la oferta sea competitiva frente a la competencia.',
    };
  }

  if (calculated < 3) {
    return {
      problem: `Conversion moderada (${calculated.toFixed(2)}%). Hay espacio para mejorar la tasa de cierre.`,
      impact: 'Medio. Podrias duplicar ventas con el mismo presupuesto publicitario.',
      priority: 'media',
      action: 'Mejora la confianza: agrega garantia, envio Full, preguntas frecuentes y fotos de calidad.',
    };
  }

  return null;
}

function analyzeVolume(impressions: number, clicks: number, sales: number): AdsAnalysisItem | null {
  if (impressions < 100 && clicks === 0 && sales === 0) {
    return {
      problem: 'Volumen muy bajo de impresiones. La campana no tiene alcance todavia.',
      impact: 'Alto. Sin impresiones no hay datos para optimizar.',
      priority: 'alta',
      action: 'Amplia el presupuesto diario, agrega mas keywords y revisa que la puja sea competitiva.',
    };
  }

  if (clicks > 50 && sales === 0) {
    return {
      problem: `${clicks} clicks pero 0 ventas. El embudo tiene un problema critico en la conversion.`,
      impact: 'Critico. Estas gastando presupuesto sin ningun retorno.',
      priority: 'alta',
      action: 'El problema no es la campana, es la publicacion. Revisa precio, fotos, descripcion y condiciones de venta.',
    };
  }

  return null;
}

export function analyzeAds(metrics: AdsMetrics): AdsAnalysisItem[] {
  if (!hasData(metrics)) {
    return [{
      problem: 'Sin datos suficientes para analizar',
      impact: 'No se puede evaluar el rendimiento de la campana todavia',
      priority: 'baja',
      action: 'Completa al menos impresiones, clicks y ventas para obtener un diagnostico util',
    }];
  }

  const impressions = num(metrics.impressions);
  const clicks = num(metrics.clicks);
  const sales = num(metrics.sales);
  const ctr = num(metrics.ctr);
  const roas = num(metrics.roas);
  const acos = num(metrics.acos);
  const conversion = num(metrics.conversion);

  const issues: AdsAnalysisItem[] = [];

  const volumeIssue = analyzeVolume(impressions, clicks, sales);
  if (volumeIssue) issues.push(volumeIssue);

  const ctrIssue = analyzeCTR(ctr, impressions, clicks);
  if (ctrIssue) issues.push(ctrIssue);

  const conversionIssue = analyzeConversion(conversion, clicks, sales);
  if (conversionIssue) issues.push(conversionIssue);

  const roasIssue = analyzeROAS(roas);
  if (roasIssue) issues.push(roasIssue);

  const acosIssue = analyzeACOS(acos);
  if (acosIssue) issues.push(acosIssue);

  if (issues.length === 0) {
    issues.push({
      problem: 'Metricas dentro de rangos aceptables',
      impact: 'La campana esta funcionando correctamente y es rentable',
      priority: 'baja',
      action: 'Mantene la estrategia actual. Probá incrementos de presupuesto del 20% semanal para escalar con control.',
    });
  }

  return issues;
}
