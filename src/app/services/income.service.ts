import { Injectable, signal, computed, inject } from '@angular/core';
import { IncomeBreakdown, IncomeTransaction, LevelCommissionRate, AutopoolTier, PayoutRequest } from '../models/income.model';
import { MembersService } from './members.service';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private readonly membersService = inject(MembersService);

  // Income Summary State
  readonly breakdown = signal<IncomeBreakdown>({
    directIncome: 0,
    levelIncome: 0,
    autopoolIncome: 0,
    carbonRoyalty: 0,
    fertilizerRebate: 0,
    totalEarned: 0,
    walletBalance: 0,
    withdrawnTotal: 0,
    pendingPayouts: 0
  });

  // Level Commission Matrix (10 Levels - 128 Total Downline Farmers)
  readonly levelCommissionRates = signal<LevelCommissionRate[]>([
    { level: 1, percentage: 10, requiredDirects: 1, unlocked: true, teamCount: 5, businessVolume: 50000, totalIncomeEarned: 5000 },
    { level: 2, percentage: 5, requiredDirects: 2, unlocked: true, teamCount: 18, businessVolume: 180000, totalIncomeEarned: 9000 },
    { level: 3, percentage: 3, requiredDirects: 3, unlocked: true, teamCount: 32, businessVolume: 320000, totalIncomeEarned: 9600 },
    { level: 4, percentage: 2, requiredDirects: 4, unlocked: true, teamCount: 24, businessVolume: 240000, totalIncomeEarned: 4800 },
    { level: 5, percentage: 2, requiredDirects: 5, unlocked: true, teamCount: 16, businessVolume: 160000, totalIncomeEarned: 3200 },
    { level: 6, percentage: 1, requiredDirects: 6, unlocked: true, teamCount: 12, businessVolume: 120000, totalIncomeEarned: 1200 },
    { level: 7, percentage: 1, requiredDirects: 7, unlocked: true, teamCount: 8, businessVolume: 80000, totalIncomeEarned: 800 },
    { level: 8, percentage: 1, requiredDirects: 8, unlocked: true, teamCount: 6, businessVolume: 60000, totalIncomeEarned: 600 },
    { level: 9, percentage: 0.5, requiredDirects: 9, unlocked: true, teamCount: 4, businessVolume: 40000, totalIncomeEarned: 200 },
    { level: 10, percentage: 0.5, requiredDirects: 10, unlocked: true, teamCount: 3, businessVolume: 30000, totalIncomeEarned: 150 }
  ]);

  // Autopool Tiers
  readonly autopoolTiers = signal<AutopoolTier[]>([
    {
      id: 'AP-1',
      name: 'Starter Green Autopool',
      badge: 'Starter',
      entryFee: 1000,
      level1Members: 2,
      level2Members: 4,
      level3Members: 8,
      totalMembers: 14,
      currentMembers: 14,
      poolPayout: 5000,
      status: 'Completed',
      reEntryBonus: 1000,
      progressPercentage: 100
    },
    {
      id: 'AP-2',
      name: 'Silver Carbon Autopool',
      badge: 'Silver',
      entryFee: 3000,
      level1Members: 3,
      level2Members: 9,
      level3Members: 27,
      totalMembers: 39,
      currentMembers: 30,
      poolPayout: 15000,
      status: 'In-Progress',
      reEntryBonus: 3000,
      progressPercentage: 77
    },
    {
      id: 'AP-3',
      name: 'Gold Agroforestry Autopool',
      badge: 'Gold',
      entryFee: 10000,
      level1Members: 3,
      level2Members: 9,
      level3Members: 27,
      totalMembers: 39,
      currentMembers: 12,
      poolPayout: 60000,
      status: 'Active',
      reEntryBonus: 10000,
      progressPercentage: 31
    },
    {
      id: 'AP-4',
      name: 'Diamond Net-Zero Club',
      badge: 'Diamond',
      entryFee: 25000,
      level1Members: 3,
      level2Members: 9,
      level3Members: 27,
      totalMembers: 39,
      currentMembers: 0,
      poolPayout: 250000,
      status: 'Locked',
      reEntryBonus: 25000,
      progressPercentage: 0
    }
  ]);

  // Income Ledger Transactions
  readonly transactions = signal<IncomeTransaction[]>([
    {
      id: 'TXN-9021',
      date: '31 Aug 2026',
      type: 'direct',
      title: 'Direct Referral Commission',
      description: '10% on Green Starter Package (₹10,000)',
      amount: 1000,
      status: 'Completed',
      fromFarmerName: 'Ramesh Patel',
      fromFarmerId: 'CGC-158201'
    },
    {
      id: 'TXN-9019',
      date: '30 Aug 2026',
      type: 'carbon_royalty',
      title: 'Monthly Carbon Offset Royalty',
      description: 'Verified 38 trees @ ₹78.94/tree dividend distribution',
      amount: 3000,
      status: 'Completed'
    },
    {
      id: 'TXN-9015',
      date: '28 Aug 2026',
      type: 'autopool',
      title: 'Silver Autopool Level 2 Spillover',
      description: 'Auto spillover position payout (Tier 2)',
      amount: 2500,
      status: 'Completed',
      poolTier: 'Silver Carbon'
    },
    {
      id: 'TXN-9012',
      date: '27 Aug 2026',
      type: 'level',
      title: 'Level 2 Commission (5%)',
      description: 'Downline package purchase by Sunita Devi',
      amount: 500,
      status: 'Completed',
      fromFarmerName: 'Sunita Devi',
      fromFarmerId: 'CGC-157990',
      level: 2
    },
    {
      id: 'TXN-9008',
      date: '25 Aug 2026',
      type: 'direct',
      title: 'Direct Referral Commission',
      description: '10% on Agroforestry Package (₹25,000)',
      amount: 2500,
      status: 'Completed',
      fromFarmerName: 'Priya Sharma',
      fromFarmerId: 'CGC-157404'
    },
    {
      id: 'TXN-9004',
      date: '22 Aug 2026',
      type: 'fertilizer_rebate',
      title: 'Bio-Fertilizer Bulk Purchase Cashback',
      description: '5% Partner repurchase cashback on Bio-NPK & Vermicompost',
      amount: 1500,
      status: 'Completed'
    },
    {
      id: 'TXN-9001',
      date: '15 Aug 2026',
      type: 'autopool',
      title: 'Starter Green Autopool Completion Bonus',
      description: '14/14 Matrix full cycle completion payout',
      amount: 5000,
      status: 'Completed',
      poolTier: 'Starter Green'
    }
  ]);

  // Payout / Withdrawal history
  readonly payouts = signal<PayoutRequest[]>([
    {
      id: 'PAY-8801',
      requestedAt: '24 Aug 2026',
      amount: 15000,
      tdsAmount: 750,
      adminFee: 750,
      netPayable: 13500,
      payoutMethod: 'Bank Transfer',
      accountDetails: 'SBI (•••• 8492)',
      status: 'Paid',
      referenceId: 'UTR202608249038472'
    },
    {
      id: 'PAY-8762',
      requestedAt: '12 Aug 2026',
      amount: 20000,
      tdsAmount: 1000,
      adminFee: 1000,
      netPayable: 18000,
      payoutMethod: 'Bank Transfer',
      accountDetails: 'SBI (•••• 8492)',
      status: 'Paid',
      referenceId: 'UTR202608121087429'
    }
  ]);

  // Request Withdrawal Method
  requestWithdrawal(amount: number, method: 'Bank Transfer' | 'UPI', accountInfo: string): { success: boolean; message: string; payout?: PayoutRequest } {
    const currentBal = this.breakdown().walletBalance;
    if (amount <= 0) {
      return { success: false, message: 'Invalid withdrawal amount.' };
    }
    if (amount > currentBal) {
      return { success: false, message: 'Insufficient wallet balance.' };
    }
    if (amount < 500) {
      return { success: false, message: 'Minimum withdrawal amount is ₹500.' };
    }

    const tds = amount * 0.05; // 5% TDS
    const admin = amount * 0.05; // 5% Admin Maintenance
    const net = amount - tds - admin;

    const newPayout: PayoutRequest = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      requestedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      amount,
      tdsAmount: tds,
      adminFee: admin,
      netPayable: net,
      payoutMethod: method,
      accountDetails: accountInfo,
      status: 'Processing',
      referenceId: `UTR${Date.now().toString().slice(-9)}`
    };

    // Update wallet
    this.breakdown.update(b => ({
      ...b,
      walletBalance: b.walletBalance - amount,
      withdrawnTotal: b.withdrawnTotal + net,
      pendingPayouts: b.pendingPayouts + 1
    }));

    this.payouts.update(list => [newPayout, ...list]);

    return { success: true, message: `Withdrawal request for ₹${amount.toLocaleString()} submitted successfully! Net payable: ₹${net.toLocaleString()} (after 5% TDS & 5% Admin Fee).`, payout: newPayout };
  }

  constructor() {
    this.loadLiveIncomeData();
  }

  async loadLiveIncomeData(): Promise<void> {
    try {
      const [resDownline, resAccount] = await Promise.allSettled([
        this.membersService.downlinestatus(),
        this.membersService.myaccount()
      ]);

      const data = resDownline.status === 'fulfilled' ? (resDownline.value?.result || resDownline.value?.data || resDownline.value) : null;
      const accountRes = resAccount.status === 'fulfilled' ? resAccount.value?.result : null;
      const summary = accountRes?.summary;

      if (summary) {
        this.breakdown.set({
          walletBalance: Number(summary.walletBalance ?? 0),
          totalEarned: Number(summary.totalEarned ?? 0),
          withdrawnTotal: Number(summary.withdrawnTotal ?? 0),
          pendingPayouts: Number(summary.pendingPayouts ?? 0),
          directIncome: Number(summary.directIncome ?? (data?.directincome ?? 0)),
          levelIncome: Number(summary.levelIncome ?? (data?.levelincome ?? 0)),
          autopoolIncome: Number(summary.autopoolIncome ?? (data?.autopoolincome ?? 0)),
          carbonRoyalty: Number(summary.carbonRoyalty ?? 0),
          fertilizerRebate: Number(summary.fertilizerRebate ?? 0)
        });
      } else if (data) {
        const direct = data.directincome !== undefined ? parseFloat(data.directincome) : 0;
        const level = data.levelincome !== undefined ? parseFloat(data.levelincome) : 0;
        const autopool = data.autopoolincome !== undefined ? parseFloat(data.autopoolincome) : 0;
        const carbonRoyalty = data.carbonroyalty !== undefined ? parseFloat(data.carbonroyalty) : 0;
        const fertilizerRebate = data.fertilizerrebate !== undefined ? parseFloat(data.fertilizerrebate) : 0;
        const totalEarned = data.totalearned !== undefined ? parseFloat(data.totalearned) : (direct + level + autopool + carbonRoyalty + fertilizerRebate);
        const walletBalance = data.walletbalance !== undefined ? parseFloat(data.walletbalance) : totalEarned;

        this.breakdown.set({
          directIncome: direct,
          levelIncome: level,
          autopoolIncome: autopool,
          carbonRoyalty,
          fertilizerRebate,
          totalEarned,
          walletBalance,
          withdrawnTotal: 0,
          pendingPayouts: 0
        });
      }

      if (Array.isArray(accountRes?.transactions) && accountRes.transactions.length > 0) {
        this.transactions.set(accountRes.transactions);
      }
      if (Array.isArray(accountRes?.payoutHistory) && accountRes.payoutHistory.length > 0) {
        this.payouts.set(accountRes.payoutHistory);
      }
    } catch (e) {
      console.warn('[IncomeService] Live server data skipped (offline or unauthenticated):', e);
    }
  }
}
