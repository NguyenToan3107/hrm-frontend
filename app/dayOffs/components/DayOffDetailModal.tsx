"use client";
import { GetDayOffParams, UpdateDayOffParams } from "@/apis/modules/schedule";
import DefaultImage from "@/app/assets/avatar/avatar_default.svg";
import { AlertDialogCancelLeaveButton } from "@/components/common/alert-dialog/AlertDialogCancelLeaveButton";
import { AlertDialogSubmitFormButton } from "@/components/common/alert-dialog/AlertDialogSubmitFormButton";
import { StyledMessageAlertDialog } from "@/components/common/alert-dialog/StyledMessageAlertDialog";
import StyledAvatarPreview from "@/components/common/StyledAvatarPreview";
import { StyledDatePicker } from "@/components/common/StyledDatePicker";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GetDayOffUseCase } from "@/core/application/usecases/schedule/getDayOff.usecase";
import { UpdateDayOffUseCase } from "@/core/application/usecases/schedule/updateDayOff.usecase";
import { DayOff } from "@/core/entities/models/dayoff.model";
import { ScheduleRepositoryImpl } from "@/core/infrastructure/repositories/schedule.repo";
import { toast } from "@/hooks/use-toast";
import useWindowSize from "@/hooks/useWindowSize";
import { useUserStore } from "@/stores/userStore";
import { FormModeType } from "@/utilities/enum";
import { formatDateToString } from "@/utilities/format";
import { convertHourToDay } from "@/utilities/helper";
import { DAY_OFF_STATUS, MAX_LENGTH_TEXT } from "@/utilities/static-value";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

interface Props {
  isOpen: boolean;
  onClose(): void;
  idLeave: number | undefined;
  setLoading(value: boolean): void;
  loading: boolean;
}

const scheduleRepo = new ScheduleRepositoryImpl();
const getDayOffUseCase = new GetDayOffUseCase(scheduleRepo);
const updateDayOffDetailUseCase = new UpdateDayOffUseCase(scheduleRepo);

const formSchema = z.object({
  dayOffDate: z.union([
    z.string({ message: "Day Off Date is required" }),
    z.date(),
  ]),
  title: z
    .string({ message: "Title is required" })
    .trim()
    .max(MAX_LENGTH_TEXT, {
      message: "Title too long",
    }),
  description: z
    .string({ message: "Description is required" })
    .max(MAX_LENGTH_TEXT, {
      message: `Description must not be longer than ${MAX_LENGTH_TEXT} characters.`,
    }),
  type: z.enum(["0", "1", "none"], {
    required_error: "Type is required",
  }),
  status: z.string().trim(),
});

