import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncomeService } from '../../services/income.service';
import { FarmerService } from '../../services/farmer.service';
import { TeamService } from '../../services/team.service';
import { WithdrawalModalComponent } from '../../components/withdrawal-modal/withdrawal-modal.component';
import { IncomeType, LevelCommissionRate, IncomeTransaction } from '../../models/income.model';
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
