"use client";
import {
  ConfirmLeaveParams,
  GetLeaveDetailParams,
  RejectLeaveParams,
  RequestCancelRequestLeaveParams,
  SkipCancelRequestLeaveParams,
  UpdateLeaveByUserParams,
} from "@/apis/modules/leave";
import DefaultImage from "@/app/assets/avatar/avatar_default.svg";
import CanRequestIcon from "@/app/assets/icons/iconCanRequest.svg";
import CanRequestIconBlue from "@/app/assets/icons/iconCanRequestBlue.svg";
import CanRequestIconGray from "@/app/assets/icons/iconCanRequestGray.svg";
import { message } from "@/app/assets/locales/en";
import FormLeave from "@/app/leaves/components/FormLeave";
import { AlertDialogCancelLeaveButton } from "@/components/common/alert-dialog/AlertDialogCancelLeaveButton";
import { AlertDialogExecuteLeavelButton } from "@/components/common/alert-dialog/AlertDialogExecuteLeavelButton";
import { AlertDialogMergeLeaveInfo } from "@/components/common/alert-dialog/AlertDialogMergeLeaveInfo";
import { AlertDialogSubmitFormButton } from "@/components/common/alert-dialog/AlertDialogSubmitFormButton";
import { StyledMessageAlertDialog } from "@/components/common/alert-dialog/StyledMessageAlertDialog";
import StyledAvatarPreview from "@/components/common/StyledAvatarPreview";
import StyledCancelRequestDialog from "@/components/common/StyledCancelRequestDialog";
import { Button } from "@/components/ui/button";
import { ConfirmLeaveByManagerUseCase } from "@/core/application/usecases/leave/confirmLeave";
import { GetLeaveDetailUseCase } from "@/core/application/usecases/leave/getLeaveDetail";
import { RejectLeaveByManagerUseCase } from "@/core/application/usecases/leave/rejectLeave";
import { RequestCancelLeaveRequestUseCase } from "@/core/application/usecases/leave/requestCancelLeave";
import { SkipCancelRequestLeaveUseCase } from "@/core/application/usecases/leave/skipCancelRequestLeave";
import { UpdateLeaveByUserUseCase } from "@/core/application/usecases/leave/updateLeave";
import { Leave } from "@/core/entities/models/leave.model";
import { LeaveRepositoryImpl } from "@/core/infrastructure/repositories/leave.repo";
import { toast } from "@/hooks/use-toast";
import useWindowSize from "@/hooks/useWindowSize";
import { useUserStore } from "@/stores/userStore";
import {
  CancelRequestValue,
  FormModeType,
  LeaveStatusValue,
} from "@/utilities/enum";
import { formatDateToString } from "@/utilities/format";
import {
  calculateSalary,
  convertHourToDay,
  errorHandler,
} from "@/utilities/helper";
import { STAFF_STATUS_WORKING } from "@/utilities/static-value";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
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

const leaveRepo = new LeaveRepositoryImpl();
const getLeaveDetailUseCase = new GetLeaveDetailUseCase(leaveRepo);
const updateLeaveDetailUseCase = new UpdateLeaveByUserUseCase(leaveRepo);
const sendCancelRequestLeaveUseCase = new RequestCancelLeaveRequestUseCase(
  leaveRepo
);
const skipCancelRequestLeaveUseCase = new SkipCancelRequestLeaveUseCase(
  leaveRepo
);
const confirmLeaveUseCase = new ConfirmLeaveByManagerUseCase(leaveRepo);
const rejectLeaveByManagerUseCase = new RejectLeaveByManagerUseCase(leaveRepo);

const formSchema = z.object({
  day_leaves: z.union([
    z.string({ message: "Leave Date is required" }),
    z.date(),
  ]),
  shift: z.string().trim(),
  status: z.string().trim().optional(),
  description: z.string().trim(),
  other_info: z.string().trim().optional(),
  created_at: z.string().trim().optional(),
  approval_date: z.string().trim().optional(),
  approverId: z.string().trim(),
});

