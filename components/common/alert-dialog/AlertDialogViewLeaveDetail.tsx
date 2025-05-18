"use client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StyledOverlay from "@/components/common/StyledOverlay";
import { Leave } from "@/core/entities/models/leave.model";
import { useEffect, useMemo, useState } from "react";
import { LeaveRepositoryImpl } from "@/core/infrastructure/repositories/leave.repo";
import { GetLeavesListUseCase } from "@/core/application/usecases/leave/getLeaveList";
import { GetLeaveListParams } from "@/apis/modules/leave";

interface Props {
  open: boolean;
  onClose(): void;
  onOpenChange(open: boolean): void;
  searchParams: GetLeaveListParams;
}

const leaveRepo = new LeaveRepositoryImpl();
const getLeavesListUseCase = new GetLeavesListUseCase(leaveRepo);

export function AlertDialogViewLeaveDetail(props: Props) {
  const { open, onOpenChange, onClose, searchParams } = props;
  // const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState<Leave[]>();

  const onCloseDialog = () => {
    onClose();
  };

  const getLeaveList = async () => {
    try {
      //   setLoading(true);
      const params: GetLeaveListParams = { ...searchParams, limit: 1000 };
      const response = await getLeavesListUseCase.execute(params);
      setLeaves(response?.data);
    } catch (error: any) {
    } finally {
      //   setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams) {
      getLeaveList();
    }
  }, [searchParams]);

  const conditionLabels: Record<string, string> = {
    sort_by: "Sort By",
    sort_order: "Sort Order",
    status: "Status",
    approver_id: "Approver ID",
    leave_type: "Leave Type",
    leave_id: "Leave ID",
    employee_name: "Employee Name",
    create_date: "Create Date",
    leave_start_date: "Leave Start Date",
    leave_end_date: "Leave End Date",
    cancel_request: "Cancel Request",
    approver: "Approver",
  };

  const ignoredKeys = ["page", "limit"];
  const statusLabels: Record<string, string> = {
    0: "Waiting",
    1: "Approved",
    2: "Disapproved",
  };

  const cancelLabels: Record<string, string> = {
    0: "Not available",
    1: "Pending request",
    2: "Agreed",
    3: "Skipped",
  };

  const valueMappers: Record<string, (value: any) => string> = {
    status: (value) => statusLabels[Number(value)] || String(value),
    cancel_request: (value) => cancelLabels[Number(value)] || String(value),
  };

  const renderSearchConditions = () => {
    return Object.entries(searchParams)
      .filter(
        ([key, value]) =>
          !ignoredKeys.includes(key) && value !== undefined && value !== ""
      )
      .map(([key, value]) => {
        const displayValue =
          valueMappers[key]?.(value) ??
          (value instanceof Date ? value.toLocaleDateString() : String(value));

        return (
          <p key={key}>
            <span>{conditionLabels[key] || key}:</span> {displayValue}
          </p>
        );
      });
  };

  const statistics = useMemo(() => {
    const statusLabels = {
      0: "Waiting",
      1: "Approved",
      2: "Disapproved",
    };

    const cancelLabels = {
      0: "Not available",
      1: "Pending request",
      2: "Agreed",
      3: "Skipped",
    };

    const statusCount: Record<number, number> = {};
    const cancelCount: Record<number, number> = {};

    leaves?.forEach((leave: Leave) => {
      if (typeof leave.status === "number") {
        statusCount[leave.status] = (statusCount[leave.status] || 0) + 1;
      }

      if (typeof leave.cancel_request === "number") {
        cancelCount[leave.cancel_request] =
          (cancelCount[leave.cancel_request] || 0) + 1;
      }
    });

    return {
      statusLabels,
      cancelLabels,
      statusCount,
      cancelCount,
    };
  }, [leaves]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <StyledOverlay isVisible={false} />
      <AlertDialogContent className="gap-0 h-[560px] w-[400px] p-5 rounded-md">
        <AlertDialogTitle className="text-[24px] font-bold h-0">
          Statistics on leave applications
        </AlertDialogTitle>

        <AlertDialogHeader className="flex justify-start text-left overflow-y-auto h-[400px] mt-6 hide-scrollbar">
          <div>
            <div className="mb-4">
              <p className="font-semibold mb-1">🔍 Search Conditions:</p>
              {renderSearchConditions()}
            </div>
            <div className="">
              <p className="font-semibold mb-1">📋 Leave Status: </p>
              {Object.entries(statistics.statusLabels).map(([key, label]) => (
                <p key={`status-${key}`}>
                  {label}: {statistics.statusCount[Number(key)] || 0}
                </p>
              ))}

              <p className="font-semibold mt-4 mb-1">
                ❌ Leave Cancel Request:
              </p>
              {Object.entries(statistics.cancelLabels).map(([key, label]) => (
                <p key={`cancel-${key}`}>
                  {label}: {statistics.cancelCount[Number(key)] || 0}
                </p>
              ))}
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <div className="flex justify-end">
            <AlertDialogCancel
              className="mt-0 w-[120px]"
              onClick={onCloseDialog}
            >
              Close
            </AlertDialogCancel>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
