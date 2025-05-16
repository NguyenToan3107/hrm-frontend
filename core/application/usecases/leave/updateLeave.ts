import { UpdateLeaveByUserParams } from "@/apis/modules/leave";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { LeaveRepository } from "../../infrastructure-interface/repositories/leave.repo-interface";

export class UpdateLeaveByUserUseCase {
  private leaveRepo: LeaveRepository;
  constructor(leaveRepo: LeaveRepository) {
    this.leaveRepo = leaveRepo;
  }
  async execute(
    params: UpdateLeaveByUserParams
  ): Promise<CommonResponse | null> {
    const response = await this.leaveRepo.updateLeaveByUser(params);
    return response;
  }
}
