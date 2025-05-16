import { SkipCancelRequestLeaveParams } from "@/apis/modules/leave";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { LeaveRepository } from "../../infrastructure-interface/repositories/leave.repo-interface";

export class SkipCancelRequestLeaveUseCase {
  private leaveRepo: LeaveRepository;
  constructor(leaveRepo: LeaveRepository) {
    this.leaveRepo = leaveRepo;
  }
  async execute(
    params: SkipCancelRequestLeaveParams
  ): Promise<CommonResponse | null> {
    const response = await this.leaveRepo.skipCancelRequestLeave(params);
    return response;
  }
}
