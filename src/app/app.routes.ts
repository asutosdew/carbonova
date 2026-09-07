import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { IncomeComponent } from './pages/income/income.component';
import { TeamComponent } from './pages/team/team.component';
import { StoreComponent } from './pages/store/store.component';
import { CreditsComponent } from './pages/credits/credits.component';
import { FarmComponent } from './pages/farm/farm.component';
import { UpdatesComponent } from './pages/updates/updates.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard], title: 'CARBONOVA | Farmer Dashboard' },
  { path: 'income', component: IncomeComponent, canActivate: [authGuard], title: 'Income & Partner Wallet | CARBONOVA' },
  { path: 'team', component: TeamComponent, canActivate: [authGuard], title: 'Partner Network & Genealogy Tree | CARBONOVA' },
  { path: 'store', component: StoreComponent, canActivate: [authGuard], title: 'Eco Store: Plants & Bio-Fertilizers | CARBONOVA' },
  { path: 'credits', component: CreditsComponent, canActivate: [authGuard], title: 'Green Credits & Carbon Certificate | CARBONOVA' },
  { path: 'farm', component: FarmComponent, canActivate: [authGuard], title: 'My Farm & Agroforestry | CARBONOVA' },
  { path: 'updates', component: UpdatesComponent, canActivate: [authGuard], title: 'Plantation Updates | CARBONOVA' },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard], title: 'Farmer Profile & KYC | CARBONOVA' },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [authGuard], title: 'Change Password & Security PIN | CARBONOVA' },
  { path: '**', redirectTo: 'dashboard' }
];



