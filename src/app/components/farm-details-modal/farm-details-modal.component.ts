import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FarmerService } from '../../services/farmer.service';

@Component({
  selector: 'app-farm-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './farm-details-modal.component.html',
  styleUrls: ['./farm-details-modal.component.scss']
})
export class FarmDetailsModalComponent {
  readonly farmerService = inject(FarmerService);
  @Output() close = new EventEmitter<void>();

  // Pre-fill existing farm info if available
  farmArea = signal<string>(this.farmerService.farmer().farmArea || '0.25 Acre');
  soilType = signal<string>(this.farmerService.farmer().soilType || 'Red & Yellow Loamy');
  irrigationSource = signal<string>(this.farmerService.farmer().irrigationSource || 'Borewell & Drip Line');
  plantationDate = signal<string>(this.farmerService.farmer().plantationDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
  village = signal<string>(this.farmerService.farmer().village || 'Kalyanpur, Ambikapur Tehsil');
  district = signal<string>(this.farmerService.farmer().district || 'Surguja');

  isSubmitting = signal(false);
  isSuccess = signal(false);

  readonly soilOptions = [
    'Red & Yellow Loamy',
    'Black Cotton (Regur)',
    'Sandy Loam',
    'Clay Loam',
    'Alluvial Soil',
    'Laterite Soil'
  ];

  readonly irrigationOptions = [
    'Borewell & Drip Line',
    'Canal Irrigation',
    'Open Well & Sprinkler',
    'Rainfed / Monsoon Only',
    'River / Stream Lift Irrigation'
  ];

  readonly areaPresets = [
    '0.25 Acre',
    '0.5 Acre',
    '1.0 Acre',
    '2.0 Acres',
    '5.0 Acres'
  ];

  setArea(preset: string) {
    this.farmArea.set(preset);
  }

  saveFarmDetails() {
    if (!this.farmArea() || !this.soilType() || !this.irrigationSource()) {
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      this.farmerService.updateFarmDetails({
        farmArea: this.farmArea(),
        soilType: this.soilType(),
        irrigationSource: this.irrigationSource(),
        plantationDate: this.plantationDate(),
        village: this.village(),
        district: this.district()
      });

      this.isSubmitting.set(false);
      this.isSuccess.set(true);

      setTimeout(() => {
        this.close.emit();
      }, 1000);
    }, 600);
  }
}

