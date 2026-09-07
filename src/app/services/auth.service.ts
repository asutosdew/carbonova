import { Injectable, signal } from '@angular/core';

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

      // Default demo session token initialization for Sandeep if first visit
      const defaultToken: AuthTokenData = {
        token: 'cgc_jwt_session_' + Math.random().toString(36).substring(2, 15),
        userId: 'CGC-157059'
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

  user(): string {
    try {
      const stored = localStorage.getItem(this.TOKEN_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.token && !parsed.token.startsWith('cgc_jwt_session_')) {
          return parsed.token;
        }
      }
    } catch {}
    // Standard live backend token for development / testing
    return '1111-1111-1111-1111-1111';
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
    return '120873';
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
