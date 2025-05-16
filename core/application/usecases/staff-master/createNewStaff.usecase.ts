import { CreateUsersParams } from "@/apis/modules/user";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { UserRepository } from "../../infrastructure-interface/repositories/user.repo-interface";

export class CreateStaffUseCase {
  private userRepo: UserRepository;
  constructor(userRepo: UserRepository) {
    this.userRepo = userRepo;
  }

  async execute(params: CreateUsersParams): Promise<CommonResponse | null> {
    const response = await this.userRepo.createNewStaff(params);
    return response;
  }
}
