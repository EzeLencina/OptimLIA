import type { PublicationFormData, GeneratedOutput } from '../types';

export interface CopywritingAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

const CTA_KEYWORDS = [
  'compra', 'compralo', 'adquiere', 'agrega al carrito', 'sumalo',
  'llevalo', 'no esperes', 'antes de que', 'disponible', 'stock limitado',
  'ultima unidad', 'envio gratis', 'ahora', 'hoy', 'no dejes pasar',
];

const TRUST_KEYWORDS = [
  'garantia', 'devolucion', 'envio', ' Mercadolibre', 'mercado pago',
  'vendedor oficial', 'envio full', ' FULL', 'full', 'calificado',
  'satisfaccion', 'seguro', 'proteccion', 'confianza',
];

const OBJECTION_HANDLERS = [
  'si no te gusta', 'devolucion', 'garantia', 'sin compromiso',
  'pregunta', 'duda', 'consultas', 'asesoramiento', 'soporte',
  'incluye', 'viene con', 'accesorios', 'caja original',
];

function strip(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function sentences(text: string): string[] {
  return text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 0);
}

function avgSentenceLength(text: string): number {
  const sents = sentences(text);
  if (sents.length === 0) return 0;
  const totalWords = sents.reduce((acc, s) => acc + s.split(' ').length, 0);
  return totalWords / sents.length;
}

function countMatches(text: string, keywords: string[]): string[] {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw.toLowerCase()));
}

function hasListStructure(html: string): boolean {
  return /<li/.test(html) || /<ul/.test(html) || /<ol/.test(html);
}

function hasBoldText(html: string): boolean {
  return /<strong/.test(html) || /<b/.test(html);
}

function analyzeClarity(text: string): { ok: boolean; msg: string } {
  const avgLen = avgSentenceLength(text);
  if (text.length === 0) return { ok: false, msg: 'La descripcion esta vacia' };
  if (avgLen > 30) return { ok: false, msg: `Oraciones demasiado largas (promedio ${Math.round(avgLen)} palabras). Divide en frases mas cortas` };
  if (avgLen > 20) return { ok: true, msg: `Longitud de oraciones aceptable (promedio ${Math.round(avgLen)} palabras)` };
  if (avgLen > 0) return { ok: true, msg: `Oraciones claras y directas (promedio ${Math.round(avgLen)} palabras)` };
  return { ok: false, msg: 'No se detectaron oraciones en la descripcion' };
}

function analyzeScannability(html: string, text: string): { ok: boolean; msg: string } {
  const features = [
    hasBoldText(html),
    hasListStructure(html),
    text.includes('\n'),
    /<br/.test(html),
  ].filter(Boolean).length;

  if (features >= 3) return { ok: true, msg: 'Excelente escaneabilidad: negritas, listas y saltos de linea' };
  if (features === 2) return { ok: true, msg: 'Buena escaneabilidad con algunos elementos visuales' };
  if (features === 1) return { ok: false, msg: 'Escaneabilidad basica. Agrega negritas, listas o saltos de linea' };
  return { ok: false, msg: 'Texto sin formato. Es dificil de escanear rapidamente' };
}

function analyzeBenefits(formData: PublicationFormData): { ok: boolean; msg: string } {
  const features = formData.description.features.filter((f) => f.name.trim() || f.benefit.trim());
  if (features.length === 0) return { ok: false, msg: 'No se destacaron beneficios del producto' };
  if (features.length >= 3) return { ok: true, msg: `${features.length} beneficios destacados. Comunica valor concreto al comprador` };
  return { ok: true, msg: `${features.length} beneficio(s) destacado(s). Agrega mas para reforzar el valor` };
}

function analyzeFeatures(html: string, formData: PublicationFormData): { ok: boolean; msg: string } {
  const hasSpecsSection = html.toLowerCase().includes('ficha tecnica') || html.toLowerCase().includes('caracteristicas');
  const hasFeaturesInDesc = formData.description.features.some((f) => f.name.trim());

  if (hasSpecsSection && hasFeaturesInDesc) return { ok: true, msg: 'Caracteristicas presentes en ficha tecnica y en descripcion' };
  if (hasSpecsSection) return { ok: true, msg: 'Caracteristicas en la ficha tecnica. Considera incluirlas tambien en la descripcion' };
  if (hasFeaturesInDesc) return { ok: true, msg: 'Caracteristicas en la descripcion. La ficha tecnica complementa la info' };
  return { ok: false, msg: 'No se detectan caracteristicas ni ficha tecnica' };
}

function analyzeCTA(text: string): { ok: boolean; msg: string } {
  const found = countMatches(text, CTA_KEYWORDS);
  if (found.length >= 2) return { ok: true, msg: `CTA efectivos detectados: "${found.slice(0, 3).join('", "')}"` };
  if (found.length === 1) return { ok: true, msg: `CTA presente: "${found[0]}". Agrega uno o dos mas para reforzar la urgencia` };
  return { ok: false, msg: 'Sin llamadas a la accion (CTA). Agrega frases que inviten a comprar' };
}

