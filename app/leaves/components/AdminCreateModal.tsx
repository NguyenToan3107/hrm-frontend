"use client";
import {
  getCommonsUserDetailRequest,
  getCommonsUserRequest,
} from "@/apis/modules/common";
import { CreateLeaveByManagerParams } from "@/apis/modules/leave";
import { AlertDialogCancelFormButton } from "@/components/common/alert-dialog/AlertDialogCancelFormButton";
import { AlertDialogMergeLeaveInfo } from "@/components/common/alert-dialog/AlertDialogMergeLeaveInfo";
import { AlertDialogSubmitFormButton } from "@/components/common/alert-dialog/AlertDialogSubmitFormButton";
import { StyledActionConfirmAlertDialog } from "@/components/common/alert-dialog/StyledActionConfirmAlertDialog";
import { StyledMessageAlertDialog } from "@/components/common/alert-dialog/StyledMessageAlertDialog";
import { StyledDatePicker } from "@/components/common/StyledDatePicker";
import StyledIconLoading from "@/components/common/StyledIconLoading";
import { StyledSelectUserDropdown } from "@/components/common/StyledSelectUserDropdown";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreateLeaveByManagerUseCase } from "@/core/application/usecases/leave/adminCreateLeave";
import { User } from "@/core/entities/models/user.model";
import { LeaveRepositoryImpl } from "@/core/infrastructure/repositories/leave.repo";
import { toast } from "@/hooks/use-toast";
import useWindowSize from "@/hooks/useWindowSize";
import { formatDateToString } from "@/utilities/format";
import { calculateSalary } from "@/utilities/helper";
import { MAX_LENGTH_TEXT, SHIFT_STATUS } from "@/utilities/static-value";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Props {
  isOpen: boolean;
  onClose(): void;
}

const formSchema = z.object({
  user_id: z.number({ message: "Employee to take leave not selected" }),
  contact: z.string().optional(),
  role: z.string().optional(),
  time_off_hours: z.string().optional(),
  leaveDate: z.union([z.string(), z.date()]).refine(
    (value) => {
      if (!value) return false;
      else return true;
    },
    {
      message: "Please select date of leave",
    }
  ),
  shift: z
    .string()
    // .min(1, {
    //   message: "Leave shift not selected",
    // })
    .trim(),
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
});

const leaveRepo = new LeaveRepositoryImpl();
const createLeaveByManagerUseCase = new CreateLeaveByManagerUseCase(leaveRepo);

