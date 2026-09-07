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

  withdrawAmount = signal<number>(5000);
  payoutMethod = signal<'Bank Transfer' | 'UPI'>('Bank Transfer');
  accountDetails = signal<string>('SBI (•••• 8492) - Ambikapur');
  
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

  submitWithdrawal() {
    this.isProcessing.set(true);
    this.feedbackMessage.set(null);

    setTimeout(() => {
      const result = this.incomeService.requestWithdrawal(
        this.withdrawAmount(),
        this.payoutMethod(),
        this.payoutMethod() === 'Bank Transfer' ? `${this.farmerService.farmer().bankName} (${this.farmerService.farmer().accountNumber})` : this.farmerService.farmer().upiId
      );

      this.isProcessing.set(false);
      this.feedbackMessage.set(result.message);
      this.isSuccess.set(result.success);

      if (result.success) {
        setTimeout(() => {
          this.close.emit();
        }, 1500);
      }
    }, 1000);
  }
}
