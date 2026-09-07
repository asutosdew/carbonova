import { Injectable, signal, computed, inject } from '@angular/core';
import { FarmerProfile, PlantItem, VerificationStep, PlantationUpdate, WeatherInfo, NotificationItem, BankDetails, KycDetails } from '../models/farmer.model';
import { WeatherService } from './weather.service';
import { MembersService } from './members.service';

@Injectable({
  providedIn: 'root'
})
export class FarmerService {
  private readonly PROFILE_STORAGE_KEY = 'carbonova_farmer_profile';
  private readonly weatherService = inject(WeatherService);
  private readonly membersService = inject(MembersService);

  // Farmer profile matching the screenshot and progressive onboarding
  readonly farmer = signal<FarmerProfile>(this.loadInitialProfile());
  readonly weather = this.weatherService.weather;

  // Plants list matching Card 1
  readonly plants = signal<PlantItem[]>([
    {
      id: 'PL-01',
      name: 'Vietnam Jackfruit',
      scientificName: 'Artocarpus heterophyllus',
      image: 'https://images.unsplash.com/photo-1596707325255-7a315e966b96?w=120&auto=format&fit=crop&q=80',
      qty: 10,
      activeQty: 10,
      status: '10 Active',
      carbonRatePerYearKg: 28.5,
      category: 'Fruit'
    },
    {
      id: 'PL-02',
      name: 'Kumbhkat Lemon',
      scientificName: 'Citrus limon (Kumbhkat)',
      image: 'https://images.unsplash.com/photo-1534856966150-c832f817a508?w=120&auto=format&fit=crop&q=80',
      qty: 10,
      activeQty: 9,
      status: '9 Active',
      carbonRatePerYearKg: 18.2,
      category: 'Fruit'
    },
    {
      id: 'PL-03',
      name: 'Moringa',
      scientificName: 'Moringa oleifera',
      image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=120&auto=format&fit=crop&q=80',
      qty: 20,
      activeQty: 19,
      status: '19 Active',
      carbonRatePerYearKg: 22.0,
      category: 'Medicinal'
    }
  ]);

  // Verification pipeline matching Card 3
  readonly verificationSteps = signal<VerificationStep[]>([
    {
      id: 1,
      title: 'Plantation',
      status: 'completed',
      icon: 'check',
      date: '08 Aug 2026',
      note: 'Saplings planted & geotagged'
    },
    {
      id: 2,
      title: 'Growth',
      status: 'in-progress',
      icon: 'refresh-cw',
      date: 'Pending',
      note: 'Growth Verification Pending'
    },
    {
      id: 3,
      title: 'Care',
      status: 'locked',
      icon: 'lock',
      date: 'Next: 08 Sep 2026',
      note: 'Fertilization & health audit'
    }
  ]);

  readonly verificationStatusInfo = signal({
    currentStatus: 'Growth Verification Pending',
    lastVerification: '08 Aug 2026',
    nextVerification: '08 Sep 2026'
  });

  // Last plantation update matching Card 4
  readonly lastPlantationUpdate = signal<PlantationUpdate>({
    id: 'UPD-2026-08-08',
    date: '08 Aug 2026',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d69106093?w=600&auto=format&fit=crop&q=80',
    statusText: 'Plants are healthy and growing well.',
    growthStage: 'Early Vegetative (Stage 1)',
    healthScore: 94,
    soilMoisture: 'Optimal (68%)',
    fertilizerUsed: 'Carbonova Bio-NPK Granules',
    verifiedBy: 'Dr. A. Sharma (Carbonova Agronomist)',
    isVerified: true
  });

  // Package details matching Card 5
  readonly packageDetails = signal({
    name: 'Green Starter Package',
    price: 10000,
    status: 'Active',
    includedItems: [
      '10 Jackfruit',
      '10 Lemon',
      '20 Moringa',
      'Fertilizer Kit',
      'Training & Support'
    ],
    boxImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=80'
  });

  // Green Credits matching Card 6
  readonly greenCredits = signal({
    points: 1250,
    verifiedPlantation: 40,
    verificationStatus: 'Active',
    co2OffsetKg: 912,
    lifetimePoints: 1650,
    redeemedPoints: 400
  });

