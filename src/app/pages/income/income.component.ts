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

  // Dynamically compute Autopool tiers progress based on live team stats (Zero Joining Fee, Dual Qualification)
  readonly autopoolTiers = computed<AutopoolTier[]>(() => {
    const stats = this.teamService.teamStats();
    const directCount = stats.totalDirects;
    const teamCount = stats.totalDownlineTeam;
    const rawTiers = this.incomeService.autopoolTiers();

    return rawTiers.map((pool, index, arr) => {
      const l1Req = pool.requiredLevel1Members;
      const totalReq = pool.requiredTotalMembers;
      const l1Cur = directCount;
      const totalCur = teamCount;

      const l1Pct = Math.min(100, Math.round((l1Cur / l1Req) * 100));
      const totalPct = Math.min(100, Math.round((totalCur / totalReq) * 100));
      const overallPct = Math.min(100, Math.round(((Math.min(1, l1Cur / l1Req) + Math.min(1, totalCur / totalReq)) / 2) * 100));

      const isCompleted = l1Cur >= l1Req && totalCur >= totalReq;
      const prevCompleted = index === 0 || (l1Cur >= arr[index - 1].requiredLevel1Members && totalCur >= arr[index - 1].requiredTotalMembers);

      let status: 'Completed' | 'In-Progress' | 'Active' | 'Locked' = 'Locked';
      if (isCompleted) {
        status = 'Completed';
      } else if (prevCompleted) {
        status = (l1Cur > 0 || totalCur > 0) ? 'In-Progress' : 'Active';
      } else {
        status = 'Locked';
      }

      return {
        ...pool,
        currentLevel1Members: l1Cur,
        currentTotalMembers: totalCur,
        level1ProgressPercentage: l1Pct,
        totalMembersProgressPercentage: totalPct,
        progressPercentage: overallPct,
        status
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
    const list = this.incomeService.levelCommissionRates();
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
