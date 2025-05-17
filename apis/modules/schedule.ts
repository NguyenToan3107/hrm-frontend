import api from "../request";

export interface GetDayOffListParams {
  current_year?: number;
  country?: string;
}

export function getDatOffListRequest(params: GetDayOffListParams) {
  return api.get(`/calendar`, { params });
}

export interface GetDayOffsParams {
  current_year?: number;
  country?: string;
  page?: number;
  sort_by?: string;
  sort_order?: string;
  status?: string;
  day_off_type?: string;
  create_date?: string | Date;
  day_off_start_date?: string | Date;
  day_off_end_date?: string | Date;
  limit?: number;
}

export function getDatOffsRequest(params: GetDayOffsParams) {
  return api.get(`/day-offs`, { params });
}

export interface GetDayOffParams {
  id?: number;
}

export function getDatOffRequest(params: GetDayOffParams) {
  return api.get(`/day-off`, { params });
}

export interface CreateDayOffParams {
  title?: string;
  description: string;
  day_off: string | Date;
  status: string;
}

export function createDayOffRequest(params: CreateDayOffParams) {
  return api.post(`/day-off`, params);
}

export interface UpdateDayOffParams {
  id: number | string;
  description: string;
  day_off: string | Date;
  status: string | "0" | "1";
  updated_at: string;
  title?: string;
}

export function updateDayOffRequest(params: UpdateDayOffParams) {
  return api.put(`/day-off`, params);
}

export interface DeleteDayOffParams {
  id: number | string;
  updated_at: string;
}

export function deleteDayOffRequest(params: DeleteDayOffParams) {
  return api.delete(`/day-off`, { params });
}

export function getDayOffForNotification() {
  return api.get(`/getdayfornotification`);
}
