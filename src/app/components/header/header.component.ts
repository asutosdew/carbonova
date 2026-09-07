import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FarmerService } from '../../services/farmer.service';
import { StoreService } from '../../services/store.service';
import { IncomeService } from '../../services/income.service';
import { TeamService } from '../../services/team.service';
import { AuthService } from '../../services/auth.service';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private router = inject(Router);
  readonly farmerService = inject(FarmerService);
  readonly storeService = inject(StoreService);
  readonly incomeService = inject(IncomeService);
  readonly teamService = inject(TeamService);
  readonly authService = inject(AuthService);

  readonly showNotifications = signal(false);
  readonly showMobileDrawer = signal(false);

  allMenuItems = [
    { label: 'Home', path: '/dashboard', icon: 'home', desc: 'Main Farm Dashboard' },
    { label: 'Team & Partner Tree', path: '/team', icon: 'users', badge: '128 Farmers', desc: 'Downline tree & affiliate network' },
    { label: 'Income & Wallet', path: '/income', icon: 'wallet', badge: '₹' + this.incomeService.breakdown().walletBalance.toLocaleString(), desc: 'Direct, level, autopool earnings' },
    { label: 'Eco Store & Packages', path: '/store', icon: 'shopping-bag', badge: 'BV Store', desc: 'Plants, bio-fertilizers & neem' },
    { label: 'Green Credits & Certificate', path: '/credits', icon: 'coins', badge: '1,250 Pts', desc: 'CO2 calculator & official VCS cert' },
    { label: 'My Farm & Plots', path: '/farm', icon: 'sprout', desc: '0.25 Acre map & soil vitals' },
    { label: 'Plantation Updates', path: '/updates', icon: 'camera', desc: 'Geotagged growth photo audit' },
    { label: 'Farmer Profile & KYC', path: '/profile', icon: 'user', desc: 'Bank account, Aadhaar & sponsor' },
    { label: 'Change Password & PIN', path: '/change-password', icon: 'lock', desc: 'Login password & 4-digit Wallet PIN' },
  ];

  isActive(path: string): boolean {
    return this.router.url === path || (path === '/dashboard' && this.router.url === '/');
  }

  toggleNotifications() {
    this.showNotifications.update(v => !v);
  }

  toggleMobileDrawer() {
    this.showMobileDrawer.update(v => !v);
  }

  closeMobileDrawer() {
    this.showMobileDrawer.set(false);
  }

  markAllRead() {
    this.farmerService.markAllNotificationsRead();
  }

  get unreadCount(): number {
    return this.farmerService.notifications().filter(n => !n.read).length;
  }

  logout() {
    this.authService.logout();
  }
}