export default function LeaveDetailModal(props: Props) {
  const { isOpen, onClose, idLeave, setLoading } = props;
  const [leave, setLeave] = useState<Leave>();
  const formLeaveRef = useRef<any>(null);
  const useDimession = useWindowSize();
  const { user } = useUserStore();
  const router = useRouter();

  const [mode, setMode] = useState(FormModeType.VIEW); // 0: view, 1: edit
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [leaveFirstIdkey, setLeaveFirstIdkey] = useState("");
  const [leaveSecondIdkey, setLeaveSecondIdkey] = useState("");
  const [alertDialogMessage, setAlertDialogMessage] = useState(false);
  const [openMergeLeaveInfoDialog, setOpenMergeLeaveInfoDialog] =
    useState(false);
  // const [loadingEdit, setLoadingEdit] = useState(false);
  const i18nLeave = useTranslations("Leave");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      day_leaves: "",
      shift: undefined,
      status: undefined,
      description: undefined,
      other_info: undefined,
      approverId: undefined,
      approval_date: undefined,
      created_at: undefined,
    },
  });

  const isOwner = useMemo(() => {
    return user.id === leave?.user_id;
  }, [user.id, leave?.user_id]);

  const isManager = useMemo(() => {
    return user.id === leave?.approver_id;
  }, [user.id, leave?.approver_id]);

  const isAdmin = useMemo(() => {
    return user?.role?.name == "admin";
  }, [user]);

  const isExecuteLeavebutton = useMemo(() => {
    const userRole = user?.role;
    return userRole?.permissions?.includes("leave_execute");
  }, []);

  const isCreateLeavebutton = useMemo(() => {
    const userRole = user?.role;
    return userRole?.permissions?.includes("leave_create");
  }, []);

  const onLoadLeaveDetail = async () => {
    try {
      setLoading(true);
      const params: GetLeaveDetailParams = { id: idLeave };
      const response = await getLeaveDetailUseCase.execute(params);
      setLeave(response?.data);
      form.setValue("day_leaves", leave?.day_leaves || "");
      form.setValue("shift", leave?.shift || "");
      form.setValue("status", leave?.status);
      form.setValue("description", leave?.description || "");
      form.setValue("other_info", leave?.other_info);
      form.setValue("approverId", leave?.approver_id || "");
      form.setValue("approval_date", leave?.approval_date);
      form.setValue("created_at", leave?.created_at);
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

  const onCloseMergeLeaveDialog = () => {
    setOpenMergeLeaveInfoDialog(false);
    onClose();
  };

  const onUpdateLeave = async () => {
    try {
      setLoading(true);
      const data = form.getValues();
      if (!leave?.id) return;
      const params: UpdateLeaveByUserParams = {
        id: String(leave?.id),
        updated_at: leave?.updated_at,
        day_leave: formatDateToString(data.day_leaves || "") || "",
        other_info: data.other_info,
        shift: data.shift || "",
        approver_id: String(data.approverId),
        description: data.description || "",
      };
      const response = await updateLeaveDetailUseCase.execute(params);
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
          response?.data?.NO_CREATE_LEAVE_ON_DAY_OFF &&
          response?.data?.NO_CREATE_LEAVE_ON_DAY_OFF[0] ==
            "NO_CREATE_LEAVE_ON_DAY_OFF"
        ) {
          toast({
            description: "Cannot edit leave on day off",
            color: "bg-red-100",
          });
        } else if (
          response?.data?.DAY_IS_WEEKEND &&
          response?.data?.DAY_IS_WEEKEND[0] == "DAY_IS_WEEKEND"
        ) {
          toast({
            description: "Cannot edit leave on weekends",
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
      } else if (response?.code == -1) {
        toast({
          description: message.concurencyUpdate,
          color: "bg-red-100",
        });
      } else {
        toast({
          description: "Updated leave successfully",
          color: "bg-blue-200",
        });
        onClose();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onSendCancelRequest = async (description: string) => {
    try {
      if (!leave || !leave?.id) return;
      const params: RequestCancelRequestLeaveParams = {
        id: leave.id,
        updated_at: leave?.updated_at,
        description: description,
      };
      const response = await sendCancelRequestLeaveUseCase.execute(params);
      if (response?.code == 1) {
        if (response?.requestStatus == 403) {
          setAlertDialogMessage(true);
        } else {
          errorHandler({
            response,
            successCallback: onClose,
            successMessage: "Send cancel request successfully",
            errorMessage: "Send cancel request failed",
          });
        }
      }
      if (response?.code == 0) {
        errorHandler({
          response,
          successCallback: onClose,
          successMessage: "Send cancel request successfully",
          errorMessage: "Send cancel request failed",
        });
      }
      if (response?.code == -1) {
        toast({
          description: message.concurencyUpdate,
          color: "bg-red-100",
        });
      }
    } catch (error) {}
  };

  const onSkipCancelRequest = async () => {
    try {
      if (!leave || !leave?.id) return;
      const params: SkipCancelRequestLeaveParams = {
        id: leave.id,
        updated_at: leave?.updated_at,
      };
      const response = await skipCancelRequestLeaveUseCase.execute(params);
      errorHandler({
        response,
        successCallback: onClose,
        successMessage: "Skip cancel request successfully",
        errorMessage: "Skip cancel request failed",
      });
    } catch (error) {}
  };

  const onConfirmLeave = async () => {
    try {
      if (!leave || !leave?.id) return;
      const params: ConfirmLeaveParams = {
        id: leave.id,
        updated_at: leave?.updated_at,
      };
      const response = await confirmLeaveUseCase.execute(params);
      if (response?.code == 1) {
        toast({
          description: "Comfirmed leave failed",
          color: "bg-red-100",
        });
      } else if (response?.code == 0) {
        if (response?.message && response?.message == "LEAVE_IS_MERGED") {
          setLeaveFirstIdkey(response?.data?.leaveFirstIdkey || "");
          setLeaveSecondIdkey(response?.data?.leaveSecondIdkey || "");
          setOpenMergeLeaveInfoDialog(true);
        } else {
          toast({
            description: "Comfirmed leave successfully",
            color: "bg-blue-200",
          });
          onClose();
        }
      } else {
        toast({
          description: message.concurencyUpdate,
          color: "bg-red-100",
        });
      }
    } catch (error) {}
  };
  const goToErrorPage = () => {
    setAlertDialogMessage(false);
    router.replace("/error");
  };

  const onRejectLeave = async () => {
    try {
      if (!leave || !leave?.id) return;
      const params: RejectLeaveParams = {
        id: leave.id,
        updated_at: leave?.updated_at,
      };
      const response = await rejectLeaveByManagerUseCase.execute(params);
      errorHandler({
        response,
        successCallback: onClose,
        successMessage:
          leave.cancel_request == CancelRequestValue.None
            ? "Canceled leave successfully"
            : "Confirmed cancel leave successfully",
        errorMessage:
          leave.cancel_request == CancelRequestValue.None
            ? "Canceled leave failed"
            : "Confirmed cancel leave failed",
      });
    } catch (error) {}
  };

  const isDirty = useMemo(() => {
    const values = form.getValues();
    const otherInfo = leave?.other_info ? leave?.other_info?.trim() : "";
    return leave
      ? values?.description?.trim() !== leave?.description?.trim() ||
          values?.other_info?.trim() !== otherInfo ||
          String(values?.shift) !== String(leave?.shift) ||
          formatDateToString(values?.day_leaves) !== leave?.day_leaves ||
          String(values?.approverId) !== String(leave?.approver_id)
      : false;
  }, Object.values(form.watch()));

  useEffect(() => {
    onLoadLeaveDetail();
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
          <h2 className="text-xl font-bold">Leave Infomation</h2>
          <p className="font-bold text-xl">({leave?.idkey})</p>
        </div>
        <div className="flex flex-col items-start w-full">
          <h3 className="font-bold mb-3">Requestor Information</h3>
          <div className="flex flex-row justify-start gap-6 h-[132px]">
            <div className="flex items-center justify-center h-full aspect-square">
              <StyledAvatarPreview
                image={
                  leave?.image
                    ? `${process.env.NEXT_PUBLIC_BASE_URL_IMAGE}${leave.image}`
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
                      {leave?.user_idkey}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-6">
                      Full name:
                    </td>
                    <td className="text-[14px] font-normal leading-6 px-2">
                      {leave?.employee_name}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-6">
                      Contact:
                    </td>
                    <td className="text-[14px] font-normal leading-6 px-2">
                      {leave?.phone}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-6">
                      Leave hour:
                    </td>
                    <td className="text-[14px] font-normal leading-6 px-2">
                      {convertHourToDay(
                        leave?.time_off_hours,
                        leave?.last_year_time_off
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-6">
                      Allocated hour:
                    </td>
                    <td className="text-[14px] font-normal leading-6 px-2">
                      {convertHourToDay(leave?.allocated_hour, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {leave?.cancel_request == CancelRequestValue.Waiting && (
              <div className="h-full relative">
                <Image
                  src={CanRequestIcon}
                  alt=""
                  className="object-cover rounded-lg w-[126px] h-[126px]"
                  height={126}
                  width={126}
                />
                <p className="text-white font-bold text-[12px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
                  Cancel Request
                </p>
              </div>
            )}
            {leave?.cancel_request == CancelRequestValue.Skip && (
              <div className="h-full relative">
                <Image
                  src={CanRequestIconBlue}
                  alt=""
                  className="object-cover rounded-lg w-[126px] h-[126px]"
                  height={126}
                  width={126}
                />
                <div className="text-white font-bold text-[12px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap flex flex-col items-center">
                  <p>Cancel Request</p>
                  <p>Agreed</p>
                </div>
              </div>
            )}
            {leave?.cancel_request == CancelRequestValue.Cancel && (
              <div className="h-full relative">
                <Image
                  src={CanRequestIconGray}
                  alt=""
                  className="object-cover rounded-lg w-[126px] h-[126px]"
                  height={126}
                  width={126}
                />
                <div className="text-white font-bold text-[12px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap flex flex-col items-center">
                  <p>Cancel Request</p>
                  <p>Skipped</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <h3 className="font-bold mt-3 mb-3">Leave Detail</h3>
        <div
          className={twMerge(
            "flex flex-col items-start w-full h-full overflow-y-auto flex-1 p-2  rounded-sm",
            mode == FormModeType.VIEW && `bg-orange-50`
          )}
          style={{
            scrollbarWidth: "none",
          }}
        >
          <FormLeave form={form} leave={leave} ref={formLeaveRef} mode={mode} />
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
              onClick={form.handleSubmit(onUpdateFormLeave)}
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
            {(isAdmin || (isManager && isExecuteLeavebutton)) &&
              leave?.cancel_request == CancelRequestValue.Waiting &&
              leave?.status != LeaveStatusValue.Canceled && (
                <AlertDialogExecuteLeavelButton
                  onOK={onSkipCancelRequest}
                  tabIndex={4}
                  description={`Do you want to confirm skip the cancel request for`}
                  button="Skip CR"
                  fullname={leave?.employee_name}
                />
              )}
            {isOwner && leave?.cancel_request == CancelRequestValue.Waiting && (
              <Button
                tabIndex={6}
                className="p-0 m-0 laptop:w-[152px] h-[50px] font-normal bg-[#A2A1A8] hover:bg-[#B0B0B8] text-white text-[16px]  rounded-[10px]"
                type="button"
              >
                {i18nLeave("cancelRequestButton")}
              </Button>
            )}
            {!isAdmin &&
              isOwner &&
              isCreateLeavebutton &&
              leave?.cancel_request == CancelRequestValue.None &&
              leave?.status != LeaveStatusValue.Canceled && (
                <StyledCancelRequestDialog
                  onOK={onSendCancelRequest}
                  onClose={() => {}}
                  canRequest={leave?.cancel_request}
                />
              )}
            {/* Trường hợp đơn chờ duyệt và có cancel request != 2, là trường hợp cancel request chưa được skip bởi người duyệt*/}
            {(isAdmin || (isManager && isExecuteLeavebutton)) &&
              leave?.status == LeaveStatusValue.Waiting &&
              leave?.cancel_request != CancelRequestValue.Skip && (
                <AlertDialogExecuteLeavelButton
                  onOK={onRejectLeave}
                  tabIndex={5}
                  description={`Do you want to disapprove the leave for`}
                  button="Disapprove"
                  fullname={leave?.employee_name}
                />
              )}
            {/* Trường hợp đơn đã duyệt và có cancel request = 1, là trường hợp cancel request đang chò được duyệt*/}
            {(isAdmin || (isManager && isExecuteLeavebutton)) &&
              leave?.status == LeaveStatusValue.Confirmed &&
              leave?.cancel_request == CancelRequestValue.Waiting && (
                <AlertDialogExecuteLeavelButton
                  onOK={onRejectLeave}
                  tabIndex={5}
                  description={`Do you want to agree CR the leave for`}
                  button="Agree CR"
                  fullname={leave?.employee_name}
                />
              )}
            {(isAdmin || (isManager && isExecuteLeavebutton)) &&
              leave?.status == LeaveStatusValue.Waiting && (
                <AlertDialogExecuteLeavelButton
                  onOK={onConfirmLeave}
                  tabIndex={8}
                  description={
                    leave?.user_status_working != STAFF_STATUS_WORKING[2].value
                      ? "The staff is not an official staff, the staff will be placed on unpaid leave. Are you sure to approve leave of"
                      : calculateSalary(
                          Number(leave?.time_off_hours),
                          Number(leave?.last_year_time_off),
                          leave?.shift
                        )
                      ? `Are you sure to approve leave of`
                      : "The staff will be placed on unpaid leave. Are you sure to approve leave of"
                  }
                  button="Approve"
                  fullname={leave?.employee_name}
                />
              )}
            {isOwner &&
              isCreateLeavebutton &&
              leave?.status == LeaveStatusValue.Waiting && (
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
      <AlertDialogMergeLeaveInfo
        tabIndex={16}
        title={"Infomation merge leave"}
        onConfirm={onCloseMergeLeaveDialog}
        open={openMergeLeaveInfoDialog}
        onOpenChange={setOpenMergeLeaveInfoDialog}
        leaveFirstIdkey={leaveFirstIdkey}
        leaveSecondIdkey={leaveSecondIdkey}
      />
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
