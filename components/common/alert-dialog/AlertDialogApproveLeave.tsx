"use client";
import IconCheck from "@/app/assets/icons/iconCheck.svg";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Leave } from "@/core/entities/models/leave.model";
import Image from "next/image";
import { useState } from "react";
import StyledOverlay from "../StyledOverlay";
import { ConfirmLeaveParams } from "@/apis/modules/leave";
import { ConfirmLeaveByManagerUseCase } from "@/core/application/usecases/leave/confirmLeave";
import { LeaveRepositoryImpl } from "@/core/infrastructure/repositories/leave.repo";
import { calculateSalary } from "@/utilities/helper";
import { useTranslations } from "next-intl";
import { STAFF_STATUS_WORKING } from "@/utilities/static-value";
import { AlertDialogMergeLeaveInfo } from "@/components/common/alert-dialog/AlertDialogMergeLeaveInfo";
import { toast } from "@/hooks/use-toast";
import { message } from "@/app/assets/locales/en";

const leaveRepo = new LeaveRepositoryImpl();

const confirmLeaveUseCase = new ConfirmLeaveByManagerUseCase(leaveRepo);

interface Props {
  leave: Leave;
  onClose(): void;
}
export function AlertDialogApproveLeave(props: Props) {
  const { leave } = props;
  const [loading, setLoading] = useState(false);
  const i18nCommon = useTranslations("Common");
  const [leaveFirstIdkey, setLeaveFirstIdkey] = useState("");
  const [leaveSecondIdkey, setLeaveSecondIdkey] = useState("");
  const [openMergeLeaveInfoDialog, setOpenMergeLeaveInfoDialog] =
    useState(false);

  const onConfirmLeave = async () => {
    try {
      setLoading(true);
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
          props.onClose();
        }
      } else {
        toast({
          description: message.concurencyUpdate,
          color: "bg-red-100",
        });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertDialog>
        <StyledOverlay isVisible={loading} />
        <AlertDialogTrigger asChild>
          <Image
            alt="Delete"
            src={IconCheck}
            className="h-[24px] aspect-square hover:cursor-pointer"
          />
        </AlertDialogTrigger>
        <AlertDialogContent className="gap-4">
          <AlertDialogHeader>
            {leave?.user_status_working != STAFF_STATUS_WORKING[2].value ? (
              <AlertDialogDescription
                className={"text-left text-[16px] font-normal"}
              >
                The staff is not an official staff, the staff will be placed on
                unpaid leave. Are you sure to approve leave of
                <span className="font-bold text-[16px] mx-1">
                  {leave.employee_name}
                </span>
              </AlertDialogDescription>
            ) : calculateSalary(
                Number(leave?.time_off_hours),
                Number(leave?.last_year_time_off),
                leave?.shift
              ) ? (
              <AlertDialogDescription
                className={"text-left text-[16px] font-normal"}
              >
                Are you sure to approve leave of
                <span className="font-bold text-[16px] mx-1">
                  {leave.employee_name}
                </span>
              </AlertDialogDescription>
            ) : (
              <AlertDialogDescription
                className={"text-left text-[16px] font-normal"}
              >
                The staff will be placed on unpaid leave. Are you sure to
                approve leave of
                <span className="font-bold text-[16px] mx-1">
                  {leave.employee_name}
                </span>
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="flex flex-1 items-center justify-end gap-2 ">
              <AlertDialogCancel className="mt-0 w-[120px]">
                {i18nCommon("cancelButton")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onConfirmLeave}
                className="mb-0 w-[120px] text-white bg-primary hover:bg-primary-hover"
              >
                {i18nCommon("approveButton")}
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialogMergeLeaveInfo
        tabIndex={16}
        title={"Infomation merge leave"}
        onConfirm={props.onClose}
        open={openMergeLeaveInfoDialog}
        onOpenChange={setOpenMergeLeaveInfoDialog}
        leaveFirstIdkey={leaveFirstIdkey}
        leaveSecondIdkey={leaveSecondIdkey}
      />
    </>
  );
}
