import { apiGet } from './config/axiosConfig';
import {
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  TeamStats,
  TeamMember,
  TreeNode,
  DirectReferral,
  DirectReferralPerformance,
  TeamReport,
  TeamGrowth,
} from '@/types';

// ==================== Team Statistics APIs ====================

/**
 * Get team statistics
 */
export const getTeamStats = async (): Promise<ApiResponse<TeamStats>> => {
  return apiGet<ApiResponse<TeamStats>>('/tree/stats');
};

/**
 * Get team business volume details
 */
export const getTeamBV = async (): Promise<ApiResponse<{
  personalBV: number;
  teamBV: number;
  leftBV: number;
  rightBV: number;
  matchingBV: number;
  carryForward: number;
}>> => {
  return apiGet<ApiResponse<{
    personalBV: number;
    teamBV: number;
    leftBV: number;
    rightBV: number;
    matchingBV: number;
    carryForward: number;
  }>>('/team/business-volume');
};

/**
 * Get leg comparison statistics
 */
export const getLegComparison = async (): Promise<ApiResponse<{
  left: {
    members: number;
    bv: number;
    investment: number;
    active: number;
  };
  right: {
    members: number;
    bv: number;
    investment: number;
    active: number;
  };
  weaker: 'LEFT' | 'RIGHT';
  stronger: 'LEFT' | 'RIGHT';
}>> => {
  return apiGet<ApiResponse<{
    left: {
      members: number;
      bv: number;
      investment: number;
      active: number;
    };
    right: {
      members: number;
      bv: number;
      investment: number;
      active: number;
    };
    weaker: 'LEFT' | 'RIGHT';
    stronger: 'LEFT' | 'RIGHT';
  }>>('/team/leg-comparison');
};

/**
 * Get team growth trends
 */
export const getTeamGrowth = async (params?: {
  period?: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
}): Promise<ApiResponse<TeamGrowth[]>> => {
  return apiGet<ApiResponse<TeamGrowth[]>>('/team/growth', params);
};

// ==================== Team Members APIs ====================

/**
 * Get all team members with pagination and filters
 */
export const getTeamMembers = async (params?: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  placement?: 'LEFT' | 'RIGHT';
  level?: number;
}): Promise<PaginatedResponse<TeamMember>> => {
  return apiGet<PaginatedResponse<TeamMember>>('/team/members', params);
};

/**
 * Get team member details
 */
export const getTeamMemberById = async (userId: number): Promise<ApiResponse<TeamMember>> => {
  return apiGet<ApiResponse<TeamMember>>(`/team/members/${userId}`);
};

/**
 * Get team member by user ID string
 */
export const getTeamMemberByUserId = async (userId: string): Promise<ApiResponse<TeamMember>> => {
  return apiGet<ApiResponse<TeamMember>>(`/team/members/code/${userId}`);
};

/**
 * Get active team members
 */
export const getActiveTeamMembers = async (params?: PaginationParams): Promise<PaginatedResponse<TeamMember>> => {
  return apiGet<PaginatedResponse<TeamMember>>('/team/members/active', params);
};

/**
 * Get inactive team members
 */
export const getInactiveTeamMembers = async (params?: PaginationParams): Promise<PaginatedResponse<TeamMember>> => {
  return apiGet<PaginatedResponse<TeamMember>>('/team/members/inactive', params);
};

/**
 * Search team members
 */
export const searchTeamMembers = async (search: string, params?: PaginationParams): Promise<PaginatedResponse<TeamMember>> => {
  return apiGet<PaginatedResponse<TeamMember>>('/team/members/search', { search, ...params });
};

// ==================== Binary Tree APIs ====================

/**
 * Get binary tree structure
 */
export const getBinaryTree = async (params?: {
  userId?: string;
  depth?: number;
}): Promise<ApiResponse<TreeNode>> => {
  return apiGet<ApiResponse<TreeNode>>('/tree/binary', params);
};

/**
 * Get binary tree for specific user
 */
export const getBinaryTreeForUser = async (userId: string, depth?: number): Promise<ApiResponse<TreeNode>> => {
  return apiGet<ApiResponse<TreeNode>>(`/team/binary-tree/${userId}`, { depth });
};

/**
 * Get left leg members
 */
