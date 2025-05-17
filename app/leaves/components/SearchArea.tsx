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
  CANCEL_REQUEST_VALUE,
  ITEM_PER_PAGE,
  LEAVE_STATUS,
  LEAVE_TYPE,
} from "@/utilities/static-value";

import { GetLeaveListParams } from "@/apis/modules/leave";
import ArrowDownIcon from "@/app/assets/icons/icon-arrow-down.svg";
import IconAdd from "@/app/assets/icons/iconAdd.svg";
import IconStat from "@/app/assets/icons/IconStats1.png";
import IconSearch from "@/app/assets/icons/iconSearch.svg";
import StyledSelected from "@/app/staffs/components/StyledSelected";
import { StyledDatePicker } from "@/components/common/StyledDatePicker";
import StyledMultipleDatePicker from "@/components/common/StyledMultipleDatePicker";
import { Input } from "@/components/ui/input";
import { GetLeavesListUseCase } from "@/core/application/usecases/leave/getLeaveList";
import { LeaveRepositoryImpl } from "@/core/infrastructure/repositories/leave.repo";
import { useLeaveStore } from "@/stores/leavesStore";
import { useUserStore } from "@/stores/userStore";
import { formatDateToString, formatStringToDate } from "@/utilities/format";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import AdminCreateModal from "./AdminCreateModal";
import CreateLeaveModal from "./CreateLeavesModal";
import { isValid } from "date-fns";
import { AlertDialogViewLeaveDetail } from "@/components/common/alert-dialog/AlertDialogViewLeaveDetail";

const leaveRepo = new LeaveRepositoryImpl();
const getLeavesListUseCase = new GetLeavesListUseCase(leaveRepo);

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
  staffName: z.string().optional(),
  approver: z.string().optional(),
  leaveId: z.string().optional(),
  cancelRequest: z.string().optional(),
  // relatedLeave: z.any(),
});

interface Props {
  setLoading(loading: boolean): void;
  loading: boolean;
  setPage(page: number): void;
  currentPage: number;
}

