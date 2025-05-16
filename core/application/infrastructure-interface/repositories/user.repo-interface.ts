import {
  CheckLeaderStatusParams,
  CreateUsersParams,
  DeleteUsersParams,
  GetStaffListParams,
  ResetPasswordParams,
  UpdateNotificationConfigParams,
  UpdateUsersParams,
} from "@/apis/modules/user";
import { Password } from "@/core/entities/models/password.model";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";

export interface UserRepository {
  changePassword(password: Password): Promise<CommonResponse | null>;

  getStaffList(params: GetStaffListParams): Promise<CommonResponse | null>;

  getProfile(): Promise<CommonResponse | null>;

  createNewStaff(params: CreateUsersParams): Promise<CommonResponse | null>;

  editStaff(params: UpdateUsersParams): Promise<CommonResponse | null>;

  deleteStaff(params: DeleteUsersParams): Promise<CommonResponse | null>;

  resetPassword(params: ResetPasswordParams): Promise<CommonResponse | null>;

  updateNotificationConfig(
    params: UpdateNotificationConfigParams
  ): Promise<CommonResponse | null>;

  checkLeaderStatus(
    params: CheckLeaderStatusParams
  ): Promise<CommonResponse | null>;
}
