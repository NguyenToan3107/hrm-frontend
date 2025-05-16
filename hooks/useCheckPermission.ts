import { refreshToken } from "@/apis/modules/auth";
import { useUserStore } from "@/stores/userStore";
import {
  ACCESS_TOKEN_EXPIRED_TIME,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_EXPIRED_TIME,
  REFRESH_TOKEN_KEY,
  SIDEBAR_ITEMS,
} from "@/utilities/static-value";
import { getCookie, setCookie } from "cookies-next";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { ShowMyPageUseCase } from "@/core/application/usecases/my-page/showMyPage.usecase";
import { UserRepositoryImpl } from "@/core/infrastructure/repositories/user.repo";
import { User } from "@/core/entities/models/user.model";

const userRepo = new UserRepositoryImpl();
const getProfileUserUseCase = new ShowMyPageUseCase(userRepo);

export const useCheckPermission = (permissionRequired?: string[]) => {
  const [loading, setLoading] = useState(true);
  const pathName = usePathname();
  const { setUser } = useUserStore((state) => state);

  const getProfileUser = async () => {
    try {
      setLoading(true);
      const res = await getProfileUserUseCase.execute();
      setUser(res?.data);
      checkUserPermisstion(res?.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onRefreshToken = async () => {
    try {
      const refresh_token = getCookie(REFRESH_TOKEN_KEY);
      if (!refresh_token) {
        if (pathName != "/login") {
          window.location.replace(`/login`);
        } else {
          setLoading(false);
        }
      } else {
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
        getProfileUser();
      }
    } catch (error) {
      if (pathName != "/login") {
        window.location.replace(`/login`);
      } else {
        setLoading(false);
      }
    }
  };
  const checkUserPermisstion = (user: User) => {
    const userRole = user.role;
    if (!userRole?.permissions) {
      window.location.replace(`/error`);
    }
    if (pathName == "/login") {
      setLoading(false);
      window.location.replace(`${SIDEBAR_ITEMS[0].route}`);
      return;
    }
    if (!permissionRequired) {
      setLoading(false);
      return;
    } else if (permissionRequired) {
      if (userRole?.name.includes("admin")) {
        setLoading(false);
      } else {
        const isLoading = permissionRequired.every((permission) =>
          userRole?.permissions.includes(permission)
        );
        if (isLoading) {
          setLoading(false);
        } else {
          setLoading(true);
          window.location.replace(`/error`);
        }
      }
    }
  };
  useLayoutEffect(() => {
    const token = getCookie("ACCESS_TOKEN_KEY");
    if (!token) {
      onRefreshToken();
    } else {
      getProfileUser();
    }
  }, []);
  return { loading };
};
