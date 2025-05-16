import IconLogout from "@/app/assets/icons/iconLogout.svg";
import StyledOverlay from "@/components/common/StyledOverlay";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LogoutUseCase } from "@/core/application/usecases/auth/signOut.usecase";
import { AuthRepositoryImpl } from "@/core/infrastructure/repositories/auth.repo";
import { useEditingStore } from "@/stores/commonStore";
import { useStaffStore } from "@/stores/staffStore";
import { ACCESS_TOKEN_KEY } from "@/utilities/static-value";
import { getCookie } from "cookies-next";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const authRepo = new AuthRepositoryImpl();
const logoutUseCase = new LogoutUseCase(authRepo);

interface Props {
  isOpen: boolean;
}
export function AlertDialogLogoutButton(props: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const i18nCommon = useTranslations("Common");

  const { resetEdittingStaff } = useStaffStore((state) => state);
  const { resetEditingStore } = useEditingStore((state) => state);
  const onConfirmLogout = async () => {
    try {
      setLoading(true);
      const res: any = await logoutUseCase.execute();
      if (res.code == 0) {
        router.push("/login");
        resetEdittingStaff();
        resetEditingStore();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const token = useMemo(() => getCookie(ACCESS_TOKEN_KEY), []);

  useEffect(() => {
    if (!token) router.push("/login");
  }, [router, token]);

  return (
    <AlertDialog>
      <StyledOverlay isVisible={loading} />
      <AlertDialogTrigger asChild className=" laptop:mx-2 mobile:p-2 w-full">
        <Button
          disabled={loading}
          className="w-full flex-1 items-center justify-center bg-[#D14918CC] laptop:bg-red_login hover:bg-red_login_hover"
          style={{
            width: props.isOpen ? "60" : "unset",
          }}
        >
          <Image src={IconLogout} alt="" className="h-6 w-6" />
          {props.isOpen && (
            <p className="text-[16px] text-white laptop:ml-2 hidden laptop:block">
              {loading ? "Loading" : "Logout"}
            </p>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="gap-4 mobile:w-3/4  rounded-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Log Out</AlertDialogTitle>
          <AlertDialogDescription className={"text-left"}>
            Click logout to log out the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex flex-1 font-normal items-center justify-center laptop:justify-end gap-2 ">
            <AlertDialogCancel className="mt-0 w-[120px] text-[12px] laptop:text-[14px] h-8 laptop:h-11">
              {i18nCommon("closeButton")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmLogout}
              className="mb-0 w-[120px] font-normal text-white bg-red_login_hover text-[12px] laptop:text-[14px] h-8 laptop:h-11"
            >
              {i18nCommon("logoutButton")}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
