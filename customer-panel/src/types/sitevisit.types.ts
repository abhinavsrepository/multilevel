export interface SiteVisit {
  id: number;
  clientId: number;
  clientName: string;
  propertyId: number;
  propertyTitle: string;
  associateId: number;
  visitDate: string;
  visitTime: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSiteVisitInput {
  clientId: number;
  propertyId: number;
  visitDate: string;
  visitTime: string;
  notes?: string;
}

export interface UpdateSiteVisitInput {
  visitDate?: string;
  visitTime?: string;
  status?: string;
  notes?: string;
}
