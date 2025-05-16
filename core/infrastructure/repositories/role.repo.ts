import {
  CreateRoleParams,
  createRoleRequest,
  getPermissionListRequest,
  GetRoleDetailParams,
  getRoleDetailRequest,
  GetRoleListParams,
  getRoleListRequest,
  EditRoleParams,
  editRoleRequest,
  DeleteRoleParams,
  deleteRoleRequest,
} from "@/apis/modules/role";
import { RoleRepository } from "@/core/application/infrastructure-interface/repositories/role.repo-interface";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";

export class RoleRepositoryImpl implements RoleRepository {
  async getRoleList(params: GetRoleListParams): Promise<CommonResponse | null> {
    try {
      const response: any = await getRoleListRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }
  async getPermissionList(): Promise<CommonResponse | null> {
    try {
      const response: any = await getPermissionListRequest();
      return response;
    } catch (error: any) {
      return error;
    }
  }
  async createRole(params: CreateRoleParams): Promise<CommonResponse | null> {
    try {
      const response: any = await createRoleRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }
  async getDetailRole(
    params: GetRoleDetailParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await getRoleDetailRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }
  async editRole(params: EditRoleParams): Promise<CommonResponse | null> {
    try {
      const response: any = await editRoleRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }
  async deleteRole(params: DeleteRoleParams): Promise<CommonResponse | null> {
    try {
      const response: any = await deleteRoleRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }
}
