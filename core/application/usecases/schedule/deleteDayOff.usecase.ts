import { DeleteDayOffParams } from "@/apis/modules/schedule";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { ScheduleRepository } from "../../infrastructure-interface/repositories/schedule.repo-interface";

export class DeleteDayOffUseCase {
  private scheduleRepo: ScheduleRepository;
  constructor(scheduleRepo: ScheduleRepository) {
    this.scheduleRepo = scheduleRepo;
  }

  async execute(params: DeleteDayOffParams): Promise<CommonResponse | null> {
    const response = await this.scheduleRepo.deleteDayOff(params);
    return response;
  }
}
