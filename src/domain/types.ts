export type ProductCondition = 'new' | 'used' | 'refurbished';

export type ShippingType = 'full' | 'flex' | 'free' | 'paid';

export type PublicationType = 'premium' | 'clasica';

export type WeightUnit = 'g' | 'kg';

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface ProductData {
  name: string;
  brand: string;
  model: string;
  category: string;
  subcategory: string;
  condition: ProductCondition;
  attribute: string;
  usage: string;
  ean: string;
}

export interface SpecData {
  brand: string;
  model: string;
  material: string;
  color: string;
  weight: string;
  weightUnit: WeightUnit;
  dimensions: string;
  warranty: string;
  origin: string;
  briefDesc: string;
}

export interface AdditionalSpec {
  name: string;
  value: string;
}

export interface PhotoItem {
  id: number;
  title: string;
  description: string;
  checked: boolean;
}

export interface VideoScript {
  hook: string;
  benefits: string;
  proof: string;
  closing: string;
}

export interface DescriptionData {
  intro: string;
  problem: string;
  boxContents: string[];
  features: FeatureItem[];
  faqs: FAQItem[];
  shipping: string;
}

export interface FeatureItem {
  name: string;
  benefit: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface PricingData {
  productCost: string;
  commission: string;
  shippingCost: string;
  margin: string;
  fixedCost: string;
  publicationType: PublicationType;
  installments: string;
  shippingType: ShippingType;
  stock: string;
}

export interface KeywordData {
  primary: string;
  secondary1: string;
  secondary2: string;
  secondary3: string;
  longtail1: string;
  longtail2: string;
}

export interface PriceCalculation {
  suggestedPrice: number;
  netProfit: number;
  roi: number;
}

export interface ScoreBreakdown {
  title: number;
  specs: number;
  photos: number;
  description: number;
  seo: number;
  total: number;
}

export interface KeywordAnalysis {
  keyword: string;
  foundInTitle: boolean;
}

export interface PublicationFormData {
  product: ProductData;
  specs: SpecData;
  additionalSpecs: AdditionalSpec[];
  photos: PhotoItem[];
  video: VideoScript;
  description: DescriptionData;
  pricing: PricingData;
  keywords: KeywordData;
}

export interface GeneratedOutput {
  title: string;
  category: string;
  specsText: string;
  descriptionHtml: string;
  keywordsText: string;
  fullText: string;
}

export const INITIAL_PRODUCT: ProductData = {
  name: '',
  brand: '',
  model: '',
  category: '',
  subcategory: '',
  condition: 'new',
  attribute: '',
  usage: '',
  ean: '',
};

export const INITIAL_SPECS: SpecData = {
  brand: '',
  model: '',
  material: '',
  color: '',
  weight: '',
  weightUnit: 'g',
  dimensions: '',
  warranty: '',
  origin: '',
  briefDesc: '',
};

export const INITIAL_VIDEO: VideoScript = {
  hook: '',
  benefits: '',
  proof: '',
  closing: '',
};

export const INITIAL_DESCRIPTION: DescriptionData = {
  intro: '',
  problem: '',
  boxContents: [''],
  features: [{ name: '', benefit: '' }],
  faqs: [{ question: '', answer: '' }],
  shipping: '',
};

export const INITIAL_PRICING: PricingData = {
  productCost: '',
  commission: '13',
  shippingCost: '',
  margin: '30',
  fixedCost: '50',
  publicationType: 'premium',
  installments: '6',
  shippingType: 'full',
  stock: '10',
};

export const INITIAL_KEYWORDS: KeywordData = {
  primary: '',
  secondary1: '',
  secondary2: '',
  secondary3: '',
  longtail1: '',
  longtail2: '',
};
