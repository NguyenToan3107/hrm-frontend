import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import {
  ACCESS_TOKEN_EXPIRED_TIME,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_EXPIRED_TIME,
  REFRESH_TOKEN_KEY,
} from "@/utilities/static-value";
import axios, { AxiosError } from "axios";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { refreshToken } from "./modules/auth";

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
  },
});

let isRefreshing = false;
let failedQueue: Array<Function> = [];

// Hàm gọi API để refresh token
export const refreshAccessToken = async () => {
  try {
    const refresh_token = getCookie(REFRESH_TOKEN_KEY);
    if (!refresh_token) {
      window.location.replace(`/login`);
      return;
    }

    // Gửi yêu cầu refresh token
    const response = await refreshToken({ refresh_token });

    // Cập nhật token mới vào cookie
    const newAccessToken = response.data.access_token;
    const newRefreshToken = response.data.refresh_token;

    setCookie(ACCESS_TOKEN_KEY, newAccessToken, {
      maxAge: ACCESS_TOKEN_EXPIRED_TIME,
      path: "/",
    });
    setCookie(REFRESH_TOKEN_KEY, newRefreshToken, {
      maxAge: REFRESH_TOKEN_EXPIRED_TIME,
      path: "/",
    });

    // Giải quyết các request đang chờ đợi
    failedQueue.forEach((resolve) => resolve());
    failedQueue = []; // Dọn dẹp hàng đợi

    return newAccessToken;
  } catch (error) {
    throw error;
  }
};

// Interceptor cho request để thêm Authorization header
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const token = getCookie(ACCESS_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = "Bearer " + token;
      }
      return config;
    } else {
      return config;
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor cho response để xử lý lỗi 401 và refresh token
api.interceptors.response.use(
  (response) => {
    // Nếu response trả về mã thành công và mã lỗi là 0
    if (response.data.code === 0) {
      response.data.formattedResponse = {
        data: response?.data?.data,
        code: response?.data?.code,
        message: response?.data?.message || "",
        requestStatus: response.status,
        totalItem: response?.data?.total,
      };
      return response.data.formattedResponse;
    }
    return Promise.reject(formatErrorResponse(response.data));
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;
    // Xử lý lỗi 401 (Unauthorized) - token hết hạn
    if (error.response?.status === 403) {
      window.location.replace("/error");
      return Promise.reject(error);
    } else if (error.response?.status === 401 && originalRequest) {
      if (isRefreshing) {
        // Nếu đang làm mới token, chỉ cần đợi kết quả
        return new Promise((resolve) => {
          failedQueue.push(resolve); // Lưu lại các request bị lỗi vào hàng đợi
        });
      }

      isRefreshing = true;
      deleteCookie(ACCESS_TOKEN_KEY);

      try {
        // Thực hiện làm mới token
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Gửi lại request gốc với token mới
        const response = await axios(originalRequest);

        // Định dạng lại dữ liệu trước khi trả về
        if (response.data.code === 0) {
          response.data.formattedResponse = {
            data: response?.data?.data,
            code: response?.data?.code,
            message: response?.data?.message || "",
            requestStatus: response.status,
            totalItem: response?.data?.total,
          };
          return response.data.formattedResponse;
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false; // Đặt lại trạng thái khi refresh xong
      }
    } else {
      // Nếu không phải lỗi 401 hoặc trường hợp khác, trả về lỗi bình thường
      return Promise.reject(formatErrorResponse(error));
    }
  }
);

export default api;

// Hàm định dạng lỗi
function formatErrorResponse(error: any): CommonResponse {
  return {
    data: error.response?.data?.data || [],
    code: error.response?.data?.code || 1,
    message: error.response?.data?.message || "",
    requestStatus: error.response?.status || 500,
    errorCode: error.response?.data?.data?.error_code || 0,
    totalItem: 0,
  };
}
