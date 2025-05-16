import { AuthRepository } from "../../infrastructure-interface/repositories/auth.repo-interface";

export class LogoutUseCase {
  private authRepo: AuthRepository;

  constructor(authRepo: AuthRepository) {
    this.authRepo = authRepo;
  }

  async execute(): Promise<any> {
    const res = await this.authRepo.signOut();
    return res;
  }
}
