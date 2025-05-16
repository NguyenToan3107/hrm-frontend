import api from "../request";

export interface GetLeaveListParams {
  page?: number;
  sort_by?: string;
  sort_order?: string;
  status?: string;
  approver_id?: string;
  leave_type?: string;
  leave_id?: string;
  employee_name?: string;
  limit?: number;
  create_date?: string | Date;
  leave_start_date?: string | Date;
  leave_end_date?: string | Date;
  cancel_request?: string;
  related_leave?: any;
  approver?: string;
}

export function getLeaveListRequest(params: GetLeaveListParams) {
  return api.get(`/leaves`, { params });
}

export interface GetLeaveDetailParams {
  id?: number;
}

export function getLeaveDetailRequest(params: GetLeaveDetailParams) {
  return api.get(`/leaves/detail`, { params });
}

export interface CreateLeaveByUserParams {
  other_info?: string;
  approver_id: number;
  description: string;
  day_leave: string | Date;
  shift: string;
}

export function createLeaveByUserRequest(params: CreateLeaveByUserParams) {
  return api.post(`/leaves`, params);
}

export interface CreateLeaveByManagerParams {
  other_info?: string;
  user_id: string;
  description: string;
  day_leave: string | Date;
  shift: string;
}

export function createLeaveByManagerRequest(
  params: CreateLeaveByManagerParams
) {
  return api.post(`/leaves/admin-create-leave`, params);
}

export interface ConfirmLeaveParams {
  id: string;
  updated_at?: string;
}

export function confirmLeaveRequest(params: ConfirmLeaveParams) {
  return api.post(`/leaves/confirm`, params);
}

export interface UpdateLeaveByUserParams {
  id: string;
  other_info?: string;
  approver_id?: string;
  description?: string;
  day_leave?: string | Date;
  shift?: string;
  updated_at?: string;
}

export function updateLeaveByUserRequest(params: UpdateLeaveByUserParams) {
  return api.post(`/leaves/edit`, params);
}

export interface RequestCancelRequestLeaveParams {
  id: string;
  updated_at?: string;
  description?: string;
}

export function requestCancelRequestLeaveRequest(
  params: RequestCancelRequestLeaveParams
) {
  return api.post(`/leaves/cancel-request`, params);
}

export interface SkipCancelRequestLeaveParams {
  id: string;
  updated_at?: string;
}

export function skipCancelRequestLeaveRequest(
  params: SkipCancelRequestLeaveParams
) {
  return api.post(`/leaves/skip-cancel-request`, params);
}

export interface RejectLeaveParams {
  id: string;
  updated_at?: string;
}

export function rejectLeaveRequest(params: RejectLeaveParams) {
  return api.post(`/leaves/cancel`, params);
}

export interface GetMyLeavesParams {
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  id?: string;
}

export function getMyLeavesRequest(params: GetMyLeavesParams) {
  return api.get(`/my-page/leave`, { params });
}
