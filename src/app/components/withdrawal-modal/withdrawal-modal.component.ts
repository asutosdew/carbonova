import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncomeService } from '../../services/income.service';
import { FarmerService } from '../../services/farmer.service';

@Component({
  selector: 'app-withdrawal-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './withdrawal-modal.component.html',
  styleUrls: ['./withdrawal-modal.component.scss']
})
export class WithdrawalModalComponent {
  readonly incomeService = inject(IncomeService);
  readonly farmerService = inject(FarmerService);
  @Output() close = new EventEmitter<void>();

  withdrawAmount = signal<number>(500);
  payoutMethod = signal<'Bank Transfer' | 'UPI'>('Bank Transfer');
  
  isProcessing = signal<boolean>(false);
  feedbackMessage = signal<string | null>(null);
  isSuccess = signal<boolean>(false);

  get maxBalance(): number {
    return this.incomeService.breakdown().walletBalance;
  }

  get tdsAmount(): number {
    return Math.round((this.withdrawAmount() || 0) * 0.05);
  }

  get adminFee(): number {
    return Math.round((this.withdrawAmount() || 0) * 0.05);
  }

  get netPayable(): number {
    return Math.max(0, (this.withdrawAmount() || 0) - this.tdsAmount - this.adminFee);
  }

  setQuickAmount(pct: number) {
    const val = Math.floor((this.maxBalance * pct) / 100);
    this.withdrawAmount.set(val);
  }

  async submitWithdrawal() {
    this.isProcessing.set(true);
    this.feedbackMessage.set(null);

    const destination = this.payoutMethod() === 'Bank Transfer'
      ? `${this.farmerService.farmer().bankName || 'Bank'} (${this.farmerService.farmer().accountNumber || ''})`
      : (this.farmerService.farmer().upiId || '');

    const result = await this.incomeService.requestWithdrawalAsync(
      this.withdrawAmount(),
      this.payoutMethod(),
      destination
    );

    this.isProcessing.set(false);
    this.feedbackMessage.set(result.message);
    this.isSuccess.set(result.success);

    if (result.success) {
      setTimeout(() => {
        this.close.emit();
      }, 1500);
    }
  }
}
