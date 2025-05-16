import { GetLeaveDetailParams } from "@/apis/modules/leave";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { LeaveRepository } from "../../infrastructure-interface/repositories/leave.repo-interface";

export class GetLeaveDetailUseCase {
  private leaveRepo: LeaveRepository;
  constructor(leaveRepo: LeaveRepository) {
    this.leaveRepo = leaveRepo;
  }

  async execute(params: GetLeaveDetailParams): Promise<CommonResponse | null> {
    const response = await this.leaveRepo.getLeaveDetail(params);
    return response;
  }
}
