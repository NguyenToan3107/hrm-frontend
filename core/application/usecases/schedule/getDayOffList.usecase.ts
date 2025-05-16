import { GetDayOffListParams } from "@/apis/modules/schedule";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { ScheduleRepository } from "../../infrastructure-interface/repositories/schedule.repo-interface";

export class GetDayOffListUseCase {
  private scheduleRepo: ScheduleRepository;
  constructor(scheduleRepo: ScheduleRepository) {
    this.scheduleRepo = scheduleRepo;
  }

  async execute(params: GetDayOffListParams): Promise<CommonResponse | null> {
    const response = await this.scheduleRepo.getDayOffList(params);
    return response;
  }
}
