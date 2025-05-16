import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// interface PositionProps {
//   value: string | number;
//   name: string;
// }
interface RoleProps {
  value: string | number;
  name: string;
  description?: string
}

interface DepartmentProps {
  id: number;
  name: string;
}

interface ApproveUserProps {
  id: number;
  idkey: string;
  fullname: string;
}

interface CommonState {
  sidebarItemSelected: string;
  arraySidebarItem: string[];
  sidebarStatus: boolean;
  roleData: RoleProps[];
  departmentData: DepartmentProps[];
  approveUsersData: ApproveUserProps[];
  updateArraySidebarItem: (arraySidebarItem: string[]) => void;
  updateSideBarStatus: (positionData: boolean) => void;
  updateSideBarItemSelected: (path: string) => void;
  updateRolesData: (rolesData: RoleProps[]) => void;
  updateDepartmentData: (departmentData: DepartmentProps[]) => void;
  updateApproveUsersData: (approveUsersData: ApproveUserProps[]) => void;
  destroy: () => void;
}

export const useCommonStore = create<CommonState>()(
  devtools(
    persist(
      (set) => ({
        sidebarItemSelected: "",
        arraySidebarItem: [],
        sidebarStatus: false,
        roleData: [],
        sideBarState: false,
        departmentData: [],
        approveUsersData: [],
        updateSideBarStatus: (sidebarStatus) =>
          set((state) => ({ ...state, sidebarStatus: sidebarStatus })),
        updateSideBarItemSelected: (path) =>
          set((state) => ({ ...state, sidebarItemSelected: path })),
        updateRolesData: (rolesData) =>
          set((state) => ({ ...state, roleData: rolesData })),
        updateDepartmentData: (departmentData) =>
          set((state) => ({ ...state, departmentData: departmentData })),
        updateApproveUsersData: (approveUsersData) =>
          set((state) => ({ ...state, approveUsersData: approveUsersData })),
        updateArraySidebarItem: (arraySidebarItem) =>
          set((state) => ({ ...state, arraySidebarItem: arraySidebarItem })),
        destroy: () =>
          set(() => ({
            sidebarItemSelected: "",
            arraySidebarItem: [],
            sidebarStatus: false,
            roleData: [],
            departmentData: [],
            approveUsersData: [],
          })),
      }),

      { name: "commonStore" }
    )
  )
);

interface EditingState {
  isEditing: boolean;
  isDirtyMyPage: boolean;
}
interface EditingAction {
  setIsEditing: (value: boolean) => void;
  resetEditingStore: () => void;
  setIsDirtyMyPage: (value: boolean) => void;
}

const initialState: EditingState = {
  isEditing: false,
  isDirtyMyPage: false,
};

export const useEditingStore = create<EditingState & EditingAction>((set) => ({
  isEditing: false,
  isDirtyMyPage: false,
  setIsEditing: (value: boolean) => set({ isEditing: value }),
  resetEditingStore: () => {
    set(initialState);
  },
  setIsDirtyMyPage: (value: boolean) => set({ isDirtyMyPage: value }),
}));

interface FileStore {
  image: File | null;
  selectedAvatarFile: File | null;
  setImage: (file: File) => void;
  setSelectedAvatarFile: (file: File) => void;
  clearImage: () => void;
  clearImageRoot: () => void;
}

export const useFileStore = create<FileStore>((set) => ({
  image: null,
  selectedAvatarFile: null,
  setImage: (file: File) => set({ image: file }),
  setSelectedAvatarFile: (file: File) => set({ selectedAvatarFile: file }),
  clearImage: () => set({ image: null }),
  clearImageRoot: () => set({ selectedAvatarFile: null }),
}));
