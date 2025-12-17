export interface Commission {
  id: number;
  associateId: number;
  type: 'DIRECT' | 'OVERRIDE' | 'PERFORMANCE' | 'BONUS';
  amount: number;
  source: string;
  sourceId: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
  paidDate?: string;
  createdAt: string;
}

export interface CommissionSummary {
  totalEarned: number;
  totalPending: number;
  totalPaid: number;
  thisMonth: number;
  lastMonth: number;
  byType: {
    type: string;
    amount: number;
  }[];
}
