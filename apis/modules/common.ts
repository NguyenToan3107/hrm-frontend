import { AuthToken } from "@/core/entities/models/authToken.model";
import api from "../request";

export interface PositionResponse {
  id: number | string;
  name: string;
}

export function getPositionRequest(token: AuthToken) {
  return api.get(`/positions`, {
    headers: {
      Authorization: `Bearer ${token.token}`,
    },
  });
}

export interface DepartmentResponse {
  id: number | string;
  name: string;
}

export function getDepartmentRequest(token: AuthToken) {
  return api.get(`/departments`, {
    headers: {
      Authorization: `Bearer ${token.token}`,
    },
  });
}

export function getCommonsRequest(token: string) {
  return api.get(`/commons`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
export function getCommonsUserRequest() {
  return api.get(`/commons/users`);
}

export interface GetCommonUserDetail {
  id: string;
}

export function getCommonsUserDetailRequest(params: GetCommonUserDetail) {
  return api.get(`/commons/users/detail`, { params });
}

export function getCommonsUserAdminLeaderRequest() {
  return api.get(`/commons/users/admin-leader`);
}

export interface GetCommonAdminLeaderOfDepartment {
  ids: number[]; // id department
}

export function getCommonsUserAdminLeaderOfDepartmentRequest(
  params: GetCommonAdminLeaderOfDepartment
) {
  return api.get(`/commons/users/department/admin-leader`, { params });
}

export interface ExportPDFResponse {
  id?: number | string;
  month?: number;
  year?: number;
}

export function getCommonsExportPDFRequest(params: ExportPDFResponse) {
  return api.get(`/commons/export-pdf`, { params });
}

export function getRoleListRequest() {
  return api.get(`/commons/roles`);
}
