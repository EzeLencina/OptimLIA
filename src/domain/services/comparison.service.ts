import type { GeneratedOutput, CompetitorData, ComparisonAnalysis } from '../types';

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
  const stopWords = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'al', 'a', 'en',
    'con', 'por', 'para', 'que', 'es', 'se', 'su', 'sus', 'y', 'o',
    'no', 'mas', 'muy', 'como', 'sin', 'sobre', 'entre', 'hasta',
    'desde', 'todo', 'cada', 'son', 'fue', 'hay', 'dan', 'va', 'vez',
    'lo', 'le', 'les', 'me', 'te', 'mi', 'tu', 'este', 'esta',
  ]);
  return normalize(text)
    .split(' ')
    .filter((w) => w.length > 1 && !stopWords.has(w));
}

function uniqueWords(texts: string[]): string[] {
  const all = new Set<string>();
  for (const t of texts) {
    for (const w of getWords(t)) all.add(w);
  }
  return Array.from(all).sort();
}

function extractFeatures(text: string): string[] {
  const lines = text.split(/[\n\r]+/).map((l) => l.trim()).filter(Boolean);
  const features: string[] = [];
  for (const line of lines) {
    const clean = line.replace(/^[-•*]\s*/, '').replace(/<[^>]*>/g, '').trim();
    if (clean.length > 3 && clean.length < 120) features.push(clean);
  }
  return features;
}

function extractAttributes(text: string): string[] {
  const attrs: string[] = [];
  const patterns = [
    /material[:\s]+([^\n.,]+)/gi,
    /color[:\s]+([^\n.,]+)/gi,
    /peso[:\s]+([^\n.,]+)/gi,
    /dimensiones?[:\s]+([^\n.,]+)/gi,
    /garantia[:\s]+([^\n.,]+)/gi,
    /envio[:\s]+([^\n.,]+)/gi,
    /marca[:\s]+([^\n.,]+)/gi,
    /modelo[:\s]+([^\n.,]+)/gi,
  ];
  for (const p of patterns) {
    let m;
    while ((m = p.exec(text)) !== null) {
      attrs.push(m[0].trim());
    }
  }
  return attrs;
}

function getCompetitorKeywords(competitors: CompetitorData[]): string[] {
  const allTitles = competitors.map((c) => c.title);
  const allDescs = competitors.map((c) => c.description);
  const titleWords = uniqueWords(allTitles);
  const descWords = uniqueWords(allDescs);
  return [...new Set([...titleWords.slice(0, 30), ...descWords.slice(0, 30)])];
}

function getMyKeywords(output: GeneratedOutput): string[] {
  const titleWords = getWords(output.title);
  const descWords = getWords(output.descriptionHtml);
  return [...new Set([...titleWords, ...descWords])];
}

function analyzeTitleLength(output: GeneratedOutput, competitors: CompetitorData[]): { ok: boolean; msg: string } {
  const myLen = output.title.length;
  const compLens = competitors.map((c) => c.title.length).filter((l) => l > 0);
  if (compLens.length === 0) return { ok: true, msg: `Tu titulo tiene ${myLen} caracteres` };

  const avgComp = compLens.reduce((a, b) => a + b, 0) / compLens.length;
  if (myLen >= avgComp) return { ok: true, msg: `Tu titulo (${myLen} chars) supera el promedio de competidores (${Math.round(avgComp)} chars)` };
  return { ok: false, msg: `Tu titulo (${myLen} chars) es mas corto que el promedio de competidores (${Math.round(avgComp)} chars)` };
}

function analyzeDescriptionLength(output: GeneratedOutput, competitors: CompetitorData[]): { ok: boolean; msg: string } {
  const myLen = output.descriptionHtml.replace(/<[^>]*>/g, '').length;
  const compLens = competitors.map((c) => c.description.length).filter((l) => l > 0);
  if (compLens.length === 0) return { ok: true, msg: `Tu descripcion tiene ${myLen} caracteres` };

  const avgComp = compLens.reduce((a, b) => a + b, 0) / compLens.length;
  if (myLen >= avgComp) return { ok: true, msg: `Tu descripcion (${myLen} chars) es igual o superior a competidores (promedio ${Math.round(avgComp)})` };
  return { ok: false, msg: `Tu descripcion (${myLen} chars) es mas corta que competidores (promedio ${Math.round(avgComp)})` };
}

