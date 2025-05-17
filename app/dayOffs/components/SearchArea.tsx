import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DAY_OFF_STATUS,
  ITEM_PER_PAGE,
  LEAVE_TYPE,
} from "@/utilities/static-value";

import ArrowDownIcon from "@/app/assets/icons/icon-arrow-down.svg";
import IconAdd from "@/app/assets/icons/iconAdd.svg";
import IconSearch from "@/app/assets/icons/iconSearch.svg";
import StyledSelected from "@/app/staffs/components/StyledSelected";
import { StyledDatePicker } from "@/components/common/StyledDatePicker";
import StyledMultipleDatePicker from "@/components/common/StyledMultipleDatePicker";
import { useUserStore } from "@/stores/userStore";
import { formatDateToString } from "@/utilities/format";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import { useForm } from "react-hook-form";
import { z } from "zod";
// import CreateLeaveModal from "@/CreateLeavesModal";
import { GetDayOffsParams } from "@/apis/modules/schedule";
import { GetDayOffsUseCase } from "@/core/application/usecases/schedule/getDayOffs.usecase";
import { ScheduleRepositoryImpl } from "@/core/infrastructure/repositories/schedule.repo";
import { useScheduleStore } from "@/stores/scheduleStore";
import CreateDayOffModal from "@/app/dayOffs/components/CreateDayOffModal";

const scheduleRepo = new ScheduleRepositoryImpl();
const getDayOffsUseCase = new GetDayOffsUseCase(scheduleRepo);

const formSchema = z.object({
  type: z.string().optional(),
  createDate: z
    .union([
      z.string({ message: "Date of birth is required" }),
      z.date(),
      z.null(),
    ])
    .optional(),
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
  setLoading(loading: boolean): void;
  loading: boolean;
  setPage(page: number): void;
  currentPage: number;
}

export default function SearchArea(props: Props) {
  const { setLoading, loading, setPage, currentPage } = props;
  const { updateDayOffListData, searchParams, updateSearchParams } =
    useScheduleStore((state) => state);

  const { user } = useUserStore();
  const router = useRouter();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const i18nLeave = useTranslations("Leave");

  const isCreateLeavebutton = useMemo(() => {
    const userRole = user?.role;
    return userRole?.permissions?.includes("leave_create");
  }, []);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const params: GetDayOffsParams = {
        page: 1,
        limit: ITEM_PER_PAGE,
        day_off_type: data.type == "-1" ? undefined : data?.type,
        status:
          !data?.status || data?.status == "-1" ? undefined : data?.status,
      };
      if (data?.createDate) {
        params.create_date = formatDateToString(data?.createDate);
      }
      if (data?.leaveStartDate)
        params.day_off_start_date = formatDateToString(data?.leaveStartDate);
      if (data?.leaveEndDate)
        params.day_off_end_date = formatDateToString(data?.leaveEndDate);
      const response = await getDayOffsUseCase.execute(params);
      setPage(1);
      updateSearchParams(params);
      updateDayOffListData(response?.data || [], response?.totalItem || 0);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const goToCreatePage = () => {
    if (isMobile) {
      router.push(`/leaves/create-leave`);
    } else {
      setIsCreateModalOpen(true);
    }
  };
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "-1",
      status: "-1",
      createDate: "",
      leaveStartDate: "",
      leaveEndDate: "",
    },
  });

  const onReloadData = async () => {
    try {
      setLoading(true);
      const params = { ...searchParams, page: currentPage };
      const response = await getDayOffsUseCase.execute(params);
      updateSearchParams(params);
      updateDayOffListData(response?.data, response?.totalItem || 0);
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };

  const onCloseCreateModal = async () => {
    setIsCreateModalOpen(false);
    await onReloadData();
  };

  return (
    <div className="h-full laptop:h-[150px]">
      {isCreateModalOpen && (
        <CreateDayOffModal
          loading={loading}
          isOpen={isCreateModalOpen}
          onClose={onCloseCreateModal}
          setLoading={setLoading}
        />
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-col w-full"
        >
          <div className="flex flex-col laptop:flex-row w-full flex-1 laptop:items-center gap-x-4 gap-y-2 ">
            <div className="flex gap-x-4 flex-1">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className=" font-normal text-[16px]">
                      Type
                    </FormLabel>
                    <StyledSelected
                      items={[{ value: "-1", name: "All" }, ...LEAVE_TYPE]}
                      field={field}
                      tabIndex={1}
                      iconRight={ArrowDownIcon}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className=" font-normal text-[16px]">
                      Status
                    </FormLabel>
                    <StyledSelected
                      items={[{ value: "-1", name: "All" }, ...DAY_OFF_STATUS]}
                      field={field}
                      tabIndex={4}
                      iconRight={ArrowDownIcon}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex gap-x-4 flex-1">
              <StyledMultipleDatePicker
                form={form}
                label="Leave date"
                nameStartDate="leaveStartDate"
                nameEndDate="leaveEndDate"
              />
            </div>
            <div className="flex gap-x-4 flex-1">
              <FormField
                control={form.control}
                name={"createDate"}
                render={({ field, fieldState }) => (
                  <FormItem className="flex-1  flex  flex-col">
                    <FormLabel className={"font-normal text-[16px]  "}>
                      Create date
                    </FormLabel>
                    <FormControl>
                      <StyledDatePicker
                        tabIndex={2}
                        field={field}
                        title={""}
                        triggerClass="flex-1 flex border rounded-md px-2"
                      />
                    </FormControl>
                    {fieldState.error?.message && (
                      <p className={"text-red-500 text-[10px]"}>
                        {fieldState.error?.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />
              <div className="w-1/2"></div>
            </div>
          </div>
          <div className="flex flex-col laptop:flex-row laptop:flex-1 justify-between mt-2 gap-y-2 laptop:gap-x-4">
            <div
              className={
                "flex gap-x-4 flex-1 items-end justify-end laptop:justify-end "
              }
            >
              <Button
                tabIndex={8}
                className="w-[124px] h-11 font-normal text-white text-[16px] bg-button-search hover:bg-button-search-hover"
                type="submit"
              >
                <Image
                  src={IconSearch}
                  alt=""
                  width={20}
                  height={20}
                  className="mr-2"
                />
                {i18nLeave("searchButton")}
              </Button>
              {isCreateLeavebutton && (
                <Button
                  tabIndex={7}
                  className="w-[124px] h-11 font-normal text-white text-[16px] bg-button-create hover:bg-button-create-hover"
                  type="button"
                  onClick={goToCreatePage}
                >
                  <Image
                    src={IconAdd}
                    alt=""
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  {i18nLeave("addNewButton")}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
