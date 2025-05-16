"use client";
import { getCommonsRequest } from "@/apis/modules/common";
import { CreateLeaveByUserParams } from "@/apis/modules/leave";
import DefaultImage from "@/app/assets/avatar/avatar_default.svg";
import { AlertDialogCancelLeaveButton } from "@/components/common/alert-dialog/AlertDialogCancelLeaveButton";
import { AlertDialogMergeLeaveInfo } from "@/components/common/alert-dialog/AlertDialogMergeLeaveInfo";
import { AlertDialogSubmitFormButton } from "@/components/common/alert-dialog/AlertDialogSubmitFormButton";
import { StyledMessageAlertDialog } from "@/components/common/alert-dialog/StyledMessageAlertDialog";
import StyledAvatarPreview from "@/components/common/StyledAvatarPreview";
import { StyledDatePicker } from "@/components/common/StyledDatePicker";
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
import { CreateLeaveByUserUseCase } from "@/core/application/usecases/leave/createLeave";
import { ShowMyPageUseCase } from "@/core/application/usecases/my-page/showMyPage.usecase";
import { LeaveRepositoryImpl } from "@/core/infrastructure/repositories/leave.repo";
import { UserRepositoryImpl } from "@/core/infrastructure/repositories/user.repo";
import { toast } from "@/hooks/use-toast";
import useWindowSize from "@/hooks/useWindowSize";
import { useCommonStore } from "@/stores/commonStore";
import { useUserStore } from "@/stores/userStore";
import { formatDateToString } from "@/utilities/format";
import { calculateSalary, convertHourToDay } from "@/utilities/helper";
import {
  ACCESS_TOKEN_KEY,
  MAX_LENGTH_TEXT,
  SHIFT_STATUS,
  STAFF_STATUS_WORKING,
} from "@/utilities/static-value";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCookie } from "cookies-next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Props {
  isOpen: boolean;
  onClose(): void;
  setLoading(value: boolean): void;
  loading: boolean;
}

const formSchema = z.object({
  leaveDate: z.union([
    z.string({ message: "Leave Date is required" }),
    z.date(),
  ]),
  shift: z.string().trim(),
  description: z
    .string()
    .trim()
    .min(1, {
      message: "Leave description not entered",
    })
    .max(MAX_LENGTH_TEXT, {
      message: "Leave description too long",
    }),
  otherInfo: z
    .string()
    .trim()
    .max(MAX_LENGTH_TEXT, {
      message: "Leave other infomation too long",
    })
    .optional(),
  approverId: z.string().min(1, {
    message: "Approver not selected",
  }),
});

