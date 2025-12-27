import axios from './axiosConfig';

export interface ClubMember {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  clubStatus: 'Rising Stars Club' | 'Business Leaders Club' | 'Millionaire CLUB';
  clubProgress: {
    group1: number;
    group2: number;
    group3: number;
  };
  createdAt: string;
}

export interface ClubStats {
  club: 'Rising Stars Club' | 'Business Leaders Club' | 'Millionaire CLUB';
  members: number;
}

/**
 * Get all club members
 */
export const getAllClubMembers = async (clubLevel?: string): Promise<{ success: boolean; data: ClubMember[] }> => {
  const params = clubLevel ? { clubLevel } : {};
  const response = await axios.get('/club/members', { params });
  return response.data;
};

/**
 * Get club statistics
 */
export const getClubStatistics = async (): Promise<{ success: boolean; data: ClubStats[] }> => {
  const response = await axios.get('/club/statistics');
  return response.data;
};

/**
 * Update user's club status (trigger recalculation)
 */
export const updateUserClubStatus = async (userId: number): Promise<{ success: boolean; message: string }> => {
  const response = await axios.post(`/club/update/${userId}`);
  return response.data;
};

/**
 * Manually trigger monthly royalty distribution
 */
export const distributeMonthlyRoyalty = async (): Promise<{ success: boolean; message: string }> => {
  const response = await axios.post('/club/distribute-royalty');
  return response.data;
};
