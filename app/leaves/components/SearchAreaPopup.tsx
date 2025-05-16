import { GetLeaveListParams } from "@/apis/modules/leave";
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { GetLeavesListUseCase } from "@/core/application/usecases/leave/getLeaveList";
import { LeaveRepositoryImpl } from "@/core/infrastructure/repositories/leave.repo";
import { useLeaveStore } from "@/stores/leavesStore";
import { useUserStore } from "@/stores/userStore";
import { formatDateToString, formatStringToDate } from "@/utilities/format";
import {
  CANCEL_REQUEST_VALUE,
  ITEM_PER_PAGE,
  LEAVE_STATUS,
} from "@/utilities/static-value";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
const leaveRepo = new LeaveRepositoryImpl();
const getLeavesListUseCase = new GetLeavesListUseCase(leaveRepo);

const formSchema = z.object({
  // type: z.string().optional(),
  // createDate: z
  //   .union([
  //     z.string({ message: "Date of birth is required" }),
  //     z.date(),
  //     z.null(),
  //   ])
  //   .optional(),
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
});

interface Props {
  loading: boolean;
  setLoading(loading: boolean): void;
  setPage(page: number): void;
  currentPage: number;
}

export function SearchAreaPopup(props: Props) {
  const { setLoading, setPage } = props;

  const { user } = useUserStore();

  const userInputRef = useRef<HTMLInputElement>(null);
  const approverInputRef = useRef<HTMLInputElement>(null);
  const leaveIdInputRef = useRef<HTMLInputElement>(null);
  const buttonSearchRef = useRef<HTMLButtonElement>(null);

  const handleUserInputDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      approverInputRef.current?.focus();
    }
  };

  const handleApproverInputDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      leaveIdInputRef.current?.focus();
    }
  };

  const handleLeaveIdInputDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  const [open, setOpen] = useState(false);
  const { searchParams, updateLeaveListData, updateSearchParams } =
    useLeaveStore((state) => state);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const params: GetLeaveListParams = {
        page: 1,
        limit: ITEM_PER_PAGE,
        status:
          !data?.status || data?.status == "-1" ? undefined : data?.status,
        cancel_request:
          !data?.cancelRequest || data?.cancelRequest == "-1"
            ? undefined
            : data?.cancelRequest,
      };
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
      staffName: "",
      leaveId: "",
      approver: "",
      cancelRequest: "-1",
    },
  });

  const onResetForm = () => {
    form.reset({
      status: "-1",
      leaveStartDate: "",
      leaveEndDate: "",
      staffName: "",
      leaveId: "",
      approver: "",
      cancelRequest: "-1",
    });
  };

  useEffect(() => {
    if (open) {
      form.setValue("status", searchParams?.status || "-1");
      form.setValue("cancelRequest", searchParams?.cancel_request || "-1");
      if (searchParams?.leave_start_date) {
        form.setValue(
          "leaveStartDate",
          formatStringToDate(String(searchParams?.leave_start_date))
        );
      }
      if (searchParams?.leave_end_date) {
        form.setValue(
          "leaveEndDate",
          formatStringToDate(String(searchParams?.leave_end_date))
        );
      }
      form.setValue("staffName", searchParams?.employee_name || "");
      form.setValue("approver", searchParams?.approver || "");
      form.setValue("leaveId", searchParams?.leave_id || "");
    }
  }, [open]);

  const isSearching = useMemo(() => {
    const employeeLength = searchParams.employee_name?.length;
    const leaveIdLength = searchParams.leave_id?.length;
    const approverLength = searchParams.approver?.length;
    return (
      (employeeLength && employeeLength > 0) ||
      (leaveIdLength && leaveIdLength > 0) ||
      (approverLength && approverLength > 0) ||
      searchParams.status ||
      searchParams.cancel_request ||
      searchParams.leave_start_date ||
      searchParams.leave_end_date
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
      <DialogContent className="overflow-scroll bg-white">
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
                        items={[{ value: "-1", name: "All" }, ...LEAVE_STATUS]}
                        field={field}
                        iconRight={ArrowDownIcon}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          {...field}
                          ref={userInputRef}
                          onKeyDown={handleUserInputDown}
                          enterKeyHint="next"
                          placeholder="Name, Code"
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
                          {...field}
                          ref={approverInputRef}
                          onKeyDown={handleApproverInputDown}
                          enterKeyHint="next"
                          placeholder="Name, Code"
                          className=" border border-border focus:border-primary px-2 "
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="leaveId"
                  render={({ field }) => (
                    <FormItem className="w-full ">
                      <FormLabel className=" font-normal text-[16px]">
                        Leave
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          ref={leaveIdInputRef}
                          onKeyDown={handleLeaveIdInputDown}
                          enterKeyHint="done"
                          placeholder="Leave ID"
                          className=" border border-border focus:border-primary px-2 "
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
        <DialogFooter className="flex flex-row justify-center gap-x-2 items-center">
          <Button
            ref={buttonSearchRef}
            onClick={onResetForm}
            type="button"
            className="w-[80px] h-[32px] font-normal border border-border bg-white text-[12px] hover:bg-gray-200 rounded-lg"
          >
            Clear
          </Button>
          <Button
            ref={buttonSearchRef}
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
