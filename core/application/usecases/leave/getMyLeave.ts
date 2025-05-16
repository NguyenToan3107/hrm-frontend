import { GetMyLeavesParams } from "@/apis/modules/leave";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { LeaveRepository } from "../../infrastructure-interface/repositories/leave.repo-interface";
export class GetMyLeaveUseCase {
  private leaveRepo: LeaveRepository;
  constructor(leaveRepo: LeaveRepository) {
    this.leaveRepo = leaveRepo;
  }
  async execute(params: GetMyLeavesParams): Promise<CommonResponse | null> {
    const response = await this.leaveRepo.getMyLeave(params);
    return response;
  }
}