export const getLeftLegMembers = async (params?: PaginationParams): Promise<PaginatedResponse<TeamMember>> => {
  return apiGet<PaginatedResponse<TeamMember>>('/team/binary-tree/left-leg', params);
};

/**
 * Get right leg members
 */
export const getRightLegMembers = async (params?: PaginationParams): Promise<PaginatedResponse<TeamMember>> => {
  return apiGet<PaginatedResponse<TeamMember>>('/team/binary-tree/right-leg', params);
};

/**
 * Find position in tree
 */
export const findPositionInTree = async (userId: string): Promise<ApiResponse<{
  path: string[];
  level: number;
  placement: 'LEFT' | 'RIGHT' | 'ROOT';
  parent?: {
    userId: string;
    name: string;
  };
}>> => {
  return apiGet<ApiResponse<{
    path: string[];
    level: number;
    placement: 'LEFT' | 'RIGHT' | 'ROOT';
    parent?: {
      userId: string;
      name: string;
    };
  }>>(`/team/binary-tree/find/${userId}`);
};

// ==================== Unilevel/Level Wise APIs ====================

/**
 * Get unilevel tree structure
 */
export const getUnilevelTree = async (params?: {
  userId?: string;
  maxLevels?: number;
}): Promise<ApiResponse<TreeNode>> => {
  return apiGet<ApiResponse<TreeNode>>('/team/unilevel-tree', params);
};

/**
 * Get Level Tree View with Unlock Logic (Ecogram)
 */
export const getLevelTreeView = async (params?: {
  userId?: number;
  maxLevels?: number;
}): Promise<ApiResponse<{
  tree: TreeNode;
  rootUser: {
    userId: number;
    username: string;
    fullName: string;
    rank: string;
    directReferralCount: number;
  };
  levelUnlockStatus: Record<number, boolean>;
  nextUnlockRequirement: {
    needed: number;
    message: string;
  };
  globalKPIs: {
    totalNodesRendered: number;
    totalActiveMembers: number;
    totalInactiveMembers: number;
    totalBusinessVolume: number;
  };
}>> => {
  return apiGet<ApiResponse<{
    tree: TreeNode;
    rootUser: {
      userId: number;
      username: string;
      fullName: string;
      rank: string;
      directReferralCount: number;
    };
    levelUnlockStatus: Record<number, boolean>;
    nextUnlockRequirement: {
      needed: number;
      message: string;
    };
    globalKPIs: {
      totalNodesRendered: number;
      totalActiveMembers: number;
      totalInactiveMembers: number;
      totalBusinessVolume: number;
    };
  }>>('/team/level-tree-view', params);
};

/**
 * Expand Tree Node (Lazy Loading)
 */
export const expandTreeNode = async (
  nodeId: number,
  params?: {
    maxLevels?: number;
    rootUserId?: number;
  }
): Promise<ApiResponse<TreeNode>> => {
  return apiGet<ApiResponse<TreeNode>>(`/team/level-tree-view/expand/${nodeId}`, params);
};

/**
 * Search Team Members in Tree
 */
export const searchTreeMembers = async (params: {
  query: string;
  rootUserId?: number;
}): Promise<ApiResponse<{
  userId: number;
  username: string;
  fullName: string;
  rank: string;
  status: string;
  profilePicture?: string;
  uplinePath: {
    userId: number;
    username: string;
    fullName: string;
  }[];
}[]>> => {
  return apiGet<ApiResponse<{
    userId: number;
    username: string;
    fullName: string;
    rank: string;
    status: string;
    profilePicture?: string;
    uplinePath: {
      userId: number;
      username: string;
      fullName: string;
    }[];
  }[]>>('/team/level-tree-view/search', params);
};

/**
 * Get members by level
 */
export const getMembersByLevel = async (
  level: number,
  params?: PaginationParams
): Promise<PaginatedResponse<TeamMember>> => {
  return apiGet<PaginatedResponse<TeamMember>>(`/team/level/${level}`, params);
};

/**
 * Get level breakdown
 */
export const getLevelBreakdown = async (): Promise<ApiResponse<{
  level: number;
  members: number;
  active: number;
  investment: number;
  bv: number;
  percentage: number;
}[]>> => {
  return apiGet<ApiResponse<{
    level: number;
    members: number;
    active: number;
    investment: number;
    bv: number;
    percentage: number;
  }[]>>('/team/level-breakdown');
};

