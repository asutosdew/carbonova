import { Injectable, signal, isDevMode } from '@angular/core';

export interface AuthTokenData {
  token: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  public readonly LOGIN_URL = 'https://www.carbonovaworld.com/login.php';

  // Development Bypass Token accepted by members.php
  public static readonly DEV_DEFAULT_TOKEN = '1111-1111-1111-1111-1111';
  public static readonly DEV_DEFAULT_USERID = '120873';

  readonly currentUser = signal<AuthTokenData | null>(null);

  constructor() {
    this.checkAndInitAuth();
  }

  private checkAndInitAuth() {
    try {
      const stored = localStorage.getItem(this.TOKEN_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthTokenData;
        if (parsed && parsed.token && parsed.userId) {
          this.currentUser.set(parsed);
          return;
        }
      }

      // In development: Default to live dev token to fetch real server data
      const defaultToken: AuthTokenData = {
        token: AuthService.DEV_DEFAULT_TOKEN,
        userId: AuthService.DEV_DEFAULT_USERID
      };
      this.setToken(defaultToken);
    } catch (e) {
      console.error('Error reading authToken from localStorage', e);
    }
  }

  isAuthenticated(): boolean {
    try {
      const stored = localStorage.getItem(this.TOKEN_KEY);
      if (!stored) return false;
      const parsed = JSON.parse(stored) as AuthTokenData;
      return !!(parsed && parsed.token && parsed.userId);
    } catch {
      return false;
    }
  }

  // Token sent in all MembersService API requests
  user(): string {
    // 1. In Production: Fetch strictly from localStorage
    if (!isDevMode()) {
      try {
        const stored = localStorage.getItem(this.TOKEN_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.token) {
            return parsed.token;
          }
        }
      } catch (e) {
        console.error('Error retrieving production token from localStorage:', e);
      }
      return '';
    }

    // 2. In Development: Use live dev token by default, or localStorage if user logged in
    try {
      const stored = localStorage.getItem(this.TOKEN_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.token && !parsed.token.startsWith('cgc_jwt_session_') && parsed.token !== 'demo') {
          return parsed.token;
        }
      }
    } catch {}

    // Default development token for live server data fetching
    return AuthService.DEV_DEFAULT_TOKEN;
  }

  userId(): string {
    try {
      const stored = localStorage.getItem(this.TOKEN_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const id = parsed?.userId || parsed?.userid;
        if (id && id !== 'CGC-157059') {
          return String(id);
        }
      }
    } catch {}
    return AuthService.DEV_DEFAULT_USERID;
  }

  getApiUrl(): string {
    return 'https://www.carbonovaworld.com/api/members.php';
  }

  getToken(): AuthTokenData | null {
    try {
      const stored = localStorage.getItem(this.TOKEN_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as AuthTokenData;
    } catch {
      return null;
    }
  }

  setToken(tokenData: AuthTokenData) {
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenData));
    this.currentUser.set(tokenData);
  }

  logout(redirectUrl: string = this.LOGIN_URL) {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      this.currentUser.set(null);
    } catch (e) {
      console.error('Error removing authToken during logout', e);
    }

    // Direct redirect to external login portal
    window.location.href = redirectUrl;
  }

  // Helper method to simulate 401 Unauthorized from a webservice
  simulate401Unauthorized() {
    this.logout();
  }
}
