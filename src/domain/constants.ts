import type { PhotoItem } from './types';

export const ML_CATEGORIES = [
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'electrohogar', label: 'Electrohogar' },
  { value: 'belleza', label: 'Belleza y Cuidado Personal' },
  { value: 'deportes', label: 'Deportes y Fitness' },
  { value: 'hogar', label: 'Hogar y Muebles' },
  { value: 'herramientas', label: 'Herramientas' },
  { value: 'vehiculos', label: 'Vehiculos' },
  { value: 'jugueteria', label: 'Jugueteria' },
  { value: 'ropa', label: 'Ropa y Accesorios' },
  { value: 'otro', label: 'Otro' },
] as const;

export const WIZARD_STEPS = [
  { step: 1, title: 'Producto', desc: 'Datos basicos', icon: 'fa-box' },
  { step: 2, title: 'Ficha Tecnica', desc: 'Detalles y specs', icon: 'fa-list-check' },
  { step: 3, title: 'Fotos y Video', desc: 'Contenido visual', icon: 'fa-camera' },
  { step: 4, title: 'Descripcion', desc: 'Copy optimizado', icon: 'fa-file-lines' },
  { step: 5, title: 'Condiciones', desc: 'Precio y envio', icon: 'fa-tags' },
  { step: 6, title: 'SEO', desc: 'Palabras clave', icon: 'fa-magnifying-glass-chart' },
] as const;

export const PHOTO_CHECKLIST: Omit<PhotoItem, 'checked'>[] = [
  { id: 1, title: 'Foto Principal - Fondo Blanco', description: 'Producto con 80% de encuadre, fondo blanco puro, sin sombras duras.' },
  { id: 2, title: 'Producto en Uso Real', description: 'Mostrar el producto siendo utilizado por una persona en contexto real.' },
  { id: 3, title: 'Detalle Anti-Objecion', description: 'Close-up de material, terminacion, costuras, textura o calidad de construccion.' },
  { id: 4, title: 'Contenido de la Caja', description: 'Todo el contenido desplegado: accesorios, manuales, cables, etc.' },
  { id: 5, title: 'Angulo Alternativo 1', description: 'Vista lateral, trasera o superior que muestre otra perspectiva.' },
  { id: 6, title: 'Angulo Alternativo 2', description: 'Segunda perspectiva adicional para completar la visualizacion.' },
  { id: 7, title: 'Escala / Tamano Real', description: 'Producto con referencia de tamano (mano, regla, moneda, etc.).' },
  { id: 8, title: 'Detalle Adicional', description: 'Conectores, etiquetas, cierres, puertos, botones o labels.' },
  { id: 9, title: 'Infografia / Medidas', description: 'Imagen con medidas, cuadro de talles o especificaciones visuales.' },
  { id: 10, title: 'Foto de Marca / Estilo de Vida', description: 'Foto aspiracional que conecte emocionalmente con el comprador.' },
];

export const VIDEO_SEGMENTS = [
  { time: '0-3s', title: 'Hook Inicial', description: 'Que es + para quien va dirigido', field: 'hook' as const },
  { time: '3-10s', title: 'Beneficios Visuales', description: '2 beneficios clave con demostracion visual', field: 'benefits' as const },
  { time: '10-20s', title: 'Prueba Anti-Objecion', description: 'Demostrar calidad, resistencia o caracteristica diferenciadora', field: 'proof' as const },
  { time: '20-30s', title: 'Cierre + Que Incluye', description: 'Mostrar contenido de caja y llamada a la accion', field: 'closing' as const },
] as const;

export const CONDITION_LABELS: Record<string, string> = {
  new: 'Nuevo',
  used: 'Usado',
  refurbished: 'Reacondicionado',
};

export const TITLE_MAX_LENGTH = 60;
export const TITLE_WARNING_THRESHOLD = 45;
export const TITLE_ERROR_THRESHOLD = 55;
export const INTRO_RECOMMENDED_LENGTH = 200;
export const TOTAL_PHOTOS = 10;
export const SCORE_RADIUS = 54;
export const SCORE_CIRCUMFERENCE = 2 * Math.PI * SCORE_RADIUS;

export const SCORE_WEIGHTS = {
  title: 0.25,
  specs: 0.25,
  photos: 0.2,
  description: 0.15,
  seo: 0.15,
} as const;

export const SCORE_THRESHOLDS = {
  excellent: 80,
  good: 50,
  warning: 25,
} as const;

export const SCORE_COLORS = {
  excellent: '#00A650',
  good: '#3483FA',
  warning: '#F5A623',
  danger: '#F23D4F',
} as const;

export const STORAGE_KEY = 'optimlia_data';
