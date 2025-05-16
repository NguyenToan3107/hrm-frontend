import { CreateDayOffParams } from "@/apis/modules/schedule";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { ScheduleRepository } from "../../infrastructure-interface/repositories/schedule.repo-interface";

export class CreateDayOffUseCase {
  private scheduleRepo: ScheduleRepository;
  constructor(scheduleRepo: ScheduleRepository) {
    this.scheduleRepo = scheduleRepo;
  }

  async execute(params: CreateDayOffParams): Promise<CommonResponse | null> {
    const response = await this.scheduleRepo.createDayOff(params);
    return response;
  }
}
