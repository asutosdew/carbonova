import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FarmerService } from '../../services/farmer.service';
import { AuthService } from '../../services/auth.service';
import { BankDetails, KycDetails } from '../../models/farmer.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  readonly farmerService = inject(FarmerService);
  readonly authService = inject(AuthService);

  readonly activeTab = signal<'profile' | 'bank' | 'kyc' | 'session'>('profile');
  readonly toastMessage = signal<string | null>(null);
  readonly isSaving = signal<boolean>(false);

  // Form State Models bound from FarmerService
  profileForm = {
    name: this.farmerService.farmer().name,
    phone: this.farmerService.farmer().phone,
    email: this.farmerService.farmer().email,
    fatherOrSpouseName: this.farmerService.farmer().fatherOrSpouseName,
    gender: this.farmerService.farmer().gender,
    dateOfBirth: this.farmerService.farmer().dateOfBirth,
    state: this.farmerService.farmer().state,
    district: this.farmerService.farmer().district,
    village: this.farmerService.farmer().village,
    pinCode: this.farmerService.farmer().pinCode,
    farmArea: this.farmerService.farmer().farmArea,
    soilType: this.farmerService.farmer().soilType,
    irrigationSource: this.farmerService.farmer().irrigationSource
  };

  bankForm = {
    accountHolderName: this.farmerService.farmer().bankDetails.accountHolderName,
    bankName: this.farmerService.farmer().bankDetails.bankName,
    accountNumber: this.farmerService.farmer().bankDetails.accountNumber,
    confirmAccountNumber: this.farmerService.farmer().bankDetails.accountNumber,
    ifscCode: this.farmerService.farmer().bankDetails.ifscCode,
    branchName: this.farmerService.farmer().bankDetails.branchName,
    upiId: this.farmerService.farmer().bankDetails.upiId,
    passbookPhotoUrl: this.farmerService.farmer().bankDetails.passbookPhotoUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80'
  };

  kycForm = {
    aadhaarNumber: this.farmerService.farmer().kycDetails.aadhaarNumber,
    panNumber: this.farmerService.farmer().kycDetails.panNumber,
    landRecordType: this.farmerService.farmer().kycDetails.landRecordType,
    landKhasraNumber: this.farmerService.farmer().kycDetails.landKhasraNumber,
    nomineeName: this.farmerService.farmer().kycDetails.nomineeName,
    nomineeRelation: this.farmerService.farmer().kycDetails.nomineeRelation,
    nomineeAge: this.farmerService.farmer().kycDetails.nomineeAge,
    aadhaarFrontUrl: this.farmerService.farmer().kycDetails.aadhaarFrontUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
    panCardUrl: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=400&auto=format&fit=crop&q=80',
    landRecordUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=80'
  };

  setTab(tab: 'profile' | 'bank' | 'kyc' | 'session') {
    this.activeTab.set(tab);
  }

  // File / Photo selection handlers
  onAvatarSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        this.farmerService.farmer.update(f => ({ ...f, avatar: dataUrl }));
        this.showToast('Profile photo updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  }

  onPassbookSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.bankForm.passbookPhotoUrl = e.target?.result as string;
        this.showToast('Passbook / Cheque photo selected!');
      };
      reader.readAsDataURL(file);
    }
  }

  onAadhaarSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.kycForm.aadhaarFrontUrl = e.target?.result as string;
        this.showToast('Aadhaar card document selected!');
      };
      reader.readAsDataURL(file);
    }
  }

  onPanSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.kycForm.panCardUrl = e.target?.result as string;
        this.showToast('PAN card document selected!');
      };
      reader.readAsDataURL(file);
    }
  }

  onLandRecordSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.kycForm.landRecordUrl = e.target?.result as string;
        this.showToast('Farm land / Khasra document selected!');
      };
      reader.readAsDataURL(file);
    }
  }

  savePersonalProfile() {
    this.isSaving.set(true);
    setTimeout(() => {
      this.farmerService.updatePersonalProfile(this.profileForm);
      this.isSaving.set(false);
      this.showToast('Farmer Profile updated successfully!');
    }, 600);
  }

  saveBankDetails() {
    if (this.bankForm.accountNumber !== this.bankForm.confirmAccountNumber) {
      this.showToast('Error: Account Numbers do not match.');
      return;
    }
    this.isSaving.set(true);
    setTimeout(() => {
      const res = this.farmerService.updateBankDetails(this.bankForm);
      this.isSaving.set(false);
      this.showToast(res.message);
    }, 800);
  }

  saveKycDetails() {
    this.isSaving.set(true);
    setTimeout(() => {
      const res = this.farmerService.updateKycDetails(this.kycForm);
      this.isSaving.set(false);
      this.showToast(res.message);
    }, 800);
  }

  lookupIfsc() {
    const code = this.bankForm.ifscCode.toUpperCase().trim();
    if (code.startsWith('SBIN')) {
      this.bankForm.bankName = 'State Bank of India';
      this.bankForm.branchName = 'Ambikapur Main Branch (Surguja)';
    } else if (code.startsWith('HDFC')) {
      this.bankForm.bankName = 'HDFC Bank';
      this.bankForm.branchName = 'Ambikapur Ring Road Branch';
    } else if (code.startsWith('PUNB')) {
      this.bankForm.bankName = 'Punjab National Bank';
      this.bankForm.branchName = 'Ambikapur City Branch';
    } else if (code.startsWith('ICIC')) {
      this.bankForm.bankName = 'ICICI Bank';
      this.bankForm.branchName = 'Ambikapur Main Branch';
    }
  }

  logout() {
    this.authService.logout();
  }

  simulate401() {
    this.authService.simulate401Unauthorized();
  }

  get tokenJson(): string {
    const t = this.authService.getToken();
    return t ? JSON.stringify(t, null, 2) : '{}';
  }

  private showToast(msg: string) {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3500);
  }
}
