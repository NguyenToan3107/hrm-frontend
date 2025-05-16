"use client";
import { ExportPDFResponse } from "@/apis/modules/common";
import IconArrowLeft from "@/app/assets/icons/iconArrowLeft.svg";
import ExportPDFPage from "@/app/staffs/components/ExportPDFPage";
import StyledYearPicker from "@/components/calendar/StyledYearPicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ExportPDFUseCase } from "@/core/application/usecases/common/exportPDF";
import { CommonRepositoryImpl } from "@/core/infrastructure/repositories/common.repo";
import { DataExport } from "@/stores/reportStore";
import { useStaffStore } from "@/stores/staffStore";
import { listYears } from "@/utilities/helper";
import { getMonth, getYear } from "date-fns";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import Image from "next/image";
import { useState } from "react";

interface Props {
  isOpenExportPDF: boolean;
  setIsOpenExportPDF(isOpenExportPDF: boolean): void;
}

const commonRepository = new CommonRepositoryImpl();
const exportPDFUseCase = new ExportPDFUseCase(commonRepository);

export default function ExportPDFDialog(props: Props) {
  const { isOpenExportPDF, setIsOpenExportPDF } = props;
  const [month, setMonth] = useState<number>(getMonth(new Date()));
  const [year, setYear] = useState<number>(getYear(new Date()));
  const [loading, setLoading] = useState<boolean>(false);
  const [dataExport, setDataExport] = useState<DataExport>();
  const { selectedStaff } = useStaffStore((state) => state);

  const handleSubmit = async () => {
    await handleDownloadPDF();
  };

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      const params: ExportPDFResponse = {
        id: selectedStaff?.id,
        month: month + 1,
        year: year,
      };
      const response = await exportPDFUseCase.execute(params);
      setDataExport(response?.data);
      const fileName =
        year +
        "年勤務管理表 - " +
        selectedStaff?.idkey +
        " - " +
        selectedStaff?.fullname +
        ".pdf";
      setTimeout(async () => {
        const input: any = document.getElementById("pdf-content");

        await html2canvas(input, {
          scale: 3,
          useCORS: true,
          backgroundColor: "#ffffff",
        }).then((canvas) => {
          const imgData: any = canvas.toDataURL("image/png");
          const pdf = new jsPDF("portrait", "pt", "a4", true);

          const width = pdf.internal.pageSize.getWidth();
          const height = pdf.internal.pageSize.getHeight();
          pdf.addImage(imgData, "JPEG", 0, 0, width, height);
          pdf.save(fileName);
        });
        setDataExport(undefined);
        setIsOpenExportPDF(false);
        setLoading(false);
      }, 1000);
    } catch (error) {
    } finally {
    }
  };

  const onNextYear = () => {
    if (year >= getYear(new Date())) return;
    setYear((pre) => pre + 1);
    setMonth(0);
  };

  const onBackYear = () => {
    if (year <= 2024) return;
    setYear((pre) => pre - 1);
    setMonth(0);
  };

  const onNextMonth = () => {
    if (Number(month) >= 11) return;
    setMonth((pre) => pre + 1);
  };
  const onBackMonth = () => {
    if (Number(month) <= 0) return;
    setMonth((pre) => pre - 1);
  };

  return (
    <div>
      <Dialog open={isOpenExportPDF} onOpenChange={setIsOpenExportPDF}>
        <DialogContent className="laptop:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Set up export PDF</DialogTitle>
            <DialogDescription className="text-start">
              Choose month you want export PDF.
            </DialogDescription>
          </DialogHeader>
          <div className="flex w-full">
            <div className="flex flex-row w-full items-center gap-2 mx-4">
              <Label htmlFor="year" className="text-right">
                Year
              </Label>

              <div className="flex w-fit px-1 items-center justify-center">
                <Image
                  onClick={onBackYear}
                  src={IconArrowLeft}
                  alt=" "
                  className={`p-1 hover:cursor-pointer h-6 w-6 rounded-full  border border-gray-300  ${
                    listYears()[0] == year
                      ? `bg-gray-300 opacity-50`
                      : `bg-white opacity-100`
                  }`}
                />
                <div className="relative">
                  <StyledYearPicker
                    selectedYear={year}
                    setSelectedYear={setYear}
                  />
                </div>
                <Image
                  onClick={onNextYear}
                  src={IconArrowLeft}
                  alt=" "
                  className={`p-1 hover:cursor-pointer rotate-180  h-6 w-6 rounded-full border border-gray-300 ${
                    listYears()[listYears().length - 2] == year
                      ? `bg-gray-300 opacity-50`
                      : `bg-white opacity-100`
                  }`}
                />
              </div>
            </div>
            <div className="flex flex-row w-full items-center gap-2 mx-4">
              <Label htmlFor="month" className="text-right">
                Month
              </Label>
              <div className="flex w-fit px-1 items-center justify-center ">
                <Image
                  onClick={onBackMonth}
                  src={IconArrowLeft}
                  alt=" "
                  className={`p-1 hover:cursor-pointer  h-6 w-6 rounded-full  border border-gray-300  ${
                    month == 0
                      ? `bg-gray-300 opacity-50`
                      : `bg-white opacity-100`
                  } `}
                />
                <p className="px-4">{month + 1}</p>

                <Image
                  onClick={onNextMonth}
                  src={IconArrowLeft}
                  alt=" "
                  className={`p-1 hover:cursor-pointer  h-6 w-6 rounded-full  border border-gray-300  rotate-180 ${
                    (year < getYear(new Date()) && month == 11) ||
                    (year == getYear(new Date()) &&
                      month >= getMonth(new Date()))
                      ? `opacity-50 bg-gray-300`
                      : `opacity-100 bg-white`
                  } `}
                />
              </div>
            </div>
          </div>
          <ExportPDFPage dataExport={dataExport} />

          <DialogFooter>
            <div className="flex flex-1 items-center justify-center gap-2 laptop:justify-end">
              <Button
                type="button"
                className="mt-0 w-[120px] bg-white border border-border"
                onClick={() => setIsOpenExportPDF(false)}
              >
                No
              </Button>
              <Button
                type="button"
                disabled={loading}
                className="mb-0 w-[120px] text-white hover:bg-primary-hover"
                onClick={handleSubmit}
              >
                {loading ? "Waiting..." : "Yes"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
