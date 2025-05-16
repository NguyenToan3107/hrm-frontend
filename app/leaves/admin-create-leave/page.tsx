"use client";
import {
  getCommonsUserDetailRequest,
  getCommonsUserRequest,
} from "@/apis/modules/common";
import { CreateLeaveByManagerParams } from "@/apis/modules/leave";
import { AlertDialogCancelFormButton } from "@/components/common/alert-dialog/AlertDialogCancelFormButton";
import { AlertDialogSubmitFormButton } from "@/components/common/alert-dialog/AlertDialogSubmitFormButton";
import SideBarComponent from "@/components/common/SideBarComponent";
import { StyledDatePicker } from "@/components/common/StyledDatePicker";
import StyledHeader from "@/components/common/StyledHeader";
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
import useWindowSize from "@/hooks/use-dimession";
import { toast } from "@/hooks/use-toast";
import { formatDateToString } from "@/utilities/format";
import { calculateSalary } from "@/utilities/helper";
import { MAX_LENGTH_TEXT, SHIFT_STATUS } from "@/utilities/static-value";
import { zodResolver } from "@hookform/resolvers/zod";

import { AlertDialogMergeLeaveInfo } from "@/components/common/alert-dialog/AlertDialogMergeLeaveInfo";
import { StyledActionConfirmAlertDialog } from "@/components/common/alert-dialog/StyledActionConfirmAlertDialog";
import { StyledMessageAlertDialog } from "@/components/common/alert-dialog/StyledMessageAlertDialog";
import { StyledBreadcrumb } from "@/components/common/StyledBreadcrumb";
import StyledIconLoading from "@/components/common/StyledIconLoading";
import { useCheckPermission } from "@/hooks/useCheckPermission";
import useScrollToTopOnKeyboardHide from "@/hooks/useScrollToTopOnKeyboardHide";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { StyledSelectUserDropdown } from "@/components/common/StyledSelectUserDropdown";
import { useLeaveStore } from "@/stores/leavesStore";

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

