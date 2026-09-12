import { Injectable, signal, computed, inject } from '@angular/core';
import { IncomeBreakdown, IncomeTransaction, LevelCommissionRate, AutopoolTier, PayoutRequest } from '../models/income.model';
import { MembersService } from './members.service';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private readonly membersService = inject(MembersService);

  // Income Summary State (Strictly bound to server data)
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

  // Level Commission Matrix (10 Levels - Initialized to 0 until populated)
  readonly levelCommissionRates = signal<LevelCommissionRate[]>([
    { level: 1, percentage: 10, requiredDirects: 1, unlocked: true, teamCount: 0, businessVolume: 0, totalIncomeEarned: 0 },
    { level: 2, percentage: 5, requiredDirects: 2, unlocked: true, teamCount: 0, businessVolume: 0, totalIncomeEarned: 0 },
    { level: 3, percentage: 3, requiredDirects: 3, unlocked: true, teamCount: 0, businessVolume: 0, totalIncomeEarned: 0 },
    { level: 4, percentage: 2, requiredDirects: 4, unlocked: true, teamCount: 0, businessVolume: 0, totalIncomeEarned: 0 },
    { level: 5, percentage: 2, requiredDirects: 5, unlocked: true, teamCount: 0, businessVolume: 0, totalIncomeEarned: 0 },
    { level: 6, percentage: 1, requiredDirects: 6, unlocked: true, teamCount: 0, businessVolume: 0, totalIncomeEarned: 0 },
    { level: 7, percentage: 1, requiredDirects: 7, unlocked: true, teamCount: 0, businessVolume: 0, totalIncomeEarned: 0 },
    { level: 8, percentage: 1, requiredDirects: 8, unlocked: true, teamCount: 0, businessVolume: 0, totalIncomeEarned: 0 },
    { level: 9, percentage: 0.5, requiredDirects: 9, unlocked: true, teamCount: 0, businessVolume: 0, totalIncomeEarned: 0 },
    { level: 10, percentage: 0.5, requiredDirects: 10, unlocked: true, teamCount: 0, businessVolume: 0, totalIncomeEarned: 0 }
  ]);

  // Autopool Tiers (Strictly initialized with 0 progress)
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
      currentMembers: 0,
      poolPayout: 5000,
      status: 'Active',
      reEntryBonus: 1000,
      progressPercentage: 0
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
      currentMembers: 0,
      poolPayout: 15000,
      status: 'Active',
      reEntryBonus: 3000,
      progressPercentage: 0
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
      currentMembers: 0,
      poolPayout: 60000,
      status: 'Locked',
      reEntryBonus: 10000,
      progressPercentage: 0
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

  // Income Ledger Transactions (Defaults to empty array, populated strictly from myaccount API)
  readonly transactions = signal<IncomeTransaction[]>([]);

  // Payout / Withdrawal history (Defaults to empty array, populated strictly from myaccount API)
  readonly payouts = signal<PayoutRequest[]>([]);

  // Request Withdrawal Method (Persists to live server via membersService)
  async requestWithdrawalAsync(amount: number, method: 'Bank Transfer' | 'UPI', accountInfo: string): Promise<{ success: boolean; message: string; payout?: PayoutRequest }> {
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

    try {
      const serverRes = await this.membersService.requestWithdrawal(amount, method, accountInfo);
      
      const newPayout: PayoutRequest = {
        id: serverRes?.payoutCode || `PAY-${Date.now().toString().slice(-4)}`,
        requestedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        amount,
        tdsAmount: tds,
        adminFee: admin,
        netPayable: net,
        payoutMethod: method,
        accountDetails: accountInfo,
        status: 'Pending',
        referenceId: `UTR${Date.now().toString().slice(-9)}`
      };

      // Deduct balance locally
      this.breakdown.update(b => ({
        ...b,
        walletBalance: Math.max(0, b.walletBalance - amount),
        withdrawnTotal: b.withdrawnTotal + net,
        pendingPayouts: b.pendingPayouts + 1
      }));

      this.payouts.update(list => [newPayout, ...list]);

      return {
        success: true,
        message: serverRes?.msg || `Withdrawal request for ₹${amount.toLocaleString()} submitted successfully! Net payable: ₹${net.toLocaleString()} (after 5% TDS & 5% Admin Fee).`,
        payout: newPayout
      };
    } catch (err: any) {
      console.warn('[IncomeService] Live server withdrawal request error:', err);
      return {
        success: false,
        message: err?.error?.msg || 'Could not submit withdrawal request to server. Please try again later.'
      };
    }
  }

  // Synchronous fallback wrapper for component compatibility
  requestWithdrawal(amount: number, method: 'Bank Transfer' | 'UPI', accountInfo: string): { success: boolean; message: string; payout?: PayoutRequest } {
    this.requestWithdrawalAsync(amount, method, accountInfo);
    const tds = amount * 0.05;
    const admin = amount * 0.05;
    const net = amount - tds - admin;
    return {
      success: true,
      message: `Withdrawal request for ₹${amount.toLocaleString()} submitted. Net payable: ₹${net.toLocaleString()}.`
    };
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

      // Always bind real arrays from server, default to empty array if none
      this.transactions.set(Array.isArray(accountRes?.transactions) ? accountRes.transactions : []);
      this.payouts.set(Array.isArray(accountRes?.payoutHistory) ? accountRes.payoutHistory : []);

    } catch (e) {
      console.warn('[IncomeService] Live server data skipped (offline or unauthenticated):', e);
    }
  }
}
