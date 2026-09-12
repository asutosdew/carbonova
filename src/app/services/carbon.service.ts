import { Injectable, signal, computed, inject } from '@angular/core';
import { TreeCarbonData, CarbonCalculationInput, CarbonCalculationOutput, CarbonCertificate, VerificationLog } from '../models/carbon.model';
import { FarmerService } from './farmer.service';

@Injectable({
  providedIn: 'root'
})
export class CarbonCreditService {
  private readonly farmerService = inject(FarmerService);

  // Tree Species Carbon Sequestration Database
  readonly speciesDatabase = signal<TreeCarbonData[]>([
    {
      speciesId: 'jackfruit',
      name: 'Vietnam Super Early Jackfruit',
      avgKgCo2PerYear: 28.5,
      maturityYears: 3,
      oxygenProducedPerYearKg: 190,
      waterRetentionLitersPerYear: 1400,
      fertilizerBoostPercentage: 25
    },
    {
      speciesId: 'lemon',
      name: 'Kumbhkat Seedless Lemon',
      avgKgCo2PerYear: 18.2,
      maturityYears: 2,
      oxygenProducedPerYearKg: 120,
      waterRetentionLitersPerYear: 900,
      fertilizerBoostPercentage: 20
    },
    {
      speciesId: 'moringa',
      name: 'PKM-1 Super Moringa',
      avgKgCo2PerYear: 22.0,
      maturityYears: 1,
      oxygenProducedPerYearKg: 150,
      waterRetentionLitersPerYear: 1100,
      fertilizerBoostPercentage: 30
    },
    {
      speciesId: 'teak',
      name: 'Hybrid Tissue Culture Teak',
      avgKgCo2PerYear: 35.0,
      maturityYears: 8,
      oxygenProducedPerYearKg: 240,
      waterRetentionLitersPerYear: 2100,
      fertilizerBoostPercentage: 25
    },
    {
      speciesId: 'bamboo',
      name: 'Giant Beema Bamboo',
      avgKgCo2PerYear: 45.0,
      maturityYears: 2,
      oxygenProducedPerYearKg: 300,
      waterRetentionLitersPerYear: 3200,
      fertilizerBoostPercentage: 35
    }
  ]);

  // Calculator Input State (Dynamic model synced to real farmer plants)
  readonly calculatorInput = signal<CarbonCalculationInput>({
    speciesQuantities: {
      jackfruit: 0,
      lemon: 0,
      moringa: 0,
      teak: 0,
      bamboo: 0
    },
    averageAgeMonths: 12,
    usingBioFertilizers: true,
    usingBioPesticides: true,
    soilQualityRating: 'High',
    survivalPercentage: 95
  });

  // Dynamic Calculator Output Computed Signal
  readonly calculationResult = computed<CarbonCalculationOutput>(() => {
    const input = this.calculatorInput();
    const species = this.speciesDatabase();

    let totalTrees = 0;
    let baseKgCo2 = 0;
    let baseOxygen = 0;

    for (const sp of species) {
      const qty = input.speciesQuantities[sp.speciesId] || 0;
      totalTrees += qty;

      // Base yearly carbon
      let treeRate = sp.avgKgCo2PerYear;
      let oxygenRate = sp.oxygenProducedPerYearKg;

      // Bio-fertilizer boost
      if (input.usingBioFertilizers) {
        treeRate *= (1 + sp.fertilizerBoostPercentage / 100);
        oxygenRate *= 1.2;
      }

      // Bio-pesticide protection
      if (input.usingBioPesticides) {
        treeRate *= 1.1;
      }

      // Soil quality modifier
      if (input.soilQualityRating === 'High') treeRate *= 1.05;
      if (input.soilQualityRating === 'Low') treeRate *= 0.85;

      // Age factor (sapling vs mature)
      const ageYears = input.averageAgeMonths / 12;
      const ageFactor = Math.min(1.2, Math.max(0.4, ageYears / 2));
      treeRate *= ageFactor;

      baseKgCo2 += treeRate * qty;
      baseOxygen += oxygenRate * qty;
    }

    const survivalRatio = input.survivalPercentage / 100;
    const activeTrees = Math.round(totalTrees * survivalRatio);
    const effectiveKgCo2 = baseKgCo2 * survivalRatio;
    const effectiveTonnesCo2 = effectiveKgCo2 / 1000;

    const lifetimeTonnes = effectiveTonnesCo2 * 20; // 20 year project lifespan
    const vcuCredits = effectiveTonnesCo2; // 1 VCU = 1 metric ton CO2e
    const corporatePricePerTonne = 1600; // ₹1,600 / Tonne on Voluntary Carbon Market
    const estimatedAnnualRevenue = vcuCredits * corporatePricePerTonne;

    return {
      totalTrees,
      activeTrees,
      totalKgCo2PerYear: Math.round(effectiveKgCo2),
      totalTonnesCo2PerYear: Number(effectiveTonnesCo2.toFixed(2)),
      lifetimeCo2PotentialTonnes: Number(lifetimeTonnes.toFixed(1)),
      estimatedCarbonCreditsVCU: Number(vcuCredits.toFixed(2)),
      estimatedAnnualRevenueInr: Math.round(estimatedAnnualRevenue),
      corporateCreditPriceInr: corporatePricePerTonne,
      oxygenProducedKg: Math.round(baseOxygen * survivalRatio),
      equivalentCarEmissionsOffsetKm: Math.round(effectiveKgCo2 * 5.2)
    };
  });

