import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Not authenticated: clear token and redirect to external login portal
  authService.logout('https://www.carbonovaworld.com/login.php');
  return false;
};
