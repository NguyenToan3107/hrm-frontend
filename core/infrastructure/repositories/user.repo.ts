import {
  ChangePasswordParams,
  changePasswordRequest,
  CheckLeaderStatusParams,
  checkStatusLeaderBeforeActive,
  createStaffRequest,
  CreateUsersParams,
  deleteStaffRequest,
  DeleteUsersParams,
  getProfileRequest,
  GetStaffListParams,
  getStaffListRequest,
  ResetPasswordParams,
  resetPasswordRequest,
  updateNotificationConfig,
  UpdateNotificationConfigParams,
  updateStaffRequest,
  UpdateUsersParams,
} from "@/apis/modules/user";
import { UserRepository } from "@/core/application/infrastructure-interface/repositories/user.repo-interface";
import { Password } from "@/core/entities/models/password.model";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";

export class UserRepositoryImpl implements UserRepository {
  async changePassword(password: Password): Promise<CommonResponse | null> {
    try {
      const params: ChangePasswordParams = {
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
      };
      const response: any = await changePasswordRequest(params);
      const formattedResponse: CommonResponse = {
        data: response?.data,
        code: response?.code,
        message: response?.message || "",
        requestStatus: response.status,
      };
      return formattedResponse;
    } catch (error: any) {
      const formattedResponse: CommonResponse = {
        data: error.response?.data || [],
        code: error.response?.code || 1,
        message: error.response?.message,
        requestStatus: error.status,
        errorCode: error?.data?.error_code || 0,
      };
      return formattedResponse;
    }
  }

  async getStaffList(
    params: GetStaffListParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await getStaffListRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }

  async getProfile(): Promise<CommonResponse | null> {
    try {
      const response: any = await getProfileRequest();
      return response;
    } catch (error: any) {
      return error;
    }
  }

  async createNewStaff(
    params: CreateUsersParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await createStaffRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }

  async editStaff(params: UpdateUsersParams): Promise<CommonResponse | null> {
    try {
      const response: any = await updateStaffRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }

  async deleteStaff(params: DeleteUsersParams): Promise<CommonResponse | null> {
    try {
      const response: any = await deleteStaffRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }

  async resetPassword(
    params: ResetPasswordParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await resetPasswordRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }

  async updateNotificationConfig(
    params: UpdateNotificationConfigParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await updateNotificationConfig(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }
  async checkLeaderStatus(
    params: CheckLeaderStatusParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await checkStatusLeaderBeforeActive(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }
}
