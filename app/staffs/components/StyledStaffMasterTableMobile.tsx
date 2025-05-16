"use client";
import { default as DefaultImage } from "@/app/assets/avatar/avatar_default.svg";
import StyledHeaderColumn from "@/components/common/StyledHeaderColumn";
import { GetStaffListUseCase } from "@/core/application/usecases/staff-master/getUserList.usecase";
import { User } from "@/core/entities/models/user.model";
import { UserRepositoryImpl } from "@/core/infrastructure/repositories/user.repo";
import useWindowSize from "@/hooks/useWindowSize";
import { useStaffStore } from "@/stores/staffStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StyledTableStatusItem from "./StyledTableStatusItem";

import { DeleteUsersParams } from "@/apis/modules/user";
import AdminCreateModal from "@/app/leaves/components/AdminCreateModal";
import { AlertDialogConfirmActiveUser } from "@/components/common/alert-dialog/AlertDialogConfirmActiveUser";
import { AlertDialogGoBackWillClearData } from "@/components/common/alert-dialog/AlertDialogGoBackWillClearData";
import { StyledMessageAlertDialog } from "@/components/common/alert-dialog/StyledMessageAlertDialog";
import StyledAvatarPreview from "@/components/common/StyledAvatarPreview";
import StyledNoDataGrid from "@/components/common/StyledNoDataGrid";
import { DeleteStaffUseCase } from "@/core/application/usecases/staff-master/deleteStaff.usecase";
import { SortOrder } from "@/utilities/enum";

const userRepo = new UserRepositoryImpl();
const getStaffListUseCase = new GetStaffListUseCase(userRepo);
const getInactiveUserUseCase = new DeleteStaffUseCase(userRepo);
interface Props {
  setLoading(loading: boolean): void;
  loading: boolean;
  currentPage: number;
}