export default function SearchArea(props: Props) {
  const { setLoading, loading, setPage, currentPage } = props;
  const { searchParams, updateLeaveListData, updateSearchParams, leaveList } =
    useLeaveStore((state) => state);
  const queryParams = useSearchParams();

  const { user } = useUserStore();
  const router = useRouter();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAdminCreateModalOpen, setIsAdminCreateModalOpen] = useState(false);
  const [isViewLeave, setIsViewLeave] = useState(false);
  const i18nLeave = useTranslations("Leave");

  const isCreateLeavebutton = useMemo(() => {
    const userRole = user?.role;
    return userRole?.permissions?.includes("leave_create");
  }, []);

  const isAdminCreateLeavebutton = useMemo(() => {
    const userRole = user?.role;
    return userRole?.permissions?.includes("add_supplementary");
  }, []);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const params: GetLeaveListParams = {
        page: 1,
        limit: ITEM_PER_PAGE,
        leave_type: data.type == "-1" ? undefined : data?.type,
        status:
          !data?.status || data?.status == "-1" ? undefined : data?.status,
        cancel_request:
          !data?.cancelRequest || data?.cancelRequest == "-1"
            ? undefined
            : data?.cancelRequest,
      };
      if (data?.createDate) {
        params.create_date = formatDateToString(data?.createDate);
      }
      if (data?.leaveStartDate)
        params.leave_start_date = formatDateToString(data?.leaveStartDate);
      if (data?.leaveEndDate)
        params.leave_end_date = formatDateToString(data?.leaveEndDate);
      if (data?.staffName) params.employee_name = data?.staffName;
      if (data?.approver) params.approver = data?.approver;
      if (data?.leaveId) params.leave_id = data?.leaveId;
      const response = await getLeavesListUseCase.execute(params);
      setPage(1);
      updateLeaveListData(response?.data || [], response?.totalItem || 0);
      updateSearchParams(params);
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
      staffName: "",
      leaveId: "",
      cancelRequest: "-1",
      // relatedLeave: true,
    },
  });

  const onGoToAdminCreate = () => {
    if (isMobile) {
      router.push(`/leaves/admin-create-leave`);
    } else {
      setIsAdminCreateModalOpen(true);
    }
  };

  const onReloadData = async () => {
    try {
      setLoading(true);
      const params = { ...searchParams, page: currentPage };
      const response = await getLeavesListUseCase.execute(params);
      updateSearchParams(params);
      updateLeaveListData(response?.data, response?.totalItem || 0);
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };

  const onCloseCreateModal = async () => {
    setIsCreateModalOpen(false);
    await onReloadData();
  };

  const onCloseAdminCreateLeaveModal = async () => {
    setIsAdminCreateModalOpen(false);
    await onReloadData();
  };

  useEffect(() => {
    // check list search by report
    const idkey = queryParams.get("idkey") || "";
    const name = queryParams.get("staffName") || "";
    const startDate = queryParams.get("leaveStartDate") || "";
    const endDate = queryParams.get("leaveEndDate") || "";
    if (name) form.setValue("staffName", name);
    if (startDate && isValid(formatStringToDate(startDate)))
      form.setValue("leaveStartDate", formatStringToDate(startDate));
    if (endDate && isValid(formatStringToDate(endDate)))
      form.setValue("leaveEndDate", formatStringToDate(endDate));
    if (idkey) form.setValue("leaveId", idkey);
    form.handleSubmit(onSubmit)();
  }, []);

  return (
    <div className="h-full laptop:h-[150px]">
      {isCreateModalOpen && (
        <CreateLeaveModal
          loading={loading}
          isOpen={isCreateModalOpen}
          onClose={onCloseCreateModal}
          setLoading={setLoading}
        />
      )}

      {isAdminCreateModalOpen && (
        <AdminCreateModal
          isOpen={isAdminCreateModalOpen}
          onClose={onCloseAdminCreateLeaveModal}
        />
      )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-col w-full"
        >
          <div className="flex flex-col laptop:flex-row w-full flex-1 laptop:items-center gap-x-4 gap-y-2 ">
            <div className="flex gap-x-4 flex-1">
              {/* <FormField
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
              /> */}
              <FormField
                control={form.control}
                name="leaveId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className=" font-normal text-[16px]">
                      Leave
                    </FormLabel>
                    <FormControl>
                      <Input
                        tabIndex={5}
                        placeholder="Leave ID"
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
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className=" font-normal text-[16px]">
                      Status
                    </FormLabel>
                    <StyledSelected
                      items={[{ value: "-1", name: "All" }, ...LEAVE_STATUS]}
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
              <FormField
                control={form.control}
                name="cancelRequest"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className=" font-normal text-[16px]">
                      Cancel request
                    </FormLabel>
                    <StyledSelected
                      items={[
                        { value: "-1", name: "All" },
                        ...CANCEL_REQUEST_VALUE,
                      ]}
                      field={field}
                      tabIndex={6}
                      iconRight={ArrowDownIcon}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </div>
            <div className="flex gap-x-4 flex-1">
              <StyledMultipleDatePicker
                form={form}
                label="Leave date"
                nameStartDate="leaveStartDate"
                nameEndDate="leaveEndDate"
              />
            </div>
          </div>
          <div className="flex flex-col laptop:flex-row laptop:flex-1 justify-between mt-2 gap-y-2 laptop:gap-x-4">
            <div className="flex gap-x-4 flex-1">
              <FormField
                control={form.control}
                name="staffName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="flex flex-row">
                      <FormLabel className="font-normal text-[16px]">
                        Employee
                      </FormLabel>
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          field.onChange(user.idkey);
                        }}
                        className={twMerge(
                          "mt-1 px-1 ml-1 laptop:text-[12px] text-[12px] text-start line-clamp-2 text-primary hover:text-black text-ellipsis whitespace-pre-wrap underline hover:bg-sky-300 hover:cursor-pointer"
                        )}
                      >
                        *me
                      </p>
                    </div>
                    <FormControl>
                      <Input
                        tabIndex={5}
                        placeholder="Name, Code"
                        {...field}
                        className=" border border-border focus:border-primary px-2 "
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approver"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <div className="flex flex-row">
                      <FormLabel className=" font-normal text-[16px]">
                        Approver
                      </FormLabel>
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          field.onChange(user.idkey);
                        }}
                        className={twMerge(
                          "mt-1 px-1 ml-1 laptop:text-[12px] text-[12px] text-start line-clamp-2 text-primary hover:text-black text-ellipsis whitespace-pre-wrap underline hover:bg-sky-300 hover:cursor-pointer"
                        )}
                      >
                        *me
                      </p>
                    </div>
                    <FormControl>
                      <Input
                        tabIndex={5}
                        placeholder="Name, Code"
                        {...field}
                        className=" border border-border focus:border-primary px-2 "
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div
              className="bg-primary w-auto h-[40px] p-3 flex justify-center items-center cursor-pointer rounded-lg mt-6"
              onClick={() => {
                setIsViewLeave(true);
              }}
            >
              <Image
                src={IconStat}
                alt=""
                width={20}
                height={20}
                className=""
              />
            </div>
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
              {isAdminCreateLeavebutton && (
                <Button
                  onClick={onGoToAdminCreate}
                  tabIndex={8}
                  className="w-fit h-11 font-normal text-white text-[16px] bg-button-create hover:bg-button-create-hover"
                  type="button"
                >
                  <Image
                    src={IconAdd}
                    alt=""
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  {i18nLeave("adminCreateButton")}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
      <AlertDialogViewLeaveDetail
        open={isViewLeave}
        onOpenChange={setIsViewLeave}
        searchParams={searchParams}
        onClose={() => {
          setIsViewLeave(false);
        }}
      />
    </div>
  );
}