  // Official Carbon Certificate dynamically tied to live Farmer profile
  readonly activeCertificate = computed<CarbonCertificate>(() => {
    const f = this.farmerService.farmer();
    const verifiedTrees = f.activePlants || f.totalPlants || 0;
    const co2Tonnes = Math.round((verifiedTrees * 25 * 0.001) * 100) / 100;
    const credits = Math.round(verifiedTrees * 31.25);
    const numericId = (f.farmerId || '120873').replace(/\D/g, '') || '120873';

    return {
      certificateId: `CERT-CGC-${numericId}`,
      certificateNumber: `CN-VCU-${numericId}-2026`,
      farmerName: f.name || 'Farmer',
      farmerId: f.farmerId || 'CGC-120873',
      issueDate: f.joiningDate || '21 Aug 2026',
      validUntil: '20 Aug 2027',
      location: f.location || 'Surguja, Chhattisgarh, India',
      farmArea: f.farmArea || '0.25 Acre',
      totalTreesVerified: verifiedTrees,
      co2SequesteredTonnes: co2Tonnes,
      creditsIssued: credits,
      verificationAuditAgency: 'Global Carbon Registry & Agro-AI Audit Standards',
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://carbonova.eco/verify/CN-VCU-${numericId}-2026`,
      blockchainHash: '0x8f3c92b8d841e170984a1e948c2b719488a0928e1c',
      signatory: 'Dr. Alok Verma',
      signatoryTitle: 'Chief Environmental Scientist & Carbon Auditor'
    };
  });

  // Verification Audit History (Empty by default, populated only with real audits)
  readonly verificationLogs = signal<VerificationLog[]>([]);

  constructor() {
    this.syncFromFarmerPlants();
  }

  // Sync species quantities from farmer's current active plants
  syncFromFarmerPlants() {
    const plants = this.farmerService.plants();
    const qtyMap: { [speciesId: string]: number } = {
      jackfruit: 0,
      lemon: 0,
      moringa: 0,
      teak: 0,
      bamboo: 0
    };

    for (const p of plants) {
      const lower = p.name.toLowerCase();
      if (lower.includes('jackfruit')) qtyMap['jackfruit'] = (qtyMap['jackfruit'] || 0) + p.qty;
      else if (lower.includes('lemon')) qtyMap['lemon'] = (qtyMap['lemon'] || 0) + p.qty;
      else if (lower.includes('moringa')) qtyMap['moringa'] = (qtyMap['moringa'] || 0) + p.qty;
      else if (lower.includes('teak')) qtyMap['teak'] = (qtyMap['teak'] || 0) + p.qty;
      else if (lower.includes('bamboo')) qtyMap['bamboo'] = (qtyMap['bamboo'] || 0) + p.qty;
    }

    const hasPlants = this.farmerService.hasPlants();
    this.calculatorInput.update(prev => ({
      ...prev,
      speciesQuantities: qtyMap,
      survivalPercentage: hasPlants ? (this.farmerService.farmer().survivalRate || 95) : 0
    }));
  }

  // Dynamic Certificate reflecting current farmer profile and verified plants
  readonly liveCertificate = computed(() => {
    const farmer = this.farmerService.farmer();
    const credits = this.farmerService.dynamicGreenCredits();
    const cert = this.activeCertificate();
    const hasPlants = this.farmerService.hasPlants();

    return {
      ...cert,
      farmerName: farmer.name,
      farmerId: farmer.farmerId,
      location: farmer.location || 'Ambikapur, Chhattisgarh, India',
      farmArea: farmer.farmArea || '0.25 Acre',
      totalTreesVerified: hasPlants ? (farmer.activePlants || farmer.totalPlants) : 0,
      co2SequesteredTonnes: hasPlants ? Number((credits.co2OffsetKg / 1000).toFixed(2)) : 0,
      creditsIssued: credits.points,
      statusText: hasPlants ? 'VERIFIED VCS ACTIVE' : 'PENDING PLANT SELECTION'
    };
  });

  updateInput(partial: Partial<CarbonCalculationInput>) {
    this.calculatorInput.update(prev => ({ ...prev, ...partial }));
  }

  updateSpeciesQuantity(speciesId: string, quantity: number) {
    this.calculatorInput.update(prev => ({
      ...prev,
      speciesQuantities: {
        ...prev.speciesQuantities,
        [speciesId]: Math.max(0, quantity)
      }
    }));
  }
}
