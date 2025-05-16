import { GetStaffListParams } from "@/apis/modules/user";
import { User } from "@/core/entities/models/user.model";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface StaffState {
  isDirty: boolean;
  editingStaff: User;
  staffList: User[];
  totalItems: number;
  searchParams: GetStaffListParams;
  selectedStaff: User;
  updateStaffListData: (data: User[], totalItems: number) => void;
  updateSearchParams: (params: GetStaffListParams) => void;
  updateStaffEditing: (staff: User) => void;
  updateSelectedStaff: (staff: User) => void;
  updateIsDirty: (isDirty: boolean) => void;
  resetEdittingStaff: () => void;
}
export const useStaffStore = create<StaffState>()(
  devtools(
    (set) => ({
      isDirty: false,
      editingStaff: {},
      selectedStaff: {},
      staffList: [],
      totalItems: 0,
      searchParams: {},
      updateStaffListData: (data: User[], total: number) =>
        set((state) => ({ ...state, staffList: data, totalItems: total })),
      updateSearchParams: (params: GetStaffListParams) =>
        set((state) => ({ ...state, searchParams: params })),
      updateStaffEditing: (staff: User) =>
        set((state) => ({
          ...state,
          editingStaff: { ...state.editingStaff, ...staff },
        })),
      updateSelectedStaff: (staff: User) =>
        set((state) => ({ ...state, selectedStaff: staff })),
      updateIsDirty: (isDirty: boolean) =>
        set((state) => ({ ...state, isDirty: isDirty })),
      resetEdittingStaff: () =>
        set((state) => ({ ...state, editingStaff: {}, isDirty: false })),
    }),
    { name: "staffStore" }
  )
);
