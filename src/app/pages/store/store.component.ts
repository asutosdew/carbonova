import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoreService } from '../../services/store.service';
import { Product, ProductCategory } from '../../models/store.model';
import { CartDrawerComponent } from '../../components/cart-drawer/cart-drawer.component';

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [CommonModule, FormsModule, CartDrawerComponent],
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss']
})
export class StoreComponent {
  readonly storeService = inject(StoreService);

  readonly selectedCategory = signal<'ALL' | ProductCategory>('ALL');
  readonly selectedProduct = signal<Product | null>(null);
  readonly showCartDrawer = signal(false);
  readonly addedNotification = signal<string | null>(null);

  filteredProducts(): Product[] {
    const cat = this.selectedCategory();
    if (cat === 'ALL') return this.storeService.products();
    return this.storeService.products().filter(p => p.category === cat);
  }

  setCategory(cat: 'ALL' | ProductCategory) {
    this.selectedCategory.set(cat);
  }

  addToCart(product: Product) {
    this.storeService.addToCart(product, 1);
    this.addedNotification.set(`Added "${product.name}" to cart! (+${product.businessVolume} BV)`);
    setTimeout(() => {
      this.addedNotification.set(null);
    }, 2500);
  }

  openDetails(product: Product) {
    this.selectedProduct.set(product);
  }

  closeDetails() {
    this.selectedProduct.set(null);
  }
}
