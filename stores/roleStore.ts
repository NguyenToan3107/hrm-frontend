import { GetRoleListParams } from "@/apis/modules/role";
import { Role } from "@/core/entities/models/role.model";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface RoleState {
  isDirtyRole: boolean;
  roleList: Role[];
  totalItems: number;
  searchParams: GetRoleListParams;
  updateRoleListData: (data: Role[], totalItems: number) => void;
  updateSearchParams: (params: GetRoleListParams) => void;
  updateIsDirtyRole: (isDirty: boolean) => void;
}
export const useRoleStore = create<RoleState>()(
  devtools(
    (set) => ({
      isDirtyRole: false,
      roleList: [],
      totalItems: 0,
      searchParams: {},
      updateRoleListData: (data: Role[], total: number) =>
        set((state) => ({ ...state, roleList: data, totalItems: total })),
      updateSearchParams: (params: GetRoleListParams) =>
        set((state) => ({ ...state, searchParams: params })),
      updateIsDirtyRole: (isDirtyRole: boolean) =>
        set((state) => ({ ...state, isDirtyRole: isDirtyRole })),
    }),
    { name: "roleStore" }
  )
);
