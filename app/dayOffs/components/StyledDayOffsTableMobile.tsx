"use client";
import { GetDayOffsParams } from "@/apis/modules/schedule";
import LeaveDetailModal from "@/app/leaves/components/LeaveDetailModal";
import { ALertDialogDeleteDayOff1 } from "@/components/common/alert-dialog/AlertDialogDeleteDayOff1";
import StyledHeaderColumn from "@/components/common/StyledHeaderColumn";
import StyledNoDataGrid from "@/components/common/StyledNoDataGrid";
import StyledOverlay from "@/components/common/StyledOverlay";
import { GetDayOffsUseCase } from "@/core/application/usecases/schedule/getDayOffs.usecase";
import { DayOff } from "@/core/entities/models/dayoff.model";
import { Leave } from "@/core/entities/models/leave.model";
import { ScheduleRepositoryImpl } from "@/core/infrastructure/repositories/schedule.repo";
import useWindowSize from "@/hooks/useWindowSize";
import { useScheduleStore } from "@/stores/scheduleStore";
import {
  CountryType,
  DayOffType,
  SortOrder,
  StatusDayOffValue,
} from "@/utilities/enum";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";

const scheduleRepo = new ScheduleRepositoryImpl();
const getDayOffsUseCase = new GetDayOffsUseCase(scheduleRepo);
interface Props {
  setLoading(loading: boolean): void;
  loading: boolean;
  currentPage: number;
}

export default function StyledDayOffsTableMobile(props: Props) {
  const { loading, setLoading } = props;
  const windowSize = useWindowSize();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isIdLeave, setIsIdLeave] = useState<number | undefined>();
  const [isLoadingLeaveDetail, setIsLoadingLeaveDetail] = useState(false);
  const router = useRouter();

  const { dayOffList, updateDayOffListData, searchParams, updateSearchParams } =
    useScheduleStore((state) => state);

  const goToDetailPage = (leave?: Leave) => {
    if (leave?.id) {
      setIsIdLeave(Number(leave?.id));
      if (isMobile) {
        router.push(`/leaves/detail-leave/${leave?.id}`);
      }
      setIsLoadingLeaveDetail(true);
    }
  };

  const onReloadData = async () => {
    try {
      setLoading(true);
      const params: GetDayOffsParams = {
        country: CountryType.VN,
      };
      const response = await getDayOffsUseCase.execute(params);
      updateSearchParams(params);
      updateDayOffListData(response?.data || [], response?.totalItem || 0);
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
      const response = await getDayOffsUseCase.execute(params);
      updateSearchParams(params);
      updateDayOffListData(response?.data || [], response?.totalItem || 0);
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
              className="bg-primary pl-2 font-medium align-center min-w-[84px] text-start hover:bg-primary-hover hover:cursor-pointer border-b "
            >
              <StyledHeaderColumn
                columnName={`Description`}
                columnNameId={"description"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("day_off")}
              className="bg-primary pl-2 font-medium align-center text-start w-[116px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={"Day off"}
                columnNameId={"day_off"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("status")}
              className="bg-primary pl-2 font-medium align-center text-start w-[100px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={"Status"}
                columnNameId={"status"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th className="text-[16px] text-white bg-primary pl-2 font-medium align-center text-start w-[80px] hover:bg-primary-hover hover:cursor-pointer  border-b">
              Action
            </th>
          </tr>
        </thead>
        {dayOffList.length !== 0 && (
          <tbody className="hide-scrollbar">
            {dayOffList?.map((dayOff: DayOff, index: number) => {
              return (
                <tr
                  onClick={() => goToDetailPage(dayOff)}
                  key={dayOff?.id ? dayOff?.id.toString() : String(index)}
                  className={`overflow-x-auto w-screen align-center h-[52px] laptop:h-[52px] bg-white `}
                >
                  <td className="pl-2 border-b border-[#F6F6F6] w-[84px] max-w-[84px]">
                    <p className="text-[16px] text-ellipsis whitespace-pre-wrap break-words line-clamp-1">
                      {dayOff.description}
                    </p>
                  </td>
                  <td className="pl-2 border-b border-[#F6F6F6]">
                    <div className="flex justify-start items-center laptop:gap-x-2">
                      {dayOff?.day_off}
                    </div>
                  </td>
                  <td className="pl-2  laptop:text-[16px] font-normal border-b border-[#F6F6F6]">
                    {dayOff.status == String(StatusDayOffValue.NotWorkingDayOff)
                      ? DayOffType.Off
                      : DayOffType.Working}
                  </td>

                  <td className="pl-2 text-[14px] laptop:text-[16px] font-normal border-b border-[#F6F6F6]">
                    <div className="flex flex-row gap-1">
                      <ALertDialogDeleteDayOff1
                        id={Number(dayOff.id)}
                        updatedAt={dayOff?.updated_at || ""}
                        onClose={onReloadData}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        )}
      </table>
      {dayOffList.length == 0 && !loading && <StyledNoDataGrid />}
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
