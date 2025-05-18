import { GetDayOffsParams } from "@/apis/modules/schedule";
import ArrowDownIcon from "@/app/assets/icons/icon-arrow-down.svg";
import IconFilter from "@/app/assets/icons/iconFilter.svg";
import IconFilterWhite from "@/app/assets/icons/iconFilterWhite.svg";
import StyledSelected from "@/app/staffs/components/StyledSelected";
import StyledMultipleDatePicker from "@/components/common/StyledMultipleDatePicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { GetDayOffsUseCase } from "@/core/application/usecases/schedule/getDayOffs.usecase";
import { ScheduleRepositoryImpl } from "@/core/infrastructure/repositories/schedule.repo";
import { useScheduleStore } from "@/stores/scheduleStore";
import { CountryType } from "@/utilities/enum";
import { formatDateToString, formatStringToDate } from "@/utilities/format";
import { DAY_OFF_STATUS, ITEM_PER_PAGE } from "@/utilities/static-value";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

const scheduleRepo = new ScheduleRepositoryImpl();
const getDayOffsUseCase = new GetDayOffsUseCase(scheduleRepo);

const formSchema = z.object({
  leaveStartDate: z
    .union([
      z.string({ message: "Leave start date is required" }),
      z.date(),
      z.null(),
    ])
    .optional(),
  leaveEndDate: z
    .union([
      z.string({ message: "Leave end date is required" }),
      z.date(),
      z.null(),
    ])
    .optional(),
  status: z.string().optional(),
});

interface Props {
  loading: boolean;
  setLoading(loading: boolean): void;
  setPage(page: number): void;
  currentPage: number;
}

export function SearchAreaPopup(props: Props) {
  const { setLoading, setPage } = props;

  const [open, setOpen] = useState(false);
  const { updateDayOffListData, searchParams, updateSearchParams } =
    useScheduleStore((state) => state);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const params: GetDayOffsParams = {
        country: CountryType.VN,
        page: 1,
        limit: ITEM_PER_PAGE,
        status:
          !data?.status || data?.status == "-1" ? undefined : data?.status,
      };
      if (data?.leaveStartDate)
        params.day_off_start_date = formatDateToString(data?.leaveStartDate);
      if (data?.leaveEndDate)
        params.day_off_end_date = formatDateToString(data?.leaveEndDate);
      const response = await getDayOffsUseCase.execute(params);
      setPage(1);
      updateSearchParams(params);
      updateDayOffListData(response?.data || [], response?.totalItem || 0);
      setOpen(false);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "-1",
      leaveStartDate: "",
      leaveEndDate: "",
    },
  });

  const onResetForm = () => {
    form.reset({
      status: "-1",
      leaveStartDate: "",
      leaveEndDate: "",
    });
  };

  useEffect(() => {
    if (open) {
      form.setValue("status", searchParams?.status || "-1");
      if (searchParams?.day_off_start_date) {
        form.setValue(
          "leaveStartDate",
          formatStringToDate(String(searchParams?.day_off_start_date))
        );
      }
      if (searchParams?.day_off_end_date) {
        form.setValue(
          "leaveEndDate",
          formatStringToDate(String(searchParams?.day_off_end_date))
        );
      }
    }
  }, [open]);

  const isSearching = useMemo(() => {
    return (
      searchParams.status ||
      searchParams.day_off_start_date ||
      searchParams.day_off_end_date
    );
  }, [searchParams]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Image
          height={28}
          width={36}
          src={isSearching ? IconFilterWhite : IconFilter}
          alt=""
          className={twMerge(
            "hover:cursor-pointer hover:bg-slate-100 rounded-sm px-1",
            isSearching && "bg-button-search"
          )}
        />
      </DialogTrigger>
      <DialogContent className="overflow-scroll bg-white py-[60px]">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-semibold">
            Filter
          </DialogTitle>
        </DialogHeader>
        <div className="flex item-center justify-center">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className=" w-full flex flex-col items-end"
            >
              <div className="flex flex-col w-full flex-1 gap-y-2 item-center justify-center ">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className=" font-normal text-[16px]">
                        Status
                      </FormLabel>
                      <StyledSelected
                        items={[
                          { value: "-1", name: "All" },
                          ...DAY_OFF_STATUS,
                        ]}
                        field={field}
                        iconRight={ArrowDownIcon}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <StyledMultipleDatePicker
                  form={form}
                  label="Leave date"
                  nameStartDate="leaveStartDate"
                  nameEndDate="leaveEndDate"
                />
              </div>
            </form>
          </Form>
        </div>
        <DialogFooter className="flex flex-row justify-center gap-x-2 items-center">
          <Button
            onClick={onResetForm}
            type="button"
            className="w-[80px] h-[32px] font-normal border border-border bg-white text-[12px] hover:bg-gray-200 rounded-lg"
          >
            Clear
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            type="submit"
            className="text-[14px] bg-button-search hover:bg-button-search-hover text-white w-[80px] h-8 "
          >
            Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
