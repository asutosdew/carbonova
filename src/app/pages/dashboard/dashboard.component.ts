import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FarmerService } from '../../services/farmer.service';
import { IncomeService } from '../../services/income.service';
import { TeamService } from '../../services/team.service';
import { PhotoModalComponent } from '../../components/photo-modal/photo-modal.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { PlantItem } from '../../models/farmer.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, PhotoModalComponent, PaginationComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  readonly farmerService = inject(FarmerService);
  readonly incomeService = inject(IncomeService);
  readonly teamService = inject(TeamService);

  readonly showPhotoModal = signal(false);
  readonly showPackageModal = signal(false);

  // Pagination for My Plants Table (Card 1)
  readonly plantPage = signal<number>(1);
  readonly plantPageSize = signal<number>(3);

  paginatedPlants(): PlantItem[] {
    const list = this.farmerService.plants();
    const start = (this.plantPage() - 1) * this.plantPageSize();
    return list.slice(start, start + this.plantPageSize());
  }

  onPlantPageChange(page: number) {
    this.plantPage.set(page);
  }

  onPlantPageSizeChange(size: number) {
    this.plantPageSize.set(size);
    this.plantPage.set(1);
  }

  openPhotoModal() {
    this.showPhotoModal.set(true);
  }

  closePhotoModal() {
    this.showPhotoModal.set(false);
  }

  readonly copied = signal(false);

  copyReferralLink() {
    navigator.clipboard.writeText(this.teamService.referralLink()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  shareReferralLink() {
    if (navigator.share) {
      navigator.share({
        title: 'Join Carbon Farming Network',
        text: 'Join Carbonova Carbon Farming with my referral code.',
        url: this.teamService.referralLink()
      }).catch(() => this.copyReferralLink());
    } else {
      this.copyReferralLink();
    }
  }

  togglePackageModal() {
    this.showPackageModal.update(v => !v);
  }
}
