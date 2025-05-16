"use client";
import { default as DefaultImage } from "@/app/assets/avatar/avatar_default.svg";
import IconEdit from "@/app/assets/icons/iconEdit.svg";
import IconDetail from "@/app/assets/icons/iconViewDetail.svg";
import StyledHeaderColumn from "@/components/common/StyledHeaderColumn";
import { GetStaffListUseCase } from "@/core/application/usecases/staff-master/getUserList.usecase";
import { User } from "@/core/entities/models/user.model";
import { UserRepositoryImpl } from "@/core/infrastructure/repositories/user.repo";
import useWindowSize from "@/hooks/useWindowSize";
import { useStaffStore } from "@/stores/staffStore";
import { STAFF_STATUS_WORKING } from "@/utilities/static-value";
import Image from "next/image";
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
import { convertHourToDay } from "@/utilities/helper";
import { isMobile } from "react-device-detect";

const userRepo = new UserRepositoryImpl();
const getStaffListUseCase = new GetStaffListUseCase(userRepo);
const getInactiveUserUseCase = new DeleteStaffUseCase(userRepo);
interface Props {
  setLoading(loading: boolean): void;
  loading: boolean;
  currentPage: number;
}

export default function StyledStaffMasterTable(props: Props) {
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
  // const goToAdminCreateLeavePage = (user: User) => {
  //   updateSelectedStaff(user);
  //   router.push(`/leaves/admin-create-leave`);
  // };

  const goToEditPage = (user: User) => {
    updateSelectedStaff(user);
    router.push(`/staffs/edit-staff/${user.id}`);
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
        maxHeight:
          windowSize.height -
          (isMobile ? 50 + 256 + 80 : 100 + 150) -
          52 -
          20 -
          36,
        minHeight:
          windowSize.height -
          (isMobile ? 56 : 100) -
          52 -
          (isMobile ? 50 + 256 + 80 : 100 + 150) -
          20 -
          36,
        scrollbarWidth: "none",
      }}
      className="overflow-y-auto mobile:mt-[18px] laptop:mt-0 max-h-screen overscroll-none block rounded-sm w-full relative"
    >
      <table className="overflow-y-none overscroll-x-none max-h-screen overscroll-none w-full border-separate border-spacing-0 relative">
        <thead className="border-border border-b sticky top-0">
          <tr className=" align-center bg-white ">
            <th
              onClick={() => onClickColumnHeader("idkey")}
              className="text-[16px] text-white pl-2 bg-primary font-medium align-center min-w-[128px] w-[128px]  text-start hover:bg-primary-hover hover:cursor-pointer border-b "
            >
              <StyledHeaderColumn
                columnName={`Employee ID`}
                columnNameId="idkey"
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("employee_name")}
              className="text-[16px] text-white pl-2 bg-primary font-medium align-center text-start min-w-[280px] w-[280px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={`Employee Name`}
                columnNameId={"employee_name"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
              {/* Employee Name */}
            </th>
            <th
              onClick={() => onClickColumnHeader("email")}
              className=" text-[16px] text-white pl-2 bg-primary font-medium align-center text-start min-w-[120px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={"Email"}
                columnNameId={"email"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("role_name")}
              className=" text-[16px] text-white pl-2 bg-primary font-medium align-center text-start min-w-[120px] w-[120px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={"Role"}
                columnNameId={"role_name"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("leader_name")}
              className=" text-[16px] text-white pl-2 bg-primary font-medium align-center text-start min-w-[280px] w-[280px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={"Leader Name"}
                columnNameId={"leader_name"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("time_off_hours")}
              className=" text-[16px] text-white pl-2 bg-primary font-medium align-center text-start min-w-[120px] w-[120px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={"Leave Hour"}
                columnNameId={"time_off_hours"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("status_working")}
              className="text-[16px] text-white pl-2 bg-primary font-medium align-center text-start min-w-[148px] w-[148px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={"Working status"}
                columnNameId={"status_working"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("status")}
              className="text-[16px] text-white pl-2 bg-primary font-medium align-center text-start min-w-[100px] w-[100px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={"Status"}
                columnNameId={"status"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              // onClick={() => onClickColumnHeader("status")}
              className="text-[16px] text-white pl-2 bg-primary font-medium align-center text-start min-w-[112px] w-[112px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
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
                    key={user?.id ? user?.id.toString() : String(index)}
                    className="overflow-x-auto w-screen align-center h-[52px]"
                  >
                    <td className="pl-2 text-start text-[16px] font-normal border-b border-[#F6F6F6]">
                      {user.idkey}
                    </td>
                    <td className="pl-2 border-b border-[#F6F6F6]">
                      <div className="flex justify-start items-center laptop:gap-x-2">
                        <StyledAvatarPreview
                          image={
                            !user.image
                              ? DefaultImage
                              : `${process.env.NEXT_PUBLIC_BASE_URL_IMAGE}${user.image}`
                          }
                          className="contain-size h-8 w-8 rounded-full cursor-pointer object-contain aspect-square"
                          height={44}
                          width={44}
                        />
                        <p className=" text-[16px] font-normal pl-2">
                          {user.fullname}
                        </p>
                      </div>
                    </td>
                    <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                      {user.email}
                    </td>
                    <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                      {user?.role?.name.charAt(0).toUpperCase() +
                        "" +
                        user?.role?.name.slice(1)}
                    </td>
                    <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                      {user.leader_name}{" "}
                      {user.leader_name ? `(${user.leader_idKey})` : ""}
                    </td>
                    <td className="pl-2  text-[16px] font-normal border-b border-[#F6F6F6]">
                      {convertHourToDay(
                        user.time_off_hours,
                        user.last_year_time_off
                      )}
                    </td>
                    <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                      {
                        STAFF_STATUS_WORKING.find(
                          (item) => item.value == user.status_working
                        )?.name
                      }
                    </td>
                    <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                      <StyledTableStatusItem value={user?.status || ""} />
                    </td>
                    <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                      <div className="flex items-center justify-start w-full gap-x-2">
                        <Image
                          onClick={() => goToDetailPage(user)}
                          alt="See detail"
                          src={IconDetail}
                          className="h-[24px] aspect-square hover:cursor-pointer"
                        />
                        <Image
                          onClick={() => goToEditPage(user)}
                          alt="Go to edit"
                          src={IconEdit}
                          className="h-[24px] aspect-square hover:cursor-pointer"
                        />
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
