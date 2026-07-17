import { useState, useCallback, useEffect, useRef } from 'react';
import type {
  PublicationFormData,
  ProductData,
  SpecData,
  AdditionalSpec,
  PhotoItem,
  VideoScript,
  DescriptionData,
  PricingData,
  KeywordData,
  FeatureItem,
  FAQItem,
  ScoreBreakdown,
  PriceCalculation,
  KeywordAnalysis,
  WizardStep,
} from '../../domain/types';
import {
  INITIAL_PRODUCT,
  INITIAL_SPECS,
  INITIAL_VIDEO,
  INITIAL_DESCRIPTION,
  INITIAL_PRICING,
  INITIAL_KEYWORDS,
} from '../../domain/types';
import { PHOTO_CHECKLIST } from '../../domain/constants';
import { calculateScore } from '../../domain/services/score.service';
import { calculatePrice } from '../../domain/services/price.service';
import { generateTitle } from '../../domain/services/title.service';
import { analyzeKeywords } from '../../domain/services/keyword.service';
import { StorageService } from '../../infrastructure/storage.service';

const createInitialPhotos = (): PhotoItem[] =>
  PHOTO_CHECKLIST.map((p) => ({ ...p, checked: false }));

const buildInitialFormData = (): PublicationFormData => ({
  product: INITIAL_PRODUCT,
  specs: INITIAL_SPECS,
  additionalSpecs: [],
  photos: createInitialPhotos(),
  video: INITIAL_VIDEO,
  description: { ...INITIAL_DESCRIPTION },
  pricing: INITIAL_PRICING,
  keywords: INITIAL_KEYWORDS,
});

function mergeWithDefaults(saved: PublicationFormData): PublicationFormData {
  const defaults = buildInitialFormData();
  return {
    product: { ...defaults.product, ...saved.product },
    specs: { ...defaults.specs, ...saved.specs },
    additionalSpecs: saved.additionalSpecs?.length ? saved.additionalSpecs : defaults.additionalSpecs,
    photos: saved.photos?.length ? saved.photos : defaults.photos,
    video: { ...defaults.video, ...saved.video },
    description: {
      ...defaults.description,
      ...saved.description,
      boxContents: saved.description?.boxContents?.length ? saved.description.boxContents : defaults.description.boxContents,
      features: saved.description?.features?.length ? saved.description.features : defaults.description.features,
      faqs: saved.description?.faqs?.length ? saved.description.faqs : defaults.description.faqs,
    },
    pricing: { ...defaults.pricing, ...saved.pricing },
    keywords: { ...defaults.keywords, ...saved.keywords },
  };
}

export function usePublicationForm() {
  const [formData, setFormData] = useState<PublicationFormData>(buildInitialFormData);
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [showResult, setShowResult] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const score: ScoreBreakdown = calculateScore(formData);
  const priceCalc: PriceCalculation = calculatePrice(formData.pricing);
  const title = generateTitle(formData.product);
  const keywordAnalysis: KeywordAnalysis[] = analyzeKeywords(formData.keywords, title);

  useEffect(() => {
    const saved = StorageService.load();
    if (saved) {
      setFormData(mergeWithDefaults(saved));
    }
  }, []);

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => StorageService.save(formData), 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [formData]);

  const updateProduct = useCallback((field: keyof ProductData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      product: { ...prev.product, [field]: value },
    }));
  }, []);

  const updateSpecs = useCallback((field: keyof SpecData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      specs: { ...prev.specs, [field]: value },
    }));
  }, []);

  const updateAdditionalSpecs = useCallback((specs: AdditionalSpec[]) => {
    setFormData((prev) => ({ ...prev, additionalSpecs: specs }));
  }, []);

  const updatePhotos = useCallback((photos: PhotoItem[]) => {
    setFormData((prev) => ({ ...prev, photos }));
  }, []);

  const updateVideo = useCallback((field: keyof VideoScript, value: string) => {
    setFormData((prev) => ({
      ...prev,
      video: { ...prev.video, [field]: value },
    }));
  }, []);

  const updateDescription = useCallback((field: keyof DescriptionData, value: string | string[] | FeatureItem[] | FAQItem[]) => {
    setFormData((prev) => ({
      ...prev,
      description: { ...prev.description, [field]: value },
    }));
  }, []);

  const updatePricing = useCallback((field: keyof PricingData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, [field]: value },
    }));
  }, []);

  const updateKeywords = useCallback((field: keyof KeywordData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: { ...prev.keywords, [field]: value },
    }));
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
    setShowResult(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const showResultPanel = useCallback(() => {
    setShowResult(true);
    setCurrentStep(7);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    formData,
    currentStep,
    showResult,
    score,
    priceCalc,
    title,
    keywordAnalysis,
    updateProduct,
    updateSpecs,
    updateAdditionalSpecs,
    updatePhotos,
    updateVideo,
    updateDescription,
    updatePricing,
    updateKeywords,
    goToStep,
    showResultPanel,
  };
}
