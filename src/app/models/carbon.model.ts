export interface TreeCarbonData {
  speciesId: string;
  name: string;
  avgKgCo2PerYear: number;
  maturityYears: number;
  oxygenProducedPerYearKg: number;
  waterRetentionLitersPerYear: number;
  fertilizerBoostPercentage: number;
}

export interface CarbonCalculationInput {
  speciesQuantities: { [speciesId: string]: number };
  averageAgeMonths: number;
  usingBioFertilizers: boolean;
  usingBioPesticides: boolean;
  soilQualityRating: 'High' | 'Medium' | 'Low';
  survivalPercentage: number;
}

export interface CarbonCalculationOutput {
  totalTrees: number;
  activeTrees: number;
  totalKgCo2PerYear: number;
  totalTonnesCo2PerYear: number;
  lifetimeCo2PotentialTonnes: number;
  estimatedCarbonCreditsVCU: number; // 1 VCU = 1 metric ton CO2e
  estimatedAnnualRevenueInr: number;
  corporateCreditPriceInr: number;
  oxygenProducedKg: number;
  equivalentCarEmissionsOffsetKm: number;
}

export interface CarbonCertificate {
  certificateId: string;
  certificateNumber: string;
  farmerName: string;
  farmerId: string;
  issueDate: string;
  validUntil: string;
  location: string;
  farmArea: string;
  totalTreesVerified: number;
  co2SequesteredTonnes: number;
  creditsIssued: number;
  verificationAuditAgency: string;
  qrCodeUrl: string;
  blockchainHash: string;
  signatory: string;
  signatoryTitle: string;
}

export interface VerificationLog {
  id: string;
  timestamp: string;
  stage: 'Plantation' | 'Growth' | 'Care';
  status: 'Approved' | 'Pending' | 'Rejected';
  auditorName: string;
  remarks: string;
  healthIndex: number;
  foliageDensity: string;
  gpsCoordinates: string;
  photoUrl: string;
}
