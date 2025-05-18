"use client";
import { getCommonsRequest } from "@/apis/modules/common";
import { CreateDayOffParams } from "@/apis/modules/schedule";
import { AlertDialogCancelLeaveButton } from "@/components/common/alert-dialog/AlertDialogCancelLeaveButton";
import { AlertDialogSubmitFormButton } from "@/components/common/alert-dialog/AlertDialogSubmitFormButton";
import { StyledMessageAlertDialog } from "@/components/common/alert-dialog/StyledMessageAlertDialog";
import SideBarComponent from "@/components/common/SideBarComponent";
import { StyledBreadcrumb } from "@/components/common/StyledBreadcrumb";
import { StyledDatePicker } from "@/components/common/StyledDatePicker";
import StyledHeader from "@/components/common/StyledHeader";
import StyledIconLoading from "@/components/common/StyledIconLoading";
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
import { ShowMyPageUseCase } from "@/core/application/usecases/my-page/showMyPage.usecase";
import { CreateDayOffUseCase } from "@/core/application/usecases/schedule/createDayOff.usecase";
import { ScheduleRepositoryImpl } from "@/core/infrastructure/repositories/schedule.repo";
import { UserRepositoryImpl } from "@/core/infrastructure/repositories/user.repo";
import useWindowSize from "@/hooks/use-dimession";
import { toast } from "@/hooks/use-toast";
import { useCheckPermission } from "@/hooks/useCheckPermission";
import useScrollToTopOnKeyboardHide from "@/hooks/useScrollToTopOnKeyboardHide";
import { useCommonStore } from "@/stores/commonStore";
import { useScheduleStore } from "@/stores/scheduleStore";
import { useUserStore } from "@/stores/userStore";
import { formatDateToString } from "@/utilities/format";
import { convertHourToDay } from "@/utilities/helper";
import {
  ACCESS_TOKEN_KEY,
  DAY_OFF_STATUS,
  MAX_LENGTH_TEXT,
} from "@/utilities/static-value";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCookie } from "cookies-next";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

const scheduleRepo = new ScheduleRepositoryImpl();
const createDayOffsUseCase = new CreateDayOffUseCase(scheduleRepo);
const userRepo = new UserRepositoryImpl();
const getProfileUserUseCase = new ShowMyPageUseCase(userRepo);

