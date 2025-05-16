import { ResetPasswordParams } from "@/apis/modules/user";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { UserRepository } from "../../infrastructure-interface/repositories/user.repo-interface";

export class ResetPasswordStaffUseCase {
  private userRepo: UserRepository;
  constructor(userRepo: UserRepository) {
    this.userRepo = userRepo;
  }

  async execute(params: ResetPasswordParams): Promise<CommonResponse | null> {
    const response = await this.userRepo.resetPassword(params);
    return response;
  }
}
