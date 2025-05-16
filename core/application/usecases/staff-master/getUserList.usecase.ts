import { GetStaffListParams } from "@/apis/modules/user";
import { UserRepository } from "../../infrastructure-interface/repositories/user.repo-interface";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";

export class GetStaffListUseCase {
  private userRepo: UserRepository;
  constructor(userRepo: UserRepository) {
    this.userRepo = userRepo;
  }

  async execute(params: GetStaffListParams): Promise<CommonResponse | null> {
    const response = await this.userRepo.getStaffList(params);
    return response;
  }
}
