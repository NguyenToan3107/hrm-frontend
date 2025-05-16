"use client";
import { default as DefaultImage } from "@/app/assets/avatar/avatar_default.svg";
import StyledCheckbox from "@/app/roles/components/StyledCheckbox";
import StyledTableStatusItem from "@/app/staffs/components/StyledTableStatusItem";
import StyledAvatarPreview from "@/components/common/StyledAvatarPreview";
import StyledHeaderColumn from "@/components/common/StyledHeaderColumn";
import StyledNoDataGrid from "@/components/common/StyledNoDataGrid";
import { GetReportListUseCase } from "@/core/application/usecases/report/getReportList.usecase";
import { User } from "@/core/entities/models/user.model";
import { ReportRepositoryImpl } from "@/core/infrastructure/repositories/report.repo";
import useWindowSize from "@/hooks/useWindowSize";
import { useReportStore } from "@/stores/reportStore";
import { SortOrder } from "@/utilities/enum";
import { convertHourToDay } from "@/utilities/helper";
import { STAFF_STATUS_WORKING } from "@/utilities/static-value";
import { useEffect, useState } from "react";

const reportRepo = new ReportRepositoryImpl();
const getReportListUseCase = new GetReportListUseCase(reportRepo);

interface Props {
  setLoading(loading: boolean): void;
  loading: boolean;
  currentPage: number;
}

export default function StyledReportMasterTable(props: Props) {
  const { loading, setLoading } = props;
  const windowSize = useWindowSize();
  const {
    reportStaffList,
    searchParams,
    selectedStaffIds,
    updateSelectedStaffIds,
    updateReportStaffListData,
    updateSearchParams,
  } = useReportStore((state) => state);

  const onReSearch = async (
    sort_by: string,
    sort_order: SortOrder.ASC | SortOrder.DESC
  ) => {
    try {
      setLoading(true);
      let params = searchParams;
      params = { ...searchParams, sort_by, sort_order };
      const response = await getReportListUseCase.execute(params);
      updateSearchParams(params);
      updateReportStaffListData(response?.data, response?.totalItem || 0);
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

  const handleCheckedChange = (checked: boolean, id: number) => {
    if (checked) {
      const mergedData = [...selectedStaffIds, id];
      console.log("-----mergedData------", mergedData);
      updateSelectedStaffIds(mergedData);
    } else {
      const filterData = [...selectedStaffIds].filter((i) => i !== id);
      console.log("------filterData-----", filterData);
      updateSelectedStaffIds(filterData);
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
          100 -
          52 -
          (windowSize.width > 1024 ? 92 : 256 + 18) -
          20 -
          32 -
          16 -
          76,
        minHeight:
          windowSize.height -
          100 -
          52 -
          (windowSize.width > 1024 ? 92 : 256 + 18) -
          20 -
          32 -
          16 -
          76,
        scrollbarWidth: "none",
      }}
      className="overflow-y-auto mobile:mt-[18px] laptop:mt-0 max-h-screen overscroll-none block rounded-sm w-full relative"
    >
      <table className="overflow-y-none overscroll-x-none max-h-screen overscroll-none w-full border-separate border-spacing-0 relative">
        <thead className="border-border border-b sticky top-0">
          <tr className=" align-center bg-white ">
            <th className="text-[16px] text-white pl-2 bg-primary font-medium align-center min-w-[40px] w-[40px] text-start hover:bg-primary-hover hover:cursor-pointer border-b "></th>
            <th
              onClick={() => onClickColumnHeader("idkey")}
              className="text-[16px] text-white pl-2 bg-primary font-medium align-center min-w-[128px] w-[128px] text-start hover:bg-primary-hover hover:cursor-pointer border-b "
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
              className="text-[16px] text-white pl-2 bg-primary font-medium align-center text-start min-w-[340px] w-[340px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={`Employee Name`}
                columnNameId={"employee_name"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
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
              className=" text-[16px] text-white pl-2 bg-primary font-medium align-center text-start min-w-[140px] w-[140px] hover:bg-primary-hover hover:cursor-pointer  border-b"
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
              className="text-[16px] text-white pl-2 bg-primary font-medium align-center text-start min-w-[180px] w-[180px] hover:bg-primary-hover hover:cursor-pointer  border-b"
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
          </tr>
        </thead>
        {reportStaffList.length !== 0 && (
          <tbody className="hide-scrollbar">
            {!!reportStaffList?.length &&
              reportStaffList?.map((user: User, index: number) => {
                return (
                  <tr
                    key={user?.id ? user?.id.toString() : String(index)}
                    className="overflow-x-auto w-screen align-center h-[52px]"
                  >
                    <td className="pl-2 mt-3 min-w-[40px] laptop:min-w-[40px] flex justify-center items-center">
                      <StyledCheckbox
                        name={""}
                        description={""}
                        checked={selectedStaffIds.includes(Number(user?.id))}
                        onCheckedChange={(checked) =>
                          handleCheckedChange(checked, Number(user?.id))
                        }
                      />
                    </td>
                    <td className="pl-2 w-[116px] text-start text-[16px] font-normal border-b border-[#F6F6F6]">
                      {user.idkey}
                    </td>
                    <td className="pl-2 min-w-[80px] laptop:min-w-[340px] border-b border-[#F6F6F6]">
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
                    <td className="pl-2 min-w-[80px] laptop:min-w-[260px] text-[16px] font-normal border-b border-[#F6F6F6]">
                      {user.email}
                    </td>
                    <td className="pl-2 min-w-[80px] laptop:min-w-[280px] text-[16px] font-normal border-b border-[#F6F6F6]">
                      {user.leader_name}{" "}
                      {user.leader_name ? `(${user.leader_idKey})` : ""}
                    </td>
                    <td className="pl-2 min-w-[50px] laptop:min-w-[140px] text-[16px] font-normal border-b border-[#F6F6F6]">
                      {convertHourToDay(
                        user.time_off_hours,
                        user.last_year_time_off
                      )}
                    </td>
                    <td className="pl-2 min-w-[180px] laptop:min-w-[180px] text-[16px] font-normal border-b border-[#F6F6F6]">
                      {
                        STAFF_STATUS_WORKING.find(
                          (item) => item.value == user.status_working
                        )?.name
                      }
                    </td>
                    <td className="pl-2 min-w-[100px] laptop:min-w-[100px] text-[16px] font-normal border-b border-[#F6F6F6]">
                      <StyledTableStatusItem value={user?.status || ""} />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        )}
      </table>
      {reportStaffList.length == 0 && !loading && <StyledNoDataGrid />}
    </div>
  );
}
