import { Injectable, signal, computed, inject } from '@angular/core';
import { FarmerProfile, PlantItem, VerificationStep, PlantationUpdate, WeatherInfo, NotificationItem, BankDetails, KycDetails } from '../models/farmer.model';
import { WeatherService } from './weather.service';
import { MembersService } from './members.service';

@Injectable({
  providedIn: 'root'
})
export class FarmerService {
  private readonly PROFILE_STORAGE_KEY = 'carbonova_farmer_profile';
  private readonly PLANTS_STORAGE_KEY = 'carbonova_farmer_plants';
  private readonly PACKAGE_STORAGE_KEY = 'carbonova_farmer_package';
  private readonly weatherService = inject(WeatherService);
  private readonly membersService = inject(MembersService);

  // Farmer profile matching the screenshot and progressive onboarding
  readonly farmer = signal<FarmerProfile>(this.loadInitialProfile());
  readonly weather = this.weatherService.weather;

  // Plants list matching Card 1 (persisted in localStorage)
  readonly plants = signal<PlantItem[]>(this.loadInitialPlants());

  // Package details matching Card 5 (persisted in localStorage)
  readonly packageDetails = signal(this.loadInitialPackageDetails());

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

  // Green Credits matching Card 6 (base signal)
  readonly greenCredits = signal({
    points: 1250,
    verifiedPlantation: 40,
    verificationStatus: 'Active',
    co2OffsetKg: 912,
    lifetimePoints: 1650,
    redeemedPoints: 400
  });

  // Computed state: Whether farmer has selected any plants
  readonly hasPlants = computed(() => {
    const list = this.plants();
    return list.length > 0 && list.some(p => p.qty > 0);
  });

  // Computed state: Whether farmer has completed farm details (land size, soil type)
  readonly hasFarmDetails = computed(() => {
    const p = this.farmer();
    return !!(p.farmArea && p.farmArea.trim() !== '' && p.soilType && p.soilType.trim() !== '');
  });

  // Computed state: Farmer activated only when plants are chosen and status is Active
  readonly isFarmerActivated = computed(() => {
    return this.hasPlants() && this.farmer().status === 'Active';
  });

  // Dynamic green credits reflecting selected plants (Inactive & 0 when no plants)
  readonly dynamicGreenCredits = computed(() => {
    if (!this.hasPlants()) {
      return {
        points: 0,
        verifiedPlantation: 0,
        verificationStatus: 'Inactive (No Plants)',
        co2OffsetKg: 0,
        lifetimePoints: 0,
        redeemedPoints: 0
      };
    }
    const totalPlants = this.farmer().totalPlants || this.plants().reduce((acc, p) => acc + p.qty, 0);
    const pts = Math.round(totalPlants * 31.25);
    const co2 = this.plants().reduce((acc, p) => acc + ((p.carbonRatePerYearKg || 25) * p.qty), 0);
    return {
      points: pts > 0 ? pts : 1250,
      verifiedPlantation: totalPlants,
      verificationStatus: 'Active',
      co2OffsetKg: Math.round(co2) > 0 ? Math.round(co2) : 912,
      lifetimePoints: (pts > 0 ? pts : 1250) + 400,
      redeemedPoints: 400
    };
  });

  // Dynamic green impact reflecting selected plants (Inactive & 0 when no plants)
  readonly dynamicGreenImpact = computed(() => {
    if (!this.hasPlants()) {
      return {
        plantsRegistered: 0,
        plantsActive: 0,
        co2OffsetKg: 0,
        statusText: 'No plants selected yet. Choose a package to activate impact tracking.'
      };
    }
    const registered = this.farmer().totalPlants || this.plants().reduce((acc, p) => acc + p.qty, 0);
    const active = this.farmer().activePlants || registered;
    const co2 = this.plants().reduce((acc, p) => acc + ((p.carbonRatePerYearKg || 25) * p.qty), 0);
    return {
      plantsRegistered: registered,
      plantsActive: active,
      co2OffsetKg: Math.round(co2) > 0 ? Math.round(co2) : 912,
      statusText: 'Impact data will update as plantation grows.'
    };
  });

