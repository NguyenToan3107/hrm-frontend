import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ITEM_PER_PAGE, STAFF_STATUS } from "@/utilities/static-value";

import { GetStaffListParams } from "@/apis/modules/user";
import ArrowDownIcon from "@/app/assets/icons/icon-arrow-down.svg";
import IconSearch from "@/app/assets/icons/iconSearch.svg";
import StyledSelected from "@/app/staffs/components/StyledSelected";
import { StyledActionConfirmAlertDialog } from "@/components/common/alert-dialog/StyledActionConfirmAlertDialog";
import { GetReportListUseCase } from "@/core/application/usecases/report/getReportList.usecase";
import { ReportRepositoryImpl } from "@/core/infrastructure/repositories/report.repo";
import { useReportStore } from "@/stores/reportStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const reportRepo = new ReportRepositoryImpl();
const getReportListUseCase = new GetReportListUseCase(reportRepo);

const formSchema = z.object({
  keyword: z.string().optional(),
  status: z.string().optional(),
});

interface Props {
  loading: boolean;
  setLoading(loading: boolean): void;
  setPage(page: number): void;
}
export default function SearchArea(props: Props) {
  const { setLoading, setPage } = props;
  const [openActionConfirmDialog, setOpenActionConfirmDialog] = useState(false);

  const {
    searchParams,
    updateReportStaffListData,
    updateSearchParams,
    selectedStaffIds,
    updateSelectedStaffIds,
  } = useReportStore((state) => state);
  const i18nStaff = useTranslations("Staff");

  const onSubmit = () => {
    if (selectedStaffIds.length > 0) {
      setOpenActionConfirmDialog(true);
    } else {
      form.handleSubmit(onSearch)();
    }
  };

  const onSearch = async (data: any) => {
    try {
      setLoading(true);
      updateSelectedStaffIds([]);
      const params: GetStaffListParams = {
        page: 1,
        keyword: data?.keyword,
        status: !data?.status ? undefined : Number(data?.status),
        limit: ITEM_PER_PAGE,
      };
      const response = await getReportListUseCase.execute(params);
      setPage(1);
      updateReportStaffListData(response?.data, response?.totalItem || 0);
      updateSearchParams(params);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keyword: "",
      status: "1",
    },
  });

  useEffect(() => {
    if (searchParams?.keyword) {
      form.setValue("keyword", searchParams?.keyword || "");
    }
  }, []);

  return (
    <div className="h-[92px]">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-row justify-between items-end"
        >
          <div className="flex flex-row flex-1 items-center gap-x-4 ">
            <FormField
              control={form.control}
              name="keyword"
              render={({ field }) => (
                <FormItem className="w-[560px]">
                  <FormLabel className="font-normal text-[16px]">
                    Keyword:
                  </FormLabel>
                  <FormControl>
                    <Input
                      tabIndex={1}
                      placeholder="ID, Name, Email"
                      {...field}
                      className=" border border-border focus:border-primary px-2 "
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => {
                return (
                  <FormItem className="w-full laptop:w-[220px]">
                    <FormLabel className=" font-normal text-[16px]">
                      Status
                    </FormLabel>
                    <StyledSelected
                      items={[{ value: "-1", name: "All" }, ...STAFF_STATUS]}
                      field={field}
                      tabIndex={5}
                      iconRight={ArrowDownIcon}
                    />
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
          <div className="flex flex-row">
            <Button
              tabIndex={5}
              className="w-[124px] h-11 text-white text-[16px] bg-button-search hover:bg-button-search-hover"
              type="submit"
            >
              <Image
                src={IconSearch}
                alt=""
                width={20}
                height={20}
                className="mr-2"
              />
              {i18nStaff("searchButton")}
            </Button>
          </div>
        </form>
      </Form>
      <StyledActionConfirmAlertDialog
        onConfirm={form.handleSubmit(onSearch)}
        title={"Warning"}
        description={
          "The staff is currently selected on the grid. If you continue, all selections will be cleared. Are you sure you want to proceed?"
        }
        open={openActionConfirmDialog}
        onOpenChange={setOpenActionConfirmDialog}
      />
    </div>
  );
}
