export interface AuditLog {
  id: number;
  timestamp: string;
  adminUser: {
    id: number;
    fullName: string;
    email: string;
  };
  action:
    | 'LOGIN'
    | 'LOGOUT'
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'APPROVE'
    | 'REJECT'
    | 'BLOCK'
    | 'ACTIVATE';
  entityType: string;
  entityId: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'FAILED';

  // Change tracking
  beforeData?: Record<string, any>;
  afterData?: Record<string, any>;

  // Request details
  requestMethod?: string;
  requestUrl?: string;
  requestBody?: any;
  responseStatus?: number;
}

export interface AuditFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  action?: string;
  entityType?: string;
  adminUserId?: string;
  status?: string;
}
