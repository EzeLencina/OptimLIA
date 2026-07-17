# OptimLIA

**Optimizador de Publicaciones MercadoLibre** — Asistente (wizard) en React + TypeScript + Vite que genera, evalúa y mejora publicaciones de MercadoLibre de forma 100% client-side (sin backend, sin IA externa).

---

## Tabla de contenidos

- [¿Qué es OptimLIA?](#qué-es-optimlia)
- [Características principales](#características-principales)
- [Arquitectura](#arquitectura)
- [Instalación y uso](#instalación-y-uso)
- [Referencia de funciones](#referencia-de-funciones)
  - [domain/types.ts](#domaintypests)
  - [domain/constants.ts](#domainconstantsts)
  - [Servicios (domain/services)](#servicios-domainservices)
  - [Infraestructura (infrastructure)](#infraestructura-infrastructure)
  - [Hook de estado (presentation/hooks)](#hook-de-estado-presentationhooks)
  - [Componente raíz (App.tsx)](#componente-raíz-apptsx)
  - [Componentes de layout](#componentes-de-layout)
  - [Componentes comunes](#componentes-comunes)
  - [Componentes de pasos (steps)](#componentes-de-pasos-steps)
  - [Punto de entrada (main.tsx)](#punto-de-entrada-maintsx)
- [Flujo de la aplicación](#flujo-de-la-aplicación)
- [Informe de estado actual](#informe-de-estado-actual)

---

## ¿Qué es OptimLIA?

OptimLIA es una herramienta que guía al vendedor de MercadoLibre a través de un asistente de 6 pasos y produce una publicación lista para copiar y pegar, junto con un diagnóstico de calidad en 5 dimensiones (título, ficha técnica, fotos, descripción y SEO). El motor es **determinista**: usa reglas heurísticas (longitud de texto, presencia de palabras clave, conteo de fotos, pesos de score) y no depende de modelos de lenguaje ni de servicios externos.

El estado se guarda automáticamente en `localStorage`, de modo que el usuario puede cerrar y retomar la sesión.

---

## Características principales

- **Asistente de 6 pasos**: Producto → Ficha Técnica → Fotos y Video → Descripción → Condiciones de Venta → SEO.
- **Score de optimización en tiempo real**: ponderado (título 25 %, ficha 25 %, fotos 20 %, descripción 15 %, SEO 15 %) con anillo visual y desglose por categoría.
- **Calculadora de precio**: precio sugerido, ganancia neta por unidad y ROI a partir de costo, comisión, envío, margen y gastos fijos.
- **Generación de contenido**: título, ficha técnica, descripción en HTML, palabras clave y texto completo listo para publicar.
- **Análisis SEO**: longitud de título, marca/modelo en título, keywords en título, calidad y estructura de descripción, intención de búsqueda, palabras repetidas y faltantes.
- **Análisis de copywriting**: claridad, escaneabilidad, beneficios, características, CTA, confianza, objeciones y SEO en descripción.
- **Análisis de imágenes**: cobertura visual, foto principal con fondo blanco, lifestyle, infografía, detalle, caja, ángulos, uso, escala y descripciones por foto.
- **Interpretación del score y plan de acciones**: diagnóstico en lenguaje natural con acciones priorizadas por impacto y tiempo estimado.
- **Comparador de competidores**: hasta 3 competidores, con fortalezas, debilidades, gaps de keywords/beneficios/atributos.
- **Diagnóstico de Mercado Ads**: evalúa volumen, CTR, conversión, ROAS y ACOS de una campaña publicitaria.
- **Exportación y copia**: copia al portapapeles y descarga de la publicación en JSON.
- **Autoguardado**: persistencia en `localStorage` con debounce de 500 ms.

---

## Arquitectura

El proyecto sigue una separación por capas (inspirada en arquitectura limpia):

```
src/
├── domain/                  # Lógica de negocio pura (sin React)
│   ├── types.ts             # Modelos de datos e inicializadores
│   ├── constants.ts         # Categorías, checklist, pesos, umbrales
│   └── services/            # Motores de cálculo y análisis
├── infrastructure/          # Acceso a persistencia
│   └── storage.service.ts   # localStorage
└── presentation/            # UI (React)
    ├── App.tsx              # Orquestador
    ├── hooks/               # usePublicationForm (estado central)
    └── components/
        ├── layout/          # Header, Sidebar, ScoreRing
        ├── common/          # Button, Toggle, DynamicFieldList, CompetitorInput, AdsMetricsInput
        └── steps/           # ProductStep, SpecsStep, PhotosStep, DescriptionStep, PricingStep, SeoStep, ResultPanel
```

- **domain**: no importa nada de React. Cada servicio es una función pura que recibe datos y devuelve un resultado.
- **infrastructure**: única dependencia de un mecanismo externo (`localStorage`).
- **presentation**: consume los servicios y el hook; no contiene reglas de negocio.

---

## Instalación y uso

Requisitos: Node.js (el proyecto usa React 19 y Vite 7, según `package.json`).

```bash
npm install      # Instala dependencias
npm run dev      # Servidor de desarrollo (Vite, con HMR)
npm run build    # Compila con tsc -b && vite build
npm run preview  # Previsualiza el build de producción
```

Lint se configura vía `.oxlintrc.json` (plugins react, typescript, oxc; reglas `react/rules-of-hooks` y `react/only-export-components`).

---

## Referencia de funciones

A continuación se documenta **toda** función y componente del proyecto, incluyendo las auxiliares internas (no exportadas), para máximo detalle.

### domain/types.ts

Define todos los modelos de datos y los valores iniciales.

- `ProductCondition = 'new' | 'used' | 'refurbished'` — Estado del producto.
- `ShippingType = 'full' | 'flex' | 'free' | 'paid'` — Tipo de envío.
- `PublicationType = 'premium' | 'clasica'` — Tipo de publicación.
- `WeightUnit = 'g' | 'kg'` — Unidad de peso.
- `WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7` — Paso del asistente.
- `ProductData` — Nombre, marca, modelo, categoría, subcategoría, condición, atributo, uso, EAN.
- `SpecData` — Marca, modelo, material, color, peso, unidad, dimensiones, garantía, origen, descripción breve.
- `AdditionalSpec` — Atributo adicional nombre/valor.
- `PhotoItem` — Foto del checklist (id, título, descripción, marcada).
- `VideoScript` — Guion de video (hook, benefits, proof, closing).
- `DescriptionData` — Intro, problema, contenido de caja, características, FAQs, envío.
- `FeatureItem` — Característica (nombre, beneficio).
- `FAQItem` — Pregunta frecuente (pregunta, respuesta).
- `PricingData` — Costos, comisión, envío, margen, gasto fijo, tipo de publicación, cuotas, envío, stock.
- `KeywordData` — Keyword principal, 3 secundarias y 2 long-tail.
- `PriceCalculation` — Precio sugerido, ganancia neta, ROI.
- `ScoreBreakdown` — Puntajes por categoría y total.
- `KeywordAnalysis` — Keyword y si está en el título.
- `PublicationFormData` — Contenedor de todo el formulario.
- `GeneratedOutput` — Salida generada (título, categoría, ficha, descripción HTML, keywords, texto completo).
- `SeoAnalysis` — Fortalezas, debilidades, keywords faltantes/repetidas, recomendaciones.
- `CopywritingAnalysis` — Fortalezas, debilidades, recomendaciones.
- `ImageAnalysis` — Fortalezas, debilidades, recomendaciones.
- `CompetitorData` — Título y descripción de un competidor.
- `ComparisonAnalysis` — Fortalezas, debilidades, gaps y listas de keywords/beneficios/atributos.
- `AdsMetrics` — Impresiones, clicks, ventas, CTR, ROAS, ACOS, conversión.
- `AdsAnalysisItem` — Problema, impacto, prioridad, acción.
- `ScoreCategory` — Categoría con score, máximo, peso y explicación.
- `ScoreInterpretation` — Resumen, categorías, fortalezas, problemas, acciones prioritarias, confianza.
- `ActionItem` — Acción, prioridad, tiempo, impacto, dificultad, área.
- Constantes `INITIAL_PRODUCT`, `INITIAL_SPECS`, `INITIAL_VIDEO`, `INITIAL_DESCRIPTION`, `INITIAL_PRICING`, `INITIAL_KEYWORDS` — Valores por defecto de cada sección.

### domain/constants.ts

Configuración estática del dominio.

- `ML_CATEGORIES` — Lista de categorías de MercadoLibre (value/label).
- `WIZARD_STEPS` — Definición de los 6 pasos del asistente (título, descripción, icono).
- `PHOTO_CHECKLIST` — Checklist de 10 fotos (id, título, descripción).
- `VIDEO_SEGMENTS` — Guion de 4 segmentos de video (tiempo, título, descripción, campo).
- `CONDITION_LABELS` — Etiquetas en español de cada condición.
- `TITLE_MAX_LENGTH` (60), `TITLE_WARNING_THRESHOLD` (45), `TITLE_ERROR_THRESHOLD` (55) — Límites del título.
- `INTRO_RECOMMENDED_LENGTH` (200) — Largo recomendado de la intro.
- `TOTAL_PHOTOS` (10) — Cantidad máxima de fotos.
- `SCORE_RADIUS` (54), `SCORE_CIRCUMFERENCE` — Geometría del anillo de score.
- `SCORE_WEIGHTS` — Pesos: título 0.25, specs 0.25, photos 0.2, description 0.15, seo 0.15.
- `SCORE_THRESHOLDS` — Umbrales excellent 80, good 50, warning 25.
- `SCORE_COLORS` — Colores por nivel.
- `STORAGE_KEY` (`'optimlia_data'`) — Clave de localStorage.

### Servicios (domain/services)

#### score.service.ts

- `calculateScore(data: PublicationFormData): ScoreBreakdown` — Calcula el puntaje total y por categoría aplicando `SCORE_WEIGHTS`.
- `calculateTitleScore(data)` — Puntaje del título según nombre, marca, categoría, condición y longitud.
- `calculateSpecsScore(data)` — Porcentaje de campos de ficha completados.
- `calculatePhotosScore(data)` — Porcentaje de fotos marcadas sobre `TOTAL_PHOTOS`.
- `calculateDescriptionScore(data)` — Puntaje por intro, características y FAQs.
- `calculateSeoScore(data)` — Puntaje por keyword principal, secundarias y long-tail.

#### price.service.ts

- `calculatePrice(pricing: PricingData): PriceCalculation` — Calcula precio sugerido (`totalCost / (1 - comisión/100 - margen/100)`), ganancia neta y ROI. Devuelve ceros si no hay datos suficientes.

#### title.service.ts

- `generateTitle(product: ProductData): string` — Une nombre + marca + modelo + atributo + uso y trunca a `TITLE_MAX_LENGTH`.
- `getTitleCharCount(product: ProductData): number` — Devuelve la longitud del título generado.

#### keyword.service.ts

- `analyzeKeywords(keywords: KeywordData, title: string): KeywordAnalysis[]` — Indica para cada keyword si aparece en el título.
- `getKeywordList(keywords: KeywordData): string[]` — Lista de keywords no vacías.

#### description.service.ts

- `generateOutput(data: PublicationFormData, suggestedPrice?: number): GeneratedOutput` — Genera la salida completa (título, categoría, ficha, descripción HTML, keywords, texto completo).
- `buildSpecsText(data)` — Construye el texto de ficha técnica.
- `buildDescriptionHtml(data, suggestedPrice)` — Construye la descripción en HTML con secciones y negritas.
- `buildKeywordsText(data)` — Construye el bloque de palabras clave.

#### seo-analysis.service.ts

- `analyzeSeo(formData, output): SeoAnalysis` — Análisis SEO completo (fortalezas, debilidades, keywords faltantes/repetidas, recomendaciones).
- `STOP_WORDS_ES` — Conjunto de palabras vacías en español para normalizar.
- `normalize(text)` — Minúsculas, sin acentos, solo alfanuméricos y espacios.
- `getWords(text)` — Tokeniza y filtra stop-words.
- `countOccurrences(words)` — Cuenta frecuencia de cada palabra.
- `hasWord(text, word)` — Verifica presencia normalizada.
- `analyzeTitleLength(title)` — Evalúa longitud del título (mensajes por rango).
- `analyzeBrandInTitle(brand, title)` — Verifica marca en el título.
- `analyzeModelInTitle(model, title)` — Verifica modelo en el título.
- `analyzeKeywordInTitle(keyword, title)` — Verifica keyword en el título.
- `analyzeDescription(descriptionHtml)` — Evalúa longitud de la descripción.
- `analyzeDescriptionStructure(descriptionHtml)` — Evalúa negritas/listas/saltos.
- `analyzeSearchIntent(title, category)` — Coincidencia de título con la categoría.
- `descriptionHtml(html)` — Identidad (helper de normalización de HTML).

#### copywriting.service.ts

- `analyzeCopywriting(formData, output): CopywritingAnalysis` — Análisis de calidad de la descripción.
- `CTA_KEYWORDS`, `TRUST_KEYWORDS`, `OBJECTION_HANDLERS` — Listas de palabras para detectar CTA, confianza y objeciones.
- `strip(html)` — Quita etiquetas HTML.
- `sentences(text)` — Divide en oraciones.
- `avgSentenceLength(text)` — Promedio de palabras por oración.
- `countMatches(text, keywords)` — Cuenta coincidencias de keywords.
- `hasListStructure(html)` — Detecta listas HTML.
- `hasBoldText(html)` — Detecta negritas.
- `analyzeClarity(text)` — Evalúa claridad según longitud de oraciones.
- `analyzeScannability(html, text)` — Evalúa formato escaneable.
- `analyzeBenefits(formData)` — Evalúa beneficios destacados.
- `analyzeFeatures(html, formData)` — Evalúa presencia de características.
- `analyzeCTA(text)` — Evalúa llamadas a la acción.
- `analyzeTrust(text)` — Evalúa elementos de confianza.
- `analyzeObjections(text, formData)` — Evalúa manejo de objeciones/FAQs.
- `analyzeSeoInDesc(text, formData)` — Evalúa presencia de keywords en la descripción.

#### image-analysis.service.ts

- `analyzeImages(formData): ImageAnalysis` — Análisis de cobertura visual y recomendaciones.
- `CRITICAL_PHOTOS = [1, 2, 3, 4, 9]`, `NICE_TO_HAVE = [5, 6, 7, 8, 10]` — Clasificación de fotos.
- `getPhotoStatus(photos, id)` — Devuelve una foto por id.
- `isCriticalPhotoChecked(photos, id)` — Indica si una foto crítica está marcada.
- `countChecked(photos)` — Cuenta fotos marcadas.
- `countWithDescription(photos)` — Cuenta fotos marcadas con descripción.
- `analyzeQuantity(checked)` — Evalúa cantidad de fotos.
- `analyzeMainPhoto(photos)` — Evalúa foto principal.
- `analyzeBackground(photos)` — Evalúa fondo blanco.
- `analyzeLifestyle(photos)` — Evalúa foto lifestyle.
- `analyzeInfographic(photos)` — Evalúa infografía de medidas.
- `analyzeDetail(photos)` — Evalúa foto de detalle.
- `analyzeBoxContents(photos)` — Evalúa foto de contenido de caja.
- `analyzeAngles(photos)` — Evalúa ángulos alternativos.
- `analyzeDescriptions(photos)` — Evalúa descripciones por foto.
- `analyzeUsagePhoto(photos)` — Evalúa foto de uso real.
- `analyzeScalePhoto(photos)` — Evalúa foto de escala.

#### interpretation.service.ts

- `interpretScores(score, seo, copy, images): ScoreInterpretation` — Diagnóstico en lenguaje natural con desglose, fortalezas, problemas, acciones prioritarias y confianza.
- `scoreLabel(score)` — Etiqueta cualitativa (excelente…crítico).
- `explainTitle/Specs/Photos/Description/Seo(score)` — Explicación por categoría.
- `buildSummary(total)` — Resumen según puntaje total.
- `buildConfidence(score, seo, copy, images)` — Nivel de confianza del diagnóstico.

#### action-plan.service.ts

- `generateActionPlan(score, formData, seo, copy, images): ActionItem[]` — Plan de acciones priorizado (ordenado por impacto, sin duplicados).
- `dedupe(actions)` — Elimina acciones duplicadas.
- `sortByImpact(actions)` — Ordena por prioridad de impacto.
- `fromTitle(score, data)` — Acciones de título.
- `fromSpecs(score, data)` — Acciones de ficha técnica.
- `fromPhotos(score, data)` — Acciones de imágenes.
- `fromDescription(score, data)` — Acciones de descripción.
- `fromSeo(score, data)` — Acciones de SEO.
- `fromCopywriting(copy)` — Acciones de copywriting.
- `fromImages(images)` — Acciones de imágenes.

#### comparison.service.ts

- `compareWithCompetitors(output, competitors): ComparisonAnalysis` — Compara tu publicación con hasta 3 competidores.
- `normalize(text)` — Normaliza texto (igual que en SEO).
- `getWords(text)` — Tokeniza filtrando stop-words.
- `uniqueWords(texts)` — Palabras únicas de varios textos.
- `extractFeatures(text)` — Extrae líneas/beneficios.
- `extractAttributes(text)` — Extrae atributos por patrones (material, color, peso, etc.).
- `getCompetitorKeywords(competitors)` — Keywords de competidores.
- `getMyKeywords(output)` — Keywords de tu publicación.
- `analyzeTitleLength(output, competitors)` — Compara longitud de títulos.
- `analyzeDescriptionLength(output, competitors)` — Compara longitud de descripciones.

#### ads-analysis.service.ts

- `analyzeAds(metrics: AdsMetrics): AdsAnalysisItem[]` — Diagnóstico de campaña de Mercado Ads.
- `num(val)` — Convierte string a número (acepta coma decimal).
- `hasData(metrics)` — Indica si hay métricas suficientes.
- `analyzeCTR(ctr, impressions, clicks)` — Evalúa CTR bajo.
- `analyzeROAS(roas)` — Evalúa ROAS crítico/debil.
- `analyzeACOS(acos)` — Evalúa ACOS elevado.
- `analyzeConversion(conversion, clicks, sales)` — Evalúa conversión baja.
- `analyzeVolume(impressions, clicks, sales)` — Evalúa volumen y embudo.

### Infraestructura (infrastructure)

- `StorageService.save(data)` — Guarda el formulario en `localStorage`.
- `StorageService.load()` — Carga el formulario desde `localStorage` (o `null`).
- `StorageService.clear()` — Elimina los datos guardados.

### Hook de estado (presentation/hooks)

- `usePublicationForm()` — Hook central: mantiene `formData`, `currentStep`, `showResult`, calcula en vivo `score`, `priceCalc`, `title` y `keywordAnalysis`, persiste con debounce y expone `updateProduct`, `updateSpecs`, `updateAdditionalSpecs`, `updatePhotos`, `updateVideo`, `updateDescription`, `updatePricing`, `updateKeywords`, `goToStep`, `showResultPanel`.
- `createInitialPhotos()` — Crea el checklist de fotos desde `PHOTO_CHECKLIST`.
- `buildInitialFormData()` — Ensambla el `PublicationFormData` inicial.
- `mergeWithDefaults(saved)` — Mezcla datos guardados con los valores por defecto.

### Componente raíz (App.tsx)

- `App` — Componente por defecto que orquesta header, sidebar y el paso actual, y maneja copia/exportación a JSON.
- `showToast(message, _type?)` — Muestra notificaciones toast en el DOM.

### Componentes de layout

- `Header` — Logo de OptimLIA, tagline y botones de historial/configuración.
- `Sidebar` — Navegación por pasos del asistente con el anillo de score.
- `ScoreRing` — Anillo SVG con el puntaje total y desglose por categoría.
- `getScoreColor(total)` — Devuelve el color según umbral (helper interno).

### Componentes comunes

- `Button` — Botón reutilizable con variantes (primary/secondary/success/outline).
- `Toggle` — Interruptor (checkbox estilizado) controlado.
- `DynamicFieldList<T>` — Lista genérica de campos con agregar/eliminar.
- `CompetitorInput` — Entrada de hasta 3 competidores y disparador de comparación.
- `AdsMetricsInput` — Captura métricas de Ads y muestra el diagnóstico con badges de prioridad.
- `PriorityBadge` (interno en AdsMetricsInput) — Badge de prioridad.

### Componentes de pasos (steps)

- `ProductStep` — Paso 1: datos del producto + vista previa del título.
- `SpecsStep` — Paso 2: ficha técnica y atributos adicionales + barra de progreso.
- `calculateSpecsProgress(specs, additionalSpecs)` (interno) — Porcentaje de completitud de la ficha.
- `PhotosStep` — Paso 3: checklist de fotos y guion de video.
- `DescriptionStep` — Paso 4: descripción optimizada (intro, problema, caja, características, FAQs, envío).
- `PricingStep` — Paso 5: condiciones de venta, precio sugerido, ganancia y ROI.
- `formatCurrency(value)` (interno) — Formatea como moneda ARS.
- `SeoStep` — Paso 6: palabras clave y análisis en título + botón generar.
- `ResultPanel` — Panel final con 12 pestañas (resumen, acciones, título, ficha, descripción, keywords, SEO, copy, imágenes, comparar, ads, todo) que integra todos los análisis.
  - `ReportSection` (interno) — Sección de lista de items.
  - `AnalysisReport` (interno) — Reporte genérico fortalezas/debilidades/recomendaciones.
  - `SeoReport` (interno) — Reporte SEO con tags de keywords.
  - `PriorityBadge` (interno) — Badge de prioridad de acción.
  - `DifficultyBadge` (interno) — Badge de dificultad.
  - `ActionPlanReport` (interno) — Plan de acciones con estadísticas.
  - `InterpretationReport` (interno) — Reporte de interpretación del score.
  - `ComparisonReport` (interno) — Reporte de comparación con competidores.

### Punto de entrada (main.tsx)

- Sin exports. Monta `<App />` en `#root` con `createRoot`.

---

## Flujo de la aplicación

1. **Estado central** — `usePublicationForm` mantiene `formData` (todo el asistente) y deriva en cada render `score`, `priceCalc`, `title` y `keywordAnalysis`. Al montar, carga desde `localStorage`; en cada cambio, guarda con debounce de 500 ms.
2. **Navegación** — `App` renderiza el paso según `currentStep` (1–6) o `ResultPanel` si `showResult` es `true`. `Sidebar` permite saltar entre pasos.
3. **Generación** — En el paso SEO, `showResultPanel` activa el resultado. `App` llama a `generateOutput`, `analyzeSeo`, `analyzeCopywriting` y `analyzeImages`, y se los pasa a `ResultPanel`.
4. **Resultado** — `ResultPanel` combina `interpretScores` (diagnóstico), `generateActionPlan` (acciones), `compareWithCompetitors` (comparación) y `analyzeAds` (Ads), organizados en 12 pestañas. El usuario puede copiar al portapapeles o exportar a JSON.
5. **Persistencia** — Todo queda en `localStorage` vía `StorageService`, recuperable al reabrir la app.

---

## Informe de estado actual

**Calidad y build**

- `npm run build` (tsc -b + vite build) compila sin errores de tipos.
- Sin dependencias de red ni backend: toda la lógica es client-side y determinista.
- Lint configurado con oxlint (reglas de hooks y exportación de componentes).

**Últimas mejoras aplicadas**

- Reescritura de todos los textos visibles (mensajes de análisis SEO, copywriting, imágenes, interpretación y plan de acciones; resultado de comparación y diagnóstico de Ads) para mejorar SEO, legibilidad, ventas y conversión, sin alterar lógica ni datos técnicos.
- Pulido de labels de UI en los 6 pasos, header, inputs de competidores/Ads y `ResultPanel`.
- Mejora de `WIZARD_STEPS`, `PHOTO_CHECKLIST` y `VIDEO_SEGMENTS` con enfoque en conversión y reducción de devoluciones.
- Corrección de erratas: `Practicamente` → `prácticamente`, `praticamente` → `prácticamente`, `destacades` → `destacadas`.

**Notas**

- El motor es heurístico (no usa IA): los puntajes y recomendaciones dependen de reglas explícitas en los servicios.
- Los umbrales de score y los pesos están centralizados en `domain/constants.ts`, lo que facilita ajustes futuros.

---

_Documentación generada a partir del código fuente completo del repositorio._
