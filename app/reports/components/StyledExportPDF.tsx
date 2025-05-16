"use client";
import { ExportPDFParams } from "@/apis/modules/report";
import ArrowDownIcon from "@/app/assets/icons/icon-arrow-down.svg";
import IconExport from "@/app/assets/icons/iconExport.svg";
import ExportPDFMultiple from "@/app/reports/components/ExportPDFMultiple";
import StyledSelected from "@/app/staffs/components/StyledSelected";
import { AlertDialogReport } from "@/components/common/alert-dialog/AlertDialogReport";
import StyledOverlay from "@/components/common/StyledOverlay";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { ExportPDFReportUseCase } from "@/core/application/usecases/report/exportPDF.usecase";
import { ReportRepositoryImpl } from "@/core/infrastructure/repositories/report.repo";
import { useReportStore } from "@/stores/reportStore";
import { START_YEAR } from "@/utilities/static-value";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AlertCheckedStaffExportPDF } from "@/components/common/alert-dialog/AlertCheckedStaffExportPDF";
import IconCheckReportPDF from "@/app/assets/icons/iconCheckReportPDF.svg";

const formSchema = z.object({
  month: z.string().optional(),
  year: z.string().optional(),
});

const reportRepository = new ReportRepositoryImpl();
const exportPDFReportUseCase = new ExportPDFReportUseCase(reportRepository);

export default function StyledExportPDF() {
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [openCheckedStaffReportDialog, setOpenCheckedStaffReportDialog] =
    useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { dataExports, setDataExports, selectedStaffIds } = useReportStore();

  const onSubmit = () => {
    setOpenReportDialog(true);
  };

  const onSubmitForm = async () => {
    try {
      setLoading(true);
      const data = form.getValues();

      const params: ExportPDFParams = {
        items: selectedStaffIds.map((item) => ({ id: item })),
        month: Number(data.month),
        year: Number(data.year),
      };
      const response = await exportPDFReportUseCase.execute(params);

      setDataExports(response?.data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onCheckStaff = () => {
    setOpenCheckedStaffReportDialog(true);
  };

  const onCloseCheckStaffDialog = () => {
    setOpenCheckedStaffReportDialog(false);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      month: `${new Date().getMonth() + 1}`,
      year: `${new Date().getFullYear()}`,
    },
  });

  const months = [
    { value: "1", name: "1 January" },
    { value: "2", name: "2 February" },
    { value: "3", name: "3 March" },
    { value: "4", name: "4 April" },
    { value: "5", name: "5 May" },
    { value: "6", name: "6 June" },
    { value: "7", name: "7 July" },
    { value: "8", name: "8 August" },
    { value: "9", name: "9 September" },
    { value: "10", name: "10 October" },
    { value: "11", name: "11 November" },
    { value: "12", name: "12 December" },
  ];

  const getYears = (startYear = START_YEAR) => {
    const currentYear = new Date().getFullYear();
    const years = [];

    for (let year = startYear; year <= currentYear; year++) {
      years.push({ value: `${year}`, name: `${year}` });
    }

    return years;
  };

  return (
    <div className="h-[44px] mt-4 mb-8">
      <StyledOverlay isVisible={loading} />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-row justify-end items-end"
        >
          <div className="flex flex-row mr-2 flex-1 justify-end items-center gap-x-2 ">
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem className="w-[146px] h-11 z-10">
                  <FormControl>
                    <StyledSelected
                      field={field}
                      tabIndex={10}
                      items={getYears()}
                      triggerClass="border border-border focus:border-primary text-black px-2 h-11"
                      iconRight={ArrowDownIcon}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem className="w-[255px] h-11 z-10">
                  <FormControl>
                    <StyledSelected
                      field={field}
                      tabIndex={10}
                      items={months}
                      triggerClass="border border-border focus:border-primary text-black px-2 h-11"
                      triggerContentClass="max-h-[500px]"
                      iconRight={ArrowDownIcon}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-row gap-x-2">
            <Button
              tabIndex={5}
              className="w-[126px] h-11 text-white text-[16px] font-normal hover:bg-primary-hover"
              onClick={onCheckStaff}
              type="button"
            >
              <Image
                src={IconCheckReportPDF}
                alt=""
                width={20}
                height={20}
                className="mr-2"
              />
              Check
            </Button>
            <Button
              tabIndex={6}
              disabled={loading}
              className="w-[126px] h-11 text-white text-[16px] font-normal hover:bg-primary-hover"
              type="submit"
            >
              <Image
                src={IconExport}
                alt=""
                width={20}
                height={20}
                className="mr-2"
              />
              Export PDF
            </Button>
          </div>
        </form>
      </Form>
      <ExportPDFMultiple dataExports={dataExports} />
      <AlertDialogReport
        checkedIds={selectedStaffIds}
        tabIndex={16}
        title={
          selectedStaffIds.length > 0
            ? "Do you want to confirm the export of the timesheet?"
            : "Please select at least one employee to export the timesheet."
        }
        onConfirm={onSubmitForm}
        open={openReportDialog}
        onOpenChange={setOpenReportDialog}
      />

      <AlertCheckedStaffExportPDF
        onClose={onCloseCheckStaffDialog}
        open={openCheckedStaffReportDialog}
        onOpenChange={setOpenCheckedStaffReportDialog}
        month={form.getValues("month") || ""}
        year={form.getValues("year") || ""}
      />
    </div>
  );
}
