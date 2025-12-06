
export type Language = 'en' | 'de' | 'fr' | 'it' | 'es';
export type ContentType = 'article' | 'page';

export interface SEOData {
  score: number;
  keywords: string[];
  suggestions: string[];
  metaDescription: string;
}

export interface ArticleContent {
  title: string;
  summary: string;
  content: string;
}

export interface Article extends ArticleContent {
  id: string;
  type: ContentType;
  imageUrl: string;
  imageCredit?: string; // New field for image attribution
  videoUrl?: string; // YouTube URL
  author: string;
  category: string; // Dynamic string now
  publishedAt: string;
  featured: boolean;
  source?: string; // Name of the source
  sourceUrl?: string; // URL backlink to the source
  seo?: SEOData;
  views: number;    // Analytics
  shares: number;   // Analytics
  readTime: number; // Analytics (seconds)
  translations?: {
    [key in Language]?: ArticleContent;
  };
}

export interface CMSState {
  isEditing: boolean;
  activeArticleId: string | null;
}

export type CompanyCategory = 'Installateur' | 'Großhändler' | 'Hersteller' | 'Dienstleister' | 'Handwerker';

export interface Company {
  id: string;
  name: string;
  category: CompanyCategory;
  logoUrl: string;
  description: string;
  contactPerson?: string; // New field
  phone: string;
  email: string;
  website: string;
  address: {
    street: string;
    city: string;
    zip: string;
  };
  views: number;
  clicks: number;
}