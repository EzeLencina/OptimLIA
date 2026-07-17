import type { PublicationFormData, GeneratedOutput } from '../types';

export interface SeoAnalysis {
  strengths: string[];
  weaknesses: string[];
  missing_keywords: string[];
  repeated_words: string[];
  recommendations: string[];
}

const STOP_WORDS_ES = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
  'de', 'del', 'al', 'a', 'en', 'con', 'por', 'para',
  'que', 'es', 'se', 'su', 'sus', 'y', 'o', 'e',
  'no', 'más', 'muy', 'como', 'este', 'esta', 'estos', 'estas',
  'sin', 'sobre', 'entre', 'hasta', 'desde', 'todo', 'cada',
  'tiene', 'puede', 'ser', 'estar', 'haber', 'hacer',
  'lo', 'le', 'les', 'me', 'te', 'nos', 'mi', 'tu',
  'otro', 'otra', 'otros', 'otras', 'mismo', 'misma',
  'cuando', 'donde', 'pero', 'porque', 'si', 'tan',
  'son', 'fue', 'ser', 'hay', 'dan', 'va', 'vez',
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getWords(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter((w) => w.length > 1 && !STOP_WORDS_ES.has(w));
}

function countOccurrences(words: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const w of words) {
    map.set(w, (map.get(w) || 0) + 1);
  }
  return map;
}

function hasWord(text: string, word: string): boolean {
  return normalize(text).includes(normalize(word));
}

function analyzeTitleLength(title: string): { ok: boolean; msg: string } {
  const len = title.length;
  if (len === 0) return { ok: false, msg: 'El titulo esta vacio. Completalo para que la publicacion sea encontrada en busquedas.' };
  if (len <= 40) return { ok: false, msg: `Titulo muy corto (${len}/60 caracteres). Suma marca, modelo y atributo clave para aprovechar el espacio y subir en el ranking de MercadoLibre.` };
  if (len <= 55) return { ok: true, msg: `Buena longitud (${len}/60 caracteres). Podrias sumar 1 o 2 palabras mas (uso o beneficio) para captar mas busquedas.` };
  if (len <= 60) return { ok: true, msg: `Longitud optima (${len}/60 caracteres). Aprovechas todo el espacio para incluir palabras que el comprador busca.` };
  return { ok: false, msg: `Titulo excede el limite (${len}/60 caracteres). MercadoLibre recorta el exceso y pierdes palabras clave visibles. Acortalo.` };
}

function analyzeBrandInTitle(brand: string, title: string): { ok: boolean; msg: string } {
  if (!brand.trim()) return { ok: false, msg: 'No especificaste la marca. Es el filtro de busqueda mas usado por los compradores.' };
  if (hasWord(title, brand)) return { ok: true, msg: `La marca "${brand}" aparece en el titulo. Esto atrae a quien busca esa marca y mejora el posicionamiento.` };
  return { ok: false, msg: `La marca "${brand}" no aparece en el titulo. Incluirla suma visibilidad y filtros de busqueda.` };
}

function analyzeModelInTitle(model: string, title: string): { ok: boolean; msg: string } {
  if (!model.trim()) return { ok: false, msg: 'No especificaste el modelo. Ayuda a diferenciar tu producto de otros similares.' };
  if (hasWord(title, model)) return { ok: true, msg: `El modelo "${model}" aparece en el titulo. Facilita que te encuentren por modelo exacto.` };
  return { ok: false, msg: `El modelo "${model}" no aparece en el titulo. Agregarlo reduce dudas y mejoras la conversion.` };
}

function analyzeKeywordInTitle(keyword: string, title: string): { found: boolean; msg: string } {
  if (!keyword.trim()) return { found: true, msg: '' };
  if (hasWord(title, keyword)) return { found: true, msg: `"${keyword}" detectada en el titulo. Posicionas para esa busqueda.` };
  return { found: false, msg: `"${keyword}" no se encuentra en el titulo. Muévela al titulo para captar esa demanda.` };
}

function analyzeDescription(descriptionHtml: string): { ok: boolean; msg: string } {
  const text = descriptionHtml.replace(/<[^>]*>/g, '');
  const len = text.length;
  if (len === 0) return { ok: false, msg: 'La descripcion esta vacia. Una descripcion bien hecha convence y cierra la venta.' };
  if (len < 100) return { ok: false, msg: `Descripcion muy corta (${len} caracteres). MercadoLibre recomienda al menos 200 para rankear y responder dudas.` };
  if (len < 200) return { ok: false, msg: `Descripcion breve (${len} caracteres). Llega a 200+ sumando beneficios y preguntas frecuentes.` };
  return { ok: true, msg: `Descripcion con buena longitud (${len} caracteres). Tienes contenido para informar y persuadir al comprador.` };
}

function analyzeDescriptionStructure(descriptionHtml: string): { ok: boolean; msg: string } {
  const hasBold = /<strong/.test(descriptionHtml);
  const hasBreaks = /<br\s*\/?>/.test(descriptionHtml) || /\n/.test(descriptionHtml.replace(/<[^>]*>/g, ''));
  const hasListItems = /<li/.test(descriptionHtml);

  const features = [hasBold, hasBreaks || hasListItems].filter(Boolean).length;
  if (features >= 2) return { ok: true, msg: 'Buena estructura con negritas y secciones separadas. Se lee rapido y resalta lo importante.' };
  if (features === 1) return { ok: false, msg: 'Estructura basica. Agrega negritas en los titulos y separa secciones para que se escanee mejor.' };
  return { ok: false, msg: 'Descripcion sin formato. Usa negritas y saltos de linea para que el comprador encuentre lo clave al instante.' };
}

