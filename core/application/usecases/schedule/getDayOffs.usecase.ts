import { GetDayOffsParams } from "@/apis/modules/schedule";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { ScheduleRepository } from "../../infrastructure-interface/repositories/schedule.repo-interface";

export class GetDayOffsUseCase {
  private scheduleRepo: ScheduleRepository;
  constructor(scheduleRepo: ScheduleRepository) {
    this.scheduleRepo = scheduleRepo;
  }

  async execute(params: GetDayOffsParams): Promise<CommonResponse | null> {
    const response = await this.scheduleRepo.getDayOffs(params);
    return response;
  }
}