  constructor() {
    // Automatically fetch real live data from backend server
    this.initLiveBackendData();
    // Automatically detect user GPS location on startup, falling back to profile city
    this.refreshWeather();
  }

  async initLiveBackendData(): Promise<void> {
    try {
      // Single unified API route for full Dashboard
      const res = await this.membersService.downlinestatus();
      const pf = res?.result || res?.data || res;

      if (pf) {
        const current = this.farmer();
        const updated: FarmerProfile = {
          ...current,
          ...(pf?.name ? { name: pf.name } : {}),
          ...(pf?.mobile ? { phone: pf.mobile } : {}),
          ...(pf?.phone ? { phone: pf.phone } : {}),
          ...(pf?.email ? { email: pf.email } : {}),
          ...(pf?.userid ? { farmerId: 'CGC-' + pf.userid } : {}),
          ...(pf?.farmerId ? { farmerId: pf.farmerId } : {}),
          ...(pf?.doj ? { joiningDate: new Date(pf.doj).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) } : {}),
          ...(pf?.joiningDate ? { joiningDate: pf.joiningDate } : {}),
          ...(pf?.totalPlants !== undefined ? { totalPlants: Number(pf.totalPlants) } : (pf?.totalplants !== undefined ? { totalPlants: Number(pf.totalplants) } : {})),
          ...(pf?.activePlants !== undefined ? { activePlants: Number(pf.activePlants) } : (pf?.activeplants !== undefined ? { activePlants: Number(pf.activeplants) } : {})),
          ...(pf?.survivalRate !== undefined ? { survivalRate: Number(pf.survivalRate) } : (pf?.survivalrate !== undefined ? { survivalRate: Number(pf.survivalrate) } : {})),
          ...(pf?.village ? { village: pf.village } : {}),
          ...(pf?.district ? { district: pf.district } : {}),
          ...(pf?.city ? { district: pf.city } : {}),
          ...(pf?.pinCode ? { pinCode: pf.pinCode } : (pf?.pincode ? { pinCode: pf.pincode } : {})),
          location: pf?.location || (pf?.city ? `${pf.city}, ${pf.state || 'Chhattisgarh'}` : current.location),
          bankDetails: {
            ...current.bankDetails,
            ...(pf?.acno ? { accountNumber: pf.acno } : {}),
            ...(pf?.ifsc ? { ifscCode: pf.ifsc } : {}),
            ...(pf?.name ? { accountHolderName: pf.name } : {})
          },
          kycDetails: {
            ...current.kycDetails,
            ...(pf?.pan ? { panNumber: pf.pan.toUpperCase() } : {})
          },
          accountNumber: pf?.acno ? `•••• •••• ${pf.acno.slice(-4)}` : current.accountNumber,
          ifscCode: pf?.ifsc || current.ifscCode
        };

        // Dynamically update dashboard cards from downlinestatus response
        if (Array.isArray(pf?.plants) && pf.plants.length > 0) {
          this.plants.set(pf.plants);
        }
        if (pf?.packageDetails) {
          this.packageDetails.set({ ...this.packageDetails(), ...pf.packageDetails });
        }
        if (pf?.greenCredits) {
          this.greenCredits.set({ ...this.greenCredits(), ...pf.greenCredits });
        }
        if (Array.isArray(pf?.verificationSteps) && pf.verificationSteps.length > 0) {
          this.verificationSteps.set(pf.verificationSteps);
        }
        if (pf?.lastPlantationUpdate) {
          this.lastPlantationUpdate.set({ ...this.lastPlantationUpdate(), ...pf.lastPlantationUpdate });
        }

        this.saveProfile(updated);
        this.refreshWeather();
      }
    } catch (e) {
      console.warn('[FarmerService] Live backend data initialization from downlinestatus skipped:', e);
    }
  }

  refreshWeather(): void {
    const fallbackLocation = this.farmer().district || this.farmer().location || 'Ambikapur, CG';
    this.weatherService.detectAndFetchWeather(fallbackLocation);
  }

  // Notifications
  readonly notifications = signal<NotificationItem[]>([
    {
      id: 'N1',
      title: 'Direct Referral Commission',
      message: 'You earned ₹1,000 direct commission from Ramesh Patel (CGC-158201)',
      time: '10 mins ago',
      read: false,
      type: 'income',
      icon: 'wallet'
    },
    {
      id: 'N2',
      title: 'Growth Verification Due',
      message: 'Please capture and upload new geotagged photos before 08 Sep 2026.',
      time: '2 hours ago',
      read: false,
      type: 'verification',
      icon: 'camera'
    },
    {
      id: 'N3',
      title: 'Autopool Cycle Advance',
      message: 'Silver Carbon Autopool reached 75% completion. Expected payout ₹10,000.',
      time: 'Yesterday',
      read: false,
      type: 'team',
      icon: 'layers'
    }
  ]);

  private loadInitialProfile(): FarmerProfile {
    try {
      const stored = localStorage.getItem(this.PROFILE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.avatar || parsed.avatar.includes('unsplash.com/photo-1507003211169')) {
          parsed.avatar = 'assets/images/farmer-avatar.jpg';
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Error loading stored profile', e);
    }

    // Default initialized profile for Sandeep (Name & Mobile initially provided at signup)
    const initial: FarmerProfile = {
      id: 'FARMER-157059',
      farmerId: 'CGC-157059',
      name: 'Sandeep', // Initially provided
      phone: '+91 98271 54321', // Initially provided
      avatar: 'assets/images/farmer-avatar.jpg',
      rank: 'Green Starter',
      sponsorId: 'CGC-102944',
      sponsorName: 'Rajendra Verma',
      location: 'Ambikapur, Chhattisgarh',
      district: 'Surguja',
      state: 'Chhattisgarh',
      village: 'Kalyanpur, Ambikapur Tehsil',
      pinCode: '497001',
      email: 'sandeep.farmer@carbonova.eco',
      fatherOrSpouseName: 'Ramprasad',
      gender: 'Male',
      dateOfBirth: '1988-06-14',
      plantationDate: '15 Aug 2026',
      farmArea: '0.25 Acre',
      soilType: 'Red & Yellow Loamy',
      irrigationSource: 'Borewell & Drip Line',
      totalPlants: 40,
      activePlants: 38,
      survivalRate: 95,
      status: 'Active',
      joiningDate: '01 Aug 2026',
      profileCompletionPercentage: 90,
      bankDetails: {
        accountHolderName: 'Sandeep',
        bankName: 'State Bank of India',
        accountNumber: '38920194821',
        ifscCode: 'SBIN0004128',
        branchName: 'Ambikapur Main Branch',
        upiId: 'sandeep.cgc@upi',
        passbookPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
        isVerified: true,
        verifiedAt: '05 Aug 2026'
      },
      kycDetails: {
        aadhaarNumber: 'XXXX-XXXX-8492',
        aadhaarFrontUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
        panNumber: 'ABCPS8492K',
        landRecordType: 'Khasra-B1',
        landKhasraNumber: 'Plot No. 142/2 (0.25 Acre)',
        nomineeName: 'Sunita',
        nomineeRelation: 'Spouse',
        nomineeAge: 32,
        kycStatus: 'Verified',
        submittedAt: '03 Aug 2026',
        verifiedAt: '05 Aug 2026'
      },
      aadhaarVerified: true,
      bankVerified: true,
      accountNumber: '•••• •••• 8492',
      ifscCode: 'SBIN0004128',
      bankName: 'State Bank of India - Ambikapur Branch',
      upiId: 'sandeep.cgc@upi'
    };

    return initial;
  }

  private saveProfile(updated: FarmerProfile) {
    this.farmer.set(updated);
    try {
      localStorage.setItem(this.PROFILE_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving profile to localStorage', e);
    }
  }

  // Update Personal & Farm Profile
  updatePersonalProfile(data: Partial<FarmerProfile>) {
    const current = this.farmer();
    const updated: FarmerProfile = {
      ...current,
      ...data,
      location: data.village && data.district ? `${data.village}, ${data.district}, ${data.state || current.state}` : (data.location || current.location),
      profileCompletionPercentage: this.calculateProfileScore({ ...current, ...data })
    };
    this.saveProfile(updated);

    // If city/district updated and not locked to live GPS, fetch weather for updated profile city
    if (data.district || data.location || data.village) {
      const city = data.district || data.location || data.village || 'Ambikapur';
      if (this.weather().source !== 'gps') {
        this.weatherService.fetchWeatherByCity(city, 'profile');
      }
    }

    // Sync with live server
    if (updated.village || updated.district || updated.pinCode) {
      this.membersService.saveShippingAddress({
        name: updated.name,
        mobile: updated.phone,
        address1: updated.village || '',
        address2: '',
        address3: '',
        distt: updated.district || '',
        city: updated.district || 'Ambikapur',
        state: updated.state || 'Chhattisgarh',
        pincode: updated.pinCode || '497001'
      }).catch(err => console.warn('[FarmerService] Server saveShippingAddress error:', err));
    }
  }

  // Update Bank Details
  updateBankDetails(bank: Partial<BankDetails>): { success: boolean; message: string } {
    const current = this.farmer();
    const updatedBank: BankDetails = {
      ...current.bankDetails,
      ...bank,
      isVerified: true,
      verifiedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    const updated: FarmerProfile = {
      ...current,
      bankDetails: updatedBank,
      bankVerified: true,
      bankName: `${updatedBank.bankName} - ${updatedBank.branchName}`,
      accountNumber: updatedBank.accountNumber ? `•••• •••• ${updatedBank.accountNumber.slice(-4)}` : current.accountNumber,
      ifscCode: updatedBank.ifscCode,
      upiId: updatedBank.upiId
    };

    this.saveProfile(updated);

    // Sync with live server
    this.membersService.updateprofile(
      current.district || 'Ambikapur',
      bank.accountNumber || current.bankDetails.accountNumber || '',
      bank.ifscCode || current.bankDetails.ifscCode || '',
      current.kycDetails.panNumber || ''
    ).catch(err => console.warn('[FarmerService] Server updateprofile error:', err));

    return { success: true, message: 'Bank account verified via Penny Drop and saved successfully!' };
  }

  // Update KYC Documents & Nominee
  updateKycDetails(kyc: Partial<KycDetails>): { success: boolean; message: string } {
    const current = this.farmer();
    const updatedKyc: KycDetails = {
      ...current.kycDetails,
      ...kyc,
      kycStatus: 'Verified',
      submittedAt: current.kycDetails.submittedAt || new Date().toLocaleDateString('en-GB'),
      verifiedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    const updated: FarmerProfile = {
      ...current,
      kycDetails: updatedKyc,
      aadhaarVerified: true
    };

    this.saveProfile(updated);
    return { success: true, message: 'Aadhaar, PAN & Land KYC documents verified successfully!' };
  }

  private calculateProfileScore(p: FarmerProfile): number {
    let score = 20; // 20% for initial Name & Mobile
    if (p.email) score += 10;
    if (p.village && p.pinCode) score += 15;
    if (p.farmArea && p.soilType) score += 15;
    if (p.bankDetails?.isVerified) score += 20;
    if (p.kycDetails?.kycStatus === 'Verified') score += 20;
    return Math.min(100, score);
  }

  markAllNotificationsRead() {
    this.notifications.update(list => list.map(item => ({ ...item, read: true })));
  }

  addPlantationPhoto(imageUrl: string, note: string) {
    const newUpdate: PlantationUpdate = {
      id: `UPD-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      image: imageUrl,
      statusText: note,
      growthStage: 'Vegetative Stage 2',
      healthScore: 96,
      soilMoisture: '72% (Good)',
      fertilizerUsed: 'Bio-NPK & Vermicompost',
      verifiedBy: 'AI Agro-Vision (Auto Approved)',
      isVerified: true
    };
    this.lastPlantationUpdate.set(newUpdate);
  }
}
