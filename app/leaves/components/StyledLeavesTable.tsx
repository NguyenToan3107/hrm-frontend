"use client";
import DefaultImage from "@/app/assets/avatar/avatar_default.svg";
import IconDetail from "@/app/assets/icons/iconViewDetail.svg";
import LeaveDetailModal from "@/app/leaves/components/LeaveDetailModal";
import StyledCancelRequestStatusItem from "@/app/leaves/components/StyledCancelRequestStatusItem";
import { StyledTooltipLeave } from "@/app/leaves/components/StyledTooltipLeave";
import { AlertDialogApproveLeave } from "@/components/common/alert-dialog/AlertDialogApproveLeave";
import StyledAvatarPreview from "@/components/common/StyledAvatarPreview";
import StyledHeaderColumn from "@/components/common/StyledHeaderColumn";
import StyledNoDataGrid from "@/components/common/StyledNoDataGrid";
import StyledOverlay from "@/components/common/StyledOverlay";
import { GetLeavesListUseCase } from "@/core/application/usecases/leave/getLeaveList";
import { Leave } from "@/core/entities/models/leave.model";
import { LeaveRepositoryImpl } from "@/core/infrastructure/repositories/leave.repo";
import useWindowSize from "@/hooks/useWindowSize";
import { useLeaveStore } from "@/stores/leavesStore";
import { useUserStore } from "@/stores/userStore";
import {
  CancelRequestValue,
  LeaveStatusValue,
  LeaveType,
  SalaryValue,
  SortOrder,
} from "@/utilities/enum";
import { LEAVE_STATUS, SHIFT_STATUS } from "@/utilities/static-value";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import StyledLeaveStatusItem from "./StyledLeaveStatusItem";

const leaveRepo = new LeaveRepositoryImpl();
const getLeavesListUseCase = new GetLeavesListUseCase(leaveRepo);

interface Props {
  setLoading(loading: boolean): void;
  loading: boolean;
  currentPage: number;
}

