import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { LeaveRepository } from "../../infrastructure-interface/repositories/leave.repo-interface";
import { RequestCancelRequestLeaveParams } from "@/apis/modules/leave";

export class RequestCancelLeaveRequestUseCase {
  private leaveRepo: LeaveRepository;
  constructor(leaveRepo: LeaveRepository) {
    this.leaveRepo = leaveRepo;
  }
  async execute(
    params: RequestCancelRequestLeaveParams
  ): Promise<CommonResponse | null> {
    const response = await this.leaveRepo.requestCancelLeave(params);
    return response;
  }
}
