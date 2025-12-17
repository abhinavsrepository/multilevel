export interface Task {
  id: number;
  associateId: number;
  title: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  linkedEntity?: {
    type: 'CLIENT' | 'PROPERTY' | 'BOOKING';
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate: string;
  priority: string;
  linkedEntityType?: string;
  linkedEntityId?: number;
}
