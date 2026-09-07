import { Injectable, signal, computed, inject } from '@angular/core';
import { Product, CartItem, Order } from '../models/store.model';
import { MembersService } from './members.service';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private readonly membersService = inject(MembersService);
  // Products Catalog
  readonly products = signal<Product[]>([
    // Packages
    {
      id: 'PKG-01',
      name: 'Green Starter Package',
      category: 'Package',
      price: 10000,
      originalPrice: 12500,
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&auto=format&fit=crop&q=80',
      shortDesc: 'Complete 40-Tree High Sequestration Starter Kit for new farmers.',
      description: 'Ideal starting package for 0.25 acre land. Includes 10 Vietnam Jackfruit, 10 Kumbhkat Lemon, 20 Moringa saplings, enriched Bio-NPK kit, training manual, and 1 year partner affiliate activation.',
      carbonScoreKgPerYear: 910,
      businessVolume: 10000,
      affiliatePoints: 1250,
      stock: 50,
      inStock: true,
      badge: 'Bestseller',
      rating: 4.9,
      reviewsCount: 142,
      packageContents: [
        '10x Vietnam Jackfruit Saplings',
        '10x Kumbhkat Seedless Lemon',
        '20x PKM-1 High Yield Moringa',
        '10kg Carbonova Bio-NPK Granules',
        '2L Cold Pressed Bio-Pesticide',
        'Farmer Digital QR Certificate & Partner License'
      ]
    },
    {
      id: 'PKG-02',
      name: 'Commercial Agroforestry Pro',
      category: 'Package',
      price: 25000,
      originalPrice: 30000,
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=80',
      shortDesc: '100-Tree High Carbon Agroforestry Kit for 0.75-1.0 Acre.',
      description: 'Commercial scale package containing high timber, fruit and bamboo species with 3-year agronomy care guidance and double partner bonus qualification.',
      carbonScoreKgPerYear: 2650,
      businessVolume: 25000,
      affiliatePoints: 3450,
      stock: 25,
      inStock: true,
      badge: 'Popular',
      rating: 5.0,
      reviewsCount: 88,
      packageContents: [
        '30x Vietnam Jackfruit',
        '30x Hybrid Teak Saplings',
        '20x Kumbhkat Lemon',
        '20x Giant Beema Bamboo',
        '25kg Micro-nutrient & Bio-NPK Kit',
        'Free Soil Testing & Geotagging Audit'
      ]
    },
    {
      id: 'PKG-03',
      name: 'Carbon Super Net-Zero Estate',
      category: 'Package',
      price: 50000,
      originalPrice: 62000,
      image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&auto=format&fit=crop&q=80',
      shortDesc: '200-Tree Elite Carbon Sink Package with Sandalwood & Teak.',
      description: 'High-density multi-canopy plantation package with guaranteed corporate carbon buy-back contract and Diamond pool entry.',
      carbonScoreKgPerYear: 5800,
      businessVolume: 50000,
      affiliatePoints: 7200,
      stock: 12,
      inStock: true,
      badge: 'VIP Elite',
      rating: 5.0,
      reviewsCount: 39,
      packageContents: [
        '50x White Sandalwood + Host Plants',
        '50x Super Hybrid Tissue Culture Teak',
        '50x Vietnam Jackfruit',
        '50x Giant Bamboo Clumps',
        'Full Organic Nutrition & Bio-Shield Kit',
        'Lifetime Agronomy & Drone Carbon Verification'
      ]
    },

    // High Carbon Plants
    {
      id: 'PLT-01',
      name: 'Vietnam Super Early Jackfruit',
      category: 'Plant',
      price: 220,
      originalPrice: 280,
      image: 'https://images.unsplash.com/photo-1596707325255-7a315e966b96?w=400&auto=format&fit=crop&q=80',
      shortDesc: 'Bears fruit in 18 months. High leaf area index sequestering 28.5 kg CO2/yr.',
      description: 'Grafted high density Vietnam Super Early Jackfruit saplings. Rapid vegetative growth creates deep root carbon locks and prolific fruiting within 1.5 years.',
      carbonScoreKgPerYear: 28.5,
      businessVolume: 200,
      affiliatePoints: 25,
      stock: 1200,
      inStock: true,
      rating: 4.8,
      reviewsCount: 310
    },
    {
      id: 'PLT-02',
      name: 'Kumbhkat Seedless Lemon',
      category: 'Plant',
      price: 180,
      originalPrice: 220,
      image: 'https://images.unsplash.com/photo-1534856966150-c832f817a508?w=400&auto=format&fit=crop&q=80',
      shortDesc: 'Year-round fruiting, high canopy density, absorbs 18.2 kg CO2/yr.',
      description: 'Thornless, high-yield citrus variety. Ideal intercrop companion for agroforestry and continuous cash flow from lemons.',
      carbonScoreKgPerYear: 18.2,
      businessVolume: 160,
      affiliatePoints: 20,
      stock: 850,
      inStock: true,
      rating: 4.7,
      reviewsCount: 195
    },
    {
      id: 'PLT-03',
      name: 'PKM-1 Super Moringa (Drumstick)',
      category: 'Plant',
      price: 95,
      originalPrice: 130,
      image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&auto=format&fit=crop&q=80',
      shortDesc: 'Fastest growing carbon absorber. Sequestering 22 kg CO2/yr.',
      description: 'Moringa trees absorb 20x more carbon dioxide than standard vegetation. Rich in medicinal value and fast biomass generation.',
      carbonScoreKgPerYear: 22.0,
      businessVolume: 80,
      affiliatePoints: 12,
      stock: 2500,
      inStock: true,
      badge: 'Super Eco',
      rating: 4.9,
      reviewsCount: 420
    },
    {
      id: 'PLT-04',
      name: 'Tissue-Culture Super Teak',
      category: 'Plant',
      price: 350,
      originalPrice: 450,
      image: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=400&auto=format&fit=crop&q=80',
      shortDesc: 'Genetically superior straight-pole timber. 35 kg CO2/yr.',
      description: 'Clonal tissue culture teak with uniform growth and thick canopy. Long term high timber wealth + premium carbon credits.',
      carbonScoreKgPerYear: 35.0,
      businessVolume: 320,
      affiliatePoints: 40,
      stock: 600,
      inStock: true,
      rating: 4.9,
      reviewsCount: 76
    },
    {
      id: 'PLT-05',
      name: 'Giant Beema Bamboo',
      category: 'Plant',
      price: 280,
      originalPrice: 340,
      image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&auto=format&fit=crop&q=80',
      shortDesc: 'Absorbs 45 kg CO2/yr per clump. Generates 300kg oxygen/yr.',
      description: 'Beema bamboo is the world’s leading biological carbon sink. Regenerates naturally and produces huge biomass without replanting.',
      carbonScoreKgPerYear: 45.0,
      businessVolume: 250,
      affiliatePoints: 35,
      stock: 450,
      inStock: true,
      badge: 'Max Carbon',
      rating: 5.0,
      reviewsCount: 112
    },

    // Bio-Fertilizers
    {
      id: 'FERT-01',
      name: 'Carbonova Bio-NPK Microbial Granules (10kg)',
      category: 'Fertilizer',
      price: 650,
      originalPrice: 850,
      image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=400&auto=format&fit=crop&q=80',
      shortDesc: 'Enriched with Azotobacter, PSB and KMB for 30% faster tree growth.',
      description: '100% natural organic microbial consortium that fixes atmospheric nitrogen, solubilizes phosphorus, and mobilizes potash into root zones.',
      carbonScoreKgPerYear: 15.0, // fertilizer boost value
      businessVolume: 500,
      affiliatePoints: 60,
      stock: 350,
      inStock: true,
      badge: 'Essential',
      rating: 4.9,
      reviewsCount: 280
    },
    {
      id: 'FERT-02',
      name: 'Endo-Mycorrhiza Root Super-Booster (1kg)',
      category: 'Fertilizer',
      price: 480,
      originalPrice: 600,
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop&q=80',
      shortDesc: 'Expands root surface area by 1000%. Boosts sapling survival to 98%.',
      description: 'Symbiotic fungal inoculant that binds soil carbon and increases drought resistance. Mandatory for dryland plantation.',
      carbonScoreKgPerYear: 10.0,
      businessVolume: 380,
      affiliatePoints: 45,
      stock: 200,
      inStock: true,
      rating: 4.8,
      reviewsCount: 94
    },
    {
      id: 'FERT-03',
      name: 'Trichoderma Enriched Vermicompost (25kg)',
      category: 'Fertilizer',
      price: 750,
      originalPrice: 950,
      image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=400&auto=format&fit=crop&q=80',
      shortDesc: 'A-Grade earthworm humus infused with beneficial biocontrol fungi.',
      description: 'Prevents root rot and soil-borne pathogens while conditioning the soil with rich organic humic acids and humin.',
      carbonScoreKgPerYear: 20.0,
      businessVolume: 600,
      affiliatePoints: 75,
      stock: 180,
      inStock: true,
      rating: 5.0,
      reviewsCount: 165
    },

    // Bio-Pesticides
    {
      id: 'PEST-01',
      name: 'Cold-Pressed Neem Azadirachtin 10000 PPM (1L)',
      category: 'Pesticide',
      price: 520,
      originalPrice: 680,
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&auto=format&fit=crop&q=80',
      shortDesc: 'Organic broad-spectrum insect antifeedant & repellent.',
      description: 'Controls sucking pests, borers, aphids, and whiteflies without leaving toxic chemical residues on plants or degrading soil ecology.',
      carbonScoreKgPerYear: 8.0,
      businessVolume: 400,
      affiliatePoints: 50,
      stock: 290,
      inStock: true,
      badge: 'Eco Safe',
      rating: 4.9,
      reviewsCount: 188
    },
    {
      id: 'PEST-02',
      name: 'Beauveria Bassiana Bio-Insecticide (1kg)',
      category: 'Pesticide',
      price: 420,
      originalPrice: 550,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80',
      shortDesc: 'Entomopathogenic fungus for caterpillar & borer management.',
      description: 'Naturally parasitizes harmful insect pests while sparing friendly pollinators like honeybees and butterflies.',
      carbonScoreKgPerYear: 5.0,
      businessVolume: 320,
      affiliatePoints: 40,
      stock: 150,
      inStock: true,
      rating: 4.7,
      reviewsCount: 62
    }
  ]);

  // Cart Signal
  readonly cart = signal<CartItem[]>([]);

  // Cart Computed Stats
  readonly cartSubtotal = computed(() => {
    return this.cart().reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  });

  readonly cartTotalBV = computed(() => {
    return this.cart().reduce((sum, item) => sum + (item.product.businessVolume * item.quantity), 0);
  });

  readonly cartTotalCarbonBoost = computed(() => {
    return this.cart().reduce((sum, item) => sum + (item.product.carbonScoreKgPerYear * item.quantity), 0);
  });

  readonly cartTotalItems = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.quantity, 0);
  });

  // Recent Orders
  readonly orders = signal<Order[]>([
    {
      id: 'ORD-9912',
      orderNumber: 'CGC-ORD-2026-9912',
      date: '01 Aug 2026',
      items: [
        {
          productId: 'PKG-01',
          productName: 'Green Starter Package',
          price: 10000,
          quantity: 1,
          category: 'Package',
          total: 10000
        }
      ],
      subtotal: 10000,
      tax: 0,
      discount: 0,
      total: 10000,
      totalBv: 10000,
      status: 'Delivered',
      shippingAddress: 'Ambikapur, Surguja District, Chhattisgarh - 497001',
      paymentMethod: 'Online UPI'
    }
  ]);

  // Cart Methods
  addToCart(product: Product, quantity: number = 1) {
    this.cart.update(items => {
      const existingIndex = items.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      } else {
        return [...items, { product, quantity }];
      }
    });
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this.cart.update(items =>
      items.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  }

  removeFromCart(productId: string) {
    this.cart.update(items => items.filter(item => item.product.id !== productId));
  }

  clearCart() {
    this.cart.set([]);
  }

  placeOrder(address: string, paymentMethod: string): Order {
    const currentCart = this.cart();
    const subtotal = this.cartSubtotal();
    const totalBv = this.cartTotalBV();

    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      orderNumber: `CGC-ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      items: currentCart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        category: item.product.category,
        total: item.product.price * item.quantity
      })),
      subtotal,
      tax: 0,
      discount: 0,
      total: subtotal,
      totalBv,
      status: 'Confirmed',
      shippingAddress: address,
      paymentMethod
    };

    this.orders.update(orders => [newOrder, ...orders]);
    this.clearCart();
    return newOrder;
  }

  constructor() {
    this.loadLiveStoreData();
  }

  async loadLiveStoreData(): Promise<void> {
    try {
      const [plansRes, productsRes] = await Promise.all([
        this.membersService.activeplans(),
        this.membersService.productslist()
      ]);

      const plans = plansRes?.result;
      const products = productsRes?.result;

      if (Array.isArray(products) && products.length > 0) {
        this.products.update(currentList => {
          return currentList.map(item => {
            const match = products.find((p: any) =>
              p.productname && item.name.toLowerCase().includes(p.productname.toLowerCase().split(' ')[0])
            );
            if (match) {
              return {
                ...item,
                price: parseFloat(match.price) || item.price,
                originalPrice: match.dp ? parseFloat(match.dp) * 1.25 : item.originalPrice,
                affiliatePoints: match.rewardpoint ? parseInt(match.rewardpoint, 10) * 1000 : item.affiliatePoints
              };
            }
            return item;
          });
        });
      }

      if (Array.isArray(plans) && plans.length > 0) {
        const pkg1 = plans[0];
        if (pkg1) {
          this.products.update(currentList => {
            return currentList.map(item => {
              if (item.id === 'PKG-01') {
                return {
                  ...item,
                  price: parseFloat(pkg1.amount) || item.price,
                  businessVolume: parseFloat(pkg1.amount) || item.businessVolume
                };
              }
              return item;
            });
          });
        }
      }
    } catch (e) {
      console.warn('[StoreService] Live store data synchronization skipped (offline or unauthenticated):', e);
    }
  }
}
