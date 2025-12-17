export interface Property {
  id: number;
  propertyId: string;
  title: string;
  description: string;
  propertyType: 'RESIDENTIAL' | 'COMMERCIAL' | 'PLOT' | 'VILLA' | 'APARTMENT' | 'LAND';
  category: 'READY_TO_MOVE' | 'UNDER_CONSTRUCTION' | 'PRE_LAUNCH';

  // Location
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  googleMapsLink?: string;
  latitude?: number;
  longitude?: number;

  // Specifications
  totalArea: number;
  areaUnit: 'SQ_FT' | 'ACRES';
  builtUpArea?: number;
  carpetArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  totalFloorsInBuilding?: number;
  propertyAge?: number;
  facingDirection?: string;
  furnishingStatus?: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';

  // Amenities
  amenities: string[];

  // Pricing
  basePrice: number;
  investmentPrice: number;
  minimumInvestment: number;
  maximumInvestmentPerUser?: number;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;

  // Commission
  directReferralCommissionPercent: number;
  bvValue: number;
  levelCommissionEnabled: boolean;
  binaryCommissionEnabled: boolean;

  // ROI
  expectedROI: number;
  roiTenure: number;
  annualAppreciationRate: number;
  rentalYield: number;

  // Developer
  developerName?: string;
  reraNumber?: string;
  developerContact?: string;
  developerEmail?: string;

  // Documents
  documents: PropertyDocument[];

  // Media
  images: PropertyImage[];
  videos: string[];
  virtualTourLink?: string;
  brochureUrl?: string;

  // Nearby Facilities
  nearbyFacilities: NearbyFacility[];

  // Status
  status: 'AVAILABLE' | 'BOOKING_OPEN' | 'BOOKING_CLOSED' | 'SOLD_OUT' | 'UNDER_CONSTRUCTION' | 'COMPLETED';
  launchDate?: string;
  bookingCloseDate?: string;
  expectedCompletionDate?: string;
  possessionDate?: string;

  // Flags
  featured: boolean;
  trending: boolean;
  bestSeller: boolean;

  // Stats
  viewsCount: number;
  totalInvested: number;
  investorsCount: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface PropertyDocument {
  id: number;
  documentType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface PropertyImage {
  id: number;
  imageUrl: string;
  isFeatured: boolean;
  displayOrder: number;
}

export interface NearbyFacility {
  id: number;
  facilityType: string;
  facilityName: string;
  distance: number;
}

export interface PropertyFilters {
  search?: string;
  propertyType?: string;
  city?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface CreatePropertyRequest {
  title: string;
  description: string;
  propertyType: string;
  category: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  basePrice: number;
  investmentPrice: number;
  minimumInvestment: number;
  totalSlots: number;
  directReferralCommissionPercent: number;
  bvValue: number;
  expectedROI: number;
  roiTenure: number;
  status: string;
  // ... other fields
}

export interface PropertyInvestor {
  id: number;
  user: {
    userId: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
  investmentAmount: number;
  bvAllocated: number;
  investmentType: 'FULL' | 'INSTALLMENT';
  investmentDate: string;
  status: string;
}
