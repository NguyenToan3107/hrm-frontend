import { Password } from "@/core/entities/models/password.model";
import { UserRepository } from "../../infrastructure-interface/repositories/user.repo-interface";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";

export class ChangePasswordUseCase {
  private userRepo: UserRepository;
  constructor(userRepo: UserRepository) {
    this.userRepo = userRepo;
  }
  async execute(password: Password): Promise<CommonResponse | null> {
    const response = await this.userRepo.changePassword(password);
    return response;
  }
}