function analyzeSearchIntent(title: string, category: string): { ok: boolean; msg: string } {
  if (!category.trim()) return { ok: false, msg: 'Sin categoria definida. La categoria correcta es clave para aparecer en las busquedas relevantes.' };

  const titleWords = getWords(title);
  const catWords = getWords(category);
  const overlap = catWords.filter((cw) => titleWords.some((tw) => tw === cw || tw.includes(cw) || cw.includes(tw)));

  if (overlap.length > 0) return { ok: true, msg: `Coincidencia con la categoria: "${overlap.join('", "')}". Apareces donde el comprador realmente busca.` };
  if (catWords.length <= 1) return { ok: true, msg: 'Categoria generica, coherente con el titulo.' };
  return { ok: false, msg: 'El titulo no refleja terminos de la categoria. Incluye palabras clave de la categoria para alinearte a la intencion de busqueda.' };
}

export function analyzeSeo(
  formData: PublicationFormData,
  output: GeneratedOutput,
): SeoAnalysis {
  const { title: titleGen } = output;
  const { product, keywords, description } = formData;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const missing_keywords: string[] = [];
  const repeated_words: string[] = [];
  const recommendations: string[] = [];

  const titleAnalysis = analyzeTitleLength(titleGen);
  if (titleAnalysis.ok) strengths.push(titleAnalysis.msg);
  else weaknesses.push(titleAnalysis.msg);

  const brandAnalysis = analyzeBrandInTitle(product.brand, titleGen);
  if (brandAnalysis.ok) strengths.push(brandAnalysis.msg);
  else weaknesses.push(brandAnalysis.msg);

  const modelAnalysis = analyzeModelInTitle(product.model, titleGen);
  if (modelAnalysis.ok) strengths.push(modelAnalysis.msg);
  else weaknesses.push(modelAnalysis.msg);

  const keywordChecks = [
    { kw: keywords.primary, label: 'keyword principal' },
    { kw: keywords.secondary1, label: 'keyword secundaria 1' },
    { kw: keywords.secondary2, label: 'keyword secundaria 2' },
    { kw: keywords.secondary3, label: 'keyword secundaria 3' },
  ];

  for (const { kw, label } of keywordChecks) {
    if (!kw.trim()) continue;
    const { found, msg } = analyzeKeywordInTitle(kw, titleGen);
    if (found) strengths.push(msg);
    else {
      missing_keywords.push(kw);
      weaknesses.push(`${label} "${kw}" no aparece en el titulo`);
    }
  }

  const descAnalysis = analyzeDescription(descriptionHtml(output.descriptionHtml));
  if (descAnalysis.ok) strengths.push(descAnalysis.msg);
  else weaknesses.push(descAnalysis.msg);

  const structAnalysis = analyzeDescriptionStructure(output.descriptionHtml);
  if (structAnalysis.ok) strengths.push(structAnalysis.msg);
  else weaknesses.push(structAnalysis.msg);

  const intentAnalysis = analyzeSearchIntent(titleGen, product.category);
  if (intentAnalysis.ok) strengths.push(intentAnalysis.msg);
  else weaknesses.push(intentAnalysis.msg);

  const titleWords = getWords(titleGen);
  const wordCount = countOccurrences(titleWords);
  for (const [word, count] of wordCount) {
    if (count >= 2) {
      repeated_words.push(word);
      weaknesses.push(`Palabra repetida en titulo: "${word}" (${count} veces)`);
    }
  }

  if (!product.name.trim()) {
    weaknesses.push('Nombre del producto vacio');
    recommendations.push('Completa el nombre del producto con su nombre comercial o generico para que te encuentren en busquedas.');
  }

  if (!product.brand.trim()) {
    missing_keywords.push('marca');
    recommendations.push('Agrega la marca del producto. Mejora el filtro de busqueda por marca y suma confianza.');
  }

  if (titleGen.length < 50) {
    recommendations.push('Aprovecha los 60 caracteres del titulo con palabras clave que el comprador usa al buscar.');
  }

  const descPlain = descriptionHtml(output.descriptionHtml).replace(/<[^>]*>/g, '');
  if (descPlain.length < 300) {
    recommendations.push('Agrega mas contenido a la descripcion (ideal 300+ caracteres) para cubrir dudas y rankear mejor.');
  }

  if (keywords.longtail1.trim() || keywords.longtail2.trim()) {
    const longtails = [keywords.longtail1, keywords.longtail2].filter((l) => l.trim());
    const inDesc = longtails.filter((lt) => hasWord(descPlain, lt));
    if (inDesc.length === 0) {
      recommendations.push('Las keywords long-tail no aparecen en la descripcion. Incluirlas capta busquedas especificas con menos competencia.');
    }
  } else {
    recommendations.push('Agrega keywords long-tail (frases de 3 o mas palabras) para capturar busquedas especificas de cola larga.');
  }

  if (!formData.pricing.shippingType || formData.pricing.shippingType === 'paid') {
    recommendations.push('El envio gratis posiciona mejor en MercadoLibre y reduce la objecion de precio. Considera ofrecerlo.');
  }

  if (strengths.length === 0) {
    recommendations.push('Revisa todos los campos del formulario para generar un titulo y descripcion optimizados que vendan mas.');
  }

  return { strengths, weaknesses, missing_keywords, repeated_words, recommendations };
}

function descriptionHtml(html: string): string {
  return html;
}
