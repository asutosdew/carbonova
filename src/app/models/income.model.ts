export type IncomeType = 'direct' | 'level' | 'autopool' | 'carbon_royalty' | 'fertilizer_rebate';

export interface IncomeBreakdown {
  directIncome: number;
  levelIncome: number;
  autopoolIncome: number;
  carbonRoyalty: number;
  fertilizerRebate: number;
  totalEarned: number;
  walletBalance: number;
  withdrawnTotal: number;
  pendingPayouts: number;
  enrolledAutopoolId?: string | null;
}

export interface IncomeTransaction {
  id: string;
  date: string;
  type: IncomeType;
  title: string;
  description: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Processing';
  fromFarmerName?: string;
  fromFarmerId?: string;
  level?: number;
  poolTier?: string;
}

export interface LevelCommissionRate {
  level: number;
  percentage: number;
  requiredDirects?: number; // Zero directs required (all levels unconditionally unlocked)
  unlocked: boolean;
  teamCount: number;
  businessVolume: number;
  totalIncomeEarned: number;
}

export interface AutopoolTier {
  id: string;
  name: string;
  badge: string;
  entryFee?: number; // 0 (No Joining Fee - Free Entry)
  requiredLevel1Members: number; // 10, 25, 50, 100
  requiredTotalMembers: number;  // 50, 200, 500, 5000
  currentLevel1Members: number;
  currentTotalMembers: number;
  level1ProgressPercentage?: number;
  totalMembersProgressPercentage?: number;
  enrolledMembers: number;        // Active members in this single pool company-wide
  totalPoolFund: number;          // Total amount generated in this pool
  perMemberShare: number;         // Equal distribution per enrolled member (totalPoolFund / enrolledMembers)
  isCurrentActivePool: boolean;   // True if user is currently active in this pool
  poolPayout: number;
  status: 'Active' | 'Enrolled' | 'Graduated' | 'Target' | 'Completed' | 'Locked' | 'In-Progress';
  reEntryBonus?: number;
  progressPercentage: number;
}

export interface PayoutRequest {
  id: string;
  requestedAt: string;
  amount: number;
  tdsAmount: number; // 5%
  adminFee: number; // 5%
  netPayable: number;
  payoutMethod: 'Bank Transfer' | 'UPI';
  accountDetails: string;
  status: 'Paid' | 'Processing' | 'Pending';
  referenceId?: string;
}