// ==================== Direct Referrals APIs ====================

/**
 * Get direct referrals
 */
export const getDirectReferrals = async (params?: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  status?: 'ACTIVE' | 'INACTIVE';
}): Promise<PaginatedResponse<DirectReferral>> => {
  return apiGet<PaginatedResponse<DirectReferral>>('/team/direct-referrals', params);
};

/**
 * Get active direct referrals
 */
export const getActiveDirectReferrals = async (params?: PaginationParams): Promise<PaginatedResponse<DirectReferral>> => {
  return apiGet<PaginatedResponse<DirectReferral>>('/team/direct-referrals/active', params);
};

/**
 * Get inactive direct referrals
 */
export const getInactiveDirectReferrals = async (params?: PaginationParams): Promise<PaginatedResponse<DirectReferral>> => {
  return apiGet<PaginatedResponse<DirectReferral>>('/team/direct-referrals/inactive', params);
};

/**
 * Get direct referrals statistics
 */
export const getDirectReferralsStats = async (): Promise<ApiResponse<{
  total: number;
  active: number;
  inactive: number;
  thisMonth: number;
  totalInvestment: number;
  totalBV: number;
}>> => {
  return apiGet<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    thisMonth: number;
    totalInvestment: number;
    totalBV: number;
  }>>('/team/direct-referrals/stats');
};

/**
 * Get direct referral performance with enhanced metrics for Leadership Dashboard
 */
export const getDirectReferralPerformance = async (params?: {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ALL';
  performanceFilter?: 'TOP_PERFORMERS' | 'NEEDS_COACHING' | 'ALL';
  search?: string;
}): Promise<PaginatedResponse<DirectReferralPerformance>> => {
  return apiGet<PaginatedResponse<DirectReferralPerformance>>('/team/direct-referrals/performance', params);
};

// ==================== Team Reports APIs ====================

/**
 * Get comprehensive team report
 */
export const getTeamReport = async (): Promise<ApiResponse<TeamReport>> => {
  return apiGet<ApiResponse<TeamReport>>('/team/report');
};

/**
 * Get team performance metrics
 */
export const getTeamPerformance = async (params?: {
  period?: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
}): Promise<ApiResponse<{
  totalInvestment: number;
  activeInvestors: number;
  propertiesInvested: number;
  averageInvestment: number;
  totalBV: number;
  totalEarnings: number;
}>> => {
  return apiGet<ApiResponse<{
    totalInvestment: number;
    activeInvestors: number;
    propertiesInvested: number;
    averageInvestment: number;
    totalBV: number;
    totalEarnings: number;
  }>>('/team/performance', params);
};

/**
 * Get top performers
 */
export const getTopPerformers = async (params?: {
  category?: 'INVESTMENT' | 'TEAM_SIZE' | 'EARNINGS';
  limit?: number;
}): Promise<ApiResponse<{
  byInvestment: TeamMember[];
  byTeamSize: TeamMember[];
  byEarnings: TeamMember[];
}>> => {
  return apiGet<ApiResponse<{
    byInvestment: TeamMember[];
    byTeamSize: TeamMember[];
    byEarnings: TeamMember[];
  }>>('/team/top-performers', params);
};

// ==================== Team Analysis APIs ====================

/**
 * Get team investment summary
 */
export const getTeamInvestmentSummary = async (): Promise<ApiResponse<{
  totalInvestment: number;
  totalInvestors: number;
  averageInvestment: number;
  activeInvestments: number;
  completedInvestments: number;
  totalProperties: number;
}>> => {
  return apiGet<ApiResponse<{
    totalInvestment: number;
    totalInvestors: number;
    averageInvestment: number;
    activeInvestments: number;
    completedInvestments: number;
    totalProperties: number;
  }>>('/team/investment-summary');
};

/**
 * Get team rank distribution
 */
export const getTeamRankDistribution = async (): Promise<ApiResponse<{
  rank: string;
  count: number;
  percentage: number;
}[]>> => {
  return apiGet<ApiResponse<{
    rank: string;
    count: number;
    percentage: number;
  }[]>>('/team/rank-distribution');
};

