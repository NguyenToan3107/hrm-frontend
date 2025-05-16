"use client";
import { default as DefaultImage } from "@/app/assets/avatar/avatar_default.svg";
import IconLink from "@/app/assets/icons/iconLink.svg";
import StyledAvatarPreview from "@/components/common/StyledAvatarPreview";
import StyledHeaderColumn from "@/components/common/StyledHeaderColumn";
import StyledNoDataGrid from "@/components/common/StyledNoDataGrid";
import { GetCheckedStaffExportPDFUseCase } from "@/core/application/usecases/report/getCheckedStaffExportPDF.usecase";
import { ReportRepositoryImpl } from "@/core/infrastructure/repositories/report.repo";
import {
  CheckedStaffExport,
  DataCheckedStaff,
  useReportStore,
} from "@/stores/reportStore";
import { SortOrder } from "@/utilities/enum";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const reportRepo = new ReportRepositoryImpl();
const getCheckedStaffExportPDFUseCase = new GetCheckedStaffExportPDFUseCase(
  reportRepo
);

interface Props {
  loading: boolean;
  month: string;
  year: string;
  dataCheckedStaffExports: DataCheckedStaff[];
  setLoading(loading: boolean): void;
  setDataCheckedStaffExports(dataCheckedStaffExports: DataCheckedStaff[]): void;
}

export default function StyledCheckedStaffReportTable(props: Props) {
  const {
    month,
    year,
    loading,
    dataCheckedStaffExports,
    setLoading,
    setDataCheckedStaffExports,
  } = props;
  const { selectedStaffIds } = useReportStore((state) => state);

  const onReSearch = async (
    sort_by: string,
    sort_order: SortOrder.ASC | SortOrder.DESC
  ) => {
    try {
      setLoading(true);
      const params = {
        items: selectedStaffIds.map((item) => ({ id: item })),
        month: Number(month),
        year: Number(year),
        sort_by,
        sort_order,
      };
      const response = await getCheckedStaffExportPDFUseCase.execute(params);
      setDataCheckedStaffExports(response?.data);
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

  return (
    <div
      style={{
        scrollbarWidth: "none",
      }}
      className="overflow-y-auto mt-0 max-h-screen overscroll-none block rounded-sm w-full h-[360px] relative items-start"
    >
      <p className="flex justify-start pt-2 pb-4">
        <strong className="pr-1">From</strong>{" "}
        {dataCheckedStaffExports[0]?.start_date}{" "}
        <strong className="px-1">to</strong>
        {dataCheckedStaffExports[0]?.end_date}
      </p>
      <table className="overflow-y-none overscroll-x-none max-h-screen overscroll-none w-full border-separate border-spacing-0 relative">
        <thead className="border-border border-b sticky top-0">
          <tr className=" align-center bg-white">
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
            <th className="text-[16px] text-white pl-2 bg-primary font-medium align-center text-start min-w-[100px] w-[100px] hover:bg-primary-hover hover:cursor-pointer  border-b">
              <StyledHeaderColumn
                columnName={"Goto Leaves"}
                columnNameId={"Goto Leaves"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
          </tr>
        </thead>
        {dataCheckedStaffExports.length !== 0 && (
          <tbody className="hide-scrollbar">
            {!!dataCheckedStaffExports?.length &&
              dataCheckedStaffExports?.map((staffData) =>
                staffData.users?.map(
                  (user: CheckedStaffExport, userIndex: number) => (
                    <tr
                      key={user.id ? user.id.toString() : String(userIndex)}
                      className="overflow-x-auto w-screen align-center h-[52px]"
                    >
                      <td className="pl-2 text-start text-[16px] font-normal border-b border-[#F6F6F6]">
                        {user.idkey}
                      </td>
                      <td className="pl-2 border-b border-[#F6F6F6]">
                        <div className="flex justify-start items-center laptop:gap-x-2">
                          <StyledAvatarPreview
                            image={
                              user.image
                                ? `${process.env.NEXT_PUBLIC_BASE_URL_IMAGE}${user.image}`
                                : DefaultImage
                            }
                            className="contain-size h-8 w-8 rounded-full cursor-pointer object-contain aspect-square"
                            height={44}
                            width={44}
                          />
                          <p className="text-[16px] font-normal pl-2">
                            {user.fullname}
                          </p>
                        </div>
                      </td>
                      <td className="pl-2 text-[16px] font-normal border-b border-[#F6F6F6]">
                        <Link
                          href={`/leaves?staffName=${user.idkey}&leaveStartDate=${staffData.start_date}&leaveEndDate=${staffData.end_date}`}
                          className="flex items-center"
                          target="_blank"
                        >
                          <Image
                            src={IconLink}
                            alt=""
                            width={20}
                            height={20}
                            className="mr-2"
                          />
                          <p className="text-primary">Link</p>
                        </Link>
                      </td>
                    </tr>
                  )
                )
              )}
          </tbody>
        )}
      </table>
      {dataCheckedStaffExports[0]?.users?.length == 0 && !loading && (
        <StyledNoDataGrid />
      )}
    </div>
  );
}
