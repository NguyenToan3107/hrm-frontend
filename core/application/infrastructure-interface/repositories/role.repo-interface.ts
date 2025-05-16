import {
  CreateRoleParams,
  GetRoleDetailParams,
  GetRoleListParams,
  EditRoleParams,
  DeleteRoleParams,
} from "@/apis/modules/role";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";

export interface RoleRepository {
  getRoleList(params: GetRoleListParams): Promise<CommonResponse | null>;
  createRole(params: CreateRoleParams): Promise<CommonResponse | null>;
  getPermissionList(): Promise<CommonResponse | null>;
  getDetailRole(params: GetRoleDetailParams): Promise<CommonResponse | null>;
  editRole(params: EditRoleParams): Promise<CommonResponse | null>;
  deleteRole(params: DeleteRoleParams): Promise<CommonResponse | null>;
}