export default function DayOffDetailModal(props: Props) {
  const { isOpen, onClose, idLeave, setLoading } = props;
  const [dayOff, setDayOff] = useState<DayOff>();
  const formLeaveRef = useRef<any>(null);
  const useDimession = useWindowSize();
  const { user } = useUserStore();
  const router = useRouter();

  const [mode, setMode] = useState(FormModeType.VIEW); // 0: view, 1: edit
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState(false);
  // const [loadingEdit, setLoadingEdit] = useState(false);
  const i18nLeave = useTranslations("Leave");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dayOffDate: "",
      status: undefined,
      description: undefined,
      title: undefined,
    },
  });

  const isCreateLeavebutton = useMemo(() => {
    const userRole = user?.role;
    return userRole?.permissions?.includes("leave_create");
  }, []);

  const onLoadDayOffDetail = async () => {
    try {
      setLoading(true);
      const params: GetDayOffParams = { id: idLeave };
      const response = await getDayOffUseCase.execute(params);
      setDayOff(response?.data);
      form.setValue("dayOffDate", response?.data?.day_off);
      form.setValue("status", response?.data?.status);
      form.setValue("description", response?.data?.description || "");
      form.setValue("title", response?.data?.title || "");
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onSetEditMode = async () => {
    formLeaveRef.current?.toggleDisable(false);
    setMode(FormModeType.EDIT);
  };

  const onUpdateFormLeave = () => {
    setOpenSubmitDialog(true);
  };

  const onUpdateLeave = async () => {
    try {
      setLoading(true);
      const data = form.getValues();
      if (!dayOff?.id) return;

      const updateParams: UpdateDayOffParams = {
        id: dayOff?.id,
        updated_at: dayOff?.updated_at || "",
        description: data.description,
        status: data.status,
        day_off: data.dayOffDate,
        title: data.title,
      };
      const result = await updateDayOffDetailUseCase.execute(updateParams);
      if (result?.code == 0) {
        toast({
          description: "Update day off information successfully",
          color: `bg-blue-200`,
        });
        onClose();
      } else {
        toast({
          description: "Update day off information failed",
          color: "bg-red-100",
        });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const goToErrorPage = () => {
    setAlertDialogMessage(false);
    router.replace("/error");
  };

  const isDirty = useMemo(() => {
    const values = form.getValues();
    const title = dayOff?.title ? dayOff?.title?.trim() : "";
    return dayOff
      ? values?.description?.trim() !== dayOff?.description?.trim() ||
          values?.title?.trim() !== title ||
          String(values?.status) !== String(dayOff?.status) ||
          formatDateToString(values?.dayOffDate) !== dayOff?.day_off
      : false;
  }, Object.values(form.watch()));

  useEffect(() => {
    onLoadDayOffDetail();
  }, []);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-10">
      <div
        className="bg-white flex flex-col justify-between rounded-sm shadow-lg w-[864px] px-8 py-4"
        style={{
          maxHeight: useDimession.height * 0.8,
          minHeight: useDimession.height * 0.8,
          scrollbarWidth: "none",
        }}
      >
        <div className="flex justify-center items-end gap-2">
          <h2 className="text-xl font-bold">Day Off Infomation</h2>
        </div>
        <div className="flex flex-col items-start w-full">
          <h3 className="font-bold mb-3">Requestor Information</h3>
          <div className="flex flex-row justify-start gap-6 h-[132px]">
            <div className="flex items-center justify-center h-full aspect-square">
              <StyledAvatarPreview
                image={
                  user?.image
                    ? `${process.env.NEXT_PUBLIC_BASE_URL_IMAGE}${user.image}`
                    : DefaultImage
                }
                className="object-contain rounded-lg w-[143px] h-[132px] cursor-pointer"
                height={132}
                width={143}
              />
            </div>
            <div className="h-full w-[460px] flex flex-col items-center justify-center rounded-[4px] border-[2px] border-opacity-25 border-black px-2 flex-1">
              <table className="w-full h-full flex justify-start items-center">
                <tbody>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-6">
                      Employee ID:
                    </td>
                    <td className="text-[14px] font-normal leading-6 px-2">
                      {user?.idkey}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-6">
                      Full name:
                    </td>
                    <td className="text-[14px] font-normal leading-6 px-2">
                      {user?.fullname}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-6">
                      Contact:
                    </td>
                    <td className="text-[14px] font-normal leading-6 px-2">
                      {user?.phone}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-6">
                      Leave hour:
                    </td>
                    <td className="text-[14px] font-normal leading-6 px-2">
                      {convertHourToDay(
                        user?.time_off_hours,
                        user?.last_year_time_off
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-6">
                      Allocated hour:
                    </td>
                    <td className="text-[14px] font-normal leading-6 px-2">
                      {convertHourToDay(user?.allocated_hour, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <h3 className="font-bold mt-3 mb-3">Day Off Detail</h3>
        <div
          className={twMerge(
            "flex flex-col items-start w-full h-full overflow-y-auto flex-1 p-2  rounded-sm",
            mode == FormModeType.VIEW && `bg-orange-50`
          )}
          style={{
            scrollbarWidth: "none",
          }}
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onUpdateFormLeave)}
              className="space-y-8 w-full"
            >
              <div className="flex flex-col h-full">
                <div className="flex flex-col laptop:flex-row laptop:justify-start gap-3 pb-[18px] laptop:gap-0 laptop:gap-x-4">
                  <FormField
                    control={form.control}
                    name={"dayOffDate"}
                    render={({ field, fieldState }) => {
                      return (
                        <FormItem>
                          <div className="bg-white rounded-sm px-1 border border-[#A2A1A8] w-full laptop:w-[242px]">
                            <FormLabel>Date</FormLabel>
                            <FormControl tabIndex={11}>
                              <StyledDatePicker
                                field={field}
                                title={""}
                                triggerClass="h-8 border-none rounded-md px-0"
                              />
                            </FormControl>
                          </div>
                          {fieldState.error?.message && (
                            <p className={"text-red-500 text-[10px]"}>
                              {fieldState.error?.message}
                            </p>
                          )}
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="bg-white rounded-sm p-1 border border-[#A2A1A8] w-full laptop:w-[242px]">
                          <FormLabel>Status</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl tabIndex={12}>
                              <SelectTrigger
                                defaultValue={field.value}
                                style={{
                                  color: !field.value
                                    ? "var(--secondary)"
                                    : "black",
                                }}
                                className="h-6 rounded-none px-0 disabled:opacity-100"
                              >
                                <SelectValue
                                  className="w-full text-black"
                                  placeholder="All day"
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white">
                              {DAY_OFF_STATUS.map((item) => {
                                return (
                                  <SelectItem
                                    key={item.value}
                                    value={String(item.value)}
                                  >
                                    {item.name}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                        {fieldState.error?.message && (
                          <p className={"text-red-500 text-[10px]"}>
                            {fieldState.error?.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="bg-white flex flex-col rounded-sm p-1 border border-[#A2A1A8] w-full">
                        <div className="flex flex-row items-center">
                          <FormLabel>Title</FormLabel>
                          <p className={"text-red-500 leading-none"}>*</p>
                        </div>
                        <FormControl tabIndex={13}>
                          <Textarea
                            className="p-0 min-h-[60px]"
                            {...field}
                            maxLength={MAX_LENGTH_TEXT}
                          />
                        </FormControl>
                      </div>
                      <div className="flex flex-row justify-between">
                        {fieldState.error?.message && (
                          <p className={"text-red-500 text-[10px]"}>
                            {fieldState.error?.message}
                          </p>
                        )}
                        <div
                          className={`text-[12px] ${
                            field.value?.length >= MAX_LENGTH_TEXT
                              ? "text-red-500"
                              : "text-gray-500"
                          }  ml-auto`}
                        >
                          {field.value?.length || 0} / {MAX_LENGTH_TEXT}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className=" bg-white flex flex-col rounded-sm p-1 border border-[#A2A1A8] w-full">
                        <div className="flex flex-row items-center">
                          <FormLabel>Description</FormLabel>
                          <p className={"text-red-500 leading-none"}>*</p>
                        </div>
                        <FormControl tabIndex={14}>
                          <Textarea
                            className="p-0 min-h-[60px]"
                            {...field}
                            placeholder="Person in charge/project in charge/work status"
                            maxLength={MAX_LENGTH_TEXT}
                          />
                        </FormControl>
                      </div>
                      <div className="flex flex-row justify-between">
                        {fieldState.error?.message && (
                          <p className={"text-red-500 text-[10px]"}>
                            {fieldState.error?.message}
                          </p>
                        )}
                        <div
                          className={`text-[12px] ${
                            field?.value &&
                            field.value?.length >= MAX_LENGTH_TEXT
                              ? "text-red-500"
                              : "text-gray-500"
                          }  ml-auto`}
                        >
                          {field.value?.length || 0} / {MAX_LENGTH_TEXT}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
        {mode == FormModeType.EDIT ? (
          <div className="flex flex-row justify-end gap-5 mt-10">
            {isDirty ? (
              <AlertDialogCancelLeaveButton
                tabIndex={16}
                isOpen={true}
                onClose={onClose}
              />
            ) : (
              <Button
                tabIndex={1}
                className="p-0 m-0 laptop:w-[152px] h-[50px] font-normal text-[16px] border bg-white border-[#A2A1A880] hover:bg-gray-100 rounded-[10px]"
                type="button"
                onClick={onClose}
              >
                {i18nLeave("cancelButton")}
              </Button>
            )}
            <Button
              tabIndex={2}
              className="p-0 m-0 laptop:w-[152px] h-[50px] font-normal text-white text-[16px] border bg-primary border-[#A2A1A880] hover:bg-primary-hover rounded-[10px]"
              type="button"
              onClick={onUpdateFormLeave}
            >
              {i18nLeave("updateButton")}
            </Button>
          </div>
        ) : (
          <div className="flex flex-row justify-end gap-5 mt-10">
            <Button
              tabIndex={3}
              className="p-0 m-0 laptop:w-[152px] h-[50px] font-normal text-[16px] border bg-white border-[#A2A1A880] hover:bg-gray-100 rounded-[10px]"
              type="button"
              onClick={onClose}
            >
              {i18nLeave("closeButton")}
            </Button>

            {isCreateLeavebutton && (
              <Button
                onClick={onSetEditMode}
                tabIndex={9}
                className="p-0 m-0 laptop:w-[152px] h-[50px] font-normal text-white text-[16px] hover:bg-primary-hover rounded-[10px]"
                type="button"
              >
                {i18nLeave("editButton")}
              </Button>
            )}
          </div>
        )}
      </div>
      <AlertDialogSubmitFormButton
        tabIndex={16}
        title={"Submit form"}
        onConfirm={onUpdateLeave}
        // mode={props.mode}
        open={openSubmitDialog}
        onOpenChange={setOpenSubmitDialog}
      />
      <StyledMessageAlertDialog
        title="Notification"
        description={`You do not have permission to access this page. Please contact your administrator if you believe this is a mistake`}
        open={alertDialogMessage}
        onOpenChange={setAlertDialogMessage}
        onOK={goToErrorPage}
      />
    </div>
  );
}