export default function AdminCreateModal(props: Props) {
  const { isOpen } = props;
  const useDimession = useWindowSize();
  const router = useRouter();

  const [users, setUsers] = useState<{ name: string; value: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>();
  const [loading, setLoading] = useState(false);
  const [leaveFirstIdkey, setLeaveFirstIdkey] = useState("");
  const [leaveSecondIdkey, setLeaveSecondIdkey] = useState("");
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState(false);

  const [openMergeLeaveInfoDialog, setOpenMergeLeaveInfoDialog] =
    useState(false);
  const [openActionConfirmDialog, setOpenActionConfirmDialog] = useState(false);
  const i18nLeave = useTranslations("Leave");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leaveDate: new Date(),
      description: "",
      shift: SHIFT_STATUS[0].value,
      otherInfo: "",
      time_off_hours: "",
      contact: "",
      role: "",
    },
  });

  const getUserDropdownData = async () => {
    try {
      const res = await getCommonsUserRequest();
      const formatUserList = res.data?.map((item: User) => {
        return { value: item?.id, name: `${item?.fullname} (${item?.idkey})` };
      });
      setUsers(formatUserList);
    } catch (error) {}
  };

  const getUserDetailData = async () => {
    try {
      const userId = form.getValues("user_id").toString();
      if (!userId || userId.length == 0) return;
      setLoading(true);
      const res = await getCommonsUserDetailRequest({ id: userId });
      setSelectedUser(res.data);
    } catch (error) {
      setSelectedUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserDropdownData();
  }, []);

  useEffect(() => {
    getUserDetailData();
  }, [form.watch("user_id")]);

  useEffect(() => {
    if (!selectedUser?.id) return;
    form.setValue(
      "time_off_hours",
      String(
        Number(selectedUser?.time_off_hours) +
          Number(selectedUser?.last_year_time_off)
      ) || ""
    );
    form.setValue("contact", selectedUser?.phone || "");
    form.setValue(
      "role",
      selectedUser?.role?.name
        ? String(
            selectedUser.role.name.charAt(0).toUpperCase() +
              selectedUser.role.name.slice(1)
          )
        : ""
    );
  }, [selectedUser?.id]);

  const isDirtyEdit = useMemo(() => {
    const values = form.getValues();
    return (
      values.time_off_hours !== "" ||
      values.role !== "" ||
      values.contact !== "" ||
      values.description?.trim() !== "" ||
      new Date(values?.leaveDate).toDateString() !==
        new Date().toDateString() ||
      values.shift !== SHIFT_STATUS[0].value ||
      values.otherInfo?.trim() !== ""
    );
  }, Object.values(form.watch()));

  const onCancelForm = () => {
    if (isDirtyEdit) {
      setOpenCancelDialog(true);
    } else {
      props.onClose();
    }
  };

  const onCloseForm = () => {
    props.onClose();
  };

  const onCloseMergeLeaveDialog = () => {
    setOpenMergeLeaveInfoDialog(false);
    props.onClose();
  };

  const onSubmitForm = async () => {
    const data = form.getValues();
    try {
      setLoading(true);
      const isSalary = calculateSalary(
        Number(selectedUser?.time_off_hours),
        Number(selectedUser?.last_year_time_off),
        data?.shift
      );
      if (!isSalary || Number(selectedUser?.status_working) != 3) {
        setOpenActionConfirmDialog(true);
        return;
      } else {
        form.handleSubmit(onCreateLeave)();
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

  const onCreateLeave = async (data: any) => {
    try {
      setLoading(true);
      const params: CreateLeaveByManagerParams = {
        user_id: String(data.user_id),
        day_leave: formatDateToString(data.leaveDate || "") || "",
        other_info: data.otherInfo,
        shift: data.shift || SHIFT_STATUS[0].value,
        description: data.description || "",
      };
      const response = await createLeaveByManagerUseCase.execute(params);
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
          props.onClose();
        }
      }
    } catch (error) {
      toast({
        description: "Leave created failed",
        color: "bg-red-100",
      });
    } finally {
      setLoading(false);
    }
  };

  function onSubmit() {
    setOpenSubmitDialog(true);
  }

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-10">
      {loading && (
        <div className="fixed inset-0 bg-black opacity-50 z-10 flex items-center justify-center">
          <>
            <svg
              className="w-5 h-5 mr-2 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="white"
                d="M4 12a8 8 0 018-8v8l5 3-5 3V4a8 8 0 00-8 8z"
              />
            </svg>
          </>
        </div>
      )}
      <div
        className="bg-white flex flex-col justify-between rounded-sm shadow-lg w-[822px] px-8 py-5"
        style={{
          maxHeight: useDimession.height * 0.8,
          minHeight: useDimession.height * 0.8,
          scrollbarWidth: "none",
        }}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 w-full"
          >
            <div className="flex justify-center">
              <h2 className="text-xl font-bold">
                Supplementary Leave Information
              </h2>
            </div>
            <h3 className="font-bold mt-3 mb-3">Employee Information</h3>
            <div className="flex flex-col gap-3 h-full">
              <div className="flex flex-row justify-start laptop:gap-x-4">
                <FormField
                  control={form.control}
                  name="user_id"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="rounded-sm p-1 border border-[#A2A1A8] laptop:w-[242px]">
                        <div className="flex flex-row items-center">
                          <FormLabel className="text-[14px]">
                            Fullname
                          </FormLabel>
                          <p className={"text-red-500 leading-none"}>*</p>
                        </div>
                        <StyledSelectUserDropdown
                          loading={loading}
                          field={field}
                          tabIndex={10}
                          items={users}
                          triggerButtonClass={"border-none"}
                          disabled={false}
                        />
                      </div>
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
                  name="contact"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex flex-col rounded-sm p-1 border border-[#A2A1A8] w-full laptop:w-[242px]">
                        <FormLabel className=" font-normal text-[14px] text-[#a0a0a0]">
                          Contact
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled
                            placeholder=""
                            {...field}
                            className="h-6"
                          />
                        </FormControl>
                      </div>
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
                  name="role"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex flex-col rounded-sm p-1 border border-[#A2A1A8] w-full laptop:w-[242px]">
                        <FormLabel className=" font-normal text-[14px] text-[#a0a0a0]">
                          Role
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled
                            placeholder=""
                            {...field}
                            className="h-6"
                          />
                        </FormControl>
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
                name="time_off_hours"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className="flex flex-col rounded-sm p-1 border border-[#A2A1A8] w-full laptop:w-[242px]">
                      <FormLabel className=" font-normal text-[14px] text-[#a0a0a0]">
                        Remaining leave hours
                      </FormLabel>
                      <FormControl>
                        <Input
                          disabled
                          placeholder=""
                          className="h-6"
                          {...field}
                        />
                      </FormControl>
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
            <h3 className="font-bold mt-3 mb-3">Leave Detail</h3>
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
                          <FormControl>
                            <StyledDatePicker
                              tabIndex={11}
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
                          <FormControl>
                            <SelectTrigger
                              tabIndex={12}
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
                      <FormControl>
                        <Textarea
                          tabIndex={13}
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
                      <FormLabel>Other Infomation</FormLabel>
                      <FormControl>
                        <Textarea
                          tabIndex={14}
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
                          field?.value && field.value?.length >= MAX_LENGTH_TEXT
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
        <div className=" flex items-center gap-x-2 w-full justify-end ">
          <Button
            tabIndex={15}
            onClick={onCancelForm}
            className="p-0 m-0 laptop:w-[152px] h-[50px] font-normal text-[16px] border bg-white border-[#A2A1A880] hover:bg-gray-100 rounded-[10px]"
            type="button"
          >
            {i18nLeave("cancelButton")}
          </Button>
          <Button
            tabIndex={16}
            variant={"default"}
            onClick={form.handleSubmit(onSubmit)}
            className=" text-white bg-primary p-0 m-0 laptop:w-[152px] h-[50px] font-normal text-[16px] border border-[#A2A1A880] hover:bg-primary-hover rounded-[10px]"
            type="submit"
          >
            {loading && <StyledIconLoading />}
            {i18nLeave("createButton")}
          </Button>
        </div>
      </div>
      <AlertDialogCancelFormButton
        tabIndex={16}
        title={"Cancel admin create leave"}
        onConfirm={onCloseForm}
        // mode={props.mode}
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
      <AlertDialogMergeLeaveInfo
        tabIndex={16}
        title={"Infomation merge leave"}
        onConfirm={onCloseMergeLeaveDialog}
        open={openMergeLeaveInfoDialog}
        onOpenChange={setOpenMergeLeaveInfoDialog}
        leaveFirstIdkey={leaveFirstIdkey}
        leaveSecondIdkey={leaveSecondIdkey}
      />
      <StyledActionConfirmAlertDialog
        onConfirm={form.handleSubmit(onCreateLeave)}
        title={"Warning"}
        description={
          Number(selectedUser?.status_working) != 3
            ? "You are creating a leave request for a non-permanent employee, so the leave request will be unpaid."
            : `The staff will be placed on unpaid leave. Are you sure?`
        }
        open={openActionConfirmDialog}
        onOpenChange={setOpenActionConfirmDialog}
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