export function compareWithCompetitors(
  output: GeneratedOutput,
  competitors: CompetitorData[],
): ComparisonAnalysis {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const missing: string[] = [];
  const excess: string[] = [];
  const different_keywords: string[] = [];
  const different_benefits: string[] = [];
  const missing_attributes: string[] = [];

  const validCompetitors = competitors.filter(
    (c) => c.title.trim() || c.description.trim(),
  );

  if (validCompetitors.length === 0) {
    return {
      strengths: [],
      weaknesses: [],
      missing: ['No ingresaste competidores para comparar. Pega al menos uno para ver como te diferencias.'],
      excess: [],
      different_keywords: [],
      different_benefits: [],
      missing_attributes: [],
    };
  }

  const titleAnalysis = analyzeTitleLength(output, validCompetitors);
  if (titleAnalysis.ok) strengths.push(titleAnalysis.msg);
  else weaknesses.push(titleAnalysis.msg);

  const descAnalysis = analyzeDescriptionLength(output, validCompetitors);
  if (descAnalysis.ok) strengths.push(descAnalysis.msg);
  else weaknesses.push(descAnalysis.msg);

  const myKeywords = new Set(getMyKeywords(output));
  const compKeywords = new Set(getCompetitorKeywords(validCompetitors));

  const onlyInCompetitors = Array.from(compKeywords).filter((w) => !myKeywords.has(w));
  const onlyInMine = Array.from(myKeywords).filter((w) => !compKeywords.has(w));

  if (onlyInCompetitors.length > 0) {
    const top = onlyInCompetitors.slice(0, 10);
    different_keywords.push(...top);
    weaknesses.push(`Tus competidores usan estas keywords y tu no: "${top.slice(0, 5).join('", "')}". Sumalas para no perder esas busquedas.`);
  }

  if (onlyInMine.length > 0) {
    const top = onlyInMine.slice(0, 10);
    different_keywords.push(...top);
    strengths.push(`Keywords unicas en tu publicacion: "${top.slice(0, 5).join('", "')}". Te diferencian y captan nichos propios.`);
  }

  const myFeatures = extractFeatures(output.descriptionHtml);
  const compFeatures = validCompetitors.flatMap((c) => extractFeatures(c.description));

  const compFeatureWords = new Set(compFeatures.flatMap((f) => getWords(f)));
  const missingFeatures = compFeatures.filter((f) => {
    const words = getWords(f);
    const overlap = words.filter((w) => myKeywords.has(w));
    return overlap.length < words.length * 0.3 && words.length > 1;
  });

  if (missingFeatures.length > 0) {
    const unique = [...new Set(missingFeatures)].slice(0, 5);
    different_benefits.push(...unique);
    missing.push(`Beneficios/caracteristicas que si tienen tus competidores: "${unique.map((f) => f.substring(0, 60)).join('", "')}". Considera sumarlos.`);
  }

  const myAttributes = extractAttributes(output.fullText);
  const compAttributes = validCompetitors.flatMap((c) => extractAttributes(c.title + ' ' + c.description));

  const myAttrTypes = new Set(myAttributes.map((a) => a.split(':')[0].toLowerCase().trim()));
  const missingAttrs = compAttributes.filter((a) => {
    const type = a.split(':')[0].toLowerCase().trim();
    return !myAttrTypes.has(type);
  });

  if (missingAttrs.length > 0) {
    const unique = [...new Set(missingAttrs)].slice(0, 5);
    missing_attributes.push(...unique);
    missing.push(`Atributos que muestran tus competidores y tu no: "${unique.join('", "')}". Agregalos para equiparar la ficha.`);
  }

  if (myFeatures.length > 0 && compFeatures.length > 0) {
    const excessFeatures = myFeatures.filter((f) => {
      const words = getWords(f);
      return words.every((w) => !compFeatureWords.has(w)) && words.length > 1;
    });
    if (excessFeatures.length > 0) {
      excess.push(...excessFeatures.slice(0, 3));
    }
  }

  if (myFeatures.length > compFeatures.length / validCompetitors.length) {
    strengths.push(`Tu publicacion tiene ${myFeatures.length} beneficios destacados, mas que el promedio de competidores`);
  }

  if (output.descriptionHtml.includes('<strong>') || output.descriptionHtml.includes('<b>')) {
    strengths.push('Tu descripcion usa formato en negritas. Muchos competidores no lo hacen');
  }

  if (validCompetitors.some((c) => c.description.includes('<strong>') || c.description.includes('<b>'))) {
    if (!output.descriptionHtml.includes('<strong>') && !output.descriptionHtml.includes('<b>')) {
      weaknesses.push('Competidores usan formato en negritas en sus descripciones');
    }
  }

  return { strengths, weaknesses, missing, excess, different_keywords, different_benefits, missing_attributes };
}
