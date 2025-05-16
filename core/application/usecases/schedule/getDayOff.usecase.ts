import { GetDayOffParams } from "@/apis/modules/schedule";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { ScheduleRepository } from "../../infrastructure-interface/repositories/schedule.repo-interface";

export class GetDayOffUseCase {
  private scheduleRepo: ScheduleRepository;
  constructor(scheduleRepo: ScheduleRepository) {
    this.scheduleRepo = scheduleRepo;
  }

  async execute(params: GetDayOffParams): Promise<CommonResponse | null> {
    const response = await this.scheduleRepo.getDayOff(params);
    return response;
  }
}
