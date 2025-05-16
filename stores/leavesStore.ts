import { GetLeaveListParams, GetMyLeavesParams } from "@/apis/modules/leave";
import { Leave } from "@/core/entities/models/leave.model";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface LeaveState {
  isDirtyLeave: boolean;
  leaveList: Leave[];
  myLeave: Leave[];
  totalItems: number;
  totalMyLeave: number;
  searchParams: GetLeaveListParams;
  searchMyLeaveParams: GetMyLeavesParams;
  selectedLeave: Leave;
  updateLeaveListData: (data: Leave[], totalItems: number) => void;
  updateMyLeaveData: (data: Leave[], totalMyLeave: number) => void;
  updateSearchParams: (params: GetLeaveListParams) => void;
  updateSearchMyLeaveParams: (params: GetMyLeavesParams) => void;
  updateSelectedLeave: (leave: Leave) => void;
  updateIsDirtyLeave: (isDirtyLeave: boolean) => void;
}
export const useLeaveStore = create<LeaveState>()(
  devtools(
    (set) => ({
      isDirtyLeave: false,
      leaveList: [],
      myLeave: [],
      totalItems: 0,
      totalMyLeave: 0,
      searchParams: {},
      searchMyLeaveParams: {},
      selectedLeave: {},
      updateLeaveListData: (data: Leave[], total: number) =>
        set((state) => ({ ...state, leaveList: data, totalItems: total })),
      updateSearchParams: (params: GetLeaveListParams) =>
        set((state) => ({ ...state, searchParams: params })),
      updateSearchMyLeaveParams: (params: GetMyLeavesParams) =>
        set((state) => ({ ...state, searchMyLeaveParams: params })),
      updateSelectedLeave: (leave: Leave) =>
        set((state) => ({ ...state, selectedLeave: leave })),
      updateMyLeaveData: (data: Leave[], total: number) =>
        set((state) => ({ ...state, myLeave: data, totalMyLeave: total })),
      updateIsDirtyLeave: (isDirtyLeave: boolean) =>
        set((state) => ({ ...state, isDirtyLeave: isDirtyLeave })),
    }),
    { name: "leaveStore" }
  )
);