export default function AdminCreateLeaveScreen() {
  const windowSize = useWindowSize();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{ name: string; value: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>();
  const router = useRouter();
  const [leaveFirstIdkey, setLeaveFirstIdkey] = useState("");
  const [leaveSecondIdkey, setLeaveSecondIdkey] = useState("");
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState(false);
  const [openMergeLeaveInfoDialog, setOpenMergeLeaveInfoDialog] =
    useState(false);
  const [openActionConfirmDialog, setOpenActionConfirmDialog] = useState(false);
  const { updateIsDirtyLeave } = useLeaveStore();

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

  const getUserDetailData = async (userId: string) => {
    try {
      const res = await getCommonsUserDetailRequest({ id: userId });
      setSelectedUser(res.data);
    } catch (error) {
      setSelectedUser(null);
    }
  };
  useScrollToTopOnKeyboardHide();

  useEffect(() => {
    getUserDropdownData();
  }, []);

  useEffect(() => {
    const userId = form.getValues("user_id");
    if (!userId) return;
    getUserDetailData(String(userId));
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
            selectedUser.role?.name.charAt(0).toUpperCase() +
              selectedUser.role?.name.slice(1)
          )
        : ""
    );
  }, [selectedUser?.id]);

  const isDirtyEdit = useMemo(() => {
    const values = form.getValues();
    return (
      values.user_id !== undefined ||
      values.description?.trim() !== "" ||
      new Date(values?.leaveDate).toDateString() !==
        new Date().toDateString() ||
      values.shift !== SHIFT_STATUS[0].value ||
      values.otherInfo?.trim() !== ""
    );
  }, Object.values(form.watch()));

  useEffect(() => {
    updateIsDirtyLeave(isDirtyEdit)
  }, [isDirtyEdit])

  const onCancelForm = () => {
    if (isDirtyEdit) {
      setOpenCancelDialog(true);
    } else {
      router.back();
    }
  };

  const onCloseForm = () => {
    router.back();
  };

  const onCloseMergeLeaveDialog = () => {
    setOpenMergeLeaveInfoDialog(false);
    router.back();
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
        form.handleSubmit(onCreateLeave);
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
          updateIsDirtyLeave(false)
          router.back();
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  async function onSubmit() {
    setOpenSubmitDialog(true);
  }

  const { loading: roleLoading } = useCheckPermission([
    "leave_list",
    "add_supplementary",
  ]);
  if (roleLoading) return null;

  return (
    <div className="w-full max-h-screen flex px-2">
      <SideBarComponent />
      <div className="w-full max-h-screen block bg-white">
        <StyledHeader />
        <StyledBreadcrumb
          items={["Leaves", "Supplementary Leave"]}
          links={["/leaves", `/leaves/admin-create-leave`]}
          triggerClass={"pb-0 laptop:px-6 px-4"}
        />
        <div
          className="px-2 w-full laptop:px-4 border border-border rounded-md"
          style={{
            maxHeight: windowSize.height - 56 - 40 - 20,
            minHeight: windowSize.height - 132 - 40 - 20,
            scrollbarWidth: "none",
          }}
        >
          <div className="flex flex-row justify-left items-center gap-x-2">
            <p className="text-[20px] font-semibold  w-fit text-center">
              Supplementary Leave Information
            </p>
          </div>
          <div
            className="flex flex-col items-start w-full overflow-x-auto"
            style={{
              maxHeight: windowSize.height - 56 - 62 - 40,
              minHeight: windowSize.height - 56 - 62 - 40,
              scrollbarWidth: "none",
            }}
          >
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
                  <p className="font-semibold mb-1">Employee Information</p>
                  <div className="flex flex-col h-full gap-y-2">
                    <div className="flex flex-col gap-y-2">
                      <FormField
                        control={form.control}
                        name="user_id"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <div className="rounded-sm p-1 border border-[#A2A1A8] w-full">
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
                    </div>
                    <FormField
                      control={form.control}
                      name="contact"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <div className="flex flex-col rounded-sm p-1 border border-[#A2A1A8] w-full">
                            <FormLabel className=" font-normal text-[14px] text-[#a0a0a0]">
                              Contact
                            </FormLabel>
                            <FormControl>
                              <Input
                                disabled
                                tabIndex={5}
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
                          <div className="flex flex-col rounded-sm p-1 border border-[#A2A1A8] w-full">
                            <FormLabel className=" font-normal text-[14px] text-[#a0a0a0]">
                              Role
                            </FormLabel>
                            <FormControl>
                              <Input
                                disabled
                                tabIndex={5}
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
                      name="time_off_hours"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <div className="flex flex-col rounded-sm p-1 border border-[#A2A1A8] w-full">
                            <FormLabel className=" font-normal text-[14px] text-[#a0a0a0]">
                              Remaining leave hours
                            </FormLabel>
                            <FormControl>
                              <Input
                                disabled
                                tabIndex={5}
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
                  <p className="font-semibold my-1">Leave Detail</p>
                  <div className="flex flex-col h-full">
                    <div className="flex flex-col gap-y-4 pb-4">
                      <FormField
                        control={form.control}
                        name={"leaveDate"}
                        render={({ field, fieldState }) => {
                          return (
                            <FormItem>
                              <div className="rounded-sm px-1 border border-[#A2A1A8] w-full">
                                <FormLabel>Date</FormLabel>
                                <FormControl>
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
                        name="shift"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <div className="rounded-sm p-1 border border-[#A2A1A8] w-full">
                              <FormLabel>Shift</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
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

            <div className="fixed bottom-[8px] right-0 left-0 flex flex-1 flex-row justify-end items-end gap-x-2 gap-y-2 mx-4">
              <Button
                onClick={onCancelForm}
                tabIndex={1}
                className="p-0 m-0 text-[12px] laptop:text-[16px] w-[100px] laptop:w-[152px] h-8 laptop:h-10 font-normal border bg-white border-[#A2A1A880] hover:bg-gray-100 rounded-[8px]"
                type="button"
              >
                Back
              </Button>
              <Button
                variant={"default"}
                onClick={form.handleSubmit(onSubmit)}
                tabIndex={2}
                className=" text-white bg-primary p-0 m-0 w-[100px] laptop:w-[152px] h-8 laptop:h-10 font-normal text-[12px] laptop:text-[16px] border border-[#A2A1A880] hover:bg-primary-hover rounded-[8px]"
                type="submit"
              >
                {loading && <StyledIconLoading />}
                Create
              </Button>
            </div>
          </div>
          {/* <ButtonGrid leave={leave} /> */}
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
