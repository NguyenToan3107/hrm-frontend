"use client";
import { GetDayOffParams, UpdateDayOffParams } from "@/apis/modules/schedule";
import { AlertDialogCancelLeaveButton } from "@/components/common/alert-dialog/AlertDialogCancelLeaveButton";
import { AlertDialogSubmitFormButton } from "@/components/common/alert-dialog/AlertDialogSubmitFormButton";
import SideBarComponent from "@/components/common/SideBarComponent";
import { StyledBreadcrumb } from "@/components/common/StyledBreadcrumb";
import { StyledDatePicker } from "@/components/common/StyledDatePicker";
import StyledHeader from "@/components/common/StyledHeader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GetDayOffUseCase } from "@/core/application/usecases/schedule/getDayOff.usecase";
import { UpdateDayOffUseCase } from "@/core/application/usecases/schedule/updateDayOff.usecase";
import { DayOff } from "@/core/entities/models/dayoff.model";
import { ScheduleRepositoryImpl } from "@/core/infrastructure/repositories/schedule.repo";
import { toast } from "@/hooks/use-toast";
import useWindowSize from "@/hooks/useWindowSize";
import { useUserStore } from "@/stores/userStore";
import { FormModeType } from "@/utilities/enum";
import { formatDateToString, formatStringToDate } from "@/utilities/format";
import { convertHourToDay } from "@/utilities/helper";
import { DAY_OFF_STATUS, MAX_LENGTH_TEXT } from "@/utilities/static-value";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

const scheduleRepo = new ScheduleRepositoryImpl();
const getDayOffUseCase = new GetDayOffUseCase(scheduleRepo);
const updateDayOffDetailUseCase = new UpdateDayOffUseCase(scheduleRepo);

const formSchema = z.object({
  dayOffDate: z.union([
    z.string({ message: "Day Off Date is required" }),
    z.date(),
  ]),
  title: z
    .string({ message: "Title is required" })
    .trim()
    .max(MAX_LENGTH_TEXT, {
      message: "Title too long",
    }),
  description: z
    .string({ message: "Description is required" })
    .max(MAX_LENGTH_TEXT, {
      message: `Description must not be longer than ${MAX_LENGTH_TEXT} characters.`,
    }),
  type: z.enum(["0", "1", "none"], {
    required_error: "Type is required",
  }),
  status: z.string().trim(),
});

