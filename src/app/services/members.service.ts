import { Injectable, inject, isDevMode } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { AuthService } from "./auth.service";

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};

@Injectable({
  providedIn: "root"
})
export class MembersService {
  private readonly http = inject(HttpClient);
  private readonly authServer = inject(AuthService);

  // Live Backend Endpoint directly accessed
  public static readonly LIVE_API_URL = "https://www.carbonovaworld.com/api/members.php";

  get authUrl(): string {
    return MembersService.LIVE_API_URL;
  }

  get token(): string {
    return this.authServer.user();
  }

  private async postRequest<T = any>(route: string, params?: any): Promise<T> {
    const payload: any[] = [
      { token: this.token },
      { route: route }
    ];

    if (params !== undefined) {
      payload.push(params);
    }

    try {
      return await firstValueFrom(this.http.post<T>(this.authUrl, payload, httpOptions));
    } catch (error) {
      console.warn(`[MembersService] API route '${route}' failed:`, error);
      throw error;
    }
  }

  // Real-time Downline Summary Stats
  async downlinestatus(): Promise<any> {
    return await this.postRequest("downlinestatus");
  }

  // Farmer Personal & KYC Details
  async personalinfo(): Promise<any> {
    return await this.postRequest("personalinfo", []);
  }

  // Update Profile Bank & PAN details on Server
  async updateprofile(city: string, acno: string, ifsc: string, pan: string): Promise<any> {
    return await this.postRequest("updatepersonalinfo", [{ acno, ifsc, pan, city }]);
  }

  // Shipping & Farm Address
  async getShippingAddress(): Promise<any> {
    return await this.postRequest("getShippingAddress");
  }

  async saveShippingAddress(saddress: any): Promise<any> {
    return await this.postRequest("saveShippingAddress", [{ address: saddress }]);
  }

  // Active Plans & Eco Packages
  async activeplans(): Promise<any> {
    return await this.postRequest("activeplanlist");
  }

  // Real-time Product & Plant List
  async productslist(): Promise<any> {
    return await this.postRequest("productlist");
  }

  // Downline Team Directory
  async downlinelist(
    findparam: number = 0,
    search: string = "",
    page: number = 1,
    pagesize: number = 20,
    fromdate: string = "",
    uptodate: string = "",
    sortby: string = "",
    sortingtype: string = ""
  ): Promise<any> {
    return await this.postRequest("downlinelist", [
      {
        findparam,
        search,
        sortby,
        page,
        pagesize,
        fromdate,
        uptodate
      }
    ]);
  }

  // Tree View
  async treeview(userid: string): Promise<any> {
    return await this.postRequest("treeview", [{ tuserid: userid }]);
  }

  async treeviewnew(userid: string): Promise<any> {
    return await this.postRequest("treeview-new", [{ tuserid: userid }]);
  }

  // Commission Incomes
  async directincome(page: number = 1, pagesize: number = 10): Promise<any> {
    return await this.postRequest("directincome", [{ page, pagesize }]);
  }

  async levelincome(page: number = 1, pagesize: number = 10): Promise<any> {
    return await this.postRequest("levelincome", [{ page, pagesize }]);
  }

  async autopoolincome(page: number = 1, pagesize: number = 10): Promise<any> {
    return await this.postRequest("autopoolincome", [{ page, pagesize }]);
  }

  // Accounts & Wallet Ledger
  async myaccount(page: number = 1, pagesize: number = 10): Promise<any> {
    return await this.postRequest("myaccount", [{ page, pagesize }]);
  }

  async myaccountsummary(): Promise<any> {
    return await this.postRequest("myaccountsummary");
  }

  async accountbalance(): Promise<any> {
    return await this.postRequest("accountbalance");
  }

  // Password & Security PIN
  async changepassword(oldpwd: string, newpwd: string): Promise<any> {
    return await this.postRequest("changepassword", [{ oldpassword: oldpwd, newpassword: newpwd }]);
  }

  // State List
  async statelist(): Promise<any> {
    return await this.postRequest("statelist");
  }

  // Package & Store Activation
  async submitActivationRequest(planid: number, productstr: any): Promise<any> {
    return await this.postRequest("newsale", [{ planid, productstr }]);
  }

  async activateuser(userid: string, planid: number): Promise<any> {
    return await this.postRequest("activateuser", [{ userid, planid }]);
  }

  // Farm Land & Geotag Specifications
  async getFarmDetails(): Promise<any> {
    return await this.postRequest("get_farm_details");
  }

  async saveFarmDetails(farmData: any): Promise<any> {
    return await this.postRequest("save_farm_details", [farmData]);
  }

  // Plantation Photo & Health Update
  async addPhotoUpdate(imageUrl: string, note: string): Promise<any> {
    return await this.postRequest("add_photo_update", [{ imageUrl, note }]);
  }

  // Personal Profile & KYC Updates
  async updatePersonalProfile(profileData: any): Promise<any> {
    return await this.postRequest("update_profile", [profileData]);
  }

  async updateBankDetails(bankData: any): Promise<any> {
    return await this.postRequest("update_bank_details", [bankData]);
  }

  async updateKyc(kycData: any): Promise<any> {
    return await this.postRequest("update_kyc", [kycData]);
  }

  // Payout / Withdrawal Request
  async requestWithdrawal(amount: number, method: string, accountInfo: string): Promise<any> {
    return await this.postRequest("request_withdrawal", [{ amount, method, accountInfo }]);
  }
}
