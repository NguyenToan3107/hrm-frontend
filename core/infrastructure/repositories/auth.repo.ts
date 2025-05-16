"use client";
import {
  getUserRequest,
  LoginParams,
  loginRequest,
  logoutRequest,
  updateUserRequest,
} from "@/apis/modules/auth";
import { AuthRepository } from "@/core/application/infrastructure-interface/repositories/auth.repo-interface";
import { AuthCredentials } from "@/core/entities/models/authCredentials.model";
import { AuthToken } from "@/core/entities/models/authToken.model";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";

import { getCommonsRequest } from "@/apis/modules/common";
import { useCommonStore } from "@/stores/commonStore";
import { useUserStore } from "@/stores/userStore";
import { expirationDate } from "@/utilities/helper";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/utilities/static-value";
import { deleteCookie, setCookie } from "cookies-next";
export class AuthRepositoryImpl implements AuthRepository {
  async signIn(credentials: AuthCredentials): Promise<AuthToken | any> {
    try {
      const params: LoginParams = {
        email: String(credentials.email),
        password: String(credentials.password),
      };
      const response = await loginRequest(params);
      const { access_token, refresh_token, expires_in } = response.data;
      const token = new AuthToken(
        access_token,
        refresh_token,
        expirationDate(expires_in)
      );

      await this.getUser(token);
      await this.getCommonData(token.token);
      return {
        token: access_token,
        refreshToken: refresh_token,
        expiresAt: expirationDate(expires_in),
      };
    } catch (error) {
      return error;
    }
  }

  async getUser(token: AuthToken): Promise<any | null> {
    try {
      const response: any = await getUserRequest(token);
      if (response && response.data) {
        const setUser = useUserStore.getState().setUser;
        setUser(response.data);
      }
      return response;
    } catch (error: any) {
      return error;
    }
  }

  async updateUser(params: FormData): Promise<CommonResponse | null> {
    try {
      const res: any = await updateUserRequest(params);
      return res;
    } catch (error: any) {
      return error;
    }
  }
  async getCommonData(token: string): Promise<boolean | null> {
    try {
      const common: any = await getCommonsRequest(token);
      const updateRolesData = useCommonStore.getState().updateRolesData;
      const updateDepartmentData =
        useCommonStore.getState().updateDepartmentData;
      const updateApproveUsersData =
        useCommonStore.getState().updateApproveUsersData;

      if (common && common.data.roles) {
        const formatted = common.data.roles.map((i: any) => {
          return {
            value: i.role_name?.toLowerCase?.(),
            name: i.role_name,
            description: i.description,
          };
        });
        updateRolesData(formatted);
      }

      if (common && common.data.departments) {
        updateDepartmentData(common.data.departments);
      }

      if (common && common.data.approve_users) {
        updateApproveUsersData(common.data.approve_users);
      }

      return true;
    } catch (error: any) {
      return false;
    }
  }

  async signOut(): Promise<any> {
    try {
      const res = await logoutRequest();
      deleteCookie("userRole");
      setCookie(ACCESS_TOKEN_KEY, "", {
        maxAge: 0,
        path: "/",
      });
      setCookie(REFRESH_TOKEN_KEY, "", {
        maxAge: 0,
        path: "/",
      });
      useCommonStore.getState().destroy();
      localStorage.clear();
      return res;
    } catch (error) {
      return error;
    }
  }
}