const leaveRepo = new LeaveRepositoryImpl();
const userRepo = new UserRepositoryImpl();
const createLeaveByUserUseCase = new CreateLeaveByUserUseCase(leaveRepo);
const showMyPage = new ShowMyPageUseCase(userRepo);
export default function CreateLeaveModal(props: Props) {
  const { isOpen, onClose } = props;
  const { user, setUser } = useUserStore();
  const i18nLeave = useTranslations("Leave");
  const router = useRouter();

  const {
    approveUsersData,
    updateRolesData,
    updateDepartmentData,
    updateApproveUsersData,
  } = useCommonStore((state) => state);
  const useDimession = useWindowSize();
  const [loading, setLoading] = useState(false);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState(false);
  const [leaveFirstIdkey, setLeaveFirstIdkey] = useState("");
  const [leaveSecondIdkey, setLeaveSecondIdkey] = useState("");
  const [openMergeLeaveInfoDialog, setOpenMergeLeaveInfoDialog] =
    useState(false);

  const isAdmin = useMemo(() => {
    return user?.role?.name == "admin";
  }, [user]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leaveDate: new Date(),
      description: "",
      shift: SHIFT_STATUS[0].value,
      otherInfo: "",
      approverId: isAdmin ? String(user?.leader_id) : "",
    },
  });

  const approvalData = useMemo(() => {
    return (
      approveUsersData.map((item) => {
        return {
          value: item.id,
          name: item.fullname,
          idkey: item.idkey,
        };
      }) || []
    );
  }, [approveUsersData]);

  async function onSubmit() {
    setOpenSubmitDialog(true);
  }

  const goToErrorPage = () => {
    setAlertDialogMessage(false);
    router.replace("/error");
  };

  const onCloseMergeLeaveDialog = () => {
    setOpenMergeLeaveInfoDialog(false);
    onClose();
  };

  const onSubmitForm = async () => {
    try {
      setLoading(true);
      const data = form.getValues();
      const params: CreateLeaveByUserParams = {
        day_leave: formatDateToString(data.leaveDate || "") || "",
        other_info: data.otherInfo,
        shift: data.shift || SHIFT_STATUS[0].value,
        approver_id: Number(data.approverId),
        description: data.description || "",
      };
      const response = await createLeaveByUserUseCase.execute(params);
      if (response?.code == 1) {
        if (
          response.data?.SHIFT_OF_LEAVE_EXISTED_ON_DAY &&
          response.data.SHIFT_OF_LEAVE_EXISTED_ON_DAY[0] ==
            "SHIFT_OF_LEAVE_EXISTED_ON_DAY"
        ) {
          toast({
            description:
              "A leave request for all day on the same date has already been approved.",
            color: "bg-red-100",
          });
        } else if (
          response.data?.SHIFT_OF_LEAVE_EXISTED_MORNING &&
          response.data.SHIFT_OF_LEAVE_EXISTED_MORNING[0] ==
            "SHIFT_OF_LEAVE_EXISTED_MORNING"
        ) {
          toast({
            description:
              "A leave request for the morning on the same date has already been approved.",
            color: "bg-red-100",
          });
        } else if (
          response.data?.SHIFT_OF_LEAVE_EXISTED_AFTERNOON &&
          response.data.SHIFT_OF_LEAVE_EXISTED_AFTERNOON[0] ==
            "SHIFT_OF_LEAVE_EXISTED_AFTERNOON"
        ) {
          toast({
            description:
              "A leave request for the afternoon on the same date has already been approved.",
            color: "bg-red-100",
          });
        } else if (
          response.data?.EXISTED_LEAVE_WAITING_ON_DAY &&
          response.data.EXISTED_LEAVE_WAITING_ON_DAY[0] ==
            "EXISTED_LEAVE_WAITING_ON_DAY"
        ) {
          toast({
            description:
              "A leave request for the same date already exists and is awaiting approval. Please modify the request if necessary.",
            color: "bg-red-100",
          });
        } else if (
          response.data?.DAY_IS_WEEKEND &&
          response.data.DAY_IS_WEEKEND[0] == "DAY_IS_WEEKEND"
        ) {
          toast({
            description: "Cannot create leave on weekends.",
            color: "bg-red-100",
          });
        } else if (
          response.data?.NO_CREATE_LEAVE_ON_DAY_OFF &&
          response.data.NO_CREATE_LEAVE_ON_DAY_OFF[0] ==
            "NO_CREATE_LEAVE_ON_DAY_OFF"
        ) {
          toast({
            description: "Cannot create leave on day off.",
            color: "bg-red-100",
          });
        } else {
          if (response?.requestStatus == 403) {
            setAlertDialogMessage(true);
          } else {
            toast({
              description:
                "An error occurred in the system. Please try again later. If the issue persists, contact support.",
              color: "bg-red-100",
            });
          }
        }
      } else {
        if (response?.message && response?.message == "LEAVE_IS_MERGED") {
          setLeaveFirstIdkey(response?.data?.leaveFirstIdkey || "");
          setLeaveSecondIdkey(response?.data?.leaveSecondIdkey || "");
          setOpenMergeLeaveInfoDialog(true);
        } else {
          toast({
            description: "Leave created successfully",
            color: "bg-blue-200",
          });
          onClose();
        }
      }
      setLoading(false);
    } catch (error) {
    } finally {
      setLoading(false);
    }
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
    const admin = isAdmin ? String(user?.leader_id) : "";
    return (
      currentValues.description?.trim() !== "" ||
      !isSameDate(new Date(currentValues.leaveDate), new Date()) ||
      currentValues.shift !== SHIFT_STATUS[0].value ||
      currentValues.otherInfo?.trim() !== "" ||
      currentValues.approverId?.trim() !== admin
    );
  }, Object.values(form.watch()));

  const reloadMyPage = async () => {
    try {
      const response: any = await showMyPage.execute();
      setUser(response.data);
    } catch (error) {}
  };

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

  useEffect(() => {
    reloadMyPage();
    getCommonData();
  }, []);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-10">
      <div
        className="bg-white flex flex-col justify-between rounded-sm shadow-lg w-[864px] px-8 py-5"
        style={{
          maxHeight: useDimession.height * 0.8,
          minHeight: useDimession.height * 0.8,
          scrollbarWidth: "none",
        }}
      >
        <div className="flex justify-center">
          <h2 className="text-xl font-bold">Leave Infomation</h2>
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
                        user.time_off_hours,
                        user.last_year_time_off
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

        <h3 className="font-bold mt-3 mb-3">Leave Detail</h3>
        <div
          className="flex flex-col items-start w-full h-full overflow-y-auto flex-1"
          style={{
            scrollbarWidth: "none",
          }}
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 w-full"
            >
              <div className="flex flex-col h-full">
                <div className="flex flex-col laptop:flex-row laptop:justify-start gap-3 pb-[18px] laptop:gap-0 laptop:gap-x-4">
                  <FormField
                    control={form.control}
                    name={"leaveDate"}
                    render={({ field, fieldState }) => {
                      return (
                        <FormItem>
                          <div className="rounded-sm px-1 border border-[#A2A1A8] w-full laptop:w-[242px]">
                            <FormLabel>Date</FormLabel>
                            <FormControl tabIndex={11}>
                              <StyledDatePicker
                                field={field}
                                title={""}
                                triggerClass="h-8 border-none rounded-md px-0"
                                minDate={new Date()}
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
                    name="shift"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="rounded-sm p-1 border border-[#A2A1A8] w-full laptop:w-[242px]">
                          <FormLabel>Shift</FormLabel>
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
                              {SHIFT_STATUS.map((item) => {
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
                  name="description"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex flex-col rounded-sm p-1 border border-[#A2A1A8] w-full">
                        <div className="flex flex-row items-center">
                          <FormLabel>Reason for Leave</FormLabel>
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
                  name="otherInfo"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex flex-col rounded-sm p-1 border border-[#A2A1A8] w-full">
                        <div className="flex flex-row items-center">
                          <FormLabel>Other Infomation</FormLabel>
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
                <div className="rounded-sm p-1 border border-[#A2A1A8] w-full laptop:w-[242px] ">
                  <FormField
                    control={form.control}
                    name={"approverId"}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="flex flex-row items-center">
                          <FormLabel>Approver</FormLabel>
                          <p className={"text-red-500 leading-none"}>*</p>
                        </div>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isAdmin}
                        >
                          <FormControl tabIndex={15}>
                            <SelectTrigger
                              style={{
                                color: !field.value
                                  ? "var(--secondary)"
                                  : "black",
                              }}
                              className="h-6 rounded-none px-0 disabled:opacity-100"
                            >
                              <SelectValue className="w-full" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white">
                            {approvalData.map((item) => {
                              return (
                                <SelectItem
                                  key={item.value}
                                  value={String(item.value)}
                                >
                                  {item.name} {`(${item.idkey})`}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {fieldState.error?.message && (
                          <p className={"text-red-500 text-[10px]"}>
                            {fieldState.error?.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </form>
          </Form>
        </div>
        <div className=" flex items-center gap-x-2 w-full justify-end">
          {isDirty ? (
            <AlertDialogCancelLeaveButton
              tabIndex={16}
              isOpen={true}
              onClose={props.onClose}
            />
          ) : (
            <Button
              onClick={props.onClose}
              tabIndex={16}
              className="p-0 m-0 laptop:w-[152px] h-[50px] font-normal text-[16px] border bg-white border-[#A2A1A880] hover:bg-gray-100 rounded-[10px]"
              type="button"
            >
              {i18nLeave("cancelButton")}
            </Button>
          )}
          <Button
            variant={"default"}
            onClick={form.handleSubmit(onSubmit)}
            tabIndex={17}
            className=" text-white bg-primary p-0 m-0 laptop:w-[152px] h-[50px] font-normal text-[16px] border border-[#A2A1A880] hover:bg-primary-hover rounded-[10px]"
            type="submit"
          >
            {loading && <StyledIconLoading />}
            {i18nLeave("createButton")}
          </Button>
        </div>
      </div>
      <AlertDialogSubmitFormButton
        tabIndex={16}
        title={"Submit form"}
        onConfirm={onSubmitForm}
        // mode={props.mode}
        open={openSubmitDialog}
        onOpenChange={setOpenSubmitDialog}
        description={
          user.status_working != STAFF_STATUS_WORKING[2].value
            ? "You are not an official staff, you will be on unpaid leave."
            : !calculateSalary(
                Number(user?.time_off_hours),
                Number(user?.last_year_time_off),
                form.getValues("shift")
              )
            ? "The remaining leave hours are insufficient, you will be on unpaid leave."
            : "Be sure to submit the information on the form"
        }
      />
      <StyledMessageAlertDialog
        title="Notification"
        description={`You do not have permission to access this page. Please contact your administrator if you believe this is a mistake`}
        open={alertDialogMessage}
        onOpenChange={setAlertDialogMessage}
        onOK={goToErrorPage}
      />
      <AlertDialogMergeLeaveInfo
        tabIndex={16}
        title={"Infomation merge leave"}
        onConfirm={onCloseMergeLeaveDialog}
        open={openMergeLeaveInfoDialog}
        onOpenChange={setOpenMergeLeaveInfoDialog}
        leaveFirstIdkey={leaveFirstIdkey}
        leaveSecondIdkey={leaveSecondIdkey}
      />
    </div>
  );
}
