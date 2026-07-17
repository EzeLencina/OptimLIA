import type { PublicationFormData, PhotoItem } from '../types';
import { PHOTO_CHECKLIST, TOTAL_PHOTOS } from '../constants';

export interface ImageAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

const CRITICAL_PHOTOS = [1, 2, 3, 4, 9];
const NICE_TO_HAVE = [5, 6, 7, 8, 10];

function getPhotoStatus(photos: PhotoItem[], id: number): PhotoItem | undefined {
  return photos.find((p) => p.id === id);
}

function isCriticalPhotoChecked(photos: PhotoItem[], id: number): boolean {
  const photo = getPhotoStatus(photos, id);
  return photo?.checked === true;
}

function countChecked(photos: PhotoItem[]): number {
  return photos.filter((p) => p.checked).length;
}

function countWithDescription(photos: PhotoItem[]): number {
  return photos.filter((p) => p.checked && p.description.trim().length > 0).length;
}

function analyzeQuantity(checked: number): { ok: boolean; msg: string } {
  if (checked === 0) return { ok: false, msg: 'No hay fotos marcadas. ML permite hasta 10 fotos' };
  if (checked <= 3) return { ok: false, msg: `Solo ${checked}/${TOTAL_PHOTOS} fotos. Las publicaciones con 6+ fotos venden mas` };
  if (checked <= 5) return { ok: true, msg: `${checked}/${TOTAL_PHOTOS} fotos. Buen inicio, ideal llegar a 8+` };
  if (checked <= 8) return { ok: true, msg: `${checked}/${TOTAL_PHOTOS} fotos. Excelente cobertura visual` };
  return { ok: true, msg: `${checked}/${TOTAL_PHOTOS} fotos. Cobertura maxima, ideal para conversion` };
}

function analyzeMainPhoto(photos: PhotoItem[]): { ok: boolean; msg: string } {
  const main = getPhotoStatus(photos, 1);
  if (!main) return { ok: false, msg: 'Foto principal no configurada' };
  if (main.checked) return { ok: true, msg: 'Foto principal con fondo blanco configurada' };
  return { ok: false, msg: 'Foto principal (fondo blanco) sin marcar. Es la mas importante' };
}

function analyzeBackground(photos: PhotoItem[]): { ok: boolean; msg: string } {
  const main = getPhotoStatus(photos, 1);
  if (!main?.checked) return { ok: false, msg: 'Sin foto de fondo blanco. ML requiere fondo blanco para la principal' };
  if (main.description.toLowerCase().includes('fondo blanco') || main.description.toLowerCase().includes('blanco')) {
    return { ok: true, msg: 'Fondo blanco especificado en la foto principal' };
  }
  return { ok: true, msg: 'Foto principal marcada. Verifica que el fondo sea blanco puro' };
}

function analyzeLifestyle(photos: PhotoItem[]): { ok: boolean; msg: string } {
  const photo = getPhotoStatus(photos, 10);
  if (!photo) return { ok: false, msg: 'Foto de estilo de vida no configurada' };
  if (photo.checked) return { ok: true, msg: 'Foto de estilo de vida presente. Conecta emocionalmente con el comprador' };
  return { ok: false, msg: 'Foto de estilo de vida sin marcar. Ayuda a generar deseo' };
}

function analyzeInfographic(photos: PhotoItem[]): { ok: boolean; msg: string } {
  const photo = getPhotoStatus(photos, 9);
  if (!photo) return { ok: false, msg: 'Infografia de medidas no configurada' };
  if (photo.checked) return { ok: true, msg: 'Infografia de medidas presente. Reduce objeciones de tamano' };
  return { ok: false, msg: 'Infografia sin marcar. Las medidas visuales reducen devoluciones' };
}

function analyzeDetail(photos: PhotoItem[]): { ok: boolean; msg: string } {
  const photo = getPhotoStatus(photos, 3);
  if (!photo) return { ok: false, msg: 'Foto de detalle no configurada' };
  if (photo.checked) return { ok: true, msg: 'Foto de detalle anti-objecion presente. Muestra calidad del producto' };
  return { ok: false, msg: 'Foto de detalle sin marcar. Un close-up de material genera confianza' };
}

function analyzeBoxContents(photos: PhotoItem[]): { ok: boolean; msg: string } {
  const photo = getPhotoStatus(photos, 4);
  if (!photo) return { ok: false, msg: 'Foto de contenido de caja no configurada' };
  if (photo.checked) return { ok: true, msg: 'Foto de contenido de caja presente. El comprador sabe que recibe' };
  return { ok: false, msg: 'Foto de contenido sin marcar. Reduce sorpresas y devoluciones' };
}

