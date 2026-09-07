import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import { FarmerService } from '../../services/farmer.service';
import { GenealogyNode, DownlineMember } from '../../models/team.model';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.scss']
})
export class TeamComponent {
  readonly teamService = inject(TeamService);
  readonly farmerService = inject(FarmerService);

  readonly searchQuery = signal('');
  readonly selectedLevelFilter = signal<number | 'ALL'>('ALL');
  readonly showQrModal = signal(false);
  readonly copyFeedback = signal(false);

  // Pagination state
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(5);

  // Selected node for detailed inspector modal
  readonly selectedNode = signal<GenealogyNode | null>(null);

  copyReferralLink() {
    navigator.clipboard.writeText(this.teamService.referralLink());
    this.copyFeedback.set(true);
    setTimeout(() => {
      this.copyFeedback.set(false);
    }, 2000);
  }

  filteredMembers(): DownlineMember[] {
    const q = this.searchQuery().toLowerCase();
    const lvl = this.selectedLevelFilter();

    return this.teamService.downlineMembers().filter(m => {
      const matchQuery = !q || m.name.toLowerCase().includes(q) || m.farmerId.toLowerCase().includes(q) || m.location.toLowerCase().includes(q);
      const matchLevel = lvl === 'ALL' || m.level === lvl;
      return matchQuery && matchLevel;
    });
  }

  paginatedMembers(): DownlineMember[] {
    const all = this.filteredMembers();
    const start = (this.currentPage() - 1) * this.pageSize();
    return all.slice(start, start + this.pageSize());
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onPageSizeChange(size: number) {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  onSearchChange() {
    this.currentPage.set(1);
  }

  onLevelChange() {
    this.currentPage.set(1);
  }

  inspectNode(node: GenealogyNode) {
    this.selectedNode.set(node);
  }
}
