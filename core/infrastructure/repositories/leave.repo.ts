import {
  ConfirmLeaveParams,
  confirmLeaveRequest,
  CreateLeaveByManagerParams,
  createLeaveByManagerRequest,
  CreateLeaveByUserParams,
  createLeaveByUserRequest,
  GetLeaveDetailParams,
  getLeaveDetailRequest,
  GetLeaveListParams,
  getLeaveListRequest,
  GetMyLeavesParams,
  getMyLeavesRequest,
  RejectLeaveParams,
  rejectLeaveRequest,
  RequestCancelRequestLeaveParams,
  requestCancelRequestLeaveRequest,
  SkipCancelRequestLeaveParams,
  skipCancelRequestLeaveRequest,
  UpdateLeaveByUserParams,
  updateLeaveByUserRequest,
} from "@/apis/modules/leave";
import { LeaveRepository } from "@/core/application/infrastructure-interface/repositories/leave.repo-interface";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";

export class LeaveRepositoryImpl implements LeaveRepository {
  async getMyLeave(params: GetMyLeavesParams): Promise<CommonResponse | null> {
    try {
      const response: any = await getMyLeavesRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }
  async getLeaveDetail(
    params: GetLeaveDetailParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await getLeaveDetailRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }
  async getLeaveList(
    params: GetLeaveListParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await getLeaveListRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }

  async createLeaveByUser(
    params: CreateLeaveByUserParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await createLeaveByUserRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }

  async requestCancelLeave(
    params: RequestCancelRequestLeaveParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await requestCancelRequestLeaveRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }

  async updateLeaveByUser(
    params: UpdateLeaveByUserParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await updateLeaveByUserRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }

  async confirmLeave(
    params: ConfirmLeaveParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await confirmLeaveRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }
  async rejectLeaveByManager(
    params: RejectLeaveParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await rejectLeaveRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }
  async skipCancelRequestLeave(
    params: SkipCancelRequestLeaveParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await skipCancelRequestLeaveRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }
  async createLeaveByManager(
    params: CreateLeaveByManagerParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await createLeaveByManagerRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }
}
