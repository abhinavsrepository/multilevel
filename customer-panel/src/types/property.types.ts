export interface Property {
  id: number;
  title: string;
  description: string;
  type: 'RESIDENTIAL' | 'COMMERCIAL' | 'PLOT' | 'VILLA' | 'APARTMENT';
  location: string;
  city: string;
  state: string;
  price: number;
  area: number;
  areaUnit: 'SQ_FT' | 'SQ_YD' | 'ACRE';
  minInvestment: number;
  maxInvestment: number;
  availabilityStatus: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  featured: boolean;
  trending: boolean;
  images: string[];
  amenities: string[];
  documents: PropertyDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertyDocument {
  id: number;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface PropertyFilter {
  location?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  type?: string;
  availabilityStatus?: string;
  featured?: boolean;
  trending?: boolean;
}

export interface PropertyComparison {
  properties: Property[];
}
