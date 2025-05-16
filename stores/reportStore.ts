import { GetStaffReportParams } from "@/apis/modules/report";
import { User } from "@/core/entities/models/user.model";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface Day {
  month: number;
  year: number;
  day: string;
  day_of_week_jp: number;
  is_working_day: boolean;
  salary: number | null;
  shift: number | null;
  day_off: null | 0 | 1;
  leave: boolean | null;
  is_weekend_day: boolean | null;
}

interface Users {
  fullname: string;
  id?: number;
  idkey: string;
  department: string[];
}

export interface DataExport {
  days: Day[];
  month: number;
  year: number;
  total: number;
  user: Users;
}

export interface CheckedStaffExport {
  id?: number;
  idkey: string;
  fullname: string;
  image: string;
}
export interface DataCheckedStaff {
  start_date: string;
  end_date: string;
  users: CheckedStaffExport[];
}

export interface ReportState {
  isDirty: boolean;
  reportStaffList: User[];
  totalItems: number;
  searchParams: GetStaffReportParams;
  dataExports: DataExport[];
  selectedStaffIds: number[];
  updateSelectedStaffIds: (selectedIds: number[]) => void;
  updateReportStaffListData: (data: User[], totalItems: number) => void;
  updateSearchParams: (params: GetStaffReportParams) => void;
  setDataExports: (params: DataExport[]) => void;
  deleteDataExportByIdUser: (idUser: number | undefined) => void;
}
export const useReportStore = create<ReportState>()(
  devtools(
    (set) => ({
      isDirty: false,
      reportStaffList: [],
      selectedStaffIds: [],
      totalItems: 0,
      searchParams: {},
      dataExports: [],
      updateSelectedStaffIds: (selectedIds: number[]) =>
        set((state) => ({
          ...state,
          selectedStaffIds: selectedIds,
        })),
      updateReportStaffListData: (data: User[], total: number) =>
        set((state) => ({
          ...state,
          reportStaffList: data,
          totalItems: total,
        })),
      updateSearchParams: (params: GetStaffReportParams) =>
        set((state) => ({ ...state, searchParams: params })),
      setDataExports: (params: DataExport[]) =>
        set((state) => ({ ...state, dataExports: params })),
      deleteDataExportByIdUser: (idUser: number | undefined) =>
        set((state) => ({
          dataExports: state.dataExports.filter(
            (dataExport) => dataExport?.user?.id !== idUser
          ),
        })),
    }),
    { name: "reportStore" }
  )
);
