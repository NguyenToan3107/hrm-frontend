import { GetLeaveListParams } from "@/apis/modules/leave";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { LeaveRepository } from "../../infrastructure-interface/repositories/leave.repo-interface";

export class GetLeavesListUseCase {
  private leaveRepo: LeaveRepository;
  constructor(leaveRepo: LeaveRepository) {
    this.leaveRepo = leaveRepo;
  }

  async execute(params: GetLeaveListParams): Promise<CommonResponse | null> {
    const response = await this.leaveRepo.getLeaveList(params);
    return response;
  }
}