/**
 * Get team activity summary
 */
export const getTeamActivitySummary = async (params?: {
  days?: number;
}): Promise<ApiResponse<{
  newJoinings: number;
  newInvestments: number;
  activeMembers: number;
  totalInvestment: number;
  totalBV: number;
}>> => {
  return apiGet<ApiResponse<{
    newJoinings: number;
    newInvestments: number;
    activeMembers: number;
    totalInvestment: number;
    totalBV: number;
  }>>('/team/activity-summary', params);
};

// ==================== Genealogy Search APIs ====================

/**
 * Search in genealogy
 */
export const searchGenealogy = async (search: string): Promise<ApiResponse<TeamMember[]>> => {
  return apiGet<ApiResponse<TeamMember[]>>('/team/genealogy/search', { search });
};

/**
 * Get genealogy path to member
 */
export const getGenealogyPath = async (userId: string): Promise<ApiResponse<{
  path: TeamMember[];
  depth: number;
}>> => {
  return apiGet<ApiResponse<{
    path: TeamMember[];
    depth: number;
  }>>(`/team/genealogy/path/${userId}`);
};

// ==================== Sponsor Details APIs ====================

/**
 * Get sponsor details
 */
export const getSponsorDetails = async (): Promise<ApiResponse<{
  userId: string;
  name: string;
  email: string;
  mobile: string;
  rank: string;
  profilePicture?: string;
  joiningDate: string;
}>> => {
  return apiGet<ApiResponse<{
    userId: string;
    name: string;
    email: string;
    mobile: string;
    rank: string;
    profilePicture?: string;
    joiningDate: string;
  }>>('/team/sponsor');
};

/**
 * Get upline details
 */
export const getUplineDetails = async (levels?: number): Promise<ApiResponse<{
  level: number;
  userId: string;
  name: string;
  rank: string;
  profilePicture?: string;
}[]>> => {
  return apiGet<ApiResponse<{
    level: number;
    userId: string;
    name: string;
    rank: string;
    profilePicture?: string;
  }[]>>('/team/upline', { levels });
};

/**
 * Get placement parent details
 */
export const getPlacementParent = async (): Promise<ApiResponse<{
  userId: string;
  name: string;
  email: string;
  mobile: string;
  rank: string;
  profilePicture?: string;
  placement: 'LEFT' | 'RIGHT';
}>> => {
  return apiGet<ApiResponse<{
    userId: string;
    name: string;
    email: string;
    mobile: string;
    rank: string;
    profilePicture?: string;
    placement: 'LEFT' | 'RIGHT';
  }>>('/team/placement-parent');
};

// ==================== Team Export APIs ====================

/**
 * Download team report
 */
export const downloadTeamReport = async (params: {
  reportType: 'FULL' | 'DIRECT' | 'LEVEL' | 'BINARY';
  format: 'PDF' | 'EXCEL' | 'CSV';
  level?: number;
  placement?: 'LEFT' | 'RIGHT';
}): Promise<Blob> => {
  const queryParams = new URLSearchParams({
    reportType: params.reportType,
    format: params.format,
    ...(params.level && { level: params.level.toString() }),
    ...(params.placement && { placement: params.placement }),
  });

  const response = await fetch(`/api/team/report/download?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.blob();
};

/**
 * Email team report
 */
export const emailTeamReport = async (params: {
  reportType: 'FULL' | 'DIRECT' | 'LEVEL' | 'BINARY';
  email?: string;
  level?: number;
  placement?: 'LEFT' | 'RIGHT';
}): Promise<ApiResponse> => {
  return apiGet<ApiResponse>('/team/report/email', params);
};

// ==================== Team Notifications APIs ====================

/**
 * Get recent team activities
 */
export const getRecentTeamActivities = async (params?: {
  limit?: number;
  activityType?: 'NEW_JOINING' | 'NEW_INVESTMENT' | 'RANK_UPGRADE' | 'ALL';
}): Promise<ApiResponse<{
  type: string;
  userId: string;
  userName: string;
  description: string;
  timestamp: string;
}[]>> => {
  return apiGet<ApiResponse<{
    type: string;
    userId: string;
    userName: string;
    description: string;
    timestamp: string;
  }[]>>('/team/activities', params);
};
