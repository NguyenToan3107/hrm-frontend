"use client";
import {
  CreateUsersParams,
  ResetPasswordParams,
  UpdateUsersParams,
} from "@/apis/modules/user";
import ArrowDownIcon from "@/app/assets/icons/icon-arrow-down.svg";
import { AlertDialogCancelFormButton } from "@/components/common/alert-dialog/AlertDialogCancelFormButton";
import { AlertDialogSubmitFormButton } from "@/components/common/alert-dialog/AlertDialogSubmitFormButton";
import { StyledDatePicker } from "@/components/common/StyledDatePicker";
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
import { CreateStaffUseCase } from "@/core/application/usecases/staff-master/createNewStaff.usecase";
import { EditStaffUseCase } from "@/core/application/usecases/staff-master/editStaff.usecase";
import { ResetPasswordStaffUseCase } from "@/core/application/usecases/staff-master/resetPasswordStaff.usecase";
import { UserRepositoryImpl } from "@/core/infrastructure/repositories/user.repo";
import useFocus from "@/hooks/use-focus";
import { toast } from "@/hooks/use-toast";
import useWindowSize from "@/hooks/useWindowSize";
import { useStaffStore } from "@/stores/staffStore";
import { formatDateToString, formatStringToDate } from "@/utilities/format";
import { COUNTRY } from "@/utilities/static-value";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import StyledSelected from "./StyledSelected";
import { useTranslations } from "next-intl";
import { isMobile } from "react-device-detect";
import useScrollToTopOnKeyboardHide from "@/hooks/useScrollToTopOnKeyboardHide";

const formSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^[0-9]*$/, "Phone number must contain only digits")
    .optional(),
  dateOfBirth: z
    .union([z.string(), z.date()])
    .refine(
      (value) => {
        const date = new Date(value);
        const today = new Date();
        return date < today;
      },
      {
        message: "Date of birth must be in the past",
      }
    )
    .transform((value) => new Date(value))
    .optional(),
  address: z.string().trim().optional(),
  country: z.string().trim().optional(),
});

const userRepo = new UserRepositoryImpl();
const editStaff = new EditStaffUseCase(userRepo);
const createStaff = new CreateStaffUseCase(userRepo);
const resetPasswordStaff = new ResetPasswordStaffUseCase(userRepo);

interface Props {
  changeTab(name: string): void;
  mode: "view" | "edit" | "create";
}

