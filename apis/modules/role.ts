import api from "../request";

export interface GetRoleListParams {
  page?: number;
  sort_by?: string;
  sort_order?: string;
  name?: string;
  limit?: number;
}

export function getRoleListRequest(params: GetRoleListParams) {
  return api.get(`/roles`, { params });
}

export interface CreateRoleParams {
  fullname?: string;
  description?: string;
  permissions?: number[];
}

export function createRoleRequest(params: CreateRoleParams) {
  return api.post(`/roles/create`, params);
}

export function getPermissionListRequest() {
  return api.get(`/roles/list-permissions`);
}

export interface GetRoleDetailParams {
  id?: number;
}

export function getRoleDetailRequest(params: GetRoleDetailParams) {
  return api.get(`/roles/show`, { params });
}

export interface EditRoleParams {
  id?: number;
  fullname?: string;
  description?: string;
  permissions?: number[];
}

export function editRoleRequest(params: EditRoleParams) {
  return api.post(`/roles/edit`, params);
}

export interface DeleteRoleParams {
  id?: number;
  updated_at?: string;
}

export function deleteRoleRequest(params: DeleteRoleParams) {
  return api.delete(`/roles/delete`, { params });
}
