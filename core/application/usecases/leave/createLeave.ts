import { CreateLeaveByUserParams } from "@/apis/modules/leave";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { LeaveRepository } from "../../infrastructure-interface/repositories/leave.repo-interface";

export class CreateLeaveByUserUseCase {
  private leaveRepo: LeaveRepository;
  constructor(leaveRepo: LeaveRepository) {
    this.leaveRepo = leaveRepo;
  }

  async execute(
    params: CreateLeaveByUserParams
  ): Promise<CommonResponse | null> {
    const response = await this.leaveRepo.createLeaveByUser(params);
    return response;
  }
}