export default function PersonalInfoTab(props: Props) {
  const { mode } = props;
  const windowSize = useWindowSize();
  const isFocus = useFocus();
  const paramsPage = useParams();
  const router = useRouter();
  useScrollToTopOnKeyboardHide();

  const [loading, setLoading] = useState(false);
  const [formMaxHeight, setFormMaxHeight] = useState(windowSize.height);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
  const i18nStaff = useTranslations("Staff");

  const {
    isDirty,
    updateStaffEditing,
    editingStaff,
    selectedStaff,
    updateSelectedStaff,
    updateIsDirty,
    resetEdittingStaff,
  } = useStaffStore((state) => state);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber:
        mode == "create"
          ? editingStaff?.phone || undefined
          : selectedStaff?.phone,
      address:
        mode == "create"
          ? editingStaff?.address || undefined
          : selectedStaff?.address,
      country:
        mode == "create"
          ? editingStaff.country?.toString() || undefined
          : selectedStaff?.country,
      dateOfBirth:
        mode == "create"
          ? editingStaff?.birth_day
            ? formatStringToDate(editingStaff?.birth_day || "")
            : undefined
          : selectedStaff?.birth_day
          ? formatStringToDate(selectedStaff?.birth_day)
          : undefined,
    },
  });

  useEffect(() => {
    if (props.mode == "create") {
      setFormMaxHeight(
        windowSize.height - (isMobile ? 56 : 100) - 40 - 48 - 50 - 20 - 50 - 52
      );
    }
    if (props.mode == "view" || props.mode == "edit") {
      // setFormMaxHeight(windowSize.height - (isMobile ? 56 : 100) - 40 - 48 - 50 - 20 - 120);
      setFormMaxHeight(
        !isMobile
          ? windowSize.height -
              (isMobile ? 56 : 100) -
              40 -
              48 -
              50 -
              20 -
              120 -
              52
          : windowSize.height - (isMobile ? 56 : 100) - 40 - 48 - 40 - 116
      );
    }
  }, [props.mode, windowSize.height]);

  useEffect(() => {
    if (isFocus) {
      if (mode == "create") {
        if (editingStaff.phone)
          form.setValue("phoneNumber", editingStaff?.phone);
        if (editingStaff.birth_day)
          form.setValue(
            "dateOfBirth",
            formatStringToDate(editingStaff?.birth_day || "")
          );
        if (editingStaff.address)
          form.setValue("address", editingStaff?.address || "");
        if (editingStaff.country)
          form.setValue("country", editingStaff?.country || "");
      }
      if (mode == "view") {
        if (selectedStaff?.phone)
          form.setValue("phoneNumber", selectedStaff?.phone);
        if (selectedStaff?.birth_day)
          form.setValue(
            "dateOfBirth",
            formatStringToDate(selectedStaff?.birth_day || "")
          );
        if (selectedStaff?.address)
          form.setValue("address", selectedStaff?.address || "");
        if (selectedStaff?.country)
          form.setValue("country", selectedStaff?.country || "");
      }
      if (mode == "edit") {
        if (selectedStaff?.phone)
          form.setValue("phoneNumber", selectedStaff?.phone);
        if (selectedStaff?.birth_day)
          form.setValue(
            "dateOfBirth",
            formatStringToDate(selectedStaff?.birth_day || "")
          );
        if (selectedStaff?.address)
          form.setValue("address", selectedStaff?.address || "");
        if (selectedStaff?.country)
          form.setValue("country", selectedStaff?.country || "");
      }
    }
  }, [isFocus, selectedStaff?.updated_at]);

  const onUpdateProfessionalInfoStaff = async (
    data: z.infer<typeof formSchema>
  ) => {
    try {
      setLoading(true);
      if (!paramsPage.id) {
        toast({
          description: "User id not found",
          color: `bg-blue-200`,
        });
      }
      const params: UpdateUsersParams = {
        id: paramsPage.id,
        idkey: selectedStaff?.idkey || "",
        phone: data.phoneNumber,
        birth_day: formatDateToString(data.dateOfBirth || ""),
        address: data.address,
        country: data.country,
        username: selectedStaff?.username || "",
        status_working: selectedStaff?.status_working || "",
        email: selectedStaff.email || "",
        // position: selectedStaff?.position_id || "",
        role: selectedStaff?.role?.name || "",
        started_at: selectedStaff.started_at || "",
        department_ids: selectedStaff.department || [],
        updated_at: selectedStaff.updated_at || "",
        leader_id: selectedStaff.leader_id || "",
        gender: selectedStaff.gender,
      };
      const result = await editStaff.execute(params);
      if (result?.code == 0) {
        toast({
          description: "Update staff information successfully",
          color: `bg-blue-200`,
        });
        updateSelectedStaff(result.data);
        // router.back();
        goToDetailScreen();
      } else {
        toast({
          description: "Update staff information failed",
          color: "bg-red-100",
        });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onSaveEditingStaff = (data: z.infer<typeof formSchema>) => {
    updateStaffEditing({
      phone: data.phoneNumber,
      birth_day: formatDateToString(data.dateOfBirth || ""),
      address: data.address,
      country: data.country,
    });
    props.changeTab("professional");
  };

  const onCreateStaff = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const params: CreateUsersParams = {
        idkey: editingStaff?.idkey || "",
        status_working: editingStaff?.status_working || "",
        email: editingStaff?.email || "",
        gender: editingStaff?.gender || "",
        role: editingStaff?.role?.name || "staff",
        started_at: editingStaff.started_at || "",
        department_ids: editingStaff.department || [],
        leader_id: editingStaff?.leader_id || "",
        time_off_hours: editingStaff.time_off_hours || 0,
        last_year_time_off: editingStaff.last_year_time_off || 0,
        fullname: editingStaff?.fullname || "",
        phone: data?.phoneNumber || editingStaff?.phone || "",
        birth_day:
          formatDateToString(data.dateOfBirth || "") || editingStaff?.birth_day,
        country: data?.country || editingStaff?.country || "",
        address: data?.address || editingStaff?.address || "",
      };
      const result = await createStaff.execute(params);
      if (result?.code == 0) {
        toast({
          description: "Create staff successfully",
          color: `bg-blue-200`,
        });
        form.reset();
        resetEdittingStaff();
        router.replace(`/staffs`);
      } else {
        if (result?.data?.idkey) {
          toast({
            description: result?.data?.idkey?.[0],
            color: "bg-red-100",
          });
        } else if (result?.data?.email) {
          toast({
            description: result?.data?.email?.[0],
            color: "bg-red-100",
          });
        } else {
          toast({
            description: "Create staff failed",
            color: `bg-red-100`,
          });
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onResetPasswordStaff = async () => {
    try {
      setLoading(true);
      if (!paramsPage.id) {
        toast({
          description: "User id not found",
          color: `bg-blue-200`,
        });
      }

      const params: ResetPasswordParams = {
        id: paramsPage.id,
        updated_at: selectedStaff.updated_at || "",
      };

      const response = await resetPasswordStaff.execute(params);
      if (response?.code == 0) {
        toast({
          description: "Reset password staff successfully",
          color: `bg-blue-200`,
        });
        updateSelectedStaff(response.data);
        // router.back();
      } else {
        toast({
          description: "Reset password staff failed",
          color: "bg-red-100",
        });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (mode == "edit") {
      // onUpdateProfessionalInfoStaff(data);
      setOpenSubmitDialog(true);
    } else {
      onCreateStaff(data);
    }
  };

  const onGoBack = async (data: z.infer<typeof formSchema>) => {
    if (mode == "edit") {
      // onUpdateProfessionalInfoStaff(data);
      setOpenSubmitDialog(true);
    } else {
      onSaveEditingStaff(data);
    }
  };

  const isDirtyCreate = useMemo(() => {
    const values = form.getValues();
    return (
      values?.phoneNumber !== undefined ||
      values?.country !== undefined ||
      values?.dateOfBirth !== undefined ||
      values?.address !== undefined
    );
  }, Object.values(form.watch()));

  const isDirtyEdit = useMemo(() => {
    const values = form.getValues();

    const birthDay = selectedStaff?.birth_day ?? undefined;
    return values?.phoneNumber !== selectedStaff?.phone ||
      values?.country !== selectedStaff?.country ||
      values?.dateOfBirth == undefined
      ? values?.dateOfBirth !== birthDay
      : formatDateToString(values?.dateOfBirth || "") !== birthDay ||
          values?.address !== selectedStaff?.address;
  }, Object.values(form.watch()));

  const onCancelForm = () => {
    if (props.mode == "edit") {
      if (isDirtyEdit) {
        setOpenCancelDialog(true);
      } else {
        goToDetailScreen();
      }
    }
  };

  const onSubmitForm = () => {
    if (props.mode == "edit") {
      const data = form.getValues();
      onUpdateProfessionalInfoStaff(data);
    }
  };

  useEffect(() => {
    if (props.mode == "edit") {
      updateIsDirty(isDirtyEdit);
    }
  }, [isDirtyEdit]);

  useEffect(() => {
    if (props.mode == "create") {
      if (isDirtyCreate && isDirty) {
        updateIsDirty(true);
      }
      if (!isDirty && !isDirtyCreate) {
        updateIsDirty(false);
      }
      if (!isDirty && isDirtyCreate) {
        updateIsDirty(true);
      }
      if (isDirty && !isDirtyCreate) {
        updateIsDirty(true);
      }
    }
  }, [isDirtyCreate]);

  const onConfirmPopupStaffList = () => {
    if (props.mode == "create") {
      if (isDirtyCreate) {
        setOpenCancelDialog(true);
      } else {
        router.replace(`/staffs`);
      }
    }
  };

  const goToDetailScreen = () => {
    form.reset();
    resetEdittingStaff();
    if (props.mode == "create") {
      router.replace(`/staffs`);
    } else if (props.mode == "edit") {
      if (selectedStaff?.id) {
        router.push(`/staffs/detail-staff/${selectedStaff?.id}`);
      }
    }
  };

  const goToEditScreen = () => {
    router.push(`/staffs/edit-staff/${selectedStaff?.id || "undefined"}`);
  };

  const onClickResetPasswordButton = () => {
    setOpenResetPasswordDialog(true);
  };

  return (
    <div
      style={{
        maxHeight: formMaxHeight,
        minHeight: formMaxHeight,
      }}
      className="flex flex-1 h-full rounded-md "
    >
      <StyledOverlay isVisible={loading} />
      <Form {...form}>
        <form
          contentEditable={false}
          onSubmit={form.handleSubmit(onSubmit)}
          style={{
            maxHeight: formMaxHeight,
            minHeight: formMaxHeight,
          }}
          className=" flex flex-col flex-1 space-y-4 mt-1  w-full p-2 laptop:p-5  rounded-md  overflow-y-auto hide-scrollbar"
        >
          <div
            className={
              "flex flex-col laptop:flex-row items-start justify-between gap-x-5  space-y-4 laptop:space-y-0"
            }
          >
            <FormField
              control={form.control}
              name={"dateOfBirth"}
              render={({ field, fieldState }) => (
                <FormItem className="w-full laptop:w-1/2" tabIndex={3}>
                  <FormLabel
                    className={"font-normal text-[14px] text-secondary"}
                  >
                    Date Of Birth
                  </FormLabel>
                  <FormControl>
                    <StyledDatePicker
                      disabled={mode == "view"}
                      field={field}
                      title={""}
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
              name={"phoneNumber"}
              disabled={mode == "view"}
              render={({ field, fieldState }) => (
                <FormItem className="w-full laptop:w-1/2" tabIndex={2}>
                  <FormLabel
                    className={"font-normal text-[14px] text-secondary "}
                  >
                    Phone number
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border border-border px-2 focus:border-primary h-10"
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
          </div>
          <div
            className={
              "flex flex-col laptop:flex-row items-start justify-between gap-x-5  space-y-4 laptop:space-y-0"
            }
          >
            <FormField
              control={form.control}
              name="country"
              disabled={mode == "view"}
              render={({ field, fieldState }) => (
                <FormItem className="w-full laptop:w-1/2" tabIndex={5}>
                  <FormLabel
                    className={"font-normal text-[14px] text-secondary"}
                  >
                    Country
                  </FormLabel>
                  <StyledSelected
                    items={COUNTRY}
                    field={field}
                    disabled={mode == "view"}
                    iconRight={ArrowDownIcon}
                  />
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
              name={"address"}
              disabled={mode == "view"}
              render={({ field, fieldState }) => (
                <FormItem className="w-full laptop:w-1/2" tabIndex={4}>
                  <FormLabel
                    className={"font-normal text-[14px] text-secondary "}
                  >
                    Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="border border-border focus:border-primary px-2 h-10"
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
          </div>
          {props.mode == "create" && (
            <div className="fixed bottom-[8px] laptop:bottom-[52px] right-0 laptop:right-[68px] left-0 laptop:left-auto flex flex-1 justify-end items-end gap-x-2 mx-4 laptop:mx-0">
              <Button
                onClick={onConfirmPopupStaffList}
                type="button"
                className="laptop:hidden w-[100px] h-8 font-normal text-[12px] bg-white hover:bg-secondary border border-border"
              >
                {i18nStaff("backStaffListButton")}
              </Button>
              <Button
                variant="outline"
                disabled={loading}
                onClick={form.handleSubmit(onGoBack)}
                tabIndex={6}
                className="w-[100px] laptop:w-[152px] h-8 laptop:h-[50px] font-normal border-border bg-white text-[12px] laptop:text-[14px] hover:bg-gray-100 rounded-lg"
                type="button"
              >
                {i18nStaff("backButton")}
              </Button>
              <Button
                // disabled={loading}
                tabIndex={3}
                className="w-[100px] laptop:w-[152px] h-8 laptop:h-[50px] font-normal text-white text-[12px] laptop:text-[14px] bg-button-create hover:bg-button-create-hover rounded-lg"
                type="submit"
              >
                {i18nStaff("createButton")}
              </Button>
            </div>
          )}

          {props.mode == "view" && (
            <div className="fixed bottom-[8px] laptop:bottom-[52px] right-0 laptop:right-[68px] left-0 laptop:left-auto flex flex-1 flex-row justify-end items-end gap-x-2 gap-y-3 mx-4 laptop:mx-0">
              <Button
                onClick={() => {
                  router.replace(`/staffs`);
                }}
                type="button"
                className="w-[100px] h-8 laptop:hidden font-normal text-[12px] bg-white hover:bg-secondary border border-border"
              >
                {i18nStaff("backStaffListButton")}
              </Button>
              <Button
                onClick={onClickResetPasswordButton}
                variant="outline"
                tabIndex={3}
                className="w-[100px] laptop:w-[152px] h-8 laptop:h-[50px] font-normal text-[12px] laptop:text-[16px] border-border bg-primary text-white hover:bg-primary-hover rounded-lg"
                type="button"
              >
                {i18nStaff("resetPasswordButton")}
              </Button>
              <Button
                type="button"
                onClick={goToEditScreen}
                className="w-[100px] laptop:hidden h-8 laptop:h-[50px] font-normal text-white text-[12px] laptop:text-[16px] bg-button-edit hover:bg-button-edit-hover rounded-lg"
              >
                <p className={"text-white"}>{i18nStaff("editButton")}</p>
              </Button>
            </div>
          )}

          {props.mode == "edit" && (
            <div className="fixed bottom-[8px] laptop:bottom-[52px] right-0 laptop:right-[68px] left-0 laptop:left-auto flex flex-1 flex-row laptop:flex-row justify-end items-end gap-x-2 gap-y-3 mx-4 laptop:mx-0">
              <Button
                onClick={onCancelForm}
                variant="outline"
                // disabled={loading}
                tabIndex={3}
                className="w-[100px] laptop:w-[152px] h-8 laptop:h-[50px] font-normal border-border bg-white text-[14px] hover:bg-gray-100 rounded-lg"
                type="button"
              >
                {i18nStaff("cancelButton")}
              </Button>
              <Button
                disabled={loading}
                tabIndex={7}
                className="w-[100px] laptop:w-[152px] h-8 laptop:h-[50px] font-normal text-white text-[14px] hover:bg-primary-hover rounded-lg"
                type="submit"
              >
                {i18nStaff("saveButton")}
              </Button>
            </div>
          )}
        </form>
      </Form>

      <AlertDialogCancelFormButton
        tabIndex={16}
        title={
          props.mode == "create"
            ? "Back to staff list page"
            : "Back to detail page"
        }
        onConfirm={goToDetailScreen}
        mode={props.mode}
        open={openCancelDialog}
        onOpenChange={setOpenCancelDialog}
      />

      <AlertDialogSubmitFormButton
        tabIndex={16}
        title={"Submit form"}
        onConfirm={onSubmitForm}
        // mode={props.mode}
        open={openSubmitDialog}
        onOpenChange={setOpenSubmitDialog}
      />

      <AlertDialogSubmitFormButton
        tabIndex={16}
        title={"Submit reset password"}
        onConfirm={onResetPasswordStaff}
        // mode={props.mode}
        open={openResetPasswordDialog}
        onOpenChange={setOpenResetPasswordDialog}
      />
    </div>
  );
}
