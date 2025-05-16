import { ConfirmLeaveParams } from "@/apis/modules/leave";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { LeaveRepository } from "../../infrastructure-interface/repositories/leave.repo-interface";

export class ConfirmLeaveByManagerUseCase {
  private leaveRepo: LeaveRepository;
  constructor(leaveRepo: LeaveRepository) {
    this.leaveRepo = leaveRepo;
  }
  async execute(params: ConfirmLeaveParams): Promise<CommonResponse | null> {
    const response = await this.leaveRepo.confirmLeave(params);
    return response;
  }
}
