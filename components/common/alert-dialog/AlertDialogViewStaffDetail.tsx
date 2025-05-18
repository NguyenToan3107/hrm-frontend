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
import { useEffect, useMemo, useState } from "react";
import { GetStaffListParams } from "@/apis/modules/user";
import { UserRepositoryImpl } from "@/core/infrastructure/repositories/user.repo";
import { GetStaffListUseCase } from "@/core/application/usecases/staff-master/getUserList.usecase";
import { User } from "@/core/entities/models/user.model";

interface Props {
  open: boolean;
  onClose(): void;
  onOpenChange(open: boolean): void;
  searchParams: GetStaffListParams;
}

const userRepo = new UserRepositoryImpl();
const getStaffListUseCase = new GetStaffListUseCase(userRepo);

export function AlertDialogViewStaffDetail(props: Props) {
  const { open, onOpenChange, onClose, searchParams } = props;
  const [users, setUsers] = useState<User[]>();
  const [total, setTotal] = useState<number>();

  const onCloseDialog = () => {
    onClose();
  };

  const getStaffList = async () => {
    try {
      const params: GetStaffListParams = { ...searchParams, limit: 1000 };
      const response = await getStaffListUseCase.execute(params);
      setUsers(response?.data);
      setTotal(response?.totalItem);
    } catch (error: any) {
    } finally {
    }
  };

  useEffect(() => {
    if (searchParams) {
      getStaffList();
    }
  }, [searchParams]);

  const conditionLabels: Record<string, string> = {
    sort_by: "Sort By",
    sort_order: "Sort Order",
    position: "Position",
    status: "Status",
    type: "Type",
    keyword: "Keyword",
    role: "Role",
  };

  const ignoredKeys = ["page", "limit"];
  //   const statusLabels: Record<string, string> = {
  //     -1: "All",
  //     0: "Inactive",
  //     1: "Active",
  //   };

  const statusLabels: Record<string, string> = {
    "-1": "All",
    "0": "Inactive",
    "1": "Active",
  };

  const statusWorkingLabels: Record<string, string> = {
    1: "Intern",
    2: "Probation",
    3: "Official",
  };

  const valueMappers: Record<string, (value: any) => string> = {
    status: (value) => statusLabels[Number(value)] || String(value),
    status_working: (value) =>
      statusWorkingLabels[Number(value)] || String(value),
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
      0: "Inactive",
      1: "Active",
    };

    const statusWorkingLabels: Record<string, string> = {
      1: "Intern",
      2: "Probation",
      3: "Official",
    };

    const statusCount: Record<number, number> = {};
    const statusWorkingCount: Record<number, number> = {};

    users?.forEach((user: User) => {
      if (typeof user.status === "number") {
        statusCount[user.status] = (statusCount[user.status] || 0) + 1;
      }

      if (typeof user.status_working === "number") {
        statusWorkingCount[user.status_working] =
          (statusWorkingCount[user.status_working] || 0) + 1;
      }
    });

    return {
      statusLabels,
      statusWorkingLabels,
      statusCount,
      statusWorkingCount,
    };
  }, [users]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <StyledOverlay isVisible={false} />
      <AlertDialogContent className="gap-0 h-auto w-[400px] p-5 rounded-md">
        <AlertDialogTitle className="text-[24px] font-bold h-0 mb-4">
          Statistics on staff applications
        </AlertDialogTitle>

        <AlertDialogHeader className="flex justify-start text-left overflow-y-auto h-auto mt-6 hide-scrollbar">
          <div>
            <div className="mb-4">
              <p className="font-semibold mb-1">🔍 Search Conditions:</p>
              {renderSearchConditions()}
            </div>
            <div className="">
              <p className="font-semibold mb-1">📋 Staff Status: </p>
              {Object.entries(statistics.statusLabels).map(([key, label]) => (
                <p key={`status-${key}`}>
                  {label}: {statistics.statusCount[Number(key)] || 0}
                </p>
              ))}

              <p className="font-semibold mt-4 mb-1">⏳ Status Working:</p>
              {Object.entries(statistics.statusWorkingLabels).map(
                ([key, label]) => (
                  <p key={`cancel-${key}`}>
                    {label}: {statistics.statusWorkingCount[Number(key)] || 0}
                  </p>
                )
              )}
              <p className="font-semibold mt-2">✅ Total staffs: {total}</p>
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
