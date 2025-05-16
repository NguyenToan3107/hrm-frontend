import { DayOff } from "@/core/entities/models/dayoff.model";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface ScheduleState {
  dayOffList: DayOff[];
  reload: boolean;
  updateDayOffListData: (data: DayOff[]) => void;
  updateReload: (reload: boolean) => void;
}
export const useScheduleStore = create<ScheduleState>()(
  devtools(
    persist(
      (set) => ({
        dayOffList: [],
        reload: false,
        updateReload: (reload: boolean) =>
          set((state) => ({ ...state, reload: reload })),
        updateDayOffListData: (data) =>
          set((state) => ({ ...state, dayOffList: data })),
      }),

      { name: "scheduleStore" }
    )
  )
);
