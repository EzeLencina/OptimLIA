import type { KeywordData, KeywordAnalysis } from '../types';
import { generateTitle } from './title.service';

export function analyzeKeywords(
  keywords: KeywordData,
  title: string
): KeywordAnalysis[] {
  const allKeywords = [
    keywords.primary,
    keywords.secondary1,
    keywords.secondary2,
    keywords.secondary3,
    keywords.longtail1,
    keywords.longtail2,
  ].filter((kw) => kw.trim());

  const lowerTitle = title.toLowerCase();

  return allKeywords.map((kw) => ({
    keyword: kw,
    foundInTitle: lowerTitle.includes(kw.toLowerCase()),
  }));
}

export function getKeywordList(keywords: KeywordData): string[] {
  return [
    keywords.primary,
    keywords.secondary1,
    keywords.secondary2,
    keywords.secondary3,
    keywords.longtail1,
    keywords.longtail2,
  ].filter((kw) => kw.trim());
}