export default function StyledLeavesTable(props: Props) {
  const { loading, setLoading, currentPage } = props;
  const windowSize = useWindowSize();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isIdLeave, setIsIdLeave] = useState<number | undefined>();
  const [isLoadingLeaveDetail, setIsLoadingLeaveDetail] = useState(false);
  const router = useRouter();
  const { user } = useUserStore();

  const isExecuteLeavebutton = useMemo(() => {
    const userRole = user?.role;
    return userRole?.permissions?.includes("leave_execute");
  }, []);

  const { leaveList, searchParams, updateSearchParams, updateLeaveListData } =
    useLeaveStore((state) => state);

  const goToDetailPage = (idLeave: number) => {
    setIsIdLeave(idLeave);
    if (isMobile) {
      router.push(`/leaves/detail-leave/${idLeave}`);
    }
    setIsModalOpen(true);
    setIsLoadingLeaveDetail(true);
  };
  //   const goToEditPage = (user: User) => {
  //     // updateSelectedStaff(user);
  //     // router.push(`/staffs/edit-staff/${user.id}`);
  //   };

  const isAdmin = useMemo(() => {
    return user?.role?.name == "admin";
  }, [user]);

  const onReloadData = async () => {
    try {
      setLoading(true);
      const params = { ...searchParams, page: currentPage };
      const response = await getLeavesListUseCase.execute(params);
      updateSearchParams(params);
      updateLeaveListData(response?.data, response?.totalItem || 0);
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
      const response = await getLeavesListUseCase.execute(params);
      updateSearchParams(params);
      updateLeaveListData(response?.data, response?.totalItem || 0);
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

  const onCloseLeaveDetailModal = async () => {
    setIsModalOpen(false);
    await onReloadData();
  };

  return (
    <div
      style={{
        maxHeight:
          windowSize.height -
          (isMobile ? 56 : 100) -
          52 -
          (windowSize.width > 1024 ? 150 : 256 + 18 + 80) -
          20 -
          36,
        minHeight:
          windowSize.height -
          (isMobile ? 56 : 100) -
          52 -
          (windowSize.width > 1024 ? 150 : 256 + 18 + 80) -
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
              className="text-[16px] text-white bg-primary pl-2 font-medium align-center min-w-[100px] w-[100px] laptop:min-w-[100px] laptop:w-[100px] text-start hover:bg-primary-hover hover:cursor-pointer border-b "
            >
              <StyledHeaderColumn
                columnName={`Leave ID`}
                columnNameId="idkey"
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("fullname")}
              className="text-[16px] text-white bg-primary pl-2 font-medium align-center min-w-[260px] w-[260px] laptop:min-w-[300px] laptop:w-[300px] text-start hover:bg-primary-hover hover:cursor-pointer border-b "
            >
              <StyledHeaderColumn
                columnName={`Employee`}
                columnNameId="fullname"
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("description")}
              className="text-[16px] text-white bg-primary pl-2 font-medium align-center text-start min-w-[300px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={`Description`}
                columnNameId={"description"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("salary")}
              className=" text-[16px] text-white bg-primary pl-2 font-medium align-center text-start min-w-[80px] w-[80px] laptop:min-w-[80px] laptop:w-[80px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={"Type"}
                columnNameId={"salary"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("created_at")}
              className="text-[16px] text-white bg-primary pl-2 font-medium align-center text-start min-w-[130px] w-[130px] laptop:min-w-[128px] laptop:w-[128px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={"Create date"}
                columnNameId={"created_at"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("day_leaves")}
              className="text-[16px] text-white bg-primary pl-2 font-medium align-center text-start min-w-[130px] w-[130px] laptop:min-w-[180px] laptop:w-[180px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={"Leave date"}
                columnNameId={"day_leaves"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>

            <th
              onClick={() => onClickColumnHeader("approver")}
              className="text-[16px] text-white bg-primary pl-2 font-medium align-center text-start min-w-[220px] w-[220px] laptop:min-w-[252px] laptop:w-[252px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                isQuickSearch
                columnName={"Approver"}
                columnNameId={"approver"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
                onQuickSearch={() => {
                  updateSearchParams({
                    ...searchParams,
                    approver: user.idkey,
                  });
                }}
              />
            </th>

            <th
              onClick={() => onClickColumnHeader("status")}
              className="text-[16px] text-white bg-primary pl-2 font-medium align-center text-start min-w-[160px] w-[160px] laptop:min-w-[160px] laptop:w-[160px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={"Status"}
                columnNameId={"status"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th className="text-[16px] text-white bg-primary pl-2 font-medium align-center text-start min-w-[100px] w-[100px] laptop:w-[80px] laptop:min-w-[80px] hover:bg-primary-hover hover:cursor-pointer  border-b">
              Action
            </th>
          </tr>
        </thead>
        {leaveList.length !== 0 && (
          <tbody className="hide-scrollbar">
            {leaveList?.map((leave: Leave, index: number) => {
              return (
                <tr
                  key={leave?.id ? leave?.id.toString() : String(index)}
                  className={`overflow-x-auto w-screen align-center h-[52px] ${
                    leave.status == LEAVE_STATUS[0].value ||
                    leave.cancel_request == CancelRequestValue.Waiting
                      ? " bg-[#C4C94040]"
                      : leave.status == LEAVE_STATUS[2].value
                      ? "bg-gray-200"
                      : "bg-white"
                  } `}
                >
                  <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                    {leave.idkey}
                  </td>
                  <td className="pl-2 border-b border-[#F6F6F6]">
                    <div className="flex justify-start items-center laptop:gap-x-2">
                      <StyledAvatarPreview
                        image={
                          !leave?.image
                            ? DefaultImage
                            : `${process.env.NEXT_PUBLIC_BASE_URL_IMAGE}${leave.image}`
                        }
                        className="contain-size h-8 w-8 rounded-full cursor-pointer aspect-square object-contain"
                        height={44}
                        width={44}
                      />
                      <p className=" text-[16px] font-normal pl-2">
                        {leave.employee_name} ({leave.user_idkey})
                      </p>
                    </div>
                  </td>
                  <td className="pl-2 text-start text-[16px] whitespace-pre-wrap  max-w-[300px]  font-normal border-b border-[#F6F6F6]">
                    {/* {leave.description} */}
                    <StyledTooltipLeave
                      content={leave.description || ""}
                      cancelRequestContent={leave?.cancel_request_desc}
                    />
                  </td>
                  <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                    {leave.salary == String(SalaryValue.UnPaidLeave)
                      ? LeaveType.Unpaid
                      : leave.salary == String(SalaryValue.PaidLeave)
                      ? LeaveType.Paid
                      : leave?.status == LeaveStatusValue.Waiting
                      ? "Waiting"
                      : "N/A"}
                  </td>
                  <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                    {leave.created_at}
                  </td>
                  <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                    {leave?.day_leaves +
                      " " +
                      SHIFT_STATUS.find(
                        (shift) => shift.value === String(leave.shift)
                      )?.name}
                  </td>
                  <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                    <div className="flex justify-start items-center laptop:gap-x-2">
                      <p className=" text-[16px] font-normal pl-2">
                        {leave.approver_name} ({leave.approver_idkey})
                      </p>
                    </div>
                  </td>
                  <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                    <div className="flex flex-row gap-1">
                      <StyledLeaveStatusItem
                        value={leave?.status || ""}
                        cancelRequest={leave?.cancel_request}
                      />
                      <StyledCancelRequestStatusItem
                        cancelRequest={leave?.cancel_request}
                      />
                    </div>
                  </td>
                  <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                    <div className="flex items-center justify-start w-full gap-x-2">
                      <Image
                        onClick={() => goToDetailPage(Number(leave.id))}
                        alt="See detail"
                        src={IconDetail}
                        className="h-[24px] aspect-square hover:cursor-pointer"
                      />
                      {leave.status == LEAVE_STATUS[0].value &&
                        ((isExecuteLeavebutton &&
                          user.id === leave.approver_id) ||
                          isAdmin) && (
                          <AlertDialogApproveLeave
                            onClose={onReloadData}
                            leave={leave}
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
      {leaveList.length == 0 && !loading && <StyledNoDataGrid />}
      {isModalOpen && (
        <LeaveDetailModal
          loading={isLoadingLeaveDetail}
          isOpen={isModalOpen}
          onClose={onCloseLeaveDetailModal}
          idLeave={isIdLeave}
          setLoading={setIsLoadingLeaveDetail}
        />
      )}

      {isLoadingLeaveDetail && (
        <StyledOverlay isVisible={isLoadingLeaveDetail} />
      )}
    </div>
  );
}