  constructor() {
    // Automatically fetch real live data from backend server
    this.initLiveBackendData();
    // Automatically detect user GPS location on startup, falling back to profile city
    this.refreshWeather();
  }

  async initLiveBackendData(): Promise<void> {
    try {
      // Single unified API route for full Dashboard + Personal Info
      const [resDownline, resPersonal] = await Promise.allSettled([
        this.membersService.downlinestatus(),
        this.membersService.personalinfo()
      ]);

      const pf = resDownline.status === 'fulfilled' ? (resDownline.value?.result || resDownline.value?.data || resDownline.value) : null;
      const pi = resPersonal.status === 'fulfilled' ? (resPersonal.value?.data || resPersonal.value?.result) : null;

      if (pf || pi) {
        const current = this.farmer();
        const updated: FarmerProfile = {
          ...current,
          name: pf?.name || pi?.name || current.name,
          phone: pf?.mobile || pf?.phone || pi?.mobile || current.phone,
          email: pf?.email || pi?.email || current.email,
          farmerId: pf?.farmerId || (pf?.userid ? 'CGC-' + pf.userid : (pi?.userid ? 'CGC-' + pi.userid : current.farmerId)),
          id: pf?.userid ? 'FARMER-' + pf.userid : (pi?.userid ? 'FARMER-' + pi.userid : current.id),
          status: pf?.status || (Number(pf?.totalPlants || 0) > 0 ? 'Active' : 'Pending'),
          joiningDate: pf?.doj ? new Date(pf.doj).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (pi?.doj ? new Date(pi.doj).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : current.joiningDate),
          totalPlants: Number(pf?.totalPlants !== undefined ? pf.totalPlants : (pf?.totalplants ?? 0)),
          activePlants: Number(pf?.activePlants !== undefined ? pf.activePlants : (pf?.activeplants ?? 0)),
          survivalRate: Number(pf?.survivalRate !== undefined ? pf.survivalRate : (pf?.survivalrate ?? 0)),
          village: pf?.village || current.village,
          district: pf?.district || pf?.city || pi?.city || current.district,
          pinCode: pf?.pinCode || pf?.pincode || current.pinCode,
          location: pf?.location || (pf?.district ? `${pf.district}, ${pf.state || 'Chhattisgarh'}` : (pf?.city ? `${pf.city}, ${pf.state || 'Chhattisgarh'}` : current.location)),
          sponsorId: pi?.sponsorid ? 'CGC-' + pi.sponsorid : (pf?.sponsorId || current.sponsorId),
          bankDetails: {
            ...current.bankDetails,
            accountNumber: pf?.acno || pi?.acno || current.bankDetails.accountNumber,
            ifscCode: pf?.ifsc || pi?.ifsc || current.bankDetails.ifscCode,
            accountHolderName: pf?.name || pi?.name || current.bankDetails.accountHolderName,
            isVerified: !!((pf?.acno || pi?.acno) && (pf?.ifsc || pi?.ifsc))
          },
          kycDetails: {
            ...current.kycDetails,
            panNumber: (pf?.pan || pi?.pan) ? (pf?.pan || pi?.pan).toUpperCase() : current.kycDetails.panNumber,
            kycStatus: (pf?.pan || pi?.pan) ? 'Verified' : current.kycDetails.kycStatus
          },
          accountNumber: (pf?.acno || pi?.acno) ? `•••• •••• ${(pf?.acno || pi?.acno).slice(-4)}` : current.accountNumber,
          ifscCode: pf?.ifsc || pi?.ifsc || current.ifscCode,
          bankVerified: !!((pf?.acno || pi?.acno) && (pf?.ifsc || pi?.ifsc))
        };

        // Dynamically update dashboard cards from downlinestatus response
        if (Array.isArray(pf?.plants)) {
          this.savePlants(pf.plants);
        }

        if (pf?.packageDetails) {
          this.savePackageDetails(pf.packageDetails);
        } else if (Number(pf?.totalPlants || 0) === 0 || !pf?.plants || pf.plants.length === 0) {
          this.savePackageDetails({
            name: 'No Package Selected',
            price: 0,
            status: 'Inactive',
            includedItems: [],
            boxImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=80'
          });
        }

        if (pf?.greenCredits) {
          this.greenCredits.set({ ...this.greenCredits(), ...pf.greenCredits });
        } else if (Number(pf?.totalPlants || 0) === 0) {
          this.greenCredits.set({
            points: 0,
            verifiedPlantation: 0,
            verificationStatus: 'Inactive (No Plants)',
            co2OffsetKg: 0,
            lifetimePoints: 0,
            redeemedPoints: 0
          });
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
        // Ignore stale demo/Sandeep profile
        if (parsed && parsed.name && parsed.name !== 'Sandeep' && parsed.farmerId !== 'CGC-157059') {
          if (!parsed.avatar || parsed.avatar.includes('unsplash.com/photo-1507003211169')) {
            parsed.avatar = 'assets/images/farmer-avatar.jpg';
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading stored profile', e);
    }

    // Default clean initial profile
    const initial: FarmerProfile = {
      id: 'FARMER-120873',
      farmerId: 'CGC-120873',
      name: 'Farmer',
      phone: '',
      avatar: 'assets/images/farmer-avatar.jpg',
      rank: 'Green Starter',
      sponsorId: '112233',
      sponsorName: '',
      location: 'Surguja, Chhattisgarh',
      district: 'Surguja',
      state: 'Chhattisgarh',
      village: '',
      pinCode: '497001',
      email: '',
      fatherOrSpouseName: '',
      gender: 'Other',
      dateOfBirth: '',
      plantationDate: '',
      farmArea: '',
      soilType: '',
      irrigationSource: '',
      totalPlants: 0,
      activePlants: 0,
      survivalRate: 0,
      status: 'Pending',
      joiningDate: '',
      profileCompletionPercentage: 20,
      bankDetails: {
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        upiId: '',
        passbookPhotoUrl: '',
        isVerified: false
      },
      kycDetails: {
        aadhaarNumber: '',
        aadhaarFrontUrl: '',
        panNumber: '',
        landRecordType: 'Khasra-B1',
        landKhasraNumber: '',
        nomineeName: '',
        nomineeRelation: 'Other',
        nomineeAge: 0,
        kycStatus: 'Pending'
      },
      aadhaarVerified: false,
      bankVerified: false,
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      upiId: ''
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

  private loadInitialPlants(): PlantItem[] {
    try {
      const stored = localStorage.getItem(this.PLANTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading stored plants', e);
    }
    return [];
  }

  private loadInitialPackageDetails() {
    try {
      const stored = localStorage.getItem(this.PACKAGE_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error loading stored package details', e);
    }
    return {
      name: 'No Package Selected',
      price: 0,
      status: 'Inactive',
      includedItems: [],
      boxImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=80'
    };
  }

  savePlants(plants: PlantItem[]) {
    this.plants.set(plants);
    try {
      localStorage.setItem(this.PLANTS_STORAGE_KEY, JSON.stringify(plants));
    } catch (e) {
      console.warn('Error saving plants to localStorage', e);
    }
  }

  savePackageDetails(pkg: any) {
    this.packageDetails.set(pkg);
    try {
      localStorage.setItem(this.PACKAGE_STORAGE_KEY, JSON.stringify(pkg));
    } catch (e) {
      console.warn('Error saving package to localStorage', e);
    }
  }

  // Activate farmer when packages and plants are selected
  activateFarmerWithPackageAndPlants(
    packageName: string,
    packagePrice: number,
    selectedPlants: PlantItem[],
    boxImage: string
  ) {
    const totalPlants = selectedPlants.reduce((sum, p) => sum + p.qty, 0);
    const activePlants = totalPlants;
    const survivalRate = 100;

    // Save plants list
    this.savePlants(selectedPlants);

    // Save package details with compulsory fertilizer and pesticide
    const pkg = {
      name: packageName,
      price: packagePrice,
      status: 'Active',
      includedItems: [
        ...selectedPlants.map(p => `${p.qty}x ${p.name}`),
        '10kg Carbonova Bio-NPK Granules (Compulsory)',
        '1L Cold-Pressed Bio-Pesticide (Compulsory)',
        'Digital Certificate & Verification License'
      ],
      boxImage: boxImage || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=80'
    };
    this.savePackageDetails(pkg);

    // Update farmer profile: status becomes Active now that plants are selected
    const current = this.farmer();
    const updated: FarmerProfile = {
      ...current,
      status: 'Active',
      totalPlants,
      activePlants,
      survivalRate,
      plantationDate: current.plantationDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    this.saveProfile(updated);

    this.lastPlantationUpdate.update(u => ({
      ...u,
      statusText: `${totalPlants} saplings registered with Bio-NPK & Bio-Pesticide kit.`
    }));
  }

  // Update Farm Details (Requirement 2)
  updateFarmDetails(details: {
    farmArea: string;
    soilType: string;
    irrigationSource: string;
    plantationDate?: string;
    village?: string;
    district?: string;
  }) {
    const current = this.farmer();
    const updated: FarmerProfile = {
      ...current,
      farmArea: details.farmArea,
      soilType: details.soilType,
      irrigationSource: details.irrigationSource,
      ...(details.plantationDate ? { plantationDate: details.plantationDate } : {}),
      ...(details.village ? { village: details.village } : {}),
      ...(details.district ? { district: details.district } : {}),
      location: details.village && details.district ? `${details.village}, ${details.district}, ${current.state}` : current.location,
      profileCompletionPercentage: this.calculateProfileScore({ ...current, ...details })
    };

    this.saveProfile(updated);

    // Sync to backend address if available
    if (updated.village || updated.district) {
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
      }).catch(err => console.warn('[FarmerService] Error saving shipping address:', err));
    }
  }

  // Demo state: Simulate New Unactivated Farmer (no plants & no farm details)
  setDemoUnactivatedState() {
    this.savePlants([]);
    this.savePackageDetails({
      name: 'No Package Selected',
      price: 0,
      status: 'Inactive',
      includedItems: [],
      boxImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=80'
    });

    const current = this.farmer();
    const updated: FarmerProfile = {
      ...current,
      status: 'Pending',
      totalPlants: 0,
      activePlants: 0,
      survivalRate: 0,
      farmArea: '',
      soilType: '',
      irrigationSource: ''
    };
    this.saveProfile(updated);
  }

  // Demo state: Restore active state with sample plants & farm details
  setDemoActiveState() {
    const defaultPlants: PlantItem[] = [
      {
        id: 'PL-01',
        name: 'Vietnam Jackfruit',
        scientificName: 'Artocarpus heterophyllus',
        image: 'https://images.unsplash.com/photo-1596707325255-7a315e966b96?w=120&auto=format&fit=crop&q=80',
        qty: 10,
        activeQty: 10,
        status: '10 Active',
        carbonRatePerYearKg: 28.5,
        category: 'Fruit',
        unitPrice: 220
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
        category: 'Fruit',
        unitPrice: 180
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
        category: 'Medicinal',
        unitPrice: 95
      }
    ];
    this.savePlants(defaultPlants);

    this.savePackageDetails({
      name: 'Green Starter Package',
      price: 10000,
      status: 'Active',
      includedItems: [
        '10x Jackfruit Saplings',
        '10x Lemon Saplings',
        '20x Moringa Saplings',
        '10kg Bio-NPK Microbial Granules (Compulsory)',
        '1L Cold-Pressed Bio-Pesticide (Compulsory)',
        'Training & Support License'
      ],
      boxImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=80'
    });

    const current = this.farmer();
    const updated: FarmerProfile = {
      ...current,
      status: 'Active',
      totalPlants: 40,
      activePlants: 38,
      survivalRate: 95,
      farmArea: '0.25 Acre',
      soilType: 'Red & Yellow Loamy',
      irrigationSource: 'Borewell & Drip Line'
    };
    this.saveProfile(updated);
  }
}
