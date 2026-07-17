import type {
  ScoreBreakdown,
  SeoAnalysis,
  CopywritingAnalysis,
  ImageAnalysis,
  PublicationFormData,
  ActionItem,
} from '../types';

function dedupe(actions: ActionItem[]): ActionItem[] {
  const seen = new Set<string>();
  return actions.filter((a) => {
    const key = a.action.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortByImpact(actions: ActionItem[]): ActionItem[] {
  const impactOrder: Record<string, number> = { critica: 0, alta: 1, media: 2, baja: 3 };
  return actions.sort((a, b) => impactOrder[a.priority] - impactOrder[b.priority]);
}

function fromTitle(score: number, data: PublicationFormData): ActionItem[] {
  const actions: ActionItem[] = [];
  const { product } = data;

  if (!product.name.trim()) {
    actions.push({
      action: 'Completar el nombre del producto en el campo "Nombre". Ejemplo: "Auriculares Bluetooth Inalambricos"',
      priority: 'critica',
      time: '1 min',
      impact: 'critica',
      difficulty: 'facil',
      area: 'Titulo',
    });
  }

  if (!product.brand.trim()) {
    actions.push({
      action: 'Agregar la marca del producto. La marca es un filtro de busqueda principal en MercadoLibre',
      priority: 'critica',
      time: '1 min',
      impact: 'critica',
      difficulty: 'facil',
      area: 'Titulo',
    });
  }

  if (!product.category.trim()) {
    actions.push({
      action: 'Seleccionar la categoria del producto. Sin categoria, la publicacion no aparece en busquedas filtradas',
      priority: 'critica',
      time: '1 min',
      impact: 'alta',
      difficulty: 'facil',
      area: 'Titulo',
    });
  }

  if (score < 50 && product.name.trim() && product.brand.trim()) {
    actions.push({
      action: 'Agregar modelo, atributo o uso al titulo para completar los 60 caracteres disponibles',
      priority: 'alta',
      time: '2 min',
      impact: 'alta',
      difficulty: 'facil',
      area: 'Titulo',
    });
  }

  return actions;
}

function fromSpecs(score: number, data: PublicationFormData): ActionItem[] {
  const actions: ActionItem[] = [];
  const { specs } = data;

  const missing: string[] = [];
  if (!specs.material.trim()) missing.push('material');
  if (!specs.color.trim()) missing.push('color');
  if (!specs.weight.trim()) missing.push('peso');
  if (!specs.dimensions.trim()) missing.push('dimensiones');
  if (!specs.warranty.trim()) missing.push('garantia');

  if (missing.length >= 3) {
    actions.push({
      action: `Completar ficha tecnica: faltan ${missing.join(', ')}. Estos campos mejoran el filtrado en busquedas`,
      priority: 'alta',
      time: '5 min',
      impact: 'alta',
      difficulty: 'facil',
      area: 'Ficha Tecnica',
    });
  } else if (missing.length > 0 && score < 80) {
    actions.push({
      action: `Agregar campos faltantes en ficha tecnica: ${missing.join(', ')}`,
      priority: 'media',
      time: '3 min',
      impact: 'media',
      difficulty: 'facil',
      area: 'Ficha Tecnica',
    });
  }

  return actions;
}

function fromPhotos(score: number, data: PublicationFormData): ActionItem[] {
  const actions: ActionItem[] = [];
  const checked = data.photos.filter((p) => p.checked).length;

  if (checked === 0) {
    actions.push({
      action: 'Subir minimo 6 fotos: principal con fondo blanco, uso real, detalle, contenido de caja, 2 angulos e infografia',
      priority: 'critica',
      time: '30 min',
      impact: 'critica',
      difficulty: 'media',
      area: 'Imagenes',
    });
  } else if (checked < 6) {
    actions.push({
      action: `Agregar ${6 - checked} fotos mas. ML premia publicaciones con 6+ fotos. Incluir: lifestyle, infografia de medidas y escala`,
      priority: 'alta',
      time: '20 min',
      impact: 'alta',
      difficulty: 'media',
      area: 'Imagenes',
    });
  } else if (score < 80) {
    const unchecked = data.photos.filter((p) => !p.checked);
    if (unchecked.length > 0) {
      actions.push({
        action: `Completar las ${unchecked.length} fotos pendientes del checklist para maximo puntaje visual`,
        priority: 'media',
      time: '15 min',
        impact: 'media',
        difficulty: 'media',
        area: 'Imagenes',
      });
    }
  }

  const mainPhoto = data.photos.find((p) => p.id === 1);
  if (mainPhoto && !mainPhoto.checked) {
    actions.push({
      action: 'Configurar foto principal con fondo blanco puro. Es lo primero que ve el comprador',
      priority: 'critica',
      time: '10 min',
      impact: 'critica',
      difficulty: 'facil',
      area: 'Imagenes',
    });
  }

  return actions;
}

function fromDescription(score: number, data: PublicationFormData): ActionItem[] {
  const actions: ActionItem[] = [];
  const { description } = data;

  if (!description.intro.trim()) {
    actions.push({
      action: 'Escribir una introduccion de 2-3 lineas que explique que es el producto y para quien va dirigido',
      priority: 'critica',
      time: '5 min',
      impact: 'alta',
      difficulty: 'facil',
      area: 'Descripcion',
    });
  }

  const filledFeatures = description.features.filter((f) => f.name.trim() && f.benefit.trim());
  if (filledFeatures.length === 0) {
    actions.push({
      action: 'Agregar minimo 3 beneficios con nombre + beneficio. Ejemplo: "Bateria larga" + "Dura 8 horas sin cargar"',
      priority: 'alta',
      time: '5 min',
      impact: 'alta',
      difficulty: 'facil',
      area: 'Descripcion',
    });
  } else if (filledFeatures.length < 3) {
    actions.push({
      action: `Agregar ${3 - filledFeatures.length} beneficios mas. Los 3 minimos cubren las dudas mas comunes del comprador`,
      priority: 'media',
      time: '3 min',
      impact: 'media',
      difficulty: 'facil',
      area: 'Descripcion',
    });
  }

  const filledFaqs = description.faqs.filter((f) => f.question.trim() && f.answer.trim());
  if (filledFaqs.length === 0) {
    actions.push({
      action: 'Crear 2-3 preguntas frecuentes. Reducen devoluciones y mejoran SEO interno',
      priority: 'alta',
      time: '5 min',
      impact: 'media',
      difficulty: 'facil',
      area: 'Descripcion',
    });
  }

  return actions;
}

function fromSeo(score: number, data: PublicationFormData): ActionItem[] {
  const actions: ActionItem[] = [];
  const { keywords } = data;

  if (!keywords.primary.trim()) {
    actions.push({
      action: 'Definir la keyword principal. Es la palabra mas importante por la que los compradores buscan tu producto',
      priority: 'critica',
      time: '2 min',
      impact: 'critica',
      difficulty: 'facil',
      area: 'SEO',
    });
  }

  const secondaryCount = [keywords.secondary1, keywords.secondary2, keywords.secondary3].filter(
    (k) => k.trim(),
  ).length;

  if (secondaryCount === 0) {
    actions.push({
      action: 'Agregar 2-3 keywords secundarias. Amplian el alcance en busquedas relacionadas',
      priority: 'alta',
      time: '3 min',
      impact: 'alta',
      difficulty: 'facil',
      area: 'SEO',
    });
  } else if (secondaryCount < 3) {
    actions.push({
      action: `Agregar ${3 - secondaryCount} keyword secundaria mas para cubrir mas busquedas`,
      priority: 'media',
      time: '2 min',
      impact: 'media',
      difficulty: 'facil',
      area: 'SEO',
    });
  }

  const longtailCount = [keywords.longtail1, keywords.longtail2].filter((k) => k.trim()).length;
  if (longtailCount === 0) {
    actions.push({
      action: 'Agregar keywords long-tail (frases largas). Capturan busquedas especificas con menor competencia',
      priority: 'media',
      time: '3 min',
      impact: 'media',
      difficulty: 'media',
      area: 'SEO',
    });
  }

  return actions;
}

function fromCopywriting(copy: CopywritingAnalysis): ActionItem[] {
  const actions: ActionItem[] = [];

  const hasCta = copy.strengths.some((s) => s.toLowerCase().includes('cta'));
  if (!hasCta && copy.weaknesses.some((w) => w.toLowerCase().includes('cta'))) {
    actions.push({
      action: 'Agregar un CTA al final de la descripcion: "Agregalo al carrito" o "Envio gratis a todo el pais"',
      priority: 'media',
      time: '1 min',
      impact: 'media',
      difficulty: 'facil',
      area: 'Copywriting',
    });
  }

  const hasTrust = copy.strengths.some((s) => s.toLowerCase().includes('confianza'));
  if (!hasTrust && copy.weaknesses.some((w) => w.toLowerCase().includes('confianza'))) {
    actions.push({
      action: 'Incluir garantia, tipo de envio y MercadoPago en la descripcion para generar confianza',
      priority: 'alta',
      time: '3 min',
      impact: 'alta',
      difficulty: 'facil',
      area: 'Copywriting',
    });
  }

  return actions;
}

function fromImages(images: ImageAnalysis): ActionItem[] {
  const actions: ActionItem[] = [];

  const hasLifestyle = images.weaknesses.some((w) => w.toLowerCase().includes('estilo de vida'));
  if (hasLifestyle) {
    actions.push({
      action: 'Agregar foto lifestyle que muestre el producto en contexto de uso real. Conecta emocionalmente',
      priority: 'media',
      time: '10 min',
      impact: 'media',
      difficulty: 'media',
      area: 'Imagenes',
    });
  }

  const hasInfographic = images.weaknesses.some((w) => w.toLowerCase().includes('infografia'));
  if (hasInfographic) {
    actions.push({
      action: 'Crear infografia con medidas o especificaciones visuales. Reduce devoluciones por expectativa',
      priority: 'media',
      time: '15 min',
      impact: 'media',
      difficulty: 'media',
      area: 'Imagenes',
    });
  }

  return actions;
}

export function generateActionPlan(
  score: ScoreBreakdown,
  formData: PublicationFormData,
  seo: SeoAnalysis,
  copy: CopywritingAnalysis,
  images: ImageAnalysis,
): ActionItem[] {
  const all: ActionItem[] = [
    ...fromTitle(score.title, formData),
    ...fromSpecs(score.specs, formData),
    ...fromPhotos(score.photos, formData),
    ...fromDescription(score.description, formData),
    ...fromSeo(score.seo, formData),
    ...fromCopywriting(copy),
    ...fromImages(images),
  ];

  return sortByImpact(dedupe(all));
}
