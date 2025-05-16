// src/infrastructure/services/AuthServiceImpl.ts

import { AuthService } from "@/core/application/infrastructure-interface/services/auth.service-interface";

export class AuthServiceImpl implements AuthService {
  private tokenKey = "authToken";

  saveToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  clearToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.tokenKey);
    }
  }
}
