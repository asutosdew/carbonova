import { Component, EventEmitter, Output, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FarmerService } from '../../services/farmer.service';
import { PlantItem } from '../../models/farmer.model';
import confetti from 'canvas-confetti';

export interface PackageOption {
  id: string;
  name: string;
  price: number;
  badge: string;
  description: string;
  boxImage: string;
  recommendedAcre: string;
  defaultPlants?: { [id: string]: number };
}

export interface PlantChoice {
  id: string;
  name: string;
  scientificName: string;
  unitPrice: number;
  category: 'Fruit' | 'Medicinal' | 'Timber' | 'Bamboo';
  carbonRatePerYearKg: number;
  image: string;
  selectedQty: number;
}

@Component({
  selector: 'app-package-plants-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './package-plants-modal.component.html',
  styleUrls: ['./package-plants-modal.component.scss']
})
export class PackagePlantsModalComponent {
  readonly farmerService = inject(FarmerService);
  readonly Math = Math;
  @Output() close = new EventEmitter<void>();

  // Step 1: Package, Step 2: Plants & Review
  readonly step = signal<1 | 2>(1);

  // Available Packages - Presets sum to EXACT package prices
  readonly packageOptions: PackageOption[] = [
    {
      id: 'PKG-01',
      name: 'Green Starter Package',
      price: 10000,
      badge: 'Most Popular',
      description: 'Ideal starting kit for 0.25 acre. Complete with 55 high carbon trees & bio inputs.',
      boxImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=80',
      recommendedAcre: '0.25 Acre',
      // 20*250 (5,000) + 15*200 (3,000) + 20*100 (2,000) = ₹10,000 EXACT
      defaultPlants: { 'PLT-01': 20, 'PLT-02': 15, 'PLT-03': 20, 'PLT-04': 0, 'PLT-05': 0 }
    },
    {
      id: 'PKG-02',
      name: 'Commercial Agroforestry Pro',
      price: 25000,
      badge: 'Commercial',
      description: 'High-yield timber, fruit & bamboo agroforestry kit for 0.75 - 1.0 Acre.',
      boxImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=300&auto=format&fit=crop&q=80',
      recommendedAcre: '0.75 - 1.0 Acre',
      // 30*250 (7,500) + 25*200 (5,000) + 50*100 (5,000) + 10*500 (5,000) + 10*250 (2,500) = ₹25,000 EXACT
      defaultPlants: { 'PLT-01': 30, 'PLT-02': 25, 'PLT-03': 50, 'PLT-04': 10, 'PLT-05': 10 }
    },
    {
      id: 'PKG-03',
      name: 'Carbon Super Net-Zero Estate',
      price: 50000,
      badge: 'VIP Elite',
      description: 'Multi-canopy maximum sequestration setup with Teak, Bamboo & Fruit trees.',
      boxImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=300&auto=format&fit=crop&q=80',
      recommendedAcre: '2.0+ Acres',
      // 50*250 (12,500) + 50*200 (10,000) + 100*100 (10,000) + 25*500 (12,500) + 20*250 (5,000) = ₹50,000 EXACT
      defaultPlants: { 'PLT-01': 50, 'PLT-02': 50, 'PLT-03': 100, 'PLT-04': 25, 'PLT-05': 20 }
    }
  ];

  readonly selectedPackage = signal<PackageOption>(this.packageOptions[0]);

  // Clean round unit prices (multiples of 50/100) allowing exact budget matching
  readonly plantChoices = signal<PlantChoice[]>([
    {
      id: 'PLT-01',
      name: 'Vietnam Super Early Jackfruit',
      scientificName: 'Artocarpus heterophyllus',
      unitPrice: 250,
      category: 'Fruit',
      carbonRatePerYearKg: 28.5,
      image: 'https://images.unsplash.com/photo-1596707325255-7a315e966b96?w=120&auto=format&fit=crop&q=80',
      selectedQty: 20
    },
    {
      id: 'PLT-02',
      name: 'Kumbhkat Seedless Lemon',
      scientificName: 'Citrus limon (Kumbhkat)',
      unitPrice: 200,
      category: 'Fruit',
      carbonRatePerYearKg: 18.2,
      image: 'https://images.unsplash.com/photo-1534856966150-c832f817a508?w=120&auto=format&fit=crop&q=80',
      selectedQty: 15
    },
    {
      id: 'PLT-03',
      name: 'PKM-1 Super Moringa',
      scientificName: 'Moringa oleifera',
      unitPrice: 100,
      category: 'Medicinal',
      carbonRatePerYearKg: 22.0,
      image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=120&auto=format&fit=crop&q=80',
      selectedQty: 20
    },
    {
      id: 'PLT-04',
      name: 'Tissue-Culture Super Teak',
      scientificName: 'Tectona grandis',
      unitPrice: 500,
      category: 'Timber',
      carbonRatePerYearKg: 35.0,
      image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=120&auto=format&fit=crop&q=80',
      selectedQty: 0
    },
    {
      id: 'PLT-05',
      name: 'Giant Beema Bamboo',
      scientificName: 'Bambusa balcooa',
      unitPrice: 250,
      category: 'Bamboo',
      carbonRatePerYearKg: 45.0,
      image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=120&auto=format&fit=crop&q=80',
      selectedQty: 0
    }
  ]);

