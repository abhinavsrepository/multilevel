export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  leadStatus: 'NEW' | 'WARM' | 'HOT' | 'CONVERTED' | 'LOST';
  budget: number;
  preferredLocation: string;
  assignedAssociate: string;
  lastInteractionDate: string;
  notes: ClientNote[];
  followUps: FollowUp[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientNote {
  id: number;
  clientId: number;
  associateId: number;
  note: string;
  createdAt: string;
}

export interface FollowUp {
  id: number;
  clientId: number;
  associateId: number;
  scheduledDate: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  notes: string;
  createdAt: string;
}

export interface CreateClientInput {
  name: string;
  email: string;
  phone: string;
  budget?: number;
  preferredLocation?: string;
  notes?: string;
}
