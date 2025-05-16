import { DeleteUsersParams } from "@/apis/modules/user";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { UserRepository } from "../../infrastructure-interface/repositories/user.repo-interface";

export class DeleteStaffUseCase {
  private userRepo: UserRepository;
  constructor(userRepo: UserRepository) {
    this.userRepo = userRepo;
  }

  async execute(params: DeleteUsersParams): Promise<CommonResponse | null> {
    const response = await this.userRepo.deleteStaff(params);
    return response;
  }
}
