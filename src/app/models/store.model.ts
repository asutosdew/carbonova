export type ProductCategory = 'Package' | 'Plant' | 'Fertilizer' | 'Pesticide';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  image: string;
  shortDesc: string;
  description: string;
  carbonScoreKgPerYear: number; // kg of CO2 sequestered per unit per year
  businessVolume: number; // BV for partner commission
  affiliatePoints: number;
  stock: number;
  inStock: boolean;
  packageContents?: string[];
  specs?: { [key: string]: string };
  badge?: string;
  rating: number;
  reviewsCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  category: ProductCategory;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  totalBv: number;
  status: 'Delivered' | 'In Transit' | 'Processing' | 'Confirmed';
  shippingAddress: string;
  paymentMethod: string;
}
