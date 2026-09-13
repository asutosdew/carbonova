import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncomeService } from '../../services/income.service';
import { FarmerService } from '../../services/farmer.service';
import { TeamService } from '../../services/team.service';
import { WithdrawalModalComponent } from '../../components/withdrawal-modal/withdrawal-modal.component';
import { IncomeType, LevelCommissionRate, IncomeTransaction, AutopoolTier } from '../../models/income.model';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, FormsModule, WithdrawalModalComponent, PaginationComponent],
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.scss']
})
export class IncomeComponent {
  readonly incomeService = inject(IncomeService);
  readonly farmerService = inject(FarmerService);
  readonly teamService = inject(TeamService);

  readonly showWithdrawalModal = signal(false);
  readonly selectedFilter = signal<'ALL' | IncomeType>('ALL');

  // Dynamically compute Autopool tiers with Single Active Pool Exclusivity & Equal Distribution Fund
  readonly autopoolTiers = computed<AutopoolTier[]>(() => {
    const stats = this.teamService.teamStats();
    const directCount = stats.totalDirects;
    const teamCount = stats.totalDownlineTeam;
    const rawTiers = this.incomeService.autopoolTiers();

    // Determine user's active enrolled pool: Priority to API response (enrolledAutopoolId)
    const apiEnrolledId = this.incomeService.enrolledAutopoolId();
    let highestQualified = -1;

    if (apiEnrolledId) {
      highestQualified = rawTiers.findIndex(p => p.id === apiEnrolledId);
    }

    // Fallback: If not explicitly set by API, calculate based on requirements
    if (highestQualified === -1) {
      for (let i = rawTiers.length - 1; i >= 0; i--) {
        if (directCount >= rawTiers[i].requiredLevel1Members && teamCount >= rawTiers[i].requiredTotalMembers) {
          highestQualified = i;
          break;
        }
      }
    }

    return rawTiers.map((pool, index) => {
      const l1Req = pool.requiredLevel1Members;
      const totalReq = pool.requiredTotalMembers;
      const l1Cur = directCount;
      const totalCur = teamCount;

      const l1Pct = Math.min(100, Math.round((l1Cur / l1Req) * 100));
      const totalPct = Math.min(100, Math.round((totalCur / totalReq) * 100));
      const overallPct = Math.min(100, Math.round(((Math.min(1, l1Cur / l1Req) + Math.min(1, totalCur / totalReq)) / 2) * 100));

      // Single Active Pool Status & Exclusivity
      let status: 'Enrolled' | 'Graduated' | 'Target' | 'Locked' = 'Locked';
      let isCurrent = false;

      if (index < highestQualified) {
        // Automatically graduated & removed from previous lower pool
        status = 'Graduated';
      } else if (index === highestQualified) {
        // User's single current active enrolled pool (from API or qualification)
        status = 'Enrolled';
        isCurrent = true;
      } else if (index === highestQualified + 1) {
        // Next target pool user is striving to qualify for
        status = 'Target';
      } else {
        // Higher future pools locked
        status = 'Locked';
      }

      // If user is currently enrolled, ensure at least 1 enrolled member in count
      const enrolled = isCurrent ? Math.max(1, pool.enrolledMembers) : pool.enrolledMembers;
      const fund = pool.totalPoolFund;
      const share = enrolled > 0 ? Math.round(fund / enrolled) : 0;

      return {
        ...pool,
        currentLevel1Members: l1Cur,
        currentTotalMembers: totalCur,
        level1ProgressPercentage: l1Pct,
        totalMembersProgressPercentage: totalPct,
        progressPercentage: overallPct,
        enrolledMembers: enrolled,
        totalPoolFund: fund,
        perMemberShare: share,
        isCurrentActivePool: isCurrent,
        status
      };
    });
  });

  // 10-Level Structure (Unifies team counts with income directly calculated from income_transactions)
  readonly combinedLevels = computed<LevelCommissionRate[]>(() => {
    const rates = this.incomeService.levelCommissionRates();
    const stats = this.teamService.levelStats();

    return rates.map(r => {
      const s = stats.find(item => item.level === r.level);
      return {
        ...r,
        teamCount: s ? s.totalMembers : r.teamCount,
        businessVolume: s ? s.totalBusiness : r.businessVolume,
        unlocked: true,
        requiredDirects: 0
      };
    });
  });

  // Pagination for 10-Level Table
  readonly levelPage = signal<number>(1);
  readonly levelPageSize = signal<number>(10);

  // Pagination for Transactions Ledger
  readonly txnPage = signal<number>(1);
  readonly txnPageSize = signal<number>(5);

  filteredTransactions(): IncomeTransaction[] {
    const filter = this.selectedFilter();
    const list = this.incomeService.transactions();
    if (filter === 'ALL') return list;
    return list.filter(t => t.type === filter);
  }

  paginatedLevels(): LevelCommissionRate[] {
    const list = this.combinedLevels();
    const start = (this.levelPage() - 1) * this.levelPageSize();
    return list.slice(start, start + this.levelPageSize());
  }

  paginatedTransactions(): IncomeTransaction[] {
    const list = this.filteredTransactions();
    const start = (this.txnPage() - 1) * this.txnPageSize();
    return list.slice(start, start + this.txnPageSize());
  }

  setFilter(filter: 'ALL' | IncomeType) {
    this.selectedFilter.set(filter);
    this.txnPage.set(1);
  }

  onLevelPageChange(page: number) {
    this.levelPage.set(page);
  }

  onLevelPageSizeChange(size: number) {
    this.levelPageSize.set(size);
    this.levelPage.set(1);
  }

  onTxnPageChange(page: number) {
    this.txnPage.set(page);
  }

  onTxnPageSizeChange(size: number) {
    this.txnPageSize.set(size);
    this.txnPage.set(1);
  }
}
