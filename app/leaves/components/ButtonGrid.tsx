"use client";
import {
  ConfirmLeaveParams,
  RejectLeaveParams,
  RequestCancelRequestLeaveParams,
  SkipCancelRequestLeaveParams,
} from "@/apis/modules/leave";
import { message } from "@/app/assets/locales/en";
import StyledCancelRequestDialog from "@/components/common/StyledCancelRequestDialog";
import { AlertDialogExecuteLeavelButton } from "@/components/common/alert-dialog/AlertDialogExecuteLeavelButton";
import { AlertDialogMergeLeaveInfo } from "@/components/common/alert-dialog/AlertDialogMergeLeaveInfo";
import { Button } from "@/components/ui/button";
import { ConfirmLeaveByManagerUseCase } from "@/core/application/usecases/leave/confirmLeave";
import { RejectLeaveByManagerUseCase } from "@/core/application/usecases/leave/rejectLeave";
import { RequestCancelLeaveRequestUseCase } from "@/core/application/usecases/leave/requestCancelLeave";
import { SkipCancelRequestLeaveUseCase } from "@/core/application/usecases/leave/skipCancelRequestLeave";
import { Leave } from "@/core/entities/models/leave.model";
import { LeaveRepositoryImpl } from "@/core/infrastructure/repositories/leave.repo";
import { toast } from "@/hooks/use-toast";
import { useUserStore } from "@/stores/userStore";
import { CancelRequestValue, LeaveStatusValue } from "@/utilities/enum";
import { calculateSalary, errorHandler } from "@/utilities/helper";
import { LEAVE_STATUS, STAFF_STATUS_WORKING } from "@/utilities/static-value";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { isMobile } from "react-device-detect";

interface Props {
  leave: Leave | undefined;
  onSetEditMode(): void;
}

const leaveRepo = new LeaveRepositoryImpl();
const sendCancelRequestLeaveUseCase = new RequestCancelLeaveRequestUseCase(
  leaveRepo
);
const skipCancelRequestLeaveUseCase = new SkipCancelRequestLeaveUseCase(
  leaveRepo
);
const confirmLeaveUseCase = new ConfirmLeaveByManagerUseCase(leaveRepo);
const rejectLeaveByManagerUseCase = new RejectLeaveByManagerUseCase(leaveRepo);

export default function ButtonGrid(props: Props) {
  const { leave, onSetEditMode } = props;
  const { user } = useUserStore();
  const [leaveFirstIdkey, setLeaveFirstIdkey] = useState("");
  const [leaveSecondIdkey, setLeaveSecondIdkey] = useState("");
  const [openMergeLeaveInfoDialog, setOpenMergeLeaveInfoDialog] =
    useState(false);

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

  const router = useRouter();
  const onGoBack = () => {
    router.back();
  };

  const onCloseMergeLeaveDialog = () => {
    setOpenMergeLeaveInfoDialog(false);
    router.back();
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
      errorHandler({
        response,
        successCallback: onGoBack,
        successMessage: "Send cancel request successfully",
        errorMessage: "Send cancel request failed",
      });
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
        successCallback: onGoBack,
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
          onGoBack();
        }
      } else {
        toast({
          description: message.concurencyUpdate,
          color: "bg-red-100",
        });
      }
    } catch (error) {}
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
        successCallback: onGoBack,
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

  return (
    <div className="flex flex-row justify-end gap-2 w-full mt-2">
      {isMobile && (
        <Button
          onClick={() => {
            router.replace("/leaves");
          }}
          type="button"
          className="w-[100px] h-8 laptop:hidden font-normal text-[12px] bg-white hover:bg-secondary border border-border"
        >
          Back
        </Button>
      )}
      {(isAdmin || (isManager && isExecuteLeavebutton)) &&
        leave?.cancel_request == CancelRequestValue.Waiting &&
        leave?.status != LeaveStatusValue.Canceled && (
          <AlertDialogExecuteLeavelButton
            onOK={onSkipCancelRequest}
            tabIndex={1}
            description={`Do you want to confirm skip the cancel request for`}
            button="Skip CR"
            fullname={leave?.employee_name}
          />
        )}
      {isOwner && leave?.cancel_request == CancelRequestValue.Waiting && (
        <Button
          tabIndex={6}
          className="min-w-[100px] text-[12px] laptop:text-[14px] p-0 h-8 laptop:h-10 hover:cursor-not-allowed text-white bg-[#A2A1A8] hover:bg-[#B0B0B8] font-normal rounded-[8px] flex items-center justify-center"
          type="button"
        >
          Cancel Request
        </Button>
      )}
      {isOwner &&
        leave?.cancel_request == CancelRequestValue.None &&
        String(leave?.status) !== LEAVE_STATUS[2]?.value && (
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
      {isOwner && String(leave?.status) == LEAVE_STATUS[0]?.value && (
        <Button
          tabIndex={4}
          onClick={onSetEditMode}
          className="min-w-[100px] p-0 laptop:h-10 h-8 text-white font-normal rounded-[8px] flex items-center justify-center"
          type="button"
        >
          Edit
        </Button>
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
