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
import { ScheduleRepositoryImpl } from "@/core/infrastructure/repositories/schedule.repo";
import { GetDayOffsUseCase } from "@/core/application/usecases/schedule/getDayOffs.usecase";
import { GetDayOffsParams } from "@/apis/modules/schedule";
import { DayOff } from "@/core/entities/models/dayoff.model";

interface Props {
  open: boolean;
  onClose(): void;
  onOpenChange(open: boolean): void;
  searchParams: GetDayOffsParams;
}

const scheduleRepo = new ScheduleRepositoryImpl();
const getDayOffsUseCase = new GetDayOffsUseCase(scheduleRepo);

export function AlertDialogViewDayOffDetail(props: Props) {
  const { open, onOpenChange, onClose, searchParams } = props;
  // const [loading, setLoading] = useState(false);
  const [dayOffs, setDayOffs] = useState<DayOff[]>();
  const [total, setTotal] = useState<number>();

  const onCloseDialog = () => {
    onClose();
  };

  const getLeaveList = async () => {
    try {
      //   setLoading(true);
      const params: GetDayOffsParams = { ...searchParams, limit: 1000 };
      const response = await getDayOffsUseCase.execute(params);
      setDayOffs(response?.data);
      setTotal(response?.totalItem);
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
    current_year: "Current Year",
    country: "Country",
    sort_by: "Sort By",
    sort_order: "Sort Order",
    status: "Status",
    day_off_type: "Day-off Type",
    create_date: "Create Date",
    day_off_start_date: "Start Date",
    day_off_end_date: "End Date",
  };

  const ignoredKeys = ["page", "limit", "country"];
  const statusLabels: Record<string, string> = {
    0: "Off",
    1: "Working",
  };
  const valueMappers: Record<string, (value: any) => string> = {
    status: (value) => statusLabels[Number(value)] || String(value),
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
    const statusLabels: Record<string, string> = {
      0: "Off",
      1: "Working",
    };

    const statusCount: Record<number, number> = {};

    dayOffs?.forEach((leave: Leave) => {
      if (typeof leave.status === "number") {
        statusCount[leave.status] = (statusCount[leave.status] || 0) + 1;
      }
    });

    return {
      statusLabels,
      statusCount,
    };
  }, [dayOffs]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <StyledOverlay isVisible={false} />
      <AlertDialogContent className="gap-0 h-auto  w-[400px] p-5 rounded-md">
        <AlertDialogTitle className="text-[24px] font-bold h-0 mb-4">
          Statistics day off applications
        </AlertDialogTitle>

        <AlertDialogHeader className="flex justify-start text-left overflow-y-auto h-auto mt-6 hide-scrollbar">
          <div>
            <div className="mb-4">
              <p className="font-semibold mb-1">🔍 Search Conditions:</p>
              {renderSearchConditions()}
            </div>
            <div className="">
              <p className="font-semibold mb-1">📋 Day Off Status: </p>
              {Object.entries(statistics.statusLabels).map(([key, label]) => (
                <p key={`status-${key}`}>
                  {label}: {statistics.statusCount[Number(key)] || 0}
                </p>
              ))}
              <p className="font-semibold mt-2">✅ Total day off: {total}</p>
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
