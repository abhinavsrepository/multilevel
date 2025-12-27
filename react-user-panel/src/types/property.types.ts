// Property Types
export interface Property {
  id: number;
  propertyId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  category: 'READY_TO_MOVE' | 'UNDER_CONSTRUCTION';
  status: PropertyStatus;
  price: number;
  minInvestment: number;
  maxInvestmentPerUser: number;
  bvValue: number;
  expectedROI: number;
  roiTenure: number;
  annualAppreciation: number;
  rentalYield?: number;
  location: PropertyLocation;
  city?: string;
  details: PropertyDetails;
  amenities: string[];
  images: string[];
  videos?: string[];
  virtualTourUrl?: string;
  documents: PropertyDocument[];
  developer: Developer;
  bookingInfo: BookingInfo;
  commissionStructure: CommissionStructure;
  investmentStats: InvestmentStats;
  isFeatured: boolean;
  isNewLaunch: boolean;
  listedDate: string;
  views: number;
}

export type PropertyType =
  | 'RESIDENTIAL'
  | 'COMMERCIAL'
  | 'PLOT'
  | 'VILLA'
  | 'APARTMENT'
  | 'LAND';

export type PropertyStatus =
  | 'AVAILABLE'
  | 'BOOKING_OPEN'
  | 'FEW_SLOTS_LEFT'
  | 'SOLD_OUT'
  | 'UPCOMING';

export interface PropertyLocation {
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  nearbyFacilities?: NearbyFacility[];
}

export interface NearbyFacility {
  type: string;
  name: string;
  distance: string;
}

export interface PropertyDetails {
  totalArea: number;
  builtUpArea?: number;
  carpetArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  totalFloors?: number;
  facing?: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'NORTH_EAST' | 'NORTH_WEST' | 'SOUTH_EAST' | 'SOUTH_WEST';
  furnishing?: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';
  ageOfProperty?: number;
  possession?: string;
}

export interface PropertyDocument {
  id: number;
  documentType: string;
  documentName: string;
  documentUrl: string;
}

export interface Developer {
  id: number;
  name: string;
  reraNumber?: string;
  contactNumber: string;
  email: string;
  about?: string;
}

export interface BookingInfo {
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  bookingProgress: number;
}

export interface CommissionStructure {
  directReferralEnabled: boolean;
  directReferralPercentage: number;
  levelCommissionEnabled: boolean;
  binaryCommissionEnabled: boolean;
}

export interface InvestmentStats {
  totalInvestments: number;
  totalInvestorsCount: number;
  averageInvestment: number;
  recentInvestments: RecentInvestment[];
}

export interface RecentInvestment {
  investorName: string;
  amount: number;
  bv: number;
  date: string;
}

// Property Filters
export interface PropertyFilters {
  propertyType?: PropertyType[];
  city?: string[];
  minPrice?: number;
  maxPrice?: number;
  minInvestment?: number;
  maxInvestment?: number;
  status?: PropertyStatus[];
  minROI?: number;
  amenities?: string[];
  sortBy?: 'LATEST' | 'PRICE_LOW_TO_HIGH' | 'PRICE_HIGH_TO_LOW' | 'POPULAR' | 'HIGHEST_ROI';
}
