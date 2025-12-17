export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'ASSOCIATE' | 'CUSTOMER' | 'ADMIN';
  avatar?: string;
  associateCode?: string;
  companyName?: string;
  designation?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  totalClients: number;
  activeClients: number;
  totalBookings: number;
  totalCommission: number;
}
