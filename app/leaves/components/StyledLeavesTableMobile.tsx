"use client";
import DefaultImage from "@/app/assets/avatar/avatar_default.svg";
import LeaveDetailModal from "@/app/leaves/components/LeaveDetailModal";
import StyledCancelRequestStatusItem from "@/app/leaves/components/StyledCancelRequestStatusItem";
import StyledAvatarPreview from "@/components/common/StyledAvatarPreview";
import StyledHeaderColumn from "@/components/common/StyledHeaderColumn";
import StyledNoDataGrid from "@/components/common/StyledNoDataGrid";
import StyledOverlay from "@/components/common/StyledOverlay";
import { GetLeavesListUseCase } from "@/core/application/usecases/leave/getLeaveList";
import { Leave } from "@/core/entities/models/leave.model";
import { LeaveRepositoryImpl } from "@/core/infrastructure/repositories/leave.repo";
import useWindowSize from "@/hooks/useWindowSize";
import { useLeaveStore } from "@/stores/leavesStore";
import { CancelRequestValue, SortOrder } from "@/utilities/enum";
import {
  formatDateToShortDateString,
  formatStringToDate,
} from "@/utilities/format";
import { LEAVE_STATUS, SHIFT_STATUS } from "@/utilities/static-value";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import StyledLeaveStatusItem from "./StyledLeaveStatusItem";

const leaveRepo = new LeaveRepositoryImpl();
const getLeavesListUseCase = new GetLeavesListUseCase(leaveRepo);

interface Props {
  setLoading(loading: boolean): void;
  loading: boolean;
  currentPage: number;
}

export default function StyledLeavesTableMobile(props: Props) {
  const { loading, setLoading, currentPage } = props;
  const windowSize = useWindowSize();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isIdLeave, setIsIdLeave] = useState<number | undefined>();
  const [isLoadingLeaveDetail, setIsLoadingLeaveDetail] = useState(false);
  const router = useRouter();

  const { leaveList, searchParams, updateSearchParams, updateLeaveListData } =
    useLeaveStore((state) => state);

  const goToDetailPage = (leave?: Leave) => {
    if (leave?.id) {
      setIsIdLeave(Number(leave?.id));
      if (isMobile) {
        router.push(`/leaves/detail-leave/${leave?.id}`);
      }
      setIsLoadingLeaveDetail(true);
    }
  };
  //   const goToEditPage = (user: User) => {
  //     // updateSelectedStaff(user);
  //     // router.push(`/staffs/edit-staff/${user.id}`);
  //   };

  // const isAdmin = useMemo(() => {
  //   return user?.role?.name == "admin";
  // }, [user]);

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
        maxHeight: windowSize.height - (isMobile ? 76 : 100) - 96,
        minHeight: windowSize.height - (isMobile ? 76 : 100) - 96,
        scrollbarWidth: "none",
      }}
      className="overflow-y-auto mt-1 laptop:mt-0 max-h-screen overscroll-none block rounded-sm w-full relative "
    >
      <table className="overflow-y-none overscroll-x-none max-h-screen overscroll-none w-full border-separate border-spacing-0 relative">
        <thead className="border-border border-b sticky top-0">
          <tr className=" align-center bg-white ">
            <th
              onClick={() => onClickColumnHeader("fullname")}
              className="bg-primary pl-2 font-medium align-center min-w-[84px] w-[84px] text-start hover:bg-primary-hover hover:cursor-pointer border-b "
            >
              <StyledHeaderColumn
                columnName={`Employee`}
                columnNameId="fullname"
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("day_leaves")}
              className="bg-primary pl-2 font-medium align-center text-start min-w-[116px] w-[116px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={"Leave date"}
                columnNameId={"day_leaves"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("status")}
              className="bg-primary pl-2 font-medium align-center text-start min-w-[132px]    hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={"Status"}
                columnNameId={"status"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
          </tr>
        </thead>
        {leaveList.length !== 0 && (
          <tbody className="hide-scrollbar">
            {leaveList?.map((leave: Leave, index: number) => {
              return (
                <tr
                  onClick={() => goToDetailPage(leave)}
                  key={leave?.id ? leave?.id.toString() : String(index)}
                  className={`overflow-x-auto w-screen align-center h-[52px] laptop:h-[52px] ${
                    leave.status == LEAVE_STATUS[0].value ||
                    leave.cancel_request == CancelRequestValue.Waiting
                      ? " bg-[#C4C94040]"
                      : leave.status == LEAVE_STATUS[2].value
                      ? "bg-gray-200"
                      : "bg-white"
                  } `}
                >
                  <td className="pl-2 border-b border-[#F6F6F6]">
                    <div className="flex justify-start items-center laptop:gap-x-2 max-w-[120px]">
                      <StyledAvatarPreview
                        image={
                          !leave?.image
                            ? DefaultImage
                            : `${process.env.NEXT_PUBLIC_BASE_URL_IMAGE}${leave.image}`
                        }
                        className="contain-size laptop:h-8 laptop:w-8 rounded-full cursor-pointer aspect-square object-contain w-[32px]"
                        height={32}
                        width={32}
                      />
                      <p className="text-[14px] laptop:text-[16px] font-normal line-clamp-1 text-ellipsis w-[100px]  max-w-[96px] pl-2 ">
                        {leave.employee_name} ({leave.user_idkey})
                      </p>
                    </div>
                  </td>
                  <td className="pl-2 text-[14px] laptop:text-[16px] font-normal border-b border-[#F6F6F6]">
                    <span className="text-[14px]">
                      {leave?.day_leaves &&
                        formatDateToShortDateString(
                          formatStringToDate(leave?.day_leaves)
                        )}
                    </span>
                    <span className="text-[12px]">
                      {`(${
                        SHIFT_STATUS.find(
                          (shift) => shift.value === String(leave.shift)
                        )?.name
                      })`}
                    </span>
                  </td>

                  <td className="pl-2 text-[14px] laptop:text-[16px] font-normal border-b border-[#F6F6F6]">
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
