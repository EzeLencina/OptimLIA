import type {
  ScoreBreakdown,
  SeoAnalysis,
  CopywritingAnalysis,
  ImageAnalysis,
  ScoreInterpretation,
  ScoreCategory,
} from '../types';
import { SCORE_WEIGHTS } from '../constants';

function scoreLabel(score: number): string {
  if (score >= 80) return 'excelente';
  if (score >= 60) return 'bueno';
  if (score >= 40) return 'aceptable';
  if (score >= 20) return 'deficiente';
  return 'critico';
}

function explainTitle(score: number): string {
  if (score >= 80) return 'El titulo aprovecha bien los 60 caracteres con nombre, marca y categoria. Esta optimizado para busqueda en MercadoLibre.';
  if (score >= 60) return 'El titulo tiene buena base pero falta informacion. Podria incluir marca, modelo o atributos relevantes para mejorar el posicionamiento.';
  if (score >= 40) return 'El titulo esta incompleto. Le falta nombre del producto, marca o categoria. Esto afecta directamente la visibilidad en busquedas.';
  if (score >= 20) return 'El titulo tiene poca informacion. Sin marca, modelo o categoria, la publicacion tiene dificultades para aparecer en busquedas relevantes.';
  return 'El titulo esta Practicamente vacio. Sin datos del producto, la publicacion es invisible para los compradores.';
}

function explainSpecs(score: number): string {
  if (score >= 80) return 'La ficha tecnica esta muy completa. Los atributos detallados generan confianza y mejoran el filtrado en busquedas de MercadoLibre.';
  if (score >= 60) return 'La ficha tecnica tiene la mayoria de campos completos. Completar los que faltan refuerza la informacion al comprador.';
  if (score >= 40) return 'La ficha tecnica esta a medios campos. MercadoLibre premia publicaciones con atributos completos en el ranking.';
  if (score >= 20) return 'La ficha tecnica tiene pocos campos completos. Los compradores no encuentran la informacion que buscan y van a la competencia.';
  return 'La ficha tecnica esta Practicamente vacia. Sin atributos, la publicacion pierde credibilidad y posicionamiento.';
}

function explainPhotos(score: number): string {
  if (score >= 80) return 'Excelente cobertura visual. Las 10 fotos cubren todos los angulos necesarios: principal, lifestyle, detalles, infografias y escala.';
  if (score >= 60) return 'Buena cantidad de fotos pero faltan algunos tipos importantes. Las fotos de lifestyle o infografias pueden mejorar la conversion.';
  if (score >= 40) return 'Cobertura visual basica. Con pocas fotos, el comprador no puede evaluar bien el producto. ML premia publicaciones con 6+ fotos.';
  if (score >= 20) return 'Muy pocas fotos. El comprador no puede ver el producto desde diferentes angulos. Esto reduce drasticamente la confianza.';
  return 'Sin fotos configuradas. Una publicacion sin imagenes es praticamente invendible en MercadoLibre.';
}

function explainDescription(score: number): string {
  if (score >= 80) return 'Descripcion completa con introduccion, beneficios destacados y preguntas frecuentes. Esta preparada para convertir visitas en ventas.';
  if (score >= 60) return 'Buena descripcion con secciones principales. Agregar mas beneficios o FAQs refuerza la confianza del comprador.';
  if (score >= 40) return 'Descripcion incompleta. Le falta introduccion o secciones de beneficios. Una descripcion corta no responde las dudas del comprador.';
  if (score >= 20) return 'Descripcion con muy poco contenido. Sin beneficios ni FAQs, el comprador no encuentra razon para elegir tu producto.';
  return 'Descripcion Practicamente vacia. Sin copywriting, la publicacion no puede competir con otras que si tienen descripcion detallada.';
}

function explainSeo(score: number): string {
  if (score >= 80) return 'Keywords bien configuradas. La keyword principal y secundarias cubren las busquedas mas relevantes del producto.';
  if (score >= 60) return 'Algunas keywords configuradas. Agregar las secundarias que faltan amplia el alcance en busquedas de MercadoLibre.';
  if (score >= 40) return 'Keywords incompletas. Sin la keyword principal o secundarias, la publicacion no aparece en las busquedas relevantes.';
  if (score >= 20) return 'Pocas keywords configuradas. La publicacion tiene alcance limitado en el motor de busqueda de MercadoLibre.';
  return 'Sin keywords definidas. La publicacion es praticamente invisible para quien busca tu tipo de producto.';
}

