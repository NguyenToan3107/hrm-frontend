import {
  CheckLeaderStatusParams,
  ResetPasswordParams,
} from "@/apis/modules/user";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { UserRepository } from "../../infrastructure-interface/repositories/user.repo-interface";

export class CheckLeaderStatusUsecase {
  private userRepo: UserRepository;
  constructor(userRepo: UserRepository) {
    this.userRepo = userRepo;
  }

  async execute(
    params: CheckLeaderStatusParams
  ): Promise<CommonResponse | null> {
    const response = await this.userRepo.checkLeaderStatus(params);
    return response;
  }
}
