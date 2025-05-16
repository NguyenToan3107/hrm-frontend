import {
  CreateDayOffParams,
  DeleteDayOffParams,
  GetDayOffListParams,
  GetDayOffParams,
  UpdateDayOffParams,
} from "@/apis/modules/schedule";
import {CommonResponse} from "@/core/entities/models/responseCommon.model";

export interface ScheduleRepository {
    getDayOffList(params: GetDayOffListParams): Promise<CommonResponse | null>;

    getDayOffNotification(): Promise<CommonResponse | null>;

    createDayOff(params: CreateDayOffParams): Promise<CommonResponse | null>;

    updateDayOff(params: UpdateDayOffParams): Promise<CommonResponse | null>;

    getDayOff(params: GetDayOffParams): Promise<CommonResponse | null>;

    deleteDayOff(params: DeleteDayOffParams): Promise<CommonResponse | null>;
}
