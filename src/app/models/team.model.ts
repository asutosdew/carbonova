export interface DownlineMember {
  id: string;
  farmerId: string;
  name: string;
  avatar: string;
  rank: string;
  level: number;
  sponsorId: string;
  sponsorName: string;
  package: string;
  packageAmount: number;
  joiningDate: string;
  status: 'Active' | 'Pending' | 'Inactive';
  totalPlants: number;
  activePlants: number;
  carbonCredits: number;
  directCount: number;
  teamCount: number;
  phone: string;
  location: string;
}

export interface GenealogyNode {
  id: string;
  farmerId: string;
  name: string;
  rank: string;
  avatar: string;
  package: string;
  packageAmount: number;
  status: 'Active' | 'Pending' | 'Inactive';
  totalPlants: number;
  level: number;
  directCount: number;
  teamCount: number;
  carbonCredits: number;
  children?: GenealogyNode[];
  collapsed?: boolean;
}

export interface LevelTeamStats {
  level: number;
  totalMembers: number;
  activeMembers: number;
  totalBusiness: number;
  carbonVolumeKg: number;
  commissionPercentage: number;
  earnedAmount: number;
}
