import {
  CreateDayOffParams,
  createDayOffRequest,
  DeleteDayOffParams,
  deleteDayOffRequest,
  getDatOffListRequest,
  getDayOffForNotification,
  GetDayOffListParams,
  GetDayOffParams,
  UpdateDayOffParams,
  updateDayOffRequest,
} from "@/apis/modules/schedule";
import { ScheduleRepository } from "@/core/application/infrastructure-interface/repositories/schedule.repo-interface";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";

export class ScheduleRepositoryImpl implements ScheduleRepository {
  async getDayOffList(
    params: GetDayOffListParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await getDatOffListRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }

  async getDayOffNotification(): Promise<CommonResponse | null> {
    try {
      const response: any = await getDayOffForNotification();
      return response;
    } catch (error: any) {
      return error;
    }
  }

  async getDayOff(params: GetDayOffParams): Promise<CommonResponse | null> {
    try {
      const response: any = await this.getDayOff(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }

  async createDayOff(
    params: CreateDayOffParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await createDayOffRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }

  async updateDayOff(
    params: UpdateDayOffParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await updateDayOffRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }

  async deleteDayOff(
    params: DeleteDayOffParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await deleteDayOffRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }
}
