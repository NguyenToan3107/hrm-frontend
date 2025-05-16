import { CreateLeaveByManagerParams } from "@/apis/modules/leave";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { LeaveRepository } from "../../infrastructure-interface/repositories/leave.repo-interface";

export class CreateLeaveByManagerUseCase {
  private leaveRepo: LeaveRepository;
  constructor(leaveRepo: LeaveRepository) {
    this.leaveRepo = leaveRepo;
  }

  async execute(
    params: CreateLeaveByManagerParams
  ): Promise<CommonResponse | null> {
    const response = await this.leaveRepo.createLeaveByManager(params);
    return response;
  }
}
