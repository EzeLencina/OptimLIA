import type { PublicationFormData, ScoreBreakdown } from '../types';
import { TOTAL_PHOTOS, SCORE_WEIGHTS } from '../constants';

function calculateTitleScore(data: PublicationFormData): number {
  let score = 0;
  const { product } = data;

  if (product.name) score += 30;
  if (product.brand) score += 25;
  if (product.category) score += 20;
  if (product.condition) score += 10;
  if ((product.name + ' ' + product.brand).trim().length > 15) score += 15;

  return score;
}

function calculateSpecsScore(data: PublicationFormData): number {
  const fields = [
    data.specs.brand,
    data.specs.model,
    data.specs.material,
    data.specs.color,
    data.specs.weight,
    data.specs.dimensions,
    data.specs.warranty,
  ];

  const filled = fields.filter((f) => f.trim()).length;
  return Math.round((filled / fields.length) * 100);
}

function calculatePhotosScore(data: PublicationFormData): number {
  const checked = data.photos.filter((p) => p.checked).length;
  return Math.round((checked / TOTAL_PHOTOS) * 100);
}

function calculateDescriptionScore(data: PublicationFormData): number {
  let score = 0;

  if (data.description.intro) score += 40;

  const filledFeatures = data.description.features.filter(
    (f) => f.name.trim() && f.benefit.trim()
  ).length;
  score += Math.min(30, filledFeatures * 10);

  const filledFaqs = data.description.faqs.filter(
    (f) => f.question.trim() && f.answer.trim()
  ).length;
  score += Math.min(30, filledFaqs * 10);

  return Math.min(100, score);
}

function calculateSeoScore(data: PublicationFormData): number {
  let score = 0;
  const { keywords } = data;

  if (keywords.primary) score += 40;

  const secondaryCount = [keywords.secondary1, keywords.secondary2, keywords.secondary3].filter(
    (k) => k.trim()
  ).length;
  score += Math.min(40, secondaryCount * 15);

  const longtailCount = [keywords.longtail1, keywords.longtail2].filter(
    (k) => k.trim()
  ).length;
  score += longtailCount * 10;

  return Math.min(100, score);
}

export function calculateScore(data: PublicationFormData): ScoreBreakdown {
  const title = calculateTitleScore(data);
  const specs = calculateSpecsScore(data);
  const photos = calculatePhotosScore(data);
  const description = calculateDescriptionScore(data);
  const seo = calculateSeoScore(data);

  const total = Math.round(
    title * SCORE_WEIGHTS.title +
    specs * SCORE_WEIGHTS.specs +
    photos * SCORE_WEIGHTS.photos +
    description * SCORE_WEIGHTS.description +
    seo * SCORE_WEIGHTS.seo
  );

  return { title, specs, photos, description, seo, total };
}
