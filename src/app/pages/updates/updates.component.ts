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

  updatesLog = [
    {
      id: 'UPD-01',
      date: '08 Aug 2026',
      image: 'https://images.unsplash.com/photo-1592417817098-8f3d69106093?w=600&auto=format&fit=crop&q=80',
      title: 'Vegetative Growth Milestone (Stage 1)',
      notes: 'All 40 saplings acclimated. Bio-NPK granules applied. Survival rate confirmed at 95%.',
      health: 94,
      tag: 'Growth Stage 1'
    },
    {
      id: 'UPD-02',
      date: '01 Aug 2026',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80',
      title: 'Initial Plantation & Geotagging Complete',
      notes: 'Planted 10 Jackfruit, 10 Lemon, 20 Moringa in 0.25 acre pit layout with Mycorrhiza root inoculant.',
      health: 98,
      tag: 'Plantation Inception'
    }
  ];
}
