import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FarmerService } from '../../services/farmer.service';
import { PhotoModalComponent } from '../../components/photo-modal/photo-modal.component';

@Component({
  selector: 'app-updates',
  standalone: true,
  imports: [CommonModule, PhotoModalComponent],
  templateUrl: './updates.component.html',
  styleUrls: ['./updates.component.scss']
})
export class UpdatesComponent {
  readonly farmerService = inject(FarmerService);
  readonly showPhotoModal = signal(false);

  get updatesLog(): any[] {
    const last = this.farmerService.lastPlantationUpdate();
    if (!last) return [];
    return [
      {
        id: last.id,
        date: last.date,
        image: last.image,
        title: `${last.growthStage} Health Milestone`,
        notes: last.statusText,
        health: last.healthScore,
        tag: last.growthStage
      }
    ];
  }
}