  // Compulsory Items included by default
  readonly compulsoryInclusions = [
    {
      name: 'Carbonova Bio-NPK Microbial Granules (10kg)',
      icon: '🧪',
      type: 'Bio-Fertilizer',
      benefit: 'Fixes atmospheric nitrogen & phosphorus for 30% faster rooting'
    },
    {
      name: 'Cold-Pressed Neem Azadirachtin 10000 PPM (1L)',
      icon: '🛡️',
      type: 'Bio-Pesticide',
      benefit: 'Broad-spectrum organic protection against pests and borer damage'
    },
    {
      name: 'Soil Testing, Geo-tagging & Partner Verification QR',
      icon: '📋',
      type: 'Certification',
      benefit: 'Unlocks Carbon Credit eligibility and audits'
    }
  ];

  readonly totalPlantsCost = computed(() => {
    return this.plantChoices().reduce((acc, p) => acc + (p.selectedQty * p.unitPrice), 0);
  });

  readonly totalPlantsCount = computed(() => {
    return this.plantChoices().reduce((acc, p) => acc + p.selectedQty, 0);
  });

  readonly totalCarbonEst = computed(() => {
    return this.plantChoices().reduce((acc, p) => acc + (p.selectedQty * p.carbonRatePerYearKg), 0);
  });

  readonly remainingBudget = computed(() => {
    return this.selectedPackage().price - this.totalPlantsCost();
  });

  // Strict validation: must not be greater and must not be less
  readonly isExactBudget = computed(() => {
    return this.totalPlantsCost() === this.selectedPackage().price;
  });

  readonly isUnderBudget = computed(() => {
    return this.totalPlantsCost() < this.selectedPackage().price;
  });

  readonly isOverBudget = computed(() => {
    return this.totalPlantsCost() > this.selectedPackage().price;
  });

  readonly isSubmitting = signal(false);
  readonly isSuccess = signal(false);

  selectPackage(pkg: PackageOption) {
    this.selectedPackage.set(pkg);
    // Apply recommended preset that equals the exact package price
    if (pkg.defaultPlants) {
      this.plantChoices.update(choices =>
        choices.map(c => ({
          ...c,
          selectedQty: pkg.defaultPlants![c.id] || 0
        }))
      );
    }
  }

  goToPlantsStep() {
    this.step.set(2);
  }

  goToPackageStep() {
    this.step.set(1);
  }

  canAddPlant(plant: PlantChoice, qtyToAdd = 1): boolean {
    return (this.totalPlantsCost() + (plant.unitPrice * qtyToAdd)) <= this.selectedPackage().price;
  }

  incrementPlant(plantId: string, amount = 1) {
    const plant = this.plantChoices().find(p => p.id === plantId);
    if (!plant) return;
    if (!this.canAddPlant(plant, amount)) return;

    this.plantChoices.update(choices =>
      choices.map(p => p.id === plantId ? { ...p, selectedQty: p.selectedQty + amount } : p)
    );
  }

  decrementPlant(plantId: string, amount = 1) {
    this.plantChoices.update(choices =>
      choices.map(p => p.id === plantId ? { ...p, selectedQty: Math.max(0, p.selectedQty - amount) } : p)
    );
  }

  resetPlants() {
    this.plantChoices.update(choices => choices.map(p => ({ ...p, selectedQty: 0 })));
  }

  // Quick action: auto-fill remaining amount with selected plant
  fillRemainingBudgetWith(plantId: string) {
    const plant = this.plantChoices().find(p => p.id === plantId);
    if (!plant) return;
    const remaining = this.remainingBudget();
    if (remaining < plant.unitPrice) return;
    const canAdd = Math.floor(remaining / plant.unitPrice);
    this.incrementPlant(plantId, canAdd);
  }

  // Quick action: auto-balance budget to exactly match package price
  autoBalanceBudget() {
    const remaining = this.remainingBudget();
    if (remaining === 0) return;

    if (remaining > 0) {
      // Allocate to Moringa (₹100) or Jackfruit/Bamboo (₹250) or Lemon (₹200)
      const moringa = this.plantChoices().find(p => p.id === 'PLT-03');
      if (moringa && remaining >= moringa.unitPrice) {
        const count = Math.floor(remaining / moringa.unitPrice);
        this.incrementPlant('PLT-03', count);
      }
    } else {
      // Reduce from selected plants until exact
      let excess = Math.abs(remaining);
      for (const p of this.plantChoices()) {
        if (excess <= 0) break;
        if (p.selectedQty > 0) {
          const reduceCount = Math.min(p.selectedQty, Math.ceil(excess / p.unitPrice));
          this.decrementPlant(p.id, reduceCount);
          excess = this.totalPlantsCost() - this.selectedPackage().price;
        }
      }
    }
  }

  confirmAndActivate() {
    // Strictly must not be less and must not be greater
    if (!this.isExactBudget()) return;

    this.isSubmitting.set(true);

    setTimeout(() => {
      const selectedList: PlantItem[] = this.plantChoices()
        .filter(p => p.selectedQty > 0)
        .map(p => ({
          id: p.id,
          name: p.name,
          scientificName: p.scientificName,
          image: p.image,
          qty: p.selectedQty,
          activeQty: p.selectedQty,
          status: `${p.selectedQty} Active`,
          carbonRatePerYearKg: p.carbonRatePerYearKg,
          category: p.category,
          unitPrice: p.unitPrice
        }));

      this.farmerService.activateFarmerWithPackageAndPlants(
        this.selectedPackage().name,
        this.selectedPackage().price,
        selectedList,
        this.selectedPackage().boxImage
      );

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      this.isSubmitting.set(false);
      this.isSuccess.set(true);

      setTimeout(() => {
        this.close.emit();
      }, 1500);
    }, 800);
  }
}