function analyzeTrust(text: string): { ok: boolean; msg: string } {
  const found = countMatches(text, TRUST_KEYWORDS);
  if (found.length >= 3) return { ok: true, msg: `Elementos de confianza: "${found.slice(0, 3).join('", "')}"` };
  if (found.length >= 1) return { ok: true, msg: `Algunos elementos de confianza: "${found.join('", "')}". Agrega garantia o envio` };
  return { ok: false, msg: 'Sin elementos de confianza. Incluye garantia, envio o MercadoPago' };
}

function analyzeObjections(text: string, formData: PublicationFormData): { ok: boolean; msg: string } {
  const found = countMatches(text, OBJECTION_HANDLERS);
  const hasFaqs = formData.description.faqs.some((f) => f.question.trim() || f.answer.trim());
  const total = found.length + (hasFaqs ? 2 : 0);

  if (total >= 3) return { ok: true, msg: 'Buen manejo de objeciones con FAQ y respuestas preventivas' };
  if (total >= 1) return { ok: true, msg: 'Algunas objeciones abordadas. Agrega mas FAQs para cubrir dudas comunes' };
  return { ok: false, msg: 'Sin manejo de objeciones. Agrega una seccion de preguntas frecuentes' };
}

function analyzeSeoInDesc(text: string, formData: PublicationFormData): { ok: boolean; msg: string } {
  const keywords = [
    formData.keywords.primary,
    formData.keywords.secondary1,
    formData.keywords.secondary2,
    formData.keywords.secondary3,
  ].filter((k) => k.trim());

  const lower = text.toLowerCase();
  const found = keywords.filter((kw) => lower.includes(kw.toLowerCase()));
  const missing = keywords.filter((kw) => !lower.includes(kw.toLowerCase()));

  if (missing.length === 0 && keywords.length > 0) return { ok: true, msg: `Todas las keywords (${keywords.length}) presentes en la descripcion` };
  if (found.length > 0) return { ok: true, msg: `${found.length}/${keywords.length} keywords en la descripcion. Faltan: "${missing.join('", "')}"` };
  if (keywords.length > 0) return { ok: false, msg: `Ninguna keyword aparece en la descripcion. Keywords definidas: "${keywords.join('", "')}"` };
  return { ok: false, msg: 'Sin keywords definidas en el paso de SEO' };
}

export function analyzeCopywriting(
  formData: PublicationFormData,
  output: GeneratedOutput,
): CopywritingAnalysis {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  const descText = strip(output.descriptionHtml);
  const descHtml = output.descriptionHtml;

  const clarity = analyzeClarity(descText);
  if (clarity.ok) strengths.push(clarity.msg);
  else weaknesses.push(clarity.msg);

  const scannability = analyzeScannability(descHtml, descText);
  if (scannability.ok) strengths.push(scannability.msg);
  else weaknesses.push(scannability.msg);

  const benefits = analyzeBenefits(formData);
  if (benefits.ok) strengths.push(benefits.msg);
  else weaknesses.push(benefits.msg);

  const features = analyzeFeatures(descHtml, formData);
  if (features.ok) strengths.push(features.msg);
  else weaknesses.push(features.msg);

  const cta = analyzeCTA(descText);
  if (cta.ok) strengths.push(cta.msg);
  else weaknesses.push(cta.msg);

  const trust = analyzeTrust(descText);
  if (trust.ok) strengths.push(trust.msg);
  else weaknesses.push(trust.msg);

  const objections = analyzeObjections(descText, formData);
  if (objections.ok) strengths.push(objections.msg);
  else weaknesses.push(objections.msg);

  const seoInDesc = analyzeSeoInDesc(descText, formData);
  if (seoInDesc.ok) strengths.push(seoInDesc.msg);
  else weaknesses.push(seoInDesc.msg);

  if (descText.length < 100) {
    recommendations.push('Agrega mas contenido a la descripcion (minimo 200 caracteres para ML)');
  }

  if (!cta.ok) {
    recommendations.push('Agrega un CTA al final: "Agregalo al carrito ahora" o "Envio gratis a todo el pais"');
  }

  if (!trust.ok) {
    recommendations.push('Incluye garantia, tipo de envio y MercadoPago para generar confianza');
  }

  if (!formData.description.faqs.some((f) => f.question.trim())) {
    recommendations.push('Agrega 2-3 preguntas frecuentes para responder dudas y mejorar SEO');
  }

  if (!hasBoldText(descHtml)) {
    recommendations.push('Usa negritas en los titulos de cada seccion para mejorar la lectura');
  }

  if (descText.length >= 200 && strengths.length >= 4) {
    recommendations.push('Tu descripcion tiene buena estructura. Revisa el score para ver si falta algo');
  }

  return { strengths, weaknesses, recommendations };
}
