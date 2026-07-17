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
      action: 'Completa el nombre del producto en el campo "Nombre". Ejemplo: "Auriculares Bluetooth Inalambricos". Sin esto, nadie te encuentra.',
      priority: 'critica',
      time: '1 min',
      impact: 'critica',
      difficulty: 'facil',
      area: 'Titulo',
    });
  }

  if (!product.brand.trim()) {
    actions.push({
      action: 'Agrega la marca del producto. Es el filtro de busqueda mas usado en MercadoLibre y suma confianza.',
      priority: 'critica',
      time: '1 min',
      impact: 'critica',
      difficulty: 'facil',
      area: 'Titulo',
    });
  }

  if (!product.category.trim()) {
    actions.push({
      action: 'Selecciona la categoria del producto. Sin categoria correcta, la publicacion no aparece en las busquedas filtradas.',
      priority: 'critica',
      time: '1 min',
      impact: 'alta',
      difficulty: 'facil',
      area: 'Titulo',
    });
  }

  if (score < 50 && product.name.trim() && product.brand.trim()) {
    actions.push({
      action: 'Agrega modelo, atributo o uso al titulo para completar los 60 caracteres y captar mas busquedas.',
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
      action: `Completa la ficha tecnica: faltan ${missing.join(', ')}. Estos campos mejoran el filtrado y la confianza en busquedas.`,
      priority: 'alta',
      time: '5 min',
      impact: 'alta',
      difficulty: 'facil',
      area: 'Ficha Tecnica',
    });
  } else if (missing.length > 0 && score < 80) {
    actions.push({
      action: `Agrega los campos faltantes en la ficha tecnica: ${missing.join(', ')} para un perfil mas completo.`,
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
      action: 'Sube minimo 6 fotos: principal con fondo blanco, uso real, detalle, contenido de caja, 2 angulos e infografia. Es lo que mas convierte.',
      priority: 'critica',
      time: '30 min',
      impact: 'critica',
      difficulty: 'media',
      area: 'Imagenes',
    });
  } else if (checked < 6) {
    actions.push({
      action: `Agrega ${6 - checked} fotos mas. ML premia publicaciones con 6+ fotos. Incluye: lifestyle, infografia de medidas y escala.`,
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
        action: `Completa las ${unchecked.length} fotos pendientes del checklist para lograr la cobertura visual maxima.`,
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
      action: 'Configura la foto principal con fondo blanco puro. Es lo primero que ve el comprador y define el click.',
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
      action: 'Escribe una introduccion de 2 o 3 lineas que explique que es el producto y para quien va dirigido. Engancha desde el inicio.',
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
      action: 'Agrega minimo 3 beneficios con nombre + beneficio. Ejemplo: "Bateria larga" + "Dura 8 horas sin cargar". Venden por ti.',
      priority: 'alta',
      time: '5 min',
      impact: 'alta',
      difficulty: 'facil',
      area: 'Descripcion',
    });
  } else if (filledFeatures.length < 3) {
    actions.push({
      action: `Agrega ${3 - filledFeatures.length} beneficios mas. Los 3 minimos cubren las dudas mas comunes del comprador.`,
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
      action: 'Crea 2 o 3 preguntas frecuentes. Reducen devoluciones y mejoran el SEO interno de la publicacion.',
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
      action: 'Define la keyword principal. Es la palabra mas importante por la que los compradores buscan tu producto.',
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
      action: 'Agrega 2 o 3 keywords secundarias. Amplian el alcance en busquedas relacionadas con tu producto.',
      priority: 'alta',
      time: '3 min',
      impact: 'alta',
      difficulty: 'facil',
      area: 'SEO',
    });
  } else if (secondaryCount < 3) {
    actions.push({
      action: `Agrega ${3 - secondaryCount} keyword secundaria mas para cubrir mas busquedas y competir mejor.`,
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
      action: 'Agrega keywords long-tail (frases largas). Capturan busquedas especificas con menos competencia y mas intencion de compra.',
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
      action: 'Cierra la descripcion con un CTA claro: "Agregalo al carrito" o "Envio gratis a todo el pais". Empuja la decision.',
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
      action: 'Incluye garantia, tipo de envio y MercadoPago en la descripcion para generar confianza y quitar el miedo a comprar.',
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
      action: 'Agrega una foto lifestyle que muestre el producto en contexto de uso real. Conecta emocionalmente y dispara la compra.',
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
      action: 'Crea una infografia con medidas o especificaciones visuales. Reduce devoluciones por expectativa de tamano.',
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