export default function DayOffDetailScreen() {
  const params = useParams();
  const [dayOff, setDayOff] = useState<DayOff>();
  const windowSize = useWindowSize();
  const { user } = useUserStore();
  const idLeave = params?.id;

  const [mode, setMode] = useState(FormModeType.VIEW); // 0: view, 1: edit
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dayOffDate: "",
      status: undefined,
      description: undefined,
      title: undefined,
    },
  });

  const onLoadDayOffDetail = async () => {
    try {
      const params: GetDayOffParams = { id: Number(idLeave) };
      const response = await getDayOffUseCase.execute(params);
      setDayOff(response?.data);
      form.setValue(
        "dayOffDate",
        formatStringToDate(response?.data?.day_off || "")
      );
      form.setValue("status", response?.data?.status);
      form.setValue("description", response?.data?.description || "");
      form.setValue("title", response?.data?.title || "");
    } catch (error) {}
  };

  const onUpdateFormLeave = () => {
    setOpenSubmitDialog(true);
  };

  const onUpdateLeave = async () => {
    try {
      const data = form.getValues();
      if (!dayOff?.id) return;

      const updateParams: UpdateDayOffParams = {
        id: dayOff?.id,
        updated_at: dayOff?.updated_at || "",
        description: data.description,
        status: data.status,
        day_off: formatDateToString(data.dayOffDate || "") || "",
        title: data.title,
      };
      const result = await updateDayOffDetailUseCase.execute(updateParams);
      if (result?.code == 0) {
        toast({
          description: "Update day off information successfully",
          color: `bg-blue-200`,
        });
        setMode(FormModeType.VIEW);
      } else {
        if (
          result?.data?.DAYOFF_IS_EXIST &&
          result?.data.DAYOFF_IS_EXIST[0] == "DAYOFF_IS_EXIST"
        ) {
          toast({
            description: "Day off is exist.",
            color: "bg-red-100",
          });
        } else {
          toast({
            description: "Update day off information failed",
            color: "bg-red-100",
          });
        }
      }
    } catch (error) {
    } finally {
    }
  };

  const isDirty = useMemo(() => {
    const values = form.getValues();
    const title = dayOff?.title ? dayOff?.title?.trim() : "";
    return dayOff
      ? values?.description?.trim() !== dayOff?.description?.trim() ||
          values?.title?.trim() !== title ||
          String(values?.status) !== String(dayOff?.status) ||
          formatDateToString(values?.dayOffDate) !== dayOff?.day_off
      : false;
  }, Object.values(form.watch()));

  useEffect(() => {
    onLoadDayOffDetail();
  }, []);

  return (
    <div className="w-full flex px-2">
      <SideBarComponent />
      <div className="w-full max-h-screen block bg-white">
        <StyledHeader />
        <StyledBreadcrumb
          items={["Day Off", "Detail Day Off"]}
          links={["/dayOffs", `/dayOffs/detail-day-off/${idLeave}`]}
          triggerClass={"pb-0 laptop:px-6 px-4"}
        />
        <div
          style={{
            maxHeight: windowSize.height - 56 - 40 - 32,
            minHeight: windowSize.height - 132 - 40 - 32,
          }}
          className="px-2 w-full laptop:px-4 border border-border rounded-md"
        >
          <div className="flex flex-row justify-left items-center gap-x-2">
            <p className="text-[18px] font-semibold  w-fit text-center">
              Day Off Information
            </p>
          </div>
          <div className="flex flex-col items-start w-full min-h-[132px]">
            <p className="font-semibold mb-1">Requestor Information</p>
            <div className="flex flex-row w-full justify-start gap-y-2 h-full rounded-[4px] border-[2px] border-opacity-25 border-black px-0 laptop:px-2 flex-1">
              <table className="w-full flex justify-start items-center px-1">
                <tbody className="w-full">
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-5">
                      Employee ID:
                    </td>
                    <td className="text-[14px] font-normal leading-5 px-2">
                      {user?.idkey}
                    </td>
                  </tr>
                  <tr className="w-full">
                    <td className="text-[#16151C] font-semibold text-[14px] leading-5 min-w-[110px]">
                      Full name:
                    </td>
                    <td className="text-[14px] font-normal leading-5 px-2 h-6 w-full flex flex-1 line-clamp-1">
                      {user?.fullname}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-5">
                      Contact:
                    </td>
                    <td className="text-[14px] font-normal leading-5 px-2">
                      {user?.phone}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-5">
                      Leave hour:
                    </td>
                    <td className="text-[14px] font-normal leading-5 px-2">
                      {convertHourToDay(
                        user?.time_off_hours,
                        user?.last_year_time_off
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-6">
                      Allocated hour:
                    </td>
                    <td className="text-[14px] font-normal leading-6 px-2">
                      {convertHourToDay(user?.allocated_hour, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="font-bold my-1">Day Off Detail</p>
          <div
            className={twMerge(
              "flex flex-col items-start w-full overflow-x-auto py-2",
              mode == FormModeType.VIEW && `bg-orange-50`
            )}
            style={{
              maxHeight: windowSize.height - 56 - 292 + (isMobile ? 8 : 0),
              minHeight: windowSize.height - 56 - 292 + (isMobile ? 8 : 0),
            }}
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onUpdateFormLeave)}
                className="space-y-8 w-full"
              >
                <div className="flex flex-col h-full">
                  <div className="flex flex-col laptop:flex-row laptop:justify-start gap-3 pb-[18px] laptop:gap-0 laptop:gap-x-4">
                    <FormField
                      control={form.control}
                      name={"dayOffDate"}
                      render={({ field, fieldState }) => {
                        return (
                          <FormItem>
                            <div className="bg-white rounded-sm px-1 border border-[#A2A1A8] w-full laptop:w-[242px]">
                              <FormLabel>Date</FormLabel>
                              <FormControl tabIndex={11}>
                                <StyledDatePicker
                                  field={field}
                                  title={""}
                                  disabled={mode == FormModeType.VIEW}
                                  triggerClass="h-8 border-none rounded-md px-0"
                                />
                              </FormControl>
                            </div>
                            {fieldState.error?.message && (
                              <p className={"text-red-500 text-[10px]"}>
                                {fieldState.error?.message}
                              </p>
                            )}
                          </FormItem>
                        );
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <div className="bg-white rounded-sm p-1 border border-[#A2A1A8] w-full laptop:w-[242px]">
                            <FormLabel>Status</FormLabel>
                            <Select
                              disabled={mode == FormModeType.VIEW}
                              value={field.value}
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl tabIndex={12}>
                                <SelectTrigger
                                  defaultValue={field.value}
                                  style={{
                                    color: !field.value
                                      ? "var(--secondary)"
                                      : "black",
                                  }}
                                  className="h-6 rounded-none px-0 disabled:opacity-100"
                                >
                                  <SelectValue
                                    className="w-full text-black"
                                    placeholder="All day"
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white">
                                {DAY_OFF_STATUS.map((item) => {
                                  return (
                                    <SelectItem
                                      key={item.value}
                                      value={String(item.value)}
                                    >
                                      {item.name}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                          {fieldState.error?.message && (
                            <p className={"text-red-500 text-[10px]"}>
                              {fieldState.error?.message}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="title"
                    disabled={mode == FormModeType.VIEW}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="bg-white flex flex-col rounded-sm p-1 border border-[#A2A1A8] w-full">
                          <div className="flex flex-row items-center">
                            <FormLabel>Title</FormLabel>
                            <p className={"text-red-500 leading-none"}>*</p>
                          </div>
                          <FormControl tabIndex={13}>
                            <Textarea
                              className="p-0 min-h-[60px]"
                              {...field}
                              maxLength={MAX_LENGTH_TEXT}
                            />
                          </FormControl>
                        </div>
                        <div className="flex flex-row justify-between">
                          {fieldState.error?.message && (
                            <p className={"text-red-500 text-[10px]"}>
                              {fieldState.error?.message}
                            </p>
                          )}
                          <div
                            className={`text-[12px] ${
                              field.value?.length >= MAX_LENGTH_TEXT
                                ? "text-red-500"
                                : "text-gray-500"
                            }  ml-auto`}
                          >
                            {field.value?.length || 0} / {MAX_LENGTH_TEXT}
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    disabled={mode == FormModeType.VIEW}
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className=" bg-white flex flex-col rounded-sm p-1 border border-[#A2A1A8] w-full">
                          <div className="flex flex-row items-center">
                            <FormLabel>Description</FormLabel>
                            <p className={"text-red-500 leading-none"}>*</p>
                          </div>
                          <FormControl tabIndex={14}>
                            <Textarea
                              className="p-0 min-h-[60px]"
                              {...field}
                              placeholder="Person in charge/project in charge/work status"
                              maxLength={MAX_LENGTH_TEXT}
                            />
                          </FormControl>
                        </div>
                        <div className="flex flex-row justify-between">
                          {fieldState.error?.message && (
                            <p className={"text-red-500 text-[10px]"}>
                              {fieldState.error?.message}
                            </p>
                          )}
                          <div
                            className={`text-[12px] ${
                              field?.value &&
                              field.value?.length >= MAX_LENGTH_TEXT
                                ? "text-red-500"
                                : "text-gray-500"
                            }  ml-auto`}
                          >
                            {field.value?.length || 0} / {MAX_LENGTH_TEXT}
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </div>
          <div className="fixed bottom-[8px] right-0 left-0 flex flex-1 flex-row justify-end items-end gap-x-2 gap-y-2 mx-4">
            {mode == FormModeType.EDIT ? (
              <div className="flex flex-row justify-end gap-2 w-full mt-2">
                {isDirty ? (
                  <AlertDialogCancelLeaveButton
                    tabIndex={16}
                    isOpen={true}
                    onClose={() => setMode(FormModeType.VIEW)}
                  />
                ) : (
                  <Button
                    tabIndex={1}
                    className="w-[100px] p-0 h-8 mt-0  font-normal bg-white hover:bg-gray-200 rounded-[8px] flex items-center justify-center border border-border"
                    type="button"
                    onClick={() => setMode(FormModeType.VIEW)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  tabIndex={10}
                  onClick={onUpdateFormLeave}
                  className="w-[100px] p-0 h-8 mt-0 text-white font-normal bg-primary hover:bg-primary-hover rounded-[8px] flex items-center justify-center "
                  type="button"
                >
                  Update
                </Button>
              </div>
            ) : (
              <Button
                tabIndex={10}
                onClick={() => setMode(FormModeType.EDIT)}
                className="w-[100px] p-0 h-8 mt-0 text-white font-normal bg-primary hover:bg-primary-hover rounded-[8px] flex items-center justify-center "
                type="button"
              >
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>
      <AlertDialogSubmitFormButton
        tabIndex={16}
        title={"Submit form"}
        onConfirm={onUpdateLeave}
        // mode={props.mode}
        open={openSubmitDialog}
        onOpenChange={setOpenSubmitDialog}
      />
    </div>
  );
}