function analyzeAngles(photos: PhotoItem[]): { ok: boolean; msg: string } {
  const a1 = getPhotoStatus(photos, 5);
  const a2 = getPhotoStatus(photos, 6);
  const checked = [a1, a2].filter((p) => p?.checked).length;

  if (checked === 2) return { ok: true, msg: '2 angulos alternativos presentes. Vision completa del producto' };
  if (checked === 1) return { ok: true, msg: '1 angulo alternativo. Agrega otro para completar la vision' };
  return { ok: false, msg: 'Sin angulos alternativos. El comprador solo ve una perspectiva' };
}

function analyzeDescriptions(photos: PhotoItem[]): { ok: boolean; msg: string } {
  const withDesc = countWithDescription(photos);
  const checked = countChecked(photos);
  if (checked === 0) return { ok: false, msg: 'Sin fotos para evaluar descripciones' };
  if (withDesc === checked) return { ok: true, msg: `Todas las ${checked} fotos tienen descripcion. Buena practica` };
  if (withDesc >= checked / 2) return { ok: true, msg: `${withDesc}/${checked} fotos con descripcion. Mejora las que faltan` };
  return { ok: false, msg: `Solo ${withDesc}/${checked} fotos con descripcion. Agrega contexto a cada imagen` };
}

function analyzeUsagePhoto(photos: PhotoItem[]): { ok: boolean; msg: string } {
  const photo = getPhotoStatus(photos, 2);
  if (!photo) return { ok: false, msg: 'Foto de uso real no configurada' };
  if (photo.checked) return { ok: true, msg: 'Foto de uso real presente. Muestra el producto en contexto' };
  return { ok: false, msg: 'Foto de uso real sin marcar. Ayuda al comprador a visualizar el producto' };
}

function analyzeScalePhoto(photos: PhotoItem[]): { ok: boolean; msg: string } {
  const photo = getPhotoStatus(photos, 7);
  if (!photo) return { ok: false, msg: 'Foto de escala no configurada' };
  if (photo.checked) return { ok: true, msg: 'Foto de escala presente. El comprador dimensiona el tamano real' };
  return { ok: false, msg: 'Foto de escala sin marcar. Reduce sorpresas por tamano' };
}

export function analyzeImages(formData: PublicationFormData): ImageAnalysis {
  const { photos } = formData;
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  const checked = countChecked(photos);

  const quantity = analyzeQuantity(checked);
  if (quantity.ok) strengths.push(quantity.msg);
  else weaknesses.push(quantity.msg);

  const mainPhoto = analyzeMainPhoto(photos);
  if (mainPhoto.ok) strengths.push(mainPhoto.msg);
  else weaknesses.push(mainPhoto.msg);

  const background = analyzeBackground(photos);
  if (background.ok) strengths.push(background.msg);
  else weaknesses.push(background.msg);

  const lifestyle = analyzeLifestyle(photos);
  if (lifestyle.ok) strengths.push(lifestyle.msg);
  else weaknesses.push(lifestyle.msg);

  const infographic = analyzeInfographic(photos);
  if (infographic.ok) strengths.push(infographic.msg);
  else weaknesses.push(infographic.msg);

  const detail = analyzeDetail(photos);
  if (detail.ok) strengths.push(detail.msg);
  else weaknesses.push(detail.msg);

  const boxContents = analyzeBoxContents(photos);
  if (boxContents.ok) strengths.push(boxContents.msg);
  else weaknesses.push(boxContents.msg);

  const angles = analyzeAngles(photos);
  if (angles.ok) strengths.push(angles.msg);
  else weaknesses.push(angles.msg);

  const usage = analyzeUsagePhoto(photos);
  if (usage.ok) strengths.push(usage.msg);
  else weaknesses.push(usage.msg);

  const scale = analyzeScalePhoto(photos);
  if (scale.ok) strengths.push(scale.msg);
  else weaknesses.push(scale.msg);

  const descriptions = analyzeDescriptions(photos);
  if (descriptions.ok) strengths.push(descriptions.msg);
  else weaknesses.push(descriptions.msg);

  if (checked < 6) {
    recommendations.push('ML recomienda minimo 6 fotos. Agrega angulos alternativos y detalles');
  }

  if (!isCriticalPhotoChecked(photos, 9)) {
    recommendations.push('Agrega una infografia con medidas. Reduce devoluciones por expectativa de tamano');
  }

  if (!isCriticalPhotoChecked(photos, 10)) {
    recommendations.push('Una foto lifestyle genera conexion emocional y mejora la tasa de conversion');
  }

  const uncheckedCritical = CRITICAL_PHOTOS.filter((id) => !isCriticalPhotoChecked(photos, id));
  if (uncheckedCritical.length > 0) {
    const labels = uncheckedCritical.map((id) => {
      const item = PHOTO_CHECKLIST.find((p) => p.id === id);
      return item?.title || `Foto #${id}`;
    });
    recommendations.push(`Fotos criticas pendientes: ${labels.join(', ')}`);
  }

  if (checked >= 8 && strengths.length >= 6) {
    recommendations.push('Excelente cobertura visual. Verifica calidad de resolucion (minimo 1200x1200px)');
  }

  return { strengths, weaknesses, recommendations };
}
