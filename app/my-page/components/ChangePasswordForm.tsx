"use client";
import StyledOverlay from "@/components/common/StyledOverlay";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LogoutUseCase } from "@/core/application/usecases/auth/signOut.usecase";
import { ChangePasswordUseCase } from "@/core/application/usecases/my-page/changePassword.usecase";
import { Password } from "@/core/entities/models/password.model";
import { AuthRepositoryImpl } from "@/core/infrastructure/repositories/auth.repo";
import { UserRepositoryImpl } from "@/core/infrastructure/repositories/user.repo";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { setCookie } from "cookies-next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import iconEyeOn from "../../assets/icons/iconEye.svg";
import iconEyeOff from "../../assets/icons/iconEyeOff.svg";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/utilities/static-value";
import { useRouter } from "next/navigation";
import { AlertDialogSubmitFormButton } from "@/components/common/alert-dialog/AlertDialogSubmitFormButton";
import { useTranslations } from "next-intl";
import useWindowSize from "@/hooks/use-dimession";
import { isMobile } from "react-device-detect";

const formSchema = z
  .object({
    currentPassword: z
      .string()
      .trim()
      .min(1, { message: "Current password is required" })
      .min(8, {
        message: "Current password does not meet the required format",
      }),
    newPassword: z
      .string()
      .trim()
      .min(1, { message: "New password is required" })
      .min(8, { message: "New password does not meet the required format" }),
    confirmPassword: z
      .string()
      .trim()
      .min(1, { message: "Confirmation password is required" })
      .min(8, {
        message: "Confirmation password does not meet the required format",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Confirmation password does not match the new password.",
    path: ["confirmPassword"], // Set the error path to `confirmPassword`
  });
const userRepo = new UserRepositoryImpl();
const changePassword = new ChangePasswordUseCase(userRepo);

const authRepo = new AuthRepositoryImpl();
const logoutUseCase = new LogoutUseCase(authRepo);

export default function ChangePasswordForm() {
  const [hideCurrentPassword, setHideCurrentPassword] = useState(true);
  const [hideNewPassword, setHideNewPassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const useDimession = useWindowSize();
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const myPage = useTranslations("MyPage");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmitChangePassword = async () => {
    const data = form.getValues();
    // FLOW: UI -> use cases -> repositories -> API
    try {
      setLoading(true);
      const params: Password = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };
      const res = await changePassword.execute(params);
      if (res?.code === 0) {
        toast({
          description: "Change password success",
          color: "bg-blue-200",
        });
        const resLogOut: any = await logoutUseCase.execute();
        if (resLogOut.code == 0) {
          setCookie(ACCESS_TOKEN_KEY, "", {
            maxAge: 0,
            path: "/",
          });
          setCookie(REFRESH_TOKEN_KEY, "", {
            maxAge: 0,
            path: "/",
          });
          router.push("/login");
        }
      } else {
        if (res?.data?.error_code === "CURRENT_PASSWORD_IS_CORRECT") {
          toast({
            description: "Current password is incorrect.",
            color: "bg-red-100",
          });
        } else if (
          res?.data?.error_code === "NEW_PASSWORD_NOT_THE_SAME_CURRENT_PASSWORD"
        ) {
          toast({
            description: "New password is the same as the current password.",
            color: "bg-red-100",
          });
        } else {
          toast({
            description: "Change password failed",
            color: "bg-red-100",
          });
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = () => {
    setOpenSubmitDialog(true);
  };
  const onClearForm = () => {
    form.reset();
  };

  const toggleHideCurrentPassword = () => {
    setHideCurrentPassword(!hideCurrentPassword);
  };
  const toggleHideNewPassword = () => {
    setHideNewPassword(!hideNewPassword);
  };
  const toggleHideConfirmPassword = () => {
    setHideConfirmPassword(!hideConfirmPassword);
  };

  return (
    <div
      className="flex flex-1 h-full"
      style={{
        maxHeight: useDimession.height - 100 - 100 - (isMobile ? 0 - 16 - 8 : 120 + 36),
        minHeight: useDimession.height - 100 - 100 - (isMobile ? 0 - 16 - 8 : 120 + 36),
        scrollbarWidth: "none",
      }}
    >
      <StyledOverlay isVisible={loading} />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 w-full p-4 "
        >
          <FormField
            control={form.control}
            name={"currentPassword"}
            render={({ field, fieldState }) => (
              <FormItem className="laptop:w-1/2 w-full">
                <FormLabel className="text-[#A2A1A8] font-light text-[0.9rem]">
                  Current Password
                </FormLabel>
                <FormControl>
                  <Input
                    tabIndex={1}
                    {...field}
                    className="border border-border focus:border-primary px-2"
                    type={hideCurrentPassword ? "password" : "text"}
                    endIcon={hideCurrentPassword ? iconEyeOff : iconEyeOn}
                    endIconOnClick={toggleHideCurrentPassword}
                  />
                </FormControl>
                {fieldState.error?.message && (
                  <p className={"text-red-500 text-[10px]"}>
                    {fieldState.error?.message}
                  </p>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={"newPassword"}
            render={({ field, fieldState }) => (
              <FormItem className="laptop:w-1/2 w-full">
                <FormLabel className="text-[#A2A1A8] font-light text-[0.9rem]">
                  New Password
                </FormLabel>
                <FormControl>
                  <Input
                    tabIndex={2}
                    {...field}
                    className="border border-border focus:border-primary px-2"
                    type={hideNewPassword ? "password" : "text"}
                    endIcon={hideNewPassword ? iconEyeOff : iconEyeOn}
                    endIconOnClick={toggleHideNewPassword}
                  />
                </FormControl>
                {fieldState.error?.message && (
                  <p className={"text-red-500 text-[10px]"}>
                    {fieldState.error?.message}
                  </p>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={"confirmPassword"}
            render={({ field, fieldState }) => (
              <FormItem className="laptop:w-1/2 w-full">
                <FormLabel className="text-[#A2A1A8] font-light text-[0.9rem]">
                  Confirm New Password
                </FormLabel>
                <FormControl>
                  <Input
                    tabIndex={3}
                    {...field}
                    className="border border-border focus:border-primary px-2"
                    type={hideConfirmPassword ? "password" : "text"}
                    endIcon={hideConfirmPassword ? iconEyeOff : iconEyeOn}
                    endIconOnClick={toggleHideConfirmPassword}
                  />
                </FormControl>
                {fieldState.error?.message && (
                  <p className={"text-red-500 text-[10px]"}>
                    {fieldState.error?.message}
                  </p>
                )}
              </FormItem>
            )}
          />
          <div className="fixed flex flex-row justify-end gap-3 bottom-[8px] laptop:bottom-[66px] right-6 mobile:left-0 laptop:right-[54px]">
            <Button
              onClick={onClearForm}
              variant="outline"
              disabled={loading}
              tabIndex={4}
              className="w-[100px] laptop:w-[152px] h-8 laptop:h-[50px] font-normal laptop:font-medium border-border bg-white text-[12px] laptop:text-[14px] hover:bg-gray-100 rounded-lg"
              type="button"
            >
              {myPage("clearButton")}
            </Button>
            <Button
              disabled={loading}
              tabIndex={5}
              className="w-[152px] h-8 laptop:h-[50px] font-normal laptop:font-medium text-white text-[12px] laptop:text-[14px] hover:bg-primary-hover rounded-lg"
              type="submit"
            >
              {loading ? "Loading" : myPage("changePasswordButton")}
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialogSubmitFormButton
        tabIndex={16}
        title={"Submit form"}
        onConfirm={onSubmitChangePassword}
        // mode={props.mode}
        open={openSubmitDialog}
        onOpenChange={setOpenSubmitDialog}
      />
    </div>
  );
}
