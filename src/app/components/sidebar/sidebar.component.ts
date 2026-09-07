import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { StoreService } from '../../services/store.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  private router = inject(Router);
  readonly storeService = inject(StoreService);
  readonly authService = inject(AuthService);

  readonly showSupportModal = signal(false);

  navItems = [
    { label: 'Home', path: '/dashboard', icon: 'home' },
    { label: 'My Farm', path: '/farm', icon: 'sprout' },
    { label: 'Updates', path: '/updates', icon: 'camera' },
    { label: 'Credits', path: '/credits', icon: 'coins' },
    { label: 'Income & Wallet', path: '/income', icon: 'wallet', badge: 'Partner' },
    { label: 'Team & Network', path: '/team', icon: 'users', badge: '128' },
    { label: 'Eco Store', path: '/store', icon: 'shopping-bag' },
    { label: 'Profile & KYC', path: '/profile', icon: 'user' },
    { label: 'Change Password', path: '/change-password', icon: 'lock' },
  ];

  isActive(path: string): boolean {
    return this.router.url === path || (path === '/dashboard' && this.router.url === '/');
  }

  toggleSupport() {
    this.showSupportModal.update(v => !v);
  }

  logout() {
    this.authService.logout();
  }
}
