export interface BankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  confirmAccountNumber?: string;
  ifscCode: string;
  branchName: string;
  upiId: string;
  passbookPhotoUrl?: string;
  isVerified: boolean;
  verifiedAt?: string;
}

export interface KycDetails {
  aadhaarNumber: string;
  aadhaarFrontUrl?: string;
  aadhaarBackUrl?: string;
  panNumber: string;
  panCardUrl?: string;
  landRecordType: 'Khasra-B1' | '7/12 Record' | 'Patta' | 'Lease Deed';
  landKhasraNumber: string;
  landRecordUrl?: string;
  nomineeName: string;
  nomineeRelation: 'Spouse' | 'Son' | 'Daughter' | 'Father' | 'Mother' | 'Brother' | 'Other';
  nomineeAge: number;
  kycStatus: 'Pending' | 'Under Review' | 'Verified';
  submittedAt?: string;
  verifiedAt?: string;
}

export interface FarmerProfile {
  id: string;
  farmerId: string;
  name: string; // Initially provided
  phone: string; // Initially provided
  avatar: string;
  rank: string;
  sponsorId: string;
  sponsorName: string;
  location: string;
  district: string;
  state: string;
  village: string;
  pinCode: string;
  email: string;
  fatherOrSpouseName: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  plantationDate: string;
  farmArea: string;
  soilType: string;
  irrigationSource: string;
  totalPlants: number;
  activePlants: number;
  survivalRate: number;
  status: 'Active' | 'Pending' | 'Inactive';
  joiningDate: string;
  profileCompletionPercentage: number;
  bankDetails: BankDetails;
  kycDetails: KycDetails;
  aadhaarVerified: boolean;
  bankVerified: boolean;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId: string;
}

export interface PlantItem {
  id: string;
  name: string;
  scientificName: string;
  image: string;
  qty: number;
  activeQty: number;
  status: string;
  carbonRatePerYearKg: number;
  category: 'Fruit' | 'Medicinal' | 'Timber' | 'Bamboo';
  unitPrice?: number;
}

export interface VerificationStep {
  id: number;
  title: string;
  status: 'completed' | 'in-progress' | 'locked';
  icon: string;
  date?: string;
  note?: string;
}

export interface PlantationUpdate {
  id: string;
  date: string;
  image: string;
  statusText: string;
  growthStage: string;
  healthScore: number;
  soilMoisture: string;
  fertilizerUsed: string;
  verifiedBy: string;
  isVerified: boolean;
}

export interface WeatherInfo {
  temp: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: string;
  rainChance: string;
  icon?: string;
  source?: 'gps' | 'profile' | 'default';
  sourceLabel?: string;
  isLoading?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'income' | 'verification' | 'team' | 'system';
  icon: string;
}
