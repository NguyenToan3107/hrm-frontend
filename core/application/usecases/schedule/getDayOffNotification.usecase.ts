import {CommonResponse} from "@/core/entities/models/responseCommon.model";
import {ScheduleRepository} from "../../infrastructure-interface/repositories/schedule.repo-interface";

export class GetDayOffNotificationUseCase {
    private scheduleRepo: ScheduleRepository;

    constructor(scheduleRepo: ScheduleRepository) {
        this.scheduleRepo = scheduleRepo;
    }

    async execute(): Promise<CommonResponse | null> {
        const response = await this.scheduleRepo.getDayOffNotification();
        return response;
    }
}