export default function StyledStaffMasterTableMobile(props: Props) {
  const { loading, setLoading, currentPage } = props;
  const windowSize = useWindowSize();
  const router = useRouter();
  const staffList = useStaffStore((state) => state.staffList);
  const [isCreateLeaveModalOpen, setIsCreateLeaveModalOpen] = useState(false);
  const [confirmActiveUser, setConfirmActiveUser] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User>({});

  const onConfirmActiveUser = async (user: User) => {
    try {
      setLoading(true);
      const activeParams: DeleteUsersParams = {
        id: user.id,
        updated_at: user.updated_at,
      };
      const activeResponse = await getInactiveUserUseCase.execute(activeParams);
      if (activeResponse?.code == 0) {
        setAlertDialogMessage(true);
        setConfirmActiveUser(false);
        onReloadData();
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const {
    searchParams,
    updateStaffListData,
    updateSearchParams,
    updateSelectedStaff,
  } = useStaffStore((state) => state);

  const goToDetailPage = (user: User) => {
    updateSelectedStaff(user);
    router.push(`/staffs/detail-staff/${user.id}`);
  };

  const onReloadData = async () => {
    try {
      setLoading(true);
      const params = { ...searchParams, page: currentPage };
      const response = await getStaffListUseCase.execute(params);
      updateSearchParams(params);
      updateStaffListData(response?.data, response?.totalItem || 0);
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };

  const onReSearch = async (
    sort_by: string,
    sort_order: SortOrder.ASC | SortOrder.DESC
  ) => {
    try {
      setLoading(true);
      let params = searchParams;
      params = { ...searchParams, sort_by, sort_order };
      const response = await getStaffListUseCase.execute(params);
      updateSearchParams(params);
      updateStaffListData(response?.data, response?.totalItem || 0);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const [currentSortedColumn, setCurrentSortedColumn] = useState("");

  const [sortDirection, setSortDirection] = useState<
    SortOrder.ASC | SortOrder.DESC | ""
  >(SortOrder.ASC);

  const onClickColumnHeader = async (sort_column: string) => {
    if (currentSortedColumn === sort_column) {
      const direction =
        sortDirection === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
      onReSearch(sort_column, direction);
      setSortDirection(direction);
    } else {
      await onReSearch(sort_column, SortOrder.ASC);
      setCurrentSortedColumn(sort_column);
      setSortDirection(SortOrder.ASC);
    }
  };

  useEffect(() => {
    if (!searchParams.sort_by) {
      setCurrentSortedColumn("");
      setSortDirection("");
    }
  }, [searchParams]);

  return (
    <div
      style={{
        maxHeight: windowSize.height - 76 - 96,
        minHeight: windowSize.height - 76 - 96,
        scrollbarWidth: "none",
      }}
      className="overflow-y-auto mt-1 laptop:mt-0 max-h-screen overscroll-none block rounded-sm w-full relative"
    >
      <table className="overflow-y-none overscroll-x-none max-h-screen overscroll-none w-full border-separate border-spacing-0 relative">
        <thead className="border-border border-b sticky top-0">
          <tr className=" align-center bg-white ">
            <th
              onClick={() => onClickColumnHeader("idkey")}
              className="text-white pl-2 bg-primary font-medium align-center min-w-[80px] w-[80px]  text-start hover:bg-primary-hover hover:cursor-pointer border-b "
            >
              <StyledHeaderColumn
                columnName={`ID`}
                columnNameId="idkey"
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("employee_name")}
              className=" text-white pl-2 bg-primary font-medium align-center text-start min-w-[112px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={`Employee`}
                columnNameId={"employee_name"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("status")}
              className=" text-white pl-2 bg-primary font-medium align-center text-start min-w-[88px] w-[88px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={"Status"}
                columnNameId={"status"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th className="text-[14px] text-white pl-2 bg-primary font-medium align-center text-start min-w-[60px] w-[60px] hover:bg-primary-hover hover:cursor-pointer  border-b">
              Action
            </th>
          </tr>
        </thead>
        {staffList?.length !== 0 && (
          <tbody className="hide-scrollbar">
            {!!staffList?.length &&
              staffList?.map((user: User, index: number) => {
                return (
                  <tr
                    onClick={() => goToDetailPage(user)}
                    key={user?.id ? user?.id.toString() : String(index)}
                    className="overflow-x-auto w-screen align-center h-[52px] hover:bg-slate-200"
                  >
                    <td className="pl-2 text-start text-[14px] font-normal border-b border-[#F6F6F6]">
                      {user.idkey}
                    </td>
                    <td className="pl-2 border-b border-[#F6F6F6] flex h-[52px] items-center justify-center">
                      <div
                        className="flex w-fit laptop:gap-x-2"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <StyledAvatarPreview
                          image={
                            !user.image
                              ? DefaultImage
                              : `${process.env.NEXT_PUBLIC_BASE_URL_IMAGE}${user.image}`
                          }
                          className="contain-size h-7 w-7 rounded-full cursor-pointer object-contain aspect-square"
                          height={44}
                          width={44}
                        />
                      </div>
                    </td>
                    <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                      <StyledTableStatusItem value={user?.status || ""} />
                    </td>
                    <td className="pl-2 text-[14px] font-normal border-b border-[#F6F6F6]">
                      <div
                        className="flex items-center justify-center w-full gap-x-2"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <AlertDialogGoBackWillClearData
                          onClose={onReloadData}
                          user={user}
                          setConfirmActiveUser={setConfirmActiveUser}
                          setSelectedUser={setSelectedUser}
                        />
                        {confirmActiveUser && (
                          <AlertDialogConfirmActiveUser
                            key={user.id}
                            id={user.id}
                            activeId={selectedUser.id}
                            description={`The leader of ${user.fullname}  is currently inactive. If you proceed with the change, you (Admin) will be assigned as the leader of this user.`}
                            open={confirmActiveUser}
                            onOpenChange={setConfirmActiveUser}
                            onConfirm={() => onConfirmActiveUser(user)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        )}
      </table>
      {staffList?.length == 0 && !loading && <StyledNoDataGrid />}
      {isCreateLeaveModalOpen && (
        <AdminCreateModal
          isOpen={isCreateLeaveModalOpen}
          onClose={() => setIsCreateLeaveModalOpen(false)}
        />
      )}
      <StyledMessageAlertDialog
        title="Notification"
        description={`Since the current leader (${selectedUser.leader_idKey}) of this staff is inactive, you will automatically be set as the leader of this staff. `}
        open={alertDialogMessage}
        onOpenChange={setAlertDialogMessage}
        onOK={() => {
          setAlertDialogMessage(false);
        }}
      />
    </div>
  );
}
