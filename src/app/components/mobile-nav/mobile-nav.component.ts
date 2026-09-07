import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FarmerService } from '../../services/farmer.service';
import { IncomeService } from '../../services/income.service';
import { TeamService } from '../../services/team.service';
import { StoreService } from '../../services/store.service';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mobile-nav.component.html',
  styleUrls: ['./mobile-nav.component.scss']
})
export class MobileNavComponent {
  private router = inject(Router);
  readonly farmerService = inject(FarmerService);
  readonly incomeService = inject(IncomeService);
  readonly teamService = inject(TeamService);
  readonly storeService = inject(StoreService);

  readonly showMenuDrawer = signal(false);
  readonly copyFeedback = signal(false);

  // 5 core quick bottom bar items
  navItems = [
    { label: 'Home', path: '/dashboard', icon: 'home' },
    { label: 'My Farm', path: '/farm', icon: 'sprout' },
    { label: 'Team', path: '/team', icon: 'users', badge: '128' },
    { label: 'Income', path: '/income', icon: 'wallet', badge: '₹' },
    { label: 'Credits', path: '/credits', icon: 'coins' },
  ];

  allMenuItems = [
    { label: 'Home', path: '/dashboard', icon: 'home', desc: 'Main Farm & Status Dashboard' },
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

  toggleMenu() {
    this.showMenuDrawer.update(v => !v);
  }

  closeMenu() {
    this.showMenuDrawer.set(false);
  }

  copyReferralLink() {
    navigator.clipboard.writeText(this.teamService.referralLink());
    this.copyFeedback.set(true);
    setTimeout(() => {
      this.copyFeedback.set(false);
    }, 2000);
  }
}
