"use client";
import StyledReportAttendanceDay from "@/components/common/StyledReportAttendanceDay";
import { DataExport, useReportStore } from "@/stores/reportStore";
import { exportPDF } from "@/utilities/helper";
import { useEffect } from "react";

interface Props {
  dataExport?: DataExport;
}

export default function ExportPDFPage(props: Props) {
  const { dataExport } = props;
  const { deleteDataExportByIdUser } = useReportStore();

  const exportpdf = async () => {
    try {
      const fileName =
        dataExport?.year +
        "年" +
        dataExport?.month +
        "月" +
        "勤務管理表 - " +
        dataExport?.user?.idkey +
        " - " +
        dataExport?.user?.fullname +
        ".pdf";
      setTimeout(async () => {
        await exportPDF(dataExport?.user?.id || "", fileName);
        deleteDataExportByIdUser(dataExport?.user?.id);
      }, 1000);
    } catch (error) {}
  };

  useEffect(() => {
    exportpdf();
  }, []);

  if (!dataExport) return null;
  return (
    <div
      id={`pdf-${dataExport?.user?.id}`}
      className={`absolute pl-[24px] pr-[24px] py-[40px] left-[100000px] z-50 bg-white  h-[842px] w-[595px] overflow-y-auto hide-scrollbar top-0`}
    >
      <div className="flex flex-row items-start justify-between mb-4">
        <p className="flex w-fit text-[14px] font-bold text-center">
          Monthly timesheet {dataExport?.month} (HANOI)
        </p>
        <div className="flex flex-col flex-1 pl-4">
          <div className="flex flex-row w-full border border-transparent border-b-black items-start">
            <div className="flex flex-row w-[140px]">
              <p className="text-[11px] w-fit text-left font-bold">Company：</p>
              <p className="text-[11px] font-bold flex-1 text-center pr-1">
                {dataExport?.user?.department?.[0]}
              </p>
            </div>
            <div className="flex flex-row flex-1 justify-start">
              <p className="text-[11px] text-center font-bold w-[56px]">ID：</p>
              <p className="text-[11px] font-semibold flex-1 text-center items-center">
                {dataExport?.user?.idkey}
              </p>
            </div>
          </div>

          <div className="flex flex-row w-full border border-transparent border-b-black items-start pt-1">
            <div className="flex flex-row w-[140px]">
              <p className="text-[11px] w-fit text-left font-bold">
                Department：
              </p>
              <p className="text-[11px] font-semibold flex-1 text-center pr-1">
                ITS
              </p>
            </div>
            <div className="flex flex-row flex-1 justify-start">
              <p className="text-[11px] text-center font-bold w-[56px]">
                Name：
              </p>
              <p className="text-[11px] font-normal flex-1 text-center items-center">
                {dataExport?.user?.fullname}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="w-full text-sm border border-black">
          {/* Header 1*/}
          <div className="flex w-full text-[10px] bg-white font-semibold">
            <div className="flex w-[15%] h-4 border-t border-black items-center ">
              <div className="flex w-1/3 h-4 border-r-0.5 border-l border-black items-center justify-center">
                Day
              </div>
              <div className="flex w-1/3 h-4 border-r-0.5 border-black items-center " />
              <div className="flex w-1/3 h-4 border-r-0.5 border-black items-center" />
            </div>
            <div className="flex w-[19%] h-4 border-t border-x-0.5 border-black items-center px-1">
              Regular work
            </div>
            <div className="flex w-[19%] h-4 border-t border-x-0.5 border-black items-center px-1">
              Overtime Record
            </div>
            <div className="flex w-[30%] h-4 border-t border-x-0.5 border-black items-center px-1">
              Overtime hours
            </div>
            <div className="flex w-[22%] h-4 border-t border-black items-center">
              <div className="flex w-[45%] text-[10px] h-4 border-x-0.5 border-black justify-center items-center px-1">
                ID Check
              </div>
              <div className="flex w-[55%] text-[10px] h-4 border-r-0.5 border-l-0 border-black items-center justify-center px-1">
                President
              </div>
            </div>
          </div>
          {/* Header 2*/}
          <div className="flex w-full text-[10px]  bg-white font-semibold">
            <div className="flex w-[15%] h-4  items-center ">
              <div className="flex w-1/3 h-4 border-0.5  border-black items-center justify-center">
                Mo.
              </div>
              <div className="flex w-1/3 h-4 border-0.5 border-l-0 border-black items-center justify-center">
                Day
              </div>
              <div className="flex w-1/3 h-4 border-0.5 border-l-0 border-black items-center justify-center">
                Day
              </div>
            </div>
            <div className="flex w-[19%] h-4 items-center">
              <div className="w-1/2 h-4 border-0.5 border-black flex items-center justify-center">
                Start
              </div>
              <div className="w-1/2 h-4 border-0.5 border-l-0 border-black flex items-center justify-center">
                End
              </div>
            </div>
            <div className="flex w-[19%] h-4 items-center">
              <div className="w-1/2 h-4 border-0.5 border-black flex items-center justify-center">
                OT Start
              </div>
              <div className="w-1/2 h-4 border-0.5 border-l-0 border-black flex items-center justify-center">
                OT End
              </div>
            </div>
            <div className="flex w-[30%] h-4 items-center">
              <div className="w-[40%] h-4 border-0.5 border-black flex items-center justify-center">
                Reg OT
              </div>
              <div className="w-[30%] h-4 border-0.5 border-l-0 border-black flex items-center justify-center">
                Night OT
              </div>
              <div className="w-[30%] h-4 border-0.5 border-l-0 border-black flex items-center justify-center">
                Holiday
              </div>
            </div>
            <div className="flex w-[22%] h-4  items-center">
              <div className="w-[45%] h-4 border-0.5 border-black flex items-center justify-center">
                Employee
              </div>
              <div className="w-[55%] h-4 border-0.5 border-t-0 border-l-0 border-black flex items-center justify-center"></div>
            </div>
          </div>
          {/* Rows */}
          {dataExport?.days?.map((row, index) => {
            return <StyledReportAttendanceDay key={index} row={row} />;
          })}
          {/* Footer */}
          <div className="flex w-full text-[10px]  bg-white font-semibold">
            <div className="flex w-[15%] h-5  items-center ">
              <div className="flex w-1/3 h-5 border-0.5 border-r-0  border-black items-center justify-center">
                Total
              </div>
              <div className="flex w-1/3 h-5 border-x-0 border-0.5 border-black items-center justify-center"></div>
              <div className="flex w-1/3 h-5   border-l-0 border-0.5  border-black items-center justify-center"></div>
            </div>
            <div className="flex w-[19%] h-5 border-0.5  border-black items-center pl-1">
              <div className="flex w-full h-5 border-0 items-center">
                Working Days
              </div>
              {/* <div className="flex w-1/2 h-5" /> */}
            </div>
            <div className="flex w-[19%] h-5 items-center ">
              <div className="flex w-1/2 text-[15px] h-5 border-0.5  border-black justify-center items-center">
                {dataExport?.total}
              </div>
              <div className="flex w-1/2 h-5 border-0.5  border-black justify-end items-center pr-1">
                Off Time
              </div>
            </div>
            <div className="flex w-[30%] h-5 items-center">
              <div className="w-[40%] h-5 border-0.5  border-black flex items-center justify-center">
                <div className="w-1/2 h-5  flex items-center justify-center text-[15px]">
                  0.0
                </div>
                <div className="w-1/2 h-5 text-[9px]  flex items-center justify-end pr-1">
                  Time
                </div>
              </div>
              <div className="w-[30%] text-[9px] h-5 border-l-0 border-0.5  border-black flex items-center justify-end pr-1">
                Time
              </div>
              <div className="w-[30%] text-[9px] h-5 border-l-0 border-0.5  border-black flex items-center justify-end pr-1">
                Time
              </div>
            </div>
            <div className="flex w-[22%] h-5 items-center">
              <div className="w-[45%] h-5 border-0.5  border-black flex items-center justify-center"></div>
              <div className="w-[55%] h-5 border-l-0 border-0.5  border-black flex items-center justify-center"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
