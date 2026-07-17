import type { PublicationFormData, GeneratedOutput } from '../types';
import { CONDITION_LABELS } from '../constants';
import { generateTitle } from './title.service';

function buildSpecsText(data: PublicationFormData): string {
  const lines: string[] = ['FICHA TECNICA:'];

  if (data.product.ean) lines.push(`- Codigo universal: ${data.product.ean}`);
  lines.push(`- Marca: ${data.product.brand}`);
  lines.push(`- Modelo: ${data.product.model}`);
  lines.push(`- Condicion: ${CONDITION_LABELS[data.product.condition]}`);

  const specFields: Array<[string, string]> = [
    ['Material', data.specs.material],
    ['Color', data.specs.color],
    ['Dimensiones', data.specs.dimensions],
    ['Pais de origen', data.specs.origin],
    ['Garantia', data.specs.warranty],
  ];

  specFields.forEach(([label, value]) => {
    if (value) lines.push(`- ${label}: ${value}`);
  });

  if (data.specs.weight) {
    lines.push(`- Peso: ${data.specs.weight} ${data.specs.weightUnit}`);
  }

  data.additionalSpecs.forEach((spec) => {
    if (spec.name && spec.value) {
      lines.push(`- ${spec.name}: ${spec.value}`);
    }
  });

  return lines.join('\n');
}

function buildDescriptionHtml(data: PublicationFormData, suggestedPrice: number): string {
  const sections: string[] = [];

  const title = generateTitle(data.product);
  sections.push(`<strong>${title}</strong>`);
  sections.push('');

  if (data.description.intro) {
    sections.push(data.description.intro);
    sections.push('');
  }

  if (data.description.problem) {
    sections.push(data.description.problem);
    sections.push('');
  }

  const filledBoxItems = data.description.boxContents.filter((item) => item.trim());
  if (filledBoxItems.length > 0) {
    sections.push('<strong>QUE INCLUYE LA CAJA:</strong>');
    filledBoxItems.forEach((item) => sections.push(`- ${item}`));
    sections.push('');
  }

  const filledFeatures = data.description.features.filter(
    (f) => f.name.trim() && f.benefit.trim()
  );
  if (filledFeatures.length > 0) {
    sections.push('<strong>CARACTERISTICAS PRINCIPALES:</strong>');
    filledFeatures.forEach((f) => sections.push(`- ${f.name}: ${f.benefit}`));
    sections.push('');
  }

  sections.push('<strong>ESPECIFICACIONES TECNICAS:</strong>');
  if (data.specs.weight) sections.push(`- Peso: ${data.specs.weight} ${data.specs.weightUnit}`);
  if (data.specs.dimensions) sections.push(`- Dimensiones: ${data.specs.dimensions}`);
  if (data.specs.material) sections.push(`- Material: ${data.specs.material}`);
  if (data.specs.warranty) sections.push(`- Garantia: ${data.specs.warranty}`);
  sections.push('');

  const filledFaqs = data.description.faqs.filter(
    (f) => f.question.trim() && f.answer.trim()
  );
  if (filledFaqs.length > 0) {
    sections.push('<strong>PREGUNTAS FRECUENTES:</strong>');
    filledFaqs.forEach((f) => sections.push(`- ${f.question} → ${f.answer}`));
    sections.push('');
  }

  if (data.description.shipping) {
    sections.push('<strong>INFORMACION DE ENVIO Y GARANTIA:</strong>');
    sections.push(data.description.shipping);
    sections.push('');
  }

  sections.push('<strong>CONDICIONES DE VENTA:</strong>');
  sections.push(`- Precio: $${suggestedPrice.toLocaleString('es-AR')}`);
  sections.push(`- Tipo de publicacion: ${data.pricing.publicationType === 'premium' ? 'Premium' : 'Clasica'}`);
  sections.push(`- Cuotas: ${data.pricing.installments} cuotas sin interes`);
  sections.push(`- Envio: ${data.pricing.shippingType.toUpperCase()}`);
  sections.push(`- Stock: ${data.pricing.stock} unidades`);

  return sections.join('\n');
}

function buildKeywordsText(data: PublicationFormData): string {
  const lines: string[] = ['PALABRAS CLAVE UTILIZADAS:'];
  const { keywords } = data;

  if (keywords.primary) lines.push(`- Principal: ${keywords.primary}`);

  const secondary = [keywords.secondary1, keywords.secondary2, keywords.secondary3].filter(
    (k) => k.trim()
  );
  if (secondary.length) lines.push(`- Secundarias: ${secondary.join(', ')}`);

  const longtails = [keywords.longtail1, keywords.longtail2].filter((k) => k.trim());
  if (longtails.length) lines.push(`- Long-tail en descripcion: ${longtails.join(', ')}`);

  return lines.join('\n');
}

export function generateOutput(data: PublicationFormData, suggestedPrice: number = 0): GeneratedOutput {
  const title = generateTitle(data.product);
  const categoryLabel = data.product.category || 'Sin categoria';
  const subcategory = data.product.subcategory;
  const category = subcategory ? `${categoryLabel} > ${subcategory}` : categoryLabel;
  const specsText = buildSpecsText(data);
  const descriptionHtml = buildDescriptionHtml(data, suggestedPrice);
  const keywordsText = buildKeywordsText(data);

  const fullText = [
    `TITULO (${title.length}/60 caracteres):`,
    title,
    '',
    'CATEGORIA:',
    category,
    '',
    specsText,
    '',
    'DESCRIPCION:',
    descriptionHtml.replace(/<strong>/g, '').replace(/<\/strong>/g, ''),
    '',
    keywordsText,
  ].join('\n');

  return { title, category, specsText, descriptionHtml, keywordsText, fullText };
}
