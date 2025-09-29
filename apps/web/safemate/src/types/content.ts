export interface HeroContent {
  title: string;
  subtitle: string;
  primary_cta_text: string;
  primary_cta_link: string;
  secondary_cta_text: string;
  secondary_cta_link: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesContent {
  title: string;
  subtitle: string;
  features: Feature[];
}

export interface UseCaseCategory {
  title: string;
  icon: string;
  items: string[];
}

export interface UseCasesContent {
  title: string;
  subtitle: string;
  categories: UseCaseCategory[];
}

export interface FunctionContent {
  title: string;
  subtitle: string;
  categories: UseCaseCategory[];
}

export interface TimelineTask {
  text: string;
  status: 'completed' | 'in-progress' | 'planned';
}

export interface TimelineItem {
  title: string;
  period: string;
  status: 'completed' | 'in-progress' | 'planned';
  tasks: TimelineTask[];
}

export interface RoadmapContent {
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  timeline: TimelineItem[];
}

export interface TokenInfo {
  initial_supply: string;
  max_supply: string;
  token_id: string;
  network: string;
}

export interface DistributionItem {
  category: string;
  percentage: number;
  color: string;
}

export interface TokenomicsContent {
  title: string;
  subtitle: string;
  description: string;
  cta_text: string;
  cta_link: string;
  token_info: TokenInfo;
  distribution: DistributionItem[];
}

export interface FooterContent {
  tagline: string;
  contact_email: string;
  website: string;
  copyright: string;
}

export interface LandingPageContent {
  hero: HeroContent;
  function: FeaturesContent;
  features: FeaturesContent;
  useCases: UseCasesContent;
  roadmap: RoadmapContent;
  tokenomics: TokenomicsContent;
  footer: FooterContent;
} 