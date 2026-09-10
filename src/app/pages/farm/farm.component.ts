import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FarmerService } from '../../services/farmer.service';
import { FarmDetailsModalComponent } from '../../components/farm-details-modal/farm-details-modal.component';
import { PhotoModalComponent } from '../../components/photo-modal/photo-modal.component';

@Component({
  selector: 'app-farm',
  standalone: true,
  imports: [CommonModule, RouterModule, FarmDetailsModalComponent, PhotoModalComponent],
  templateUrl: './farm.component.html',
  styleUrls: ['./farm.component.scss']
})
export class FarmComponent {
  readonly farmerService = inject(FarmerService);
  readonly showFarmDetailsModal = signal(false);
  readonly showPhotoModal = signal(false);

  openFarmDetailsModal() {
    this.showFarmDetailsModal.set(true);
  }

  closeFarmDetailsModal() {
    this.showFarmDetailsModal.set(false);
  }

  openPhotoModal() {
    this.showPhotoModal.set(true);
  }

  closePhotoModal() {
    this.showPhotoModal.set(false);
  }

  farmTasks = [
    { title: 'Apply Bio-NPK Granules', due: 'Tomorrow', status: 'Pending', tag: 'Fertilization', icon: '🧪' },
    { title: 'Foliar Neem Oil Spray (10000 PPM)', due: 'In 3 days', status: 'Upcoming', tag: 'Pest Shield', icon: '🛡️' },
    { title: 'Soil Moisture & Mulch Inspection', due: 'Weekly', status: 'Completed', tag: 'Care', icon: '💧' },
    { title: 'Capture Growth Photo for Monthly Audit', due: '08 Sep 2026', status: 'Required', tag: 'Verification', icon: '📷' }
  ];
}
