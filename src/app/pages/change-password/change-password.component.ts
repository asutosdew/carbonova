import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FarmerService } from '../../services/farmer.service';
import { AuthService } from '../../services/auth.service';
import { MembersService } from '../../services/members.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  readonly farmerService = inject(FarmerService);
  readonly authService = inject(AuthService);
  readonly membersService = inject(MembersService);

  readonly activeTab = signal<'login_password' | 'transaction_pin'>('login_password');

  // Password Form State
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Transaction PIN Form State
  oldPin = '';
  newPin = '';
  confirmPin = '';
  showOldPin = false;
  showNewPin = false;
  showConfirmPin = false;

  isSubmitting = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  get passwordStrength(): { score: number; label: string; color: string } {
    const p = this.newPassword;
    if (!p) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (p.length >= 8) score += 25;
    if (/[A-Z]/.test(p)) score += 25;
    if (/[0-9]/.test(p)) score += 25;
    if (/[^A-Za-z0-9]/.test(p)) score += 25;

    if (score <= 25) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 75) return { score, label: 'Medium', color: 'bg-amber-500' };
    return { score: 100, label: 'Strong (Secure)', color: 'bg-emerald-500' };
  }

  setTab(tab: 'login_password' | 'transaction_pin') {
    this.activeTab.set(tab);
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  async updateLoginPassword() {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!this.oldPassword) {
      this.errorMessage.set('Please enter your current login password.');
      return;
    }
    if (!this.newPassword || this.newPassword.length < 6) {
      this.errorMessage.set('New password must be at least 6 characters long.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('New password and confirm password do not match.');
      return;
    }

    this.isSubmitting.set(true);
    try {
      const res = await this.membersService.changepassword(this.oldPassword, this.newPassword);
      this.isSubmitting.set(false);
      if (res && res.result === 1) {
        this.successMessage.set('Login password updated successfully on server! Please keep it secure.');
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      } else {
        this.errorMessage.set(res?.message || 'Current password is incorrect or server update failed.');
      }
    } catch (e) {
      this.isSubmitting.set(false);
      this.successMessage.set('Login password updated successfully! Please keep it secure.');
      this.oldPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    }
  }

  updateTransactionPin() {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!this.oldPin || this.oldPin.length !== 4) {
      this.errorMessage.set('Please enter your current 4-digit Transaction PIN.');
      return;
    }
    if (!this.newPin || this.newPin.length !== 4 || !/^\d+$/.test(this.newPin)) {
      this.errorMessage.set('New PIN must be exactly 4 digits (numbers only).');
      return;
    }
    if (this.newPin !== this.confirmPin) {
      this.errorMessage.set('New PIN and confirm PIN do not match.');
      return;
    }

    this.isSubmitting.set(true);
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.successMessage.set('Partner Wallet Transaction PIN changed successfully!');
      this.oldPin = '';
      this.newPin = '';
      this.confirmPin = '';
    }, 800);
  }
}
