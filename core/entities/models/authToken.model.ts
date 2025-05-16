export class AuthToken {
  constructor(
    public token: string, // JWT token hoặc session token
    public refreshToken: string, // JWT token hoặc session token
    public expiresAt: Date // Thời điểm token hết hạn
  ) {}
}