export default function LeaveCreateScreen() {
  const { user, setUser } = useUserStore();
  const windowSize = useWindowSize();
  const { updateRolesData, updateApproveUsersData, updateDepartmentData } =
    useCommonStore((state) => state);
  const { updateIsDirtyDayOff } = useScheduleStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dayOffDate: new Date(),
      description: "",
      status: DAY_OFF_STATUS[0].value,
      title: "",
    },
  });

  const getCommonData = async () => {
    try {
      const token = getCookie(ACCESS_TOKEN_KEY);
      if (token) {
        const common: any = await getCommonsRequest(token);
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
      }
    } catch (error) {}
  };

  const isSameDate = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isDirty = useMemo(() => {
    const currentValues = form.getValues();
    return (
      currentValues.description?.trim() !== "" ||
      !isSameDate(new Date(currentValues.dayOffDate), new Date()) ||
      currentValues.status !== DAY_OFF_STATUS[0].value ||
      currentValues.title?.trim() !== ""
    );
  }, Object.values(form.watch()));

  useEffect(() => {
    updateIsDirtyDayOff(isDirty);
  }, [isDirty]);

  const onClose = () => {
    router.back();
  };

  async function onSubmit() {
    setOpenSubmitDialog(true);
  }

  const onSubmitForm = async () => {
    try {
      setLoading(true);
      const data = form.getValues();
      const createParams: CreateDayOffParams = {
        title: data.title,
        description: data.description,
        status: data.type == "0" ? "0" : "1",
        day_off: formatDateToString(data.dayOffDate || "") || "",
      };
      const response = await createDayOffsUseCase.execute(createParams);
      if (response?.code == 1) {
        if (
          response.data?.DAYOFF_IS_EXIST &&
          response.data.DAYOFF_IS_EXIST[0] == "DAYOFF_IS_EXIST"
        ) {
          toast({
            description: "Day off is exist.",
            color: "bg-red-100",
          });
        } else {
          toast({
            description: "Create day off failed",
            color: "bg-red-100",
          });
        }
      } else {
        toast({
          description: "Create day off successfully",
          color: `bg-blue-200`,
        });
        updateIsDirtyDayOff(false);
        router.back();
      }
      setLoading(false);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const goToErrorPage = () => {
    setAlertDialogMessage(false);
    router.replace("/error");
  };

  const getProfileUser = async () => {
    try {
      const res: any = await getProfileUserUseCase.execute();
      setUser(res?.data);
    } catch (error) {}
  };

  useEffect(() => {
    getProfileUser();
    getCommonData();
  }, []);

  useScrollToTopOnKeyboardHide();

  const { loading: roleLoading } = useCheckPermission([
    "dashboard_view",
    "dashboard_edit",
  ]);
  if (roleLoading) return null;

  return (
    <div className="w-full max-h-screen flex px-2">
      <SideBarComponent />
      <div className="w-full max-h-screen block">
        <StyledHeader />
        <StyledBreadcrumb
          items={["Day Offs", "Create Day Off"]}
          links={["/dayOffs", `/dayOffs/create-day-off`]}
          triggerClass={"pb-0 laptop:px-6 px-4"}
        />
        <div
          className="px-2 laptop:px-4 w-full border border-border rounded-md "
          style={{
            maxHeight: windowSize.height - 56 - 40 - 32,
            minHeight: windowSize.height - 56 - 40 - 32,
            scrollbarWidth: "none",
          }}
        >
          <div className="flex flex-row justify-left items-center gap-x-2">
            <p className="text-[20px] font-semibold  w-fit text-center">
              Day Off Information
            </p>
          </div>
          <div className="flex flex-col items-start w-full min-h-[132px]">
            <p className="font-semibold mb-1">Requestor Information</p>
            <div className="flex flex-row w-full justify-start gap-y-2 min-h-full rounded-[4px] border-[2px] border-opacity-25 border-black px-2 flex-1">
              <table className="w-full h-full flex justify-start items-center">
                <tbody>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-5">
                      Employee ID:
                    </td>
                    <td className="text-[14px] font-normal leading-5 px-1">
                      {user?.idkey}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-5 w-[110px]">
                      Employee:
                    </td>
                    <td className="text-[14px] font-normal leading-5 px-1 line-clamp-1 ">
                      {user?.fullname}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-5 w-[110px]">
                      Contact:
                    </td>
                    <td className="text-[14px] font-normal leading-5 px-1">
                      {user?.phone}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-5  w-[110px]">
                      Leave hour:
                    </td>
                    <td className="text-[14px] font-normal leading-5 px-1">
                      {convertHourToDay(
                        user?.time_off_hours,
                        user?.last_year_time_off
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-6  w-[110px]">
                      Allocated hour:
                    </td>
                    <td className="text-[14px] font-normal leading-6 px-1">
                      {convertHourToDay(user?.allocated_hour, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div
            className="flex flex-col items-start w-full overflow-x-auto mb-2"
            style={{
              maxHeight: windowSize.height - 302 - 12,
              minHeight: windowSize.height - 302 - 12,
              scrollbarWidth: "none",
            }}
          >
            <p className="font-semibold my-1">Day Off Detail</p>
            <div
              className="flex flex-col items-start w-full h-full overflow-y-auto flex-1"
              style={{
                scrollbarWidth: "none",
              }}
            >
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-2 w-full"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex flex-col gap-y-4 pb-4">
                      <FormField
                        control={form.control}
                        name={"dayOffDate"}
                        render={({ field, fieldState }) => {
                          return (
                            <FormItem>
                              <div className="rounded-sm px-1 border border-[#A2A1A8] w-full laptop:w-[242px]">
                                <FormLabel>Date</FormLabel>
                                <FormControl tabIndex={1}>
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
                            <div className="rounded-sm p-1 border border-[#A2A1A8] w-full laptop:w-[242px]">
                              <FormLabel>Status</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl tabIndex={2}>
                                  <SelectTrigger
                                    style={{
                                      color: !field.value
                                        ? "var(--secondary)"
                                        : "black",
                                    }}
                                    className="h-6 rounded-none px-0 disabled:opacity-100"
                                  >
                                    <SelectValue
                                      className="w-full"
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
                          <div className="flex flex-col rounded-sm p-1 border border-[#A2A1A8] w-full">
                            <div className="flex flex-row items-center">
                              <FormLabel>Title</FormLabel>
                              <p className={"text-red-500 leading-none"}>*</p>
                            </div>
                            <FormControl tabIndex={3}>
                              <Textarea
                                className="p-0 min-h-[60px]"
                                {...field}
                                onChange={field.onChange}
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
                          <div className="flex flex-col rounded-sm p-1 border border-[#A2A1A8] w-full">
                            <div className="flex flex-row items-center">
                              <FormLabel>Description</FormLabel>
                              <p className={"text-red-500 leading-none"}>*</p>
                            </div>
                            <FormControl tabIndex={4}>
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
          </div>
          <div className="fixed bottom-[8px] laptop:bottom-[60px] right-0 laptop:right-[62px] left-0 laptop:left-auto flex flex-1 flex-row justify-end items-end gap-x-2 laptop:gap-x-4 gap-y-2 laptop:gap-y-3 mx-4 laptop:mx-0">
            {isDirty ? (
              <AlertDialogCancelLeaveButton
                tabIndex={16}
                isOpen={true}
                onClose={onClose}
              />
            ) : (
              <Button
                onClick={router.back}
                tabIndex={6}
                className="p-0 m-0 w-[100px] h-8 font-normal text-[12px] border bg-white border-[#A2A1A880] hover:bg-gray-100 rounded-[8px]"
                type="button"
              >
                Back
              </Button>
            )}
            <Button
              variant={"default"}
              onClick={onSubmit}
              tabIndex={7}
              className=" text-white bg-primary p-0 m-0  w-[100px] h-8 font-normal text-[12px] border border-[#A2A1A880] hover:bg-primary-hover rounded-[8px]"
              type="submit"
            >
              {loading && <StyledIconLoading />}
              Create
            </Button>
          </div>
        </div>
      </div>
      <AlertDialogSubmitFormButton
        tabIndex={16}
        title={"Submit form"}
        onConfirm={onSubmitForm}
        // mode={props.mode}
        open={openSubmitDialog}
        onOpenChange={setOpenSubmitDialog}
        description={"Be sure to submit the information on the form"}
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
