import { UpdateDayOffParams } from "@/apis/modules/schedule";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { ScheduleRepository } from "../../infrastructure-interface/repositories/schedule.repo-interface";

export class UpdateDayOffUseCase {
  private scheduleRepo: ScheduleRepository;
  constructor(scheduleRepo: ScheduleRepository) {
    this.scheduleRepo = scheduleRepo;
  }

  async execute(params: UpdateDayOffParams): Promise<CommonResponse | null> {
    const response = await this.scheduleRepo.updateDayOff(params);
    return response;
  }
}
