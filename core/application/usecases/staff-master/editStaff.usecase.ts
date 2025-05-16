import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { UserRepository } from "../../infrastructure-interface/repositories/user.repo-interface";
import { UpdateUsersParams } from "@/apis/modules/user";

export class EditStaffUseCase {
  private userRepo: UserRepository;
  constructor(userRepo: UserRepository) {
    this.userRepo = userRepo;
  }

  async execute(params: UpdateUsersParams): Promise<CommonResponse | null> {
    const response = await this.userRepo.editStaff(params);
    return response;
  }
}
