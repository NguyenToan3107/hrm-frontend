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
          {dataExport?.month}月度勤務管理表(HANOI社員用)
        </p>
        <div className="flex flex-col flex-1 pl-4">
          <div className="flex flex-row w-full border border-transparent border-b-black items-start">
            <div className="flex flex-row w-[140px]">
              <p className="text-[11px] w-fit text-left font-bold">会社名：</p>
              <p className="text-[11px] font-bold flex-1 text-center pr-1">
                {dataExport?.user?.department?.[0]}
              </p>
            </div>
            <div className="flex flex-row flex-1 justify-start">
              <p className="text-[11px] text-center font-bold w-[56px]">
                社員番号：
              </p>
              <p className="text-[11px] font-semibold flex-1 text-center items-center">
                {dataExport?.user?.idkey}
              </p>
            </div>
          </div>

          <div className="flex flex-row w-full border border-transparent border-b-black items-start pt-1">
            <div className="flex flex-row w-[140px]">
              <p className="text-[11px] w-fit text-left font-bold">部署名：</p>
              <p className="text-[11px] font-semibold flex-1 text-center pr-1">
                設計事業部
              </p>
            </div>
            <div className="flex flex-row flex-1 justify-start">
              <p className="text-[11px] text-center font-bold w-[56px]">
                氏名：
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
                日付
              </div>
              <div className="flex w-1/3 h-4 border-r-0.5 border-black items-center " />
              <div className="flex w-1/3 h-4 border-r-0.5 border-black items-center" />
            </div>
            <div className="flex w-[19%] h-4 border-t border-x-0.5 border-black items-center px-1">
              通常勤務記録
            </div>
            <div className="flex w-[19%] h-4 border-t border-x-0.5 border-black items-center px-1">
              時間外勤務記録
            </div>
            <div className="flex w-[30%] h-4 border-t border-x-0.5 border-black items-center px-1">
              時間外勤務時間
            </div>
            <div className="flex w-[22%] h-4 border-t border-black items-center">
              <div className="flex w-[45%] text-[8px] h-4 border-x-0.5 border-black justify-center items-center px-1">
                社員確認
              </div>
              <div className="flex w-[55%] text-[8px] h-4 border-r-0.5 border-l-0 border-black items-center justify-center px-1">
                社長確認印
              </div>
            </div>
          </div>
          {/* Header 2*/}
          <div className="flex w-full text-[10px]  bg-white font-semibold">
            <div className="flex w-[15%] h-4  items-center ">
              <div className="flex w-1/3 h-4 border-0.5  border-black items-center justify-center">
                月
              </div>
              <div className="flex w-1/3 h-4 border-0.5 border-l-0 border-black items-center justify-center">
                日
              </div>
              <div className="flex w-1/3 h-4 border-0.5 border-l-0 border-black items-center justify-center">
                曜日
              </div>
            </div>
            <div className="flex w-[19%] h-4 items-center">
              <div className="w-1/2 h-4 border-0.5 border-black flex items-center justify-center">
                始業時間
              </div>
              <div className="w-1/2 h-4 border-0.5 border-l-0 border-black flex items-center justify-center">
                終業時間
              </div>
            </div>
            <div className="flex w-[19%] h-4 items-center">
              <div className="w-1/2 h-4 border-0.5 border-black flex items-center justify-center">
                残業開始
              </div>
              <div className="w-1/2 h-4 border-0.5 border-l-0 border-black flex items-center justify-center">
                残業終了
              </div>
            </div>
            <div className="flex w-[30%] h-4 items-center">
              <div className="w-[40%] h-4 border-0.5 border-black flex items-center justify-center">
                普通残業
              </div>
              <div className="w-[30%] h-4 border-0.5 border-l-0 border-black flex items-center justify-center">
                深夜残業
              </div>
              <div className="w-[30%] h-4 border-0.5 border-l-0 border-black flex items-center justify-center">
                休日出勤
              </div>
            </div>
            <div className="flex w-[22%] h-4  items-center">
              <div className="w-[45%] h-4 border-0.5 border-black flex items-center justify-center">
                社員印
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
                合計
              </div>
              <div className="flex w-1/3 h-5 border-x-0 border-0.5 border-black items-center justify-center"></div>
              <div className="flex w-1/3 h-5   border-l-0 border-0.5  border-black items-center justify-center"></div>
            </div>
            <div className="flex w-[19%] h-5 border-0.5  border-black items-center pl-1">
              <div className="flex w-1/2 h-5 border-0 items-center">
                出勤日数
              </div>
              <div className="flex w-1/2 h-5" />
            </div>
            <div className="flex w-[19%] h-5 items-center ">
              <div className="flex w-1/2 text-[15px] h-5 border-0.5  border-black justify-end items-center">
                {dataExport?.total}日
              </div>
              <div className="flex w-1/2 h-5 border-0.5  border-black justify-end items-center pr-1">
                時間外
              </div>
            </div>
            <div className="flex w-[30%] h-5 items-center">
              <div className="w-[40%] h-5 border-0.5  border-black flex items-center justify-center">
                <div className="w-1/2 h-5  flex items-center justify-center text-[15px]">
                  0.0
                </div>
                <div className="w-1/2 h-5 text-[9px]  flex items-center justify-end pr-1">
                  時間
                </div>
              </div>
              <div className="w-[30%] text-[9px] h-5 border-l-0 border-0.5  border-black flex items-center justify-end pr-1">
                時間
              </div>
              <div className="w-[30%] text-[9px] h-5 border-l-0 border-0.5  border-black flex items-center justify-end pr-1">
                時間
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
