import { AuthToken } from "@/core/entities/models/authToken.model";
import api from "../request";
import { ACCESS_TOKEN_KEY } from "@/utilities/static-value";
import { getCookie } from "cookies-next";

export interface LoginParams {
  email: string;
  password: string;
}

export function loginRequest(params: LoginParams) {
  return api.post(`/login`, params);
}

export interface RefeshTokenParams {
  refresh_token: string;
}

export function refreshToken(params: RefeshTokenParams) {
  return api.post(`/refresh`, params);
}

export function logoutRequest() {
  return api.post(`/logout`);
}

export const getUserRequest = async (token: AuthToken) => {
  return api.get("/my-page", {
    headers: {
      Authorization: `Bearer ${token.token}`,
    },
  });
};

export interface UserProfileParams {
  fullname: string;
  phone: string;
  birth_day: string;
  address: string;
  country: string;
  image: File | null;
  image_root?: File | null;
  updated_at: string | "";
}

export const updateUserRequest = async (params: FormData) => {
  const token = getCookie(ACCESS_TOKEN_KEY);
  return api.post("/my-page", params, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};
