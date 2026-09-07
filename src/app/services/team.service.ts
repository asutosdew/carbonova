import { Injectable, signal, inject } from '@angular/core';
import { DownlineMember, GenealogyNode, LevelTeamStats } from '../models/team.model';
import { MembersService } from './members.service';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private readonly membersService = inject(MembersService);
  // Referral Link
  readonly referralLink = signal('https://carbonova.eco/join?ref=CGC-157059');
  readonly referralCode = signal('CGC-157059');

  // Overall Team summary stats (10 Levels total: 128 Farmers)
  readonly teamStats = signal({
    totalDirects: 5,
    activeDirects: 5,
    totalDownlineTeam: 128,
    activeDownlineTeam: 123,
    totalNetworkVolume: 1280000,
    totalCarbonPointsEarned: 18450,
    totalCarbonOffsetTonnes: 48.2,
    totalLevelIncome: 34550
  });

  // Level-wise Team Stats Breakdown across ALL 10 LEVELS
  readonly levelStats = signal<LevelTeamStats[]>([
    { level: 1, totalMembers: 5, activeMembers: 5, totalBusiness: 50000, carbonVolumeKg: 4500, commissionPercentage: 10, earnedAmount: 5000 },
    { level: 2, totalMembers: 18, activeMembers: 18, totalBusiness: 180000, carbonVolumeKg: 16200, commissionPercentage: 5, earnedAmount: 9000 },
    { level: 3, totalMembers: 32, activeMembers: 30, totalBusiness: 320000, carbonVolumeKg: 28800, commissionPercentage: 3, earnedAmount: 9600 },
    { level: 4, totalMembers: 24, activeMembers: 23, totalBusiness: 240000, carbonVolumeKg: 21600, commissionPercentage: 2, earnedAmount: 4800 },
    { level: 5, totalMembers: 16, activeMembers: 15, totalBusiness: 160000, carbonVolumeKg: 14400, commissionPercentage: 2, earnedAmount: 3200 },
    { level: 6, totalMembers: 12, activeMembers: 11, totalBusiness: 120000, carbonVolumeKg: 10800, commissionPercentage: 1, earnedAmount: 1200 },
    { level: 7, totalMembers: 8, activeMembers: 8, totalBusiness: 80000, carbonVolumeKg: 7200, commissionPercentage: 1, earnedAmount: 800 },
    { level: 8, totalMembers: 6, activeMembers: 6, totalBusiness: 60000, carbonVolumeKg: 5400, commissionPercentage: 1, earnedAmount: 600 },
    { level: 9, totalMembers: 4, activeMembers: 4, totalBusiness: 40000, carbonVolumeKg: 3600, commissionPercentage: 0.5, earnedAmount: 200 },
    { level: 10, totalMembers: 3, activeMembers: 3, totalBusiness: 30000, carbonVolumeKg: 2700, commissionPercentage: 0.5, earnedAmount: 150 }
  ]);

  // Downline Members across all 10 Levels
  readonly downlineMembers = signal<DownlineMember[]>([
    // LEVEL 1 (Directs)
    {
      id: 'MEM-01',
      farmerId: 'CGC-158201',
      name: 'Ramesh Patel',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
      rank: 'Green Starter',
      level: 1,
      sponsorId: 'CGC-157059',
      sponsorName: 'Sandeep',
      package: 'Green Starter Package',
      packageAmount: 10000,
      joiningDate: '10 Aug 2026',
      status: 'Active',
      totalPlants: 40,
      activePlants: 39,
      carbonCredits: 1280,
      directCount: 4,
      teamCount: 22,
      phone: '+91 94250 11223',
      location: 'Surajpur, CG'
    },
    {
      id: 'MEM-02',
      farmerId: 'CGC-157404',
      name: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      rank: 'Agro Pro',
      level: 1,
      sponsorId: 'CGC-157059',
      sponsorName: 'Sandeep',
      package: 'Commercial Agroforestry',
      packageAmount: 25000,
      joiningDate: '12 Aug 2026',
      status: 'Active',
      totalPlants: 100,
      activePlants: 98,
      carbonCredits: 3450,
      directCount: 6,
      teamCount: 38,
      phone: '+91 97521 88490',
      location: 'Raigarh, CG'
    },
    {
      id: 'MEM-03',
      farmerId: 'CGC-157990',
      name: 'Sunita Devi',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      rank: 'Green Starter',
      level: 1,
      sponsorId: 'CGC-157059',
      sponsorName: 'Sandeep',
      package: 'Green Starter Package',
      packageAmount: 10000,
      joiningDate: '15 Aug 2026',
      status: 'Active',
      totalPlants: 40,
      activePlants: 38,
      carbonCredits: 1190,
      directCount: 3,
      teamCount: 16,
      phone: '+91 91312 44781',
      location: 'Bilaspur, CG'
    },
    {
      id: 'MEM-04',
      farmerId: 'CGC-158812',
      name: 'Amit Kumar Sahu',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      rank: 'Green Starter',
      level: 1,
      sponsorId: 'CGC-157059',
      sponsorName: 'Sandeep',
      package: 'Green Starter Package',
      packageAmount: 10000,
      joiningDate: '18 Aug 2026',
      status: 'Active',
      totalPlants: 40,
      activePlants: 37,
      carbonCredits: 1100,
      directCount: 2,
      teamCount: 12,
      phone: '+91 99814 32901',
      location: 'Korba, CG'
    },
    {
      id: 'MEM-05',
      farmerId: 'CGC-159044',
      name: 'Rajesh Gond',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      rank: 'Green Starter',
      level: 1,
      sponsorId: 'CGC-157059',
      sponsorName: 'Sandeep',
      package: 'Green Starter Package',
      packageAmount: 10000,
      joiningDate: '20 Aug 2026',
      status: 'Active',
      totalPlants: 40,
      activePlants: 40,
      carbonCredits: 1300,
      directCount: 5,
      teamCount: 40,
      phone: '+91 96698 22105',
      location: 'Jashpur, CG'
    },

    // LEVEL 2
    {
      id: 'MEM-06',
      farmerId: 'CGC-159410',
      name: 'Kavita Baghel',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
      rank: 'Green Starter',
      level: 2,
      sponsorId: 'CGC-158201',
      sponsorName: 'Ramesh Patel',
      package: 'Green Starter Package',
      packageAmount: 10000,
      joiningDate: '22 Aug 2026',
      status: 'Active',
      totalPlants: 40,
      activePlants: 39,
      carbonCredits: 1250,
      directCount: 2,
      teamCount: 8,
      phone: '+91 94060 99881',
      location: 'Manendragarh, CG'
    },
    {
      id: 'MEM-07',
      farmerId: 'CGC-159620',
      name: 'Devendra Yadav',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
      rank: 'Carbon Super',
      level: 2,
      sponsorId: 'CGC-157404',
      sponsorName: 'Priya Sharma',
      package: 'Carbon Super Package',
      packageAmount: 50000,
      joiningDate: '24 Aug 2026',
      status: 'Active',
      totalPlants: 200,
      activePlants: 196,
      carbonCredits: 6800,
      directCount: 4,
      teamCount: 14,
      phone: '+91 93001 77210',
      location: 'Raipur, CG'
    },

    // LEVEL 3
    {
      id: 'MEM-08',
      farmerId: 'CGC-160105',
      name: 'Bhupendra Netam',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      rank: 'Green Starter',
      level: 3,
      sponsorId: 'CGC-159410',
      sponsorName: 'Kavita Baghel',
      package: 'Green Starter Package',
      packageAmount: 10000,
      joiningDate: '25 Aug 2026',
      status: 'Active',
      totalPlants: 40,
      activePlants: 38,
      carbonCredits: 1180,
      directCount: 3,
      teamCount: 6,
      phone: '+91 98930 11456',
      location: 'Kanker, CG'
    },

    // LEVEL 4
    {
      id: 'MEM-09',
      farmerId: 'CGC-161200',
      name: 'Dinesh Kashyap',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
      rank: 'Green Starter',
      level: 4,
      sponsorId: 'CGC-160105',
      sponsorName: 'Bhupendra Netam',
      package: 'Green Starter Package',
      packageAmount: 10000,
      joiningDate: '26 Aug 2026',
      status: 'Active',
      totalPlants: 40,
      activePlants: 39,
      carbonCredits: 1220,
      directCount: 2,
      teamCount: 4,
      phone: '+91 94251 77889',
      location: 'Jagdalpur, CG'
    },

    // LEVEL 5
    {
      id: 'MEM-10',
      farmerId: 'CGC-162330',
      name: 'Shivkumar Markam',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rank: 'Green Starter',
      level: 5,
      sponsorId: 'CGC-161200',
      sponsorName: 'Dinesh Kashyap',
      package: 'Green Starter Package',
      packageAmount: 10000,
      joiningDate: '27 Aug 2026',
      status: 'Active',
      totalPlants: 40,
      activePlants: 37,
      carbonCredits: 1140,
      directCount: 2,
      teamCount: 3,
      phone: '+91 97530 44556',
      location: 'Dhamtari, CG'
    },

    // LEVEL 6
    {
      id: 'MEM-11',
      farmerId: 'CGC-163450',
      name: 'Hemant Korram',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
      rank: 'Green Starter',
      level: 6,
      sponsorId: 'CGC-162330',
      sponsorName: 'Shivkumar Markam',
      package: 'Green Starter Package',
      packageAmount: 10000,
      joiningDate: '28 Aug 2026',
      status: 'Active',
      totalPlants: 40,
      activePlants: 40,
      carbonCredits: 1290,
      directCount: 1,
      teamCount: 2,
      phone: '+91 91310 88990',
      location: 'Kondagaon, CG'
    },

    // LEVEL 7
    {
      id: 'MEM-12',
      farmerId: 'CGC-164500',
      name: 'Radha Bai Mandavi',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      rank: 'Green Starter',
      level: 7,
      sponsorId: 'CGC-163450',
      sponsorName: 'Hemant Korram',
      package: 'Green Starter Package',
      packageAmount: 10000,
      joiningDate: '29 Aug 2026',
      status: 'Active',
      totalPlants: 40,
      activePlants: 38,
      carbonCredits: 1180,
      directCount: 2,
      teamCount: 2,
      phone: '+91 99810 55667',
      location: 'Bastar, CG'
    },

    // LEVEL 8
    {
      id: 'MEM-13',
      farmerId: 'CGC-165600',
      name: 'Narendra Rathore',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      rank: 'Green Starter',
      level: 8,
      sponsorId: 'CGC-164500',
      sponsorName: 'Radha Bai Mandavi',
      package: 'Green Starter Package',
      packageAmount: 10000,
      joiningDate: '29 Aug 2026',
      status: 'Active',
      totalPlants: 40,
      activePlants: 39,
      carbonCredits: 1210,
      directCount: 1,
      teamCount: 1,
      phone: '+91 96690 33445',
      location: 'Rajnandgaon, CG'
    },

    // LEVEL 9
    {
      id: 'MEM-14',
      farmerId: 'CGC-166700',
      name: 'Poonam Baghel',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      rank: 'Green Starter',
      level: 9,
      sponsorId: 'CGC-165600',
      sponsorName: 'Narendra Rathore',
      package: 'Green Starter Package',
      packageAmount: 10000,
      joiningDate: '30 Aug 2026',
      status: 'Active',
      totalPlants: 40,
      activePlants: 38,
      carbonCredits: 1170,
      directCount: 1,
      teamCount: 1,
      phone: '+91 94070 12345',
      location: 'Durg, CG'
    },

    // LEVEL 10
    {
      id: 'MEM-15',
      farmerId: 'CGC-167800',
      name: 'Kamlesh Poyam',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      rank: 'Green Starter',
      level: 10,
      sponsorId: 'CGC-166700',
      sponsorName: 'Poonam Baghel',
      package: 'Green Starter Package',
      packageAmount: 10000,
      joiningDate: '31 Aug 2026',
      status: 'Active',
      totalPlants: 40,
      activePlants: 40,
      carbonCredits: 1260,
      directCount: 0,
      teamCount: 0,
      phone: '+91 98260 98765',
      location: 'Bijapur, CG'
    }
  ]);

  // Deep Hierarchical 10-Level Partner Genealogy Tree structure
  readonly genealogyRoot = signal<GenealogyNode>({
    id: 'ROOT',
    farmerId: 'CGC-157059',
    name: 'Sandeep (You)',
    rank: 'Green Starter',
    avatar: 'assets/images/farmer-avatar.jpg',
    package: 'Green Starter Package (₹10,000)',
    packageAmount: 10000,
    status: 'Active',
    totalPlants: 40,
    level: 0,
    directCount: 5,
    teamCount: 128,
    carbonCredits: 1250,
    children: [
      {
        id: 'L1-01',
        farmerId: 'CGC-158201',
        name: 'Ramesh Patel',
        rank: 'Green Starter',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
        package: 'Green Starter (₹10,000)',
        packageAmount: 10000,
        status: 'Active',
        totalPlants: 40,
        level: 1,
        directCount: 4,
        teamCount: 22,
        carbonCredits: 1280,
        children: [
          {
            id: 'L2-01',
            farmerId: 'CGC-159410',
            name: 'Kavita Baghel',
            rank: 'Green Starter',
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
            package: 'Green Starter (₹10,000)',
            packageAmount: 10000,
            status: 'Active',
            totalPlants: 40,
            level: 2,
            directCount: 2,
            teamCount: 8,
            carbonCredits: 1250,
            children: [
              {
                id: 'L3-01',
                farmerId: 'CGC-160105',
                name: 'Bhupendra Netam',
                rank: 'Green Starter',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
                package: 'Green Starter (₹10,000)',
                packageAmount: 10000,
                status: 'Active',
                totalPlants: 40,
                level: 3,
                directCount: 3,
                teamCount: 6,
                carbonCredits: 1180,
                children: [
                  {
                    id: 'L4-01',
                    farmerId: 'CGC-161200',
                    name: 'Dinesh Kashyap',
                    rank: 'Green Starter',
                    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
                    package: 'Green Starter (₹10,000)',
                    packageAmount: 10000,
                    status: 'Active',
                    totalPlants: 40,
                    level: 4,
                    directCount: 2,
                    teamCount: 4,
                    carbonCredits: 1220,
                    children: [
                      {
                        id: 'L5-01',
                        farmerId: 'CGC-162330',
                        name: 'Shivkumar Markam',
                        rank: 'Green Starter',
                        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                        package: 'Green Starter (₹10,000)',
                        packageAmount: 10000,
                        status: 'Active',
                        totalPlants: 40,
                        level: 5,
                        directCount: 2,
                        teamCount: 3,
                        carbonCredits: 1140,
                        children: [
                          {
                            id: 'L6-01',
                            farmerId: 'CGC-163450',
                            name: 'Hemant Korram',
                            rank: 'Green Starter',
                            avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
                            package: 'Green Starter (₹10,000)',
                            packageAmount: 10000,
                            status: 'Active',
                            totalPlants: 40,
                            level: 6,
                            directCount: 1,
                            teamCount: 2,
                            carbonCredits: 1290,
                            children: [
                              {
                                id: 'L7-01',
                                farmerId: 'CGC-164500',
                                name: 'Radha Bai Mandavi',
                                rank: 'Green Starter',
                                avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
                                package: 'Green Starter (₹10,000)',
                                packageAmount: 10000,
                                status: 'Active',
                                totalPlants: 40,
                                level: 7,
                                directCount: 2,
                                teamCount: 2,
                                carbonCredits: 1180,
                                children: [
                                  {
                                    id: 'L8-01',
                                    farmerId: 'CGC-165600',
                                    name: 'Narendra Rathore',
                                    rank: 'Green Starter',
                                    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
                                    package: 'Green Starter (₹10,000)',
                                    packageAmount: 10000,
                                    status: 'Active',
                                    totalPlants: 40,
                                    level: 8,
                                    directCount: 1,
                                    teamCount: 1,
                                    carbonCredits: 1210,
                                    children: [
                                      {
                                        id: 'L9-01',
                                        farmerId: 'CGC-166700',
                                        name: 'Poonam Baghel',
                                        rank: 'Green Starter',
                                        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
                                        package: 'Green Starter (₹10,000)',
                                        packageAmount: 10000,
                                        status: 'Active',
                                        totalPlants: 40,
                                        level: 9,
                                        directCount: 1,
                                        teamCount: 1,
                                        carbonCredits: 1170,
                                        children: [
                                          {
                                            id: 'L10-01',
                                            farmerId: 'CGC-167800',
                                            name: 'Kamlesh Poyam',
                                            rank: 'Green Starter',
                                            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
                                            package: 'Green Starter (₹10,000)',
                                            packageAmount: 10000,
                                            status: 'Active',
                                            totalPlants: 40,
                                            level: 10,
                                            directCount: 0,
                                            teamCount: 0,
                                            carbonCredits: 1260
                                          }
                                        ]
                                      }
                                    ]
                                  }
                                ]
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'L1-02',
        farmerId: 'CGC-157404',
        name: 'Priya Sharma',
        rank: 'Agro Pro',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
        package: 'Commercial Agroforestry (₹25,000)',
        packageAmount: 25000,
        status: 'Active',
        totalPlants: 100,
        level: 1,
        directCount: 6,
        teamCount: 38,
        carbonCredits: 3450,
        children: [
          {
            id: 'L2-02',
            farmerId: 'CGC-159620',
            name: 'Devendra Yadav',
            rank: 'Carbon Super',
            avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
            package: 'Carbon Super (₹50,000)',
            packageAmount: 50000,
            status: 'Active',
            totalPlants: 200,
            level: 2,
            directCount: 4,
            teamCount: 14,
            carbonCredits: 6800
          }
        ]
      },
      {
        id: 'L1-03',
        farmerId: 'CGC-157990',
        name: 'Sunita Devi',
        rank: 'Green Starter',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        package: 'Green Starter (₹10,000)',
        packageAmount: 10000,
        status: 'Active',
        totalPlants: 40,
        level: 1,
        directCount: 3,
        teamCount: 16,
        carbonCredits: 1190
      },
      {
        id: 'L1-04',
        farmerId: 'CGC-158812',
        name: 'Amit Kumar Sahu',
        rank: 'Green Starter',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        package: 'Green Starter (₹10,000)',
        packageAmount: 10000,
        status: 'Active',
        totalPlants: 40,
        level: 1,
        directCount: 2,
        teamCount: 12,
        carbonCredits: 1100
      },
      {
        id: 'L1-05',
        farmerId: 'CGC-159044',
        name: 'Rajesh Gond',
        rank: 'Green Starter',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
        package: 'Green Starter (₹10,000)',
        packageAmount: 10000,
        status: 'Active',
        totalPlants: 40,
        level: 1,
        directCount: 5,
        teamCount: 40,
        carbonCredits: 1300
      }
    ]
  });

  constructor() {
    this.loadLiveTeamData();
  }

  async loadLiveTeamData(): Promise<void> {
    try {
      const res = await this.membersService.downlinestatus();
      if (res) {
        const uid = res.userid || '120873';
        this.referralCode.set('CGC-' + uid);
        const encoded = btoa(unescape(encodeURIComponent(String(uid))));
        this.referralLink.set(`https://www.carbonovaworld.com/register.php?sid=${encodeURIComponent(encoded)}`);

        const totalTeam = res.totalteam ? parseInt(res.totalteam, 10) : this.teamStats().totalDownlineTeam;
        const totalActive = res.totalactive ? parseInt(res.totalactive, 10) : this.teamStats().activeDownlineTeam;
        const directs = res.directs ? parseInt(res.directs, 10) : this.teamStats().totalDirects;
        const levelIncome = res.levelincome ? parseFloat(res.levelincome) : this.teamStats().totalLevelIncome;

        this.teamStats.update(s => ({
          ...s,
          totalDirects: directs,
          activeDirects: directs,
          totalDownlineTeam: totalTeam,
          activeDownlineTeam: totalActive,
          totalLevelIncome: levelIncome
        }));

        this.genealogyRoot.update(r => ({
          ...r,
          farmerId: 'CGC-' + uid,
          directCount: directs,
          teamCount: totalTeam
        }));
      }
    } catch (e) {
      console.warn('[TeamService] Live server downlinestatus skipped (offline or unauthenticated):', e);
    }
  }
}
