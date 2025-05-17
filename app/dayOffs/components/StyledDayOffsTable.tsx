"use client";
import { GetDayOffsParams } from "@/apis/modules/schedule";
import IconDetail from "@/app/assets/icons/iconViewDetail.svg";
import StyledHeaderColumn from "@/components/common/StyledHeaderColumn";
import StyledNoDataGrid from "@/components/common/StyledNoDataGrid";
import StyledOverlay from "@/components/common/StyledOverlay";
import { GetDayOffsUseCase } from "@/core/application/usecases/schedule/getDayOffs.usecase";
import { DayOff } from "@/core/entities/models/dayoff.model";
import { ScheduleRepositoryImpl } from "@/core/infrastructure/repositories/schedule.repo";
import useWindowSize from "@/hooks/useWindowSize";
import { useScheduleStore } from "@/stores/scheduleStore";
import {
  CountryType,
  DayOffType,
  LeaveType,
  SalaryValue,
  SortOrder,
  StatusDayOffValue,
} from "@/utilities/enum";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import DayOffDetailModal from "@/app/dayOffs/components/DayOffDetailModal";
import { ALertDialogDeleteDayOff1 } from "@/components/common/alert-dialog/AlertDialogDeleteDayOff1";

const scheduleRepo = new ScheduleRepositoryImpl();
const getDayOffsUseCase = new GetDayOffsUseCase(scheduleRepo);

interface Props {
  setLoading(loading: boolean): void;
  loading: boolean;
  currentPage: number;
}

export default function StyledDayOffsTable(props: Props) {
  const { loading, setLoading } = props;
  const windowSize = useWindowSize();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isIdLeave, setIsIdLeave] = useState<number | undefined>();
  const [isLoadingLeaveDetail, setIsLoadingLeaveDetail] = useState(false);
  const router = useRouter();
  const { dayOffList, updateDayOffListData, searchParams, updateSearchParams } =
    useScheduleStore((state) => state);

  const goToDetailPage = (idLeave: number) => {
    setIsIdLeave(idLeave);
    if (isMobile) {
      router.push(`/leaves/detail-leave/${idLeave}`);
    }
    setIsModalOpen(true);
    setIsLoadingLeaveDetail(true);
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
              onClick={() => onClickColumnHeader("title")}
              className="text-[16px] text-white bg-primary pl-2 font-medium align-center min-w-[260px] w-[260px] laptop:min-w-[300px] laptop:w-[300px] text-start hover:bg-primary-hover hover:cursor-pointer border-b "
            >
              <StyledHeaderColumn
                columnName={`Title`}
                columnNameId="title"
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
        {dayOffList.length !== 0 && (
          <tbody className="hide-scrollbar">
            {dayOffList?.map((dayOff: DayOff, index: number) => {
              return (
                <tr
                  key={dayOff?.id ? dayOff?.id.toString() : String(index)}
                  className={`overflow-x-auto w-screen align-center h-[52px] bg-white `}
                >
                  <td className="pl-2 border-b border-[#F6F6F6]">
                    {dayOff.title}
                  </td>
                  <td className="pl-2 text-start text-[16px] whitespace-pre-wrap  max-w-[300px]  font-normal border-b border-[#F6F6F6]">
                    {dayOff.description}
                  </td>
                  <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                    {dayOff.salary == String(SalaryValue.UnPaidLeave)
                      ? LeaveType.Unpaid
                      : LeaveType.Paid}
                  </td>
                  <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                    {dayOff.created_at}
                  </td>
                  <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                    {dayOff?.day_off}
                  </td>
                  <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                    <div className="flex flex-row gap-1">
                      {dayOff.status ==
                      String(StatusDayOffValue.NotWorkingDayOff)
                        ? DayOffType.Off
                        : DayOffType.Working}
                    </div>
                  </td>
                  <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                    <div className="flex items-center justify-start w-full gap-x-2">
                      <Image
                        onClick={() => goToDetailPage(Number(dayOff.id))}
                        alt="See detail"
                        src={IconDetail}
                        className="h-[24px] aspect-square hover:cursor-pointer"
                      />
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
        <DayOffDetailModal
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
