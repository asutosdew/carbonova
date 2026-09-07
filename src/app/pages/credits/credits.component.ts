import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarbonCreditService } from '../../services/carbon.service';
import { FarmerService } from '../../services/farmer.service';

@Component({
  selector: 'app-credits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss']
})
export class CreditsComponent {
  readonly carbonService = inject(CarbonCreditService);
  readonly farmerService = inject(FarmerService);

  readonly showPrintView = signal(false);

  printCertificate() {
    window.print();
  }
}
