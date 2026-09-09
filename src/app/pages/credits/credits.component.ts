import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CarbonCreditService } from '../../services/carbon.service';
import { FarmerService } from '../../services/farmer.service';

@Component({
  selector: 'app-credits',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss']
})
export class CreditsComponent implements OnInit {
  readonly carbonService = inject(CarbonCreditService);
  readonly farmerService = inject(FarmerService);

  readonly showPrintView = signal(false);

  ngOnInit() {
    this.carbonService.syncFromFarmerPlants();
  }

  syncWithMyTrees() {
    this.carbonService.syncFromFarmerPlants();
  }

  printCertificate() {
    window.print();
  }
}
