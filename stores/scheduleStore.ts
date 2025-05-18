import { GetDayOffsParams } from "@/apis/modules/schedule";
import { DayOff } from "@/core/entities/models/dayoff.model";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface ScheduleState {
  isDirtyDayOff: boolean;
  dayOffList: DayOff[];
  reload: boolean;
  totalItems: number;
  searchParams: GetDayOffsParams;
  updateDayOffListData: (data: DayOff[], totalItems: number) => void;
  updateReload: (reload: boolean) => void;
  updateSearchParams: (params: GetDayOffsParams) => void;
  updateIsDirtyDayOff: (isDirtyDayOff: boolean) => void;
}
export const useScheduleStore = create<ScheduleState>()(
  devtools(
    persist(
      (set) => ({
        isDirtyDayOff: false,
        dayOffList: [],
        reload: false,
        totalItems: 0,
        searchParams: {},
        updateReload: (reload: boolean) =>
          set((state) => ({ ...state, reload: reload })),
        updateDayOffListData: (data: DayOff[], total: number) =>
          set((state) => ({ ...state, dayOffList: data, totalItems: total })),
        updateSearchParams: (params: GetDayOffsParams) =>
          set((state) => ({ ...state, searchParams: params })),
        updateIsDirtyDayOff: (isDirtyDayOff: boolean) =>
          set((state) => ({ ...state, isDirtyDayOff: isDirtyDayOff })),
      }),

      { name: "scheduleStore" }
    )
  )
);
