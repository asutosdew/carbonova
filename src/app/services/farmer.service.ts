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
      date: 'Registered',
      note: 'Saplings registration'
    },
    {
      id: 2,
      title: 'Growth',
      status: 'in-progress',
      icon: 'refresh-cw',
      date: 'Pending',
      note: 'Growth audit pending'
    },
    {
      id: 3,
      title: 'Care',
      status: 'locked',
      icon: 'lock',
      date: 'Next Stage',
      note: 'Fertilization & health audit'
    }
  ]);

  readonly verificationStatusInfo = signal({
    currentStatus: 'Growth Verification Pending',
    lastVerification: 'Pending',
    nextVerification: 'Scheduled'
  });

  // Last plantation update matching Card 4 (Defaults to null until uploaded or fetched from server)
  readonly lastPlantationUpdate = signal<PlantationUpdate | null>(null);

  // Green Credits matching Card 6 (base signal)
  readonly greenCredits = signal({
    points: 0,
    verifiedPlantation: 0,
    verificationStatus: 'Pending',
    co2OffsetKg: 0,
    lifetimePoints: 0,
    redeemedPoints: 0
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

  // Dynamic total plants count computed from farmer profile and plant list
  readonly totalPlantsCount = computed(() => {
    const p = this.farmer().totalPlants;
    if (p && p > 0) return p;
    const list = this.plants();
    return list.reduce((sum, item) => sum + (item.qty || 0), 0);
  });

  readonly activePlantsCount = computed(() => {
    const p = this.farmer().activePlants;
    if (p && p > 0) return p;
    const list = this.plants();
    const activeSum = list.reduce((sum, item) => sum + (item.activeQty !== undefined ? item.activeQty : (item.qty || 0)), 0);
    return activeSum > 0 ? activeSum : this.totalPlantsCount();
  });

  readonly survivalRatePct = computed(() => {
    const r = this.farmer().survivalRate;
    if (r && r > 0) return r;
    const total = this.totalPlantsCount();
    const active = this.activePlantsCount();
    return total > 0 ? Math.round((active / total) * 100) : 100;
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
    const totalPlants = this.totalPlantsCount();
    const pts = Math.round(totalPlants * 31.25);
    const co2 = this.plants().reduce((acc, p) => acc + ((p.carbonRatePerYearKg || 25) * p.qty), 0);
    return {
      points: pts,
      verifiedPlantation: totalPlants,
      verificationStatus: 'Active',
      co2OffsetKg: Math.round(co2),
      lifetimePoints: pts,
      redeemedPoints: 0
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
      co2OffsetKg: Math.round(co2),
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
        const rawPlants = Array.isArray(pf?.plants) ? pf.plants : [];
        const plantQtySum = rawPlants.reduce((sum: number, p: any) => sum + Number(p.qty || 0), 0);
        const activePlantQtySum = rawPlants.reduce((sum: number, p: any) => sum + Number(p.activeQty !== undefined ? p.activeQty : (p.qty || 0)), 0);

        const totalPlants = (Number(pf?.totalPlants) > 0) ? Number(pf.totalPlants) : plantQtySum;
        const activePlants = (Number(pf?.activePlants) > 0) ? Number(pf.activePlants) : (activePlantQtySum > 0 ? activePlantQtySum : totalPlants);
        const survivalRate = (Number(pf?.survivalRate) > 0) 
          ? Number(pf.survivalRate) 
          : (totalPlants > 0 ? Math.round((activePlants / totalPlants) * 100) : 100);

        const current = this.farmer();
        const updated: FarmerProfile = {
          ...current,
          name: pf?.name || pi?.name || current.name,
          phone: pf?.mobile || pf?.phone || pi?.mobile || current.phone,
          email: pf?.email || pi?.email || current.email,
          farmerId: pf?.farmerId || (pf?.userid ? 'CGC-' + pf.userid : (pi?.userid ? 'CGC-' + pi.userid : current.farmerId)),
          id: pf?.userid ? 'FARMER-' + pf.userid : (pi?.userid ? 'FARMER-' + pi.userid : current.id),
          status: (totalPlants > 0 || pf?.status === 'Active') ? 'Active' : (pf?.status || 'Pending'),
          joiningDate: pf?.doj ? new Date(pf.doj).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (pi?.doj ? new Date(pi.doj).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : current.joiningDate),
          totalPlants: totalPlants,
          activePlants: activePlants,
          survivalRate: survivalRate,
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
        } else if (totalPlants === 0 || !pf?.plants || pf.plants.length === 0) {
          this.savePackageDetails({
            name: 'No Package Selected',
            price: 0,
            status: 'Inactive',
            includedItems: [],
            boxImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=300&auto=format&fit=crop&q=80'
          });
        }

        if (pf?.greenCredits && Number(pf.greenCredits.points || 0) > 0) {
          this.greenCredits.set({ ...this.greenCredits(), ...pf.greenCredits });
        } else if (totalPlants > 0) {
          const carbonOffset = rawPlants.reduce((acc: number, p: any) => acc + (Number(p.carbonRatePerYearKg || 25) * Number(p.qty || 0)), 0);
          const pts = Math.round(totalPlants * 31.25);
          this.greenCredits.set({
            points: pts,
            verifiedPlantation: totalPlants,
            verificationStatus: 'Active',
            co2OffsetKg: Math.round(carbonOffset),
            lifetimePoints: pts,
            redeemedPoints: 0
          });
        } else {
          this.greenCredits.set({
            points: 0,
            verifiedPlantation: 0,
            verificationStatus: 'Inactive (No Plants)',
            co2OffsetKg: 0,
            lifetimePoints: 0,
            redeemedPoints: 0
          });
        }

        // Also fetch real farm details from get_farm_details
        try {
          const resFarm = await this.membersService.getFarmDetails();
          const farmData = resFarm?.result;
          if (farmData && farmData.hasFarmDetails) {
            updated.farmArea = farmData.farmArea || updated.farmArea;
            updated.soilType = farmData.soilType || updated.soilType;
            updated.irrigationSource = farmData.irrigationSource || updated.irrigationSource;
            updated.plantationDate = farmData.plantationDate || updated.plantationDate;
            if (farmData.village) updated.village = farmData.village;
            if (farmData.district) updated.district = farmData.district;
          }
        } catch (farmErr) {
          // non-blocking
        }

        const hasPlantsNow = (Array.isArray(pf?.plants) && pf.plants.length > 0) || Number(updated.totalPlants || 0) > 0;
        if (Array.isArray(pf?.verificationSteps) && pf.verificationSteps.length > 0) {
          this.verificationSteps.set(pf.verificationSteps);
        } else {
          this.verificationSteps.set([
            {
              id: 1,
              title: 'Plantation',
              status: hasPlantsNow ? 'completed' : 'in-progress',
              icon: 'check',
              date: updated.plantationDate || (hasPlantsNow ? 'Completed' : 'Pending'),
              note: hasPlantsNow ? 'Saplings registered & geotagged' : 'Select package to plant'
            },
            {
              id: 2,
              title: 'Growth',
              status: pf?.lastPlantationUpdate ? 'completed' : (hasPlantsNow ? 'in-progress' : 'locked'),
              icon: 'refresh-cw',
              date: pf?.lastPlantationUpdate?.date || (hasPlantsNow ? 'Pending' : 'Locked'),
              note: pf?.lastPlantationUpdate ? pf.lastPlantationUpdate.statusText : (hasPlantsNow ? 'Growth audit pending' : 'Awaiting plantation')
            },
            {
              id: 3,
              title: 'Care',
              status: (hasPlantsNow && pf?.lastPlantationUpdate?.isVerified) ? 'in-progress' : 'locked',
              icon: 'lock',
              date: hasPlantsNow ? 'Quarterly Audit' : 'Locked',
              note: hasPlantsNow ? 'Fertilization & health audit' : 'Awaiting plantation'
            }
          ]);
        }

        if (pf?.lastPlantationUpdate) {
          this.lastPlantationUpdate.set(pf.lastPlantationUpdate);
        } else {
          this.lastPlantationUpdate.set(null);
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

  // Notifications (Clean empty state, no mock items)
  readonly notifications = signal<NotificationItem[]>([]);

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
    Promise.allSettled([
      this.membersService.updatePersonalProfile(updated),
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
      })
    ]).catch(err => console.warn('[FarmerService] Server profile update error:', err));
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
      bankName: `${updatedBank.bankName || ''} - ${updatedBank.branchName || ''}`,
      accountNumber: updatedBank.accountNumber ? `•••• •••• ${updatedBank.accountNumber.slice(-4)}` : current.accountNumber,
      ifscCode: updatedBank.ifscCode,
      upiId: updatedBank.upiId
    };

    this.saveProfile(updated);

    // Sync with live server
    Promise.allSettled([
      this.membersService.updateBankDetails(updatedBank),
      this.membersService.updateprofile(
        current.district || 'Ambikapur',
        bank.accountNumber || current.bankDetails.accountNumber || '',
        bank.ifscCode || current.bankDetails.ifscCode || '',
        current.kycDetails.panNumber || ''
      )
    ]).catch(err => console.warn('[FarmerService] Server bank update error:', err));

    return { success: true, message: 'Bank account details saved and submitted to server!' };
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

    // Sync with live server
    this.membersService.updateKyc(updatedKyc).catch(err => console.warn('[FarmerService] Server KYC update error:', err));

    return { success: true, message: 'Aadhaar, PAN & Land KYC documents submitted to server!' };
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

    // Sync with live server
    this.membersService.addPhotoUpdate(imageUrl, note).catch(err => console.warn('[FarmerService] Server addPhotoUpdate error:', err));
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

    if (this.lastPlantationUpdate()) {
      this.lastPlantationUpdate.update(u => u ? ({
        ...u,
        statusText: `${totalPlants} saplings registered with Bio-NPK & Bio-Pesticide kit.`
      }) : null);
    } else {
      this.lastPlantationUpdate.set({
        id: `UPD-${Date.now().toString().slice(-4)}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        image: 'https://images.unsplash.com/photo-1592417817098-8f3d69106093?w=600',
        statusText: `${totalPlants} saplings registered with Bio-NPK & Bio-Pesticide kit.`,
        growthStage: 'Plantation Stage (Stage 1)',
        healthScore: 100,
        soilMoisture: '70% (Optimal)',
        fertilizerUsed: 'Bio-NPK Granules & Neem Shield',
        verifiedBy: 'AI Agro-Vision & Field Agent',
        isVerified: true
      });
    }
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

    // Sync to backend farm details & shipping address
    Promise.allSettled([
      this.membersService.saveFarmDetails({
        farmArea: details.farmArea,
        soilType: details.soilType,
        irrigationSource: details.irrigationSource,
        plantationDate: details.plantationDate || new Date().toISOString().split('T')[0],
        village: details.village,
        district: details.district,
        state: current.state || 'Chhattisgarh'
      }),
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
      })
    ]).catch(err => console.warn('[FarmerService] Error saving farm details to server:', err));
  }

  // Reload live server state
  setDemoUnactivatedState() {
    this.initLiveBackendData();
  }

  // Reload live server state
  setDemoActiveState() {
    this.initLiveBackendData();
  }
}