function buildSummary(total: number): string {
  if (total >= 80) return `Tu publicacion esta muy bien optimizada (${total}/100). Esta en el top de las publicaciones de MercadoLibre para tu categoria.`;
  if (total >= 60) return `Tu publicacion tiene buena base (${total}/100). Con algunos ajustes puede llegar a ser competitiva.`;
  if (total >= 40) return `Tu publicacion esta a medias (${total}/100). Hay areas importantes que mejorar para competir efectivamente.`;
  if (total >= 20) return `Tu publicacion necesita trabajo significativo (${total}/100). Multiples areas estan por debajo del minimo esperado.`;
  return `Tu publicacion esta en nivel critico (${total}/100). Requiere mejoras urgentes en casi todos los aspectos.`;
}

function buildConfidence(score: ScoreBreakdown, seo: SeoAnalysis, copy: CopywritingAnalysis, images: ImageAnalysis): string {
  let factors = 0;
  let total = 0;

  if (score.title > 0) { factors++; total++; }
  if (score.specs > 0) { factors++; total++; }
  if (score.photos > 0) { factors++; total++; }
  if (score.description > 0) { factors++; total++; }
  if (score.seo > 0) { factors++; total++; }
  if (seo.strengths.length + seo.weaknesses.length > 0) { factors++; total++; } else { total++; }
  if (copy.strengths.length + copy.weaknesses.length > 0) { factors++; total++; } else { total++; }
  if (images.strengths.length + images.weaknesses.length > 0) { factors++; total++; } else { total++; }

  const pct = total > 0 ? (factors / total) * 100 : 0;
  if (pct >= 80) return `Alta (${Math.round(pct)}% de datos disponibles). La interpretacion es precisa porque todos los campos estan evaluados.`;
  if (pct >= 50) return `Media (${Math.round(pct)}% de datos disponibles). Algunos campos estan vacios, lo que limita el analisis completo.`;
  return `Baja (${Math.round(pct)}% de datos disponibles). Completar mas campos del formulario mejorara la precision del diagnostico.`;
}

export function interpretScores(
  score: ScoreBreakdown,
  seo: SeoAnalysis,
  copy: CopywritingAnalysis,
  images: ImageAnalysis,
): ScoreInterpretation {
  const categories: ScoreCategory[] = [
    {
      name: 'Titulo',
      score: score.title,
      max: 100,
      weight: `${Math.round(SCORE_WEIGHTS.title * 100)}%`,
      explanation: explainTitle(score.title),
    },
    {
      name: 'Ficha Tecnica',
      score: score.specs,
      max: 100,
      weight: `${Math.round(SCORE_WEIGHTS.specs * 100)}%`,
      explanation: explainSpecs(score.specs),
    },
    {
      name: 'Imagenes',
      score: score.photos,
      max: 100,
      weight: `${Math.round(SCORE_WEIGHTS.photos * 100)}%`,
      explanation: explainPhotos(score.photos),
    },
    {
      name: 'Descripcion',
      score: score.description,
      max: 100,
      weight: `${Math.round(SCORE_WEIGHTS.description * 100)}%`,
      explanation: explainDescription(score.description),
    },
    {
      name: 'SEO',
      score: score.seo,
      max: 100,
      weight: `${Math.round(SCORE_WEIGHTS.seo * 100)}%`,
      explanation: explainSeo(score.seo),
    },
  ];

  const strengths: string[] = [];
  const problems: string[] = [];
  const priority_actions: string[] = [];

  for (const cat of categories) {
    if (cat.score >= 80) {
      strengths.push(`${cat.name}: ${scoreLabel(cat.score)} (${cat.score}/100). ${cat.explanation}`);
    } else if (cat.score < 40) {
      problems.push(`${cat.name}: ${scoreLabel(cat.score)} (${cat.score}/100). ${cat.explanation}`);
    }
  }

  const sortedByScore = [...categories].sort((a, b) => a.score - b.score);
  const weakest = sortedByScore.slice(0, 3);
  for (const cat of weakest) {
    if (cat.score < 80) {
      priority_actions.push(`Mejorar ${cat.name} (${cat.score}/100): ${cat.explanation}`);
    }
  }

  if (seo.weaknesses.length > 0) {
    priority_actions.push(`SEO: ${seo.weaknesses[0]}`);
  }

  if (copy.weaknesses.length > 0) {
    priority_actions.push(`Copywriting: ${copy.weaknesses[0]}`);
  }

  if (images.weaknesses.length > 0) {
    priority_actions.push(`Imagenes: ${images.weaknesses[0]}`);
  }

  return {
    summary: buildSummary(score.total),
    categories,
    strengths,
    problems,
    priority_actions,
    confidence: buildConfidence(score, seo, copy, images),
  };
}
