import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FarmerService } from '../../services/farmer.service';

@Component({
  selector: 'app-farm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './farm.component.html',
  styleUrls: ['./farm.component.scss']
})
export class FarmComponent {
  readonly farmerService = inject(FarmerService);

  farmTasks = [
    { title: 'Apply Bio-NPK Granules', due: 'Tomorrow', status: 'Pending', tag: 'Fertilization', icon: '🧪' },
    { title: 'Foliar Neem Oil Spray (10000 PPM)', due: 'In 3 days', status: 'Upcoming', tag: 'Pest Shield', icon: '🛡️' },
    { title: 'Soil Moisture & Mulch Inspection', due: 'Weekly', status: 'Completed', tag: 'Care', icon: '💧' },
    { title: 'Capture Growth Photo for Monthly Audit', due: '08 Sep 2026', status: 'Required', tag: 'Verification', icon: '📷' }
  ];
}
