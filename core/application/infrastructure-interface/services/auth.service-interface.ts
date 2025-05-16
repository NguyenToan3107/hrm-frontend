export interface AuthService {
  saveToken(token: string): void;
  getToken(): string | null;
  clearToken(): void;
}
