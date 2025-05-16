"use client";
import { GetCheckedStaffReportParams } from "@/apis/modules/report";
import StyledCheckedStaffReportTable from "@/app/reports/components/StyledCheckedStaffReportTable";
import StyledOverlay from "@/components/common/StyledOverlay";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { GetCheckedStaffExportPDFUseCase } from "@/core/application/usecases/report/getCheckedStaffExportPDF.usecase";
import { ReportRepositoryImpl } from "@/core/infrastructure/repositories/report.repo";
import { DataCheckedStaff, useReportStore } from "@/stores/reportStore";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  month: string;
  year: string;
  onClose(): void;
  onOpenChange(open: boolean): void;
}

const reportRepository = new ReportRepositoryImpl();
const getCheckedStaffExportPDFUseCase = new GetCheckedStaffExportPDFUseCase(
  reportRepository
);

export function AlertCheckedStaffExportPDF(props: Props) {
  const { month, year, open, onOpenChange, onClose } = props;
  const [loading, setLoading] = useState(false);
  const { selectedStaffIds } = useReportStore((state) => state);

  const [dataCheckedStaffExports, setDataCheckedStaffExports] =
    useState<DataCheckedStaff[]>();

  const onCloseDialog = async () => {
    onClose();
  };

  const getCheckedStaffExportPDF = async () => {
    try {
      setLoading(true);
      const params: GetCheckedStaffReportParams = {
        items: selectedStaffIds.map((item) => ({ id: item })),
        month: Number(month),
        year: Number(year),
      };

      const response = await getCheckedStaffExportPDFUseCase.execute(params);
      setDataCheckedStaffExports(response?.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      getCheckedStaffExportPDF();
    }
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <StyledOverlay isVisible={loading} />
      <AlertDialogContent className="gap-0 w-1/2 h-[560px] min-w-[800px] p-5">
        <AlertDialogTitle className={"text-[24px] font-bold h-0"}>
          List of employees with unprocessed applications
        </AlertDialogTitle>
        <AlertDialogHeader>
          <div className="w-full flex flex-col items-start">
            <StyledCheckedStaffReportTable
              dataCheckedStaffExports={dataCheckedStaffExports || []}
              setDataCheckedStaffExports={setDataCheckedStaffExports}
              loading={loading}
              setLoading={setLoading}
              month={month}
              year={year}
            />
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex flex-1 items-center justify-center gap-2">
            <>
              <AlertDialogCancel
                className="mt-0 w-[120px]"
                onClick={onCloseDialog}
              >
                Close
              </AlertDialogCancel>
              <Button
                onClick={getCheckedStaffExportPDF}
                className="mb-0 w-[120px] text-white"
              >
                Re-Check
              </Button>
            </>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
