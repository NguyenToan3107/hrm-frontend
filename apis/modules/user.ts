import api from "../request";

export interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
}

export function changePasswordRequest(params: ChangePasswordParams) {
  return api.post(`/change-password`, {
    current_password: params.currentPassword,
    new_password: params.newPassword,
  });
}

export interface GetStaffListParams {
  page?: number;
  sort_by?: string;
  sort_order?: string;
  position?: string;
  status?: number;
  type?: number;
  keyword?: string;
  role?: string;
  limit?: number;
}

export function getStaffListRequest(params: GetStaffListParams) {
  return api.get(`/users`, { params });
}

export interface DeleteUsersParams {
  id?: string;
  updated_at?: string;
}

export function deleteStaffRequest(params: DeleteUsersParams) {
  return api.delete(`/users`, { data: params });
}

export interface CreateUsersParams {
  idkey: string;
  fullname?: string;
  phone?: string;
  birth_day?: string;
  address?: string;
  country?: string;
  username?: string;
  status_working: string;
  email: string;
  // position: string;
  role: string;
  started_at: string;
  department_ids: number[];
  leader_id: string;
  time_off_hours: any;
  last_year_time_off?: any;
  gender?: string;
}

export function createStaffRequest(params: CreateUsersParams) {
  return api.post(`/users`, params);
}

export interface UpdateUsersParams {
  id: any;
  idkey: string;
  fullname?: string;
  phone?: string | null;
  birth_day?: string; // d/m/Y && before:today
  address?: string;
  country?: string;
  username?: string;
  status_working?: string;
  email?: string;
  // position?: string;
  role: string;
  started_at?: string;
  department_ids?: number[];
  updated_at: string;
  leader_id?: any;
  time_off_hours?: any;
  last_year_time_off?: any;
  gender?: string;
  ended_at?: string; // d/m/Y && from:today
}

export function updateStaffRequest(params: UpdateUsersParams) {
  return api.put(`/users`, params);
}

export function getProfileRequest() {
  return api.get("/my-page");
}

export interface ResetPasswordParams {
  id: any;
  updated_at: string;
}

export function resetPasswordRequest(params: ResetPasswordParams) {
  return api.post(`/users/reset-password`, params);
}

export interface UpdateNotificationConfigParams {
  hide_notification_to: string;
}

export function updateNotificationConfig(
  params: UpdateNotificationConfigParams
) {
  return api.post(`/users-update-hide-notification`, params);
}

export interface CheckLeaderStatusParams {
  id: any;
}
export const checkStatusLeaderBeforeActive = (
  params: CheckLeaderStatusParams
) => {
  return api.get(`/users/status`, { params });
};
