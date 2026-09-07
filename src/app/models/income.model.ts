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
  requiredDirects: number;
  unlocked: boolean;
  teamCount: number;
  businessVolume: number;
  totalIncomeEarned: number;
}

export interface AutopoolTier {
  id: string;
  name: string;
  badge: string;
  entryFee: number;
  level1Members: number; // e.g. 2 or 3
  level2Members: number; // e.g. 4 or 9
  level3Members: number;
  totalMembers: number;
  currentMembers: number;
  poolPayout: number;
  status: 'Active' | 'Completed' | 'Locked' | 'In-Progress';
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
