import { Injectable, signal, inject } from '@angular/core';
import { DownlineMember, GenealogyNode, LevelTeamStats } from '../models/team.model';
import { MembersService } from './members.service';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private readonly membersService = inject(MembersService);

  // Referral Link & Code
  readonly referralLink = signal('https://www.carbonovaworld.com/register.php?sid=MTIwODcz');
  readonly referralCode = signal('CGC-120873');

  // Overall Team summary stats (Defaults to 0, strictly populated from live server)
  readonly teamStats = signal({
    totalDirects: 0,
    activeDirects: 0,
    totalDownlineTeam: 0,
    activeDownlineTeam: 0,
    totalNetworkVolume: 0,
    totalCarbonPointsEarned: 0,
    totalCarbonOffsetTonnes: 0,
    totalLevelIncome: 0
  });

  // Level-wise Team Stats Breakdown across ALL 10 LEVELS (Clean defaults)
  readonly levelStats = signal<LevelTeamStats[]>([
    { level: 1, totalMembers: 0, activeMembers: 0, totalBusiness: 0, carbonVolumeKg: 0, commissionPercentage: 10, earnedAmount: 0 },
    { level: 2, totalMembers: 0, activeMembers: 0, totalBusiness: 0, carbonVolumeKg: 0, commissionPercentage: 5, earnedAmount: 0 },
    { level: 3, totalMembers: 0, activeMembers: 0, totalBusiness: 0, carbonVolumeKg: 0, commissionPercentage: 3, earnedAmount: 0 },
    { level: 4, totalMembers: 0, activeMembers: 0, totalBusiness: 0, carbonVolumeKg: 0, commissionPercentage: 2, earnedAmount: 0 },
    { level: 5, totalMembers: 0, activeMembers: 0, totalBusiness: 0, carbonVolumeKg: 0, commissionPercentage: 2, earnedAmount: 0 },
    { level: 6, totalMembers: 0, activeMembers: 0, totalBusiness: 0, carbonVolumeKg: 0, commissionPercentage: 1, earnedAmount: 0 },
    { level: 7, totalMembers: 0, activeMembers: 0, totalBusiness: 0, carbonVolumeKg: 0, commissionPercentage: 1, earnedAmount: 0 },
    { level: 8, totalMembers: 0, activeMembers: 0, totalBusiness: 0, carbonVolumeKg: 0, commissionPercentage: 1, earnedAmount: 0 },
    { level: 9, totalMembers: 0, activeMembers: 0, totalBusiness: 0, carbonVolumeKg: 0, commissionPercentage: 0.5, earnedAmount: 0 },
    { level: 10, totalMembers: 0, activeMembers: 0, totalBusiness: 0, carbonVolumeKg: 0, commissionPercentage: 0.5, earnedAmount: 0 }
  ]);

  // Downline Members (Empty by default, populated only with real server data)
  readonly downlineMembers = signal<DownlineMember[]>([]);

  // Genealogy Root (Root represents current user, children populated only with real server downline)
  readonly genealogyRoot = signal<GenealogyNode>({
    id: 'ROOT',
    farmerId: 'CGC-120873',
    name: 'You (Sponsor)',
    rank: 'Green Starter',
    avatar: 'assets/images/farmer-avatar.jpg',
    package: 'Package',
    packageAmount: 10000,
    status: 'Pending',
    totalPlants: 0,
    level: 0,
    directCount: 0,
    teamCount: 0,
    carbonCredits: 0,
    children: []
  });

  constructor() {
    this.loadLiveTeamData();
  }

  async loadLiveTeamData(): Promise<void> {
    try {
      const [resStatus, resList] = await Promise.allSettled([
        this.membersService.downlinestatus(),
        this.membersService.downlinelist(0, '', 1, 100)
      ]);

      const data = resStatus.status === 'fulfilled' ? (resStatus.value?.result || resStatus.value?.data || resStatus.value) : null;
      const downlineRaw = resList.status === 'fulfilled' ? (resList.value?.result || resList.value?.data || []) : [];

      const uid = data?.userid || '120873';
      const userName = data?.name || 'Farmer';
      this.referralCode.set('CGC-' + uid);

      const encoded = btoa(unescape(encodeURIComponent(String(uid))));
      this.referralLink.set(data?.referrallink || `https://www.carbonovaworld.com/register.php?sid=${encodeURIComponent(encoded)}`);

      // Map real downline members from server downlinelist
      if (Array.isArray(downlineRaw) && downlineRaw.length > 0) {
        const mappedList: DownlineMember[] = downlineRaw.map((m: any, index: number) => {
          const isAct = Number(m.isapproved) === 1 || !!m.doa;
          const pkgAmt = m.amount ? parseFloat(m.amount) : 0;
          const plants = pkgAmt >= 50000 ? 250 : (pkgAmt >= 25000 ? 100 : (pkgAmt >= 10000 ? 40 : 0));
          const lvl = Number(m.level) || 1;
          const memSponsorId = m.sid ? ('CGC-' + m.sid) : ('CGC-' + uid);

          return {
            id: 'MEM-' + (m.userid || (index + 1)),
            farmerId: 'CGC-' + m.userid,
            name: m.name || `Partner Farmer (${m.userid})`,
            avatar: 'assets/images/farmer-avatar.jpg',
            rank: pkgAmt >= 50000 ? 'Carbon Super' : (pkgAmt >= 25000 ? 'Agro Pro' : 'Green Starter'),
            level: lvl,
            sponsorId: memSponsorId,
            sponsorName: m.sid == uid ? `${userName} (You)` : memSponsorId,
            package: m.packagename || (pkgAmt > 0 ? `Package (₹${pkgAmt.toLocaleString()})` : 'Registered Node'),
            packageAmount: pkgAmt,
            joiningDate: m.doj ? new Date(m.doj).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
            status: isAct ? 'Active' : 'Pending',
            totalPlants: plants,
            activePlants: isAct ? plants : 0,
            carbonCredits: isAct ? Math.round(plants * 31.25) : 0,
            directCount: 0,
            teamCount: 0,
            phone: '',
            location: m.city ? `${m.city}, Chhattisgarh` : 'Chhattisgarh'
          };
        });

        this.downlineMembers.set(mappedList);

        // Dynamically compute level-wise stats across 10 levels
        const commissionRates = [10, 5, 3, 2, 2, 1, 1, 1, 0.5, 0.5];
        const computedLevelStats: LevelTeamStats[] = [];
        for (let l = 1; l <= 10; l++) {
          const atLvl = mappedList.filter(m => m.level === l);
          const actAtLvl = atLvl.filter(m => m.status === 'Active');
          const biz = atLvl.reduce((sum, m) => sum + (m.packageAmount || 0), 0);
          const commPct = commissionRates[l - 1] || 0.5;
          const earned = biz * commPct / 100;
          computedLevelStats.push({
            level: l,
            totalMembers: atLvl.length,
            activeMembers: actAtLvl.length,
            totalBusiness: biz,
            carbonVolumeKg: atLvl.reduce((sum, m) => sum + (m.totalPlants * 25), 0),
            commissionPercentage: commPct,
            earnedAmount: earned
          });
        }
        this.levelStats.set(computedLevelStats);

        // Build dynamic visual tree from real directs and sub-referrals
        const directMembers = mappedList.filter(m => m.level === 1 || m.sponsorId === 'CGC-' + uid);
        const rootChildren: GenealogyNode[] = directMembers.map(d => {
          const rawDirectUid = d.farmerId.replace(/\D/g, '');
          const subChildren = mappedList.filter(m => m.sponsorId === d.farmerId || m.sponsorId === 'CGC-' + rawDirectUid);
          return {
            id: d.id,
            farmerId: d.farmerId,
            name: d.name,
            rank: d.rank,
            avatar: d.avatar,
            package: d.package,
            packageAmount: d.packageAmount,
            status: d.status,
            totalPlants: d.totalPlants,
            level: 1,
            directCount: subChildren.length,
            teamCount: subChildren.length,
            carbonCredits: d.carbonCredits,
            children: subChildren.map(sc => ({
              id: sc.id,
              farmerId: sc.farmerId,
              name: sc.name,
              rank: sc.rank,
              avatar: sc.avatar,
              package: sc.package,
              packageAmount: sc.packageAmount,
              status: sc.status,
              totalPlants: sc.totalPlants,
              level: sc.level,
              directCount: 0,
              teamCount: 0,
              carbonCredits: sc.carbonCredits
            }))
          };
        });

        // Compute overall team totals
        const totalTeam = mappedList.length;
        const activeTeam = mappedList.filter(m => m.status === 'Active').length;
        const directsCount = directMembers.length;
        const activeDirectsCount = directMembers.filter(m => m.status === 'Active').length;
        const netVol = mappedList.reduce((sum, m) => sum + (m.packageAmount || 0), 0);
        const carbonPts = mappedList.reduce((sum, m) => sum + m.carbonCredits, 0);
        const carbonOffset = Math.round((carbonPts * 25 * 0.001) * 10) / 10;
        const lvlIncome = data?.levelincome ? parseFloat(data.levelincome) : 0;

        this.teamStats.set({
          totalDirects: directsCount,
          activeDirects: activeDirectsCount,
          totalDownlineTeam: totalTeam,
          activeDownlineTeam: activeTeam,
          totalNetworkVolume: netVol,
          totalCarbonPointsEarned: carbonPts,
          totalCarbonOffsetTonnes: carbonOffset,
          totalLevelIncome: lvlIncome
        });

        this.genealogyRoot.set({
          id: 'ROOT',
          farmerId: 'CGC-' + uid,
          name: `${userName} (You)`,
          rank: 'Green Starter',
          avatar: data?.avatar || 'assets/images/farmer-avatar.jpg',
          package: data?.packageDetails?.name || 'Green Starter Package',
          packageAmount: data?.packageDetails?.price || 10000,
          status: data?.status || (Number(data?.totalPlants || 0) > 0 ? 'Active' : 'Pending'),
          totalPlants: Number(data?.totalPlants ?? 0),
          level: 0,
          directCount: directsCount,
          teamCount: totalTeam,
          carbonCredits: data?.greenCredits?.points || 0,
          children: rootChildren
        });

      } else {
        // Empty state when server returns 0 downline records
        this.downlineMembers.set([]);
        const lvlIncome = data?.levelincome ? parseFloat(data.levelincome) : 0;
        this.teamStats.set({
          totalDirects: 0,
          activeDirects: 0,
          totalDownlineTeam: 0,
          activeDownlineTeam: 0,
          totalNetworkVolume: 0,
          totalCarbonPointsEarned: 0,
          totalCarbonOffsetTonnes: 0,
          totalLevelIncome: lvlIncome
        });
        this.genealogyRoot.set({
          id: 'ROOT',
          farmerId: 'CGC-' + uid,
          name: `${userName} (You)`,
          rank: 'Green Starter',
          avatar: data?.avatar || 'assets/images/farmer-avatar.jpg',
          package: data?.packageDetails?.name || 'Green Starter Package',
          packageAmount: data?.packageDetails?.price || 10000,
          status: data?.status || (Number(data?.totalPlants || 0) > 0 ? 'Active' : 'Pending'),
          totalPlants: Number(data?.totalPlants ?? 0),
          level: 0,
          directCount: 0,
          teamCount: 0,
          carbonCredits: data?.greenCredits?.points || 0,
          children: []
        });
      }
    } catch (e) {
      console.warn('[TeamService] Live server team data fetch error:', e);
    }
  }
}
