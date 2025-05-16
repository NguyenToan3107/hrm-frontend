import {
  ConfirmLeaveParams,
  CreateLeaveByManagerParams,
  CreateLeaveByUserParams,
  GetLeaveDetailParams,
  GetLeaveListParams,
  GetMyLeavesParams,
  RejectLeaveParams,
  RequestCancelRequestLeaveParams,
  SkipCancelRequestLeaveParams,
  UpdateLeaveByUserParams,
} from "@/apis/modules/leave";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";

export interface LeaveRepository {
  getLeaveList(params: GetLeaveListParams): Promise<CommonResponse | null>;
  getLeaveDetail(params: GetLeaveDetailParams): Promise<CommonResponse | null>;
  createLeaveByUser(
    params: CreateLeaveByUserParams
  ): Promise<CommonResponse | null>;
  createLeaveByManager(
    params: CreateLeaveByManagerParams
  ): Promise<CommonResponse | null>;
  requestCancelLeave(
    params: RequestCancelRequestLeaveParams
  ): Promise<CommonResponse | null>;
  skipCancelRequestLeave(
    params: SkipCancelRequestLeaveParams
  ): Promise<CommonResponse | null>;
  updateLeaveByUser(
    params: UpdateLeaveByUserParams
  ): Promise<CommonResponse | null>;
  confirmLeave(params: ConfirmLeaveParams): Promise<CommonResponse | null>;
  rejectLeaveByManager(
    params: RejectLeaveParams
  ): Promise<CommonResponse | null>;
  getMyLeave(params: GetMyLeavesParams): Promise<CommonResponse | null>;
}
