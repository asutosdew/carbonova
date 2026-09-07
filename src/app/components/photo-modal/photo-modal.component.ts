import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FarmerService } from '../../services/farmer.service';

@Component({
  selector: 'app-photo-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './photo-modal.component.html',
  styleUrls: ['./photo-modal.component.scss']
})
export class PhotoModalComponent {
  readonly farmerService = inject(FarmerService);
  @Output() close = new EventEmitter<void>();

  selectedImage = signal<string>('https://images.unsplash.com/photo-1592417817098-8f3d69106093?w=600&auto=format&fit=crop&q=80');
  notes = signal<string>('Plants are healthy and growing well. Bio-NPK applied this morning.');
  isSubmitting = signal<boolean>(false);
  isSuccess = signal<boolean>(false);

  sampleImages = [
    { label: 'Farm Row A (Jackfruit & Moringa)', url: 'https://images.unsplash.com/photo-1592417817098-8f3d69106093?w=600&auto=format&fit=crop&q=80' },
    { label: 'Farm Row B (Lemon & Bio-Mulch)', url: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80' },
    { label: 'Close-up Foliage Health', url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&auto=format&fit=crop&q=80' }
  ];

  selectSample(url: string) {
    this.selectedImage.set(url);
  }

  submitPhoto() {
    this.isSubmitting.set(true);
    setTimeout(() => {
      this.farmerService.addPlantationPhoto(this.selectedImage(), this.notes());
      this.isSubmitting.set(false);
      this.isSuccess.set(true);
      setTimeout(() => {
        this.close.emit();
      }, 1200);
    }, 1000);
  }
}
