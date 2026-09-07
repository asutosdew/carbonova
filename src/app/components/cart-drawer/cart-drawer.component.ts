import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store.service';
import { Order } from '../../models/store.model';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart-drawer.component.html',
  styleUrls: ['./cart-drawer.component.scss']
})
export class CartDrawerComponent {
  readonly storeService = inject(StoreService);
  @Output() close = new EventEmitter<void>();

  shippingAddress = signal('Ambikapur, Surguja District, Chhattisgarh - 497001');
  paymentMethod = signal('Online UPI / Wallet');
  isCheckingOut = signal(false);
  completedOrder = signal<Order | null>(null);

  checkout() {
    this.isCheckingOut.set(true);
    setTimeout(() => {
      const order = this.storeService.placeOrder(this.shippingAddress(), this.paymentMethod());
      this.completedOrder.set(order);
      this.isCheckingOut.set(false);
    }, 1000);
  }
}
