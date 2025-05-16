"use client";
import { getCommonsRequest } from "@/apis/modules/common";
import { StyledDatePicker } from "@/components/common/StyledDatePicker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Leave } from "@/core/entities/models/leave.model";
import { useCommonStore } from "@/stores/commonStore";
import { CancelRequestValue, FormModeType } from "@/utilities/enum";
import { formatStringToDate } from "@/utilities/format";
import {
  ACCESS_TOKEN_KEY,
  LEAVE_STATUS,
  MAX_LENGTH_TEXT,
  SHIFT_STATUS,
} from "@/utilities/static-value";
import { getCookie } from "cookies-next";
import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  leave: Leave | undefined;
  form: any;
  mode: FormModeType.VIEW | FormModeType.EDIT;
}

const FormLeave = (props: Props, ref: any) => {
  const { leave, form, mode } = props;
  const [disabled, setDisable] = useState(true);
  // const [approvalData, setApprovalData] = useState<
  //   { value: string; name: string; idkey: string }[]
  // >([]);
  const {
    approveUsersData,
    updateRolesData,
    updateApproveUsersData,
    updateDepartmentData,
  } = useCommonStore((state) => state);

  useImperativeHandle(
    ref,
    () => {
      return {
        toggleDisable(disabled: boolean) {
          setDisable(disabled);
        },
      };
    },
    []
  );

  const approvalDataLeaderId = useMemo(() => {
    return (
      approveUsersData.map((item) => {
        return {
          value: item.id,
          name: item.fullname,
          idkey: item.idkey,
        };
      }) || []
    );
  }, [approveUsersData]);

  const getCommonData = async () => {
    try {
      const token = getCookie(ACCESS_TOKEN_KEY);
      if (token) {
        const common: any = await getCommonsRequest(token);
        if (common && common.data.roles) {
          const formatted = common.data.roles.map((i: any) => {
            return {
              value: i.role_name?.toLowerCase?.(),
              name: i.role_name,
              description: i.description,
            };
          });
          updateRolesData(formatted);
        }

        if (common && common.data.departments) {
          updateDepartmentData(common.data.departments);
        }

        if (common && common.data.approve_users) {
          updateApproveUsersData(common.data.approve_users);
        }
      }
    } catch (error) {}
  };

  // const getUserAdminLeaderDropdownData = async () => {
  //   try {
  //     const res = await getCommonsUserAdminLeaderRequest();
  //     const formatUserList = res.data?.map((item: User) => {
  //       return {
  //         value: item?.id,
  //         name: `${item?.fullname}`,
  //         idkey: item.idkey,
  //       };
  //     });
  //     // setApprovalData(formatUserList);
  //   } catch (error) {}
  // };

  useEffect(() => {
    // getUserAdminLeaderDropdownData();
    getCommonData();
  }, []);

  useEffect(() => {
    if (disabled) form.setValue("shift", String(leave?.shift));
  }, [form.watch("shift")]);

  useEffect(() => {
    if (disabled) form.setValue("approverId", String(leave?.approver_id));
  }, [form.watch("approverId")]);

  useEffect(() => {
    if (disabled) form.setValue("status", String(leave?.status));
  }, [form.watch("status")]);

  useEffect(() => {
    form.setValue("day_leaves", formatStringToDate(leave?.day_leaves || ""));
    form.setValue("description", leave?.description);
    form.setValue("other_info", leave?.other_info || "");
    form.setValue("approval_date", leave?.approval_date || "");
    form.setValue("created_at", leave?.created_at || "");
  }, [leave]);

  function onSubmit(values: any) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="flex flex-col h-full">
          <div className="flex flex-col laptop:flex-row justify-between gap-[18px] pb-[18px] laptop:gap-0">
            <div
              className={`bg-white rounded-sm p-1 border border-[#A2A1A8] w-full laptop:w-[242px] h-full ${
                disabled && `cursor-not-allowed`
              } `}
            >
              <FormField
                disabled={disabled}
                control={form.control}
                name={"day_leaves"}
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <StyledDatePicker
                        disabled={disabled}
                        field={field}
                        title={""}
                        triggerClass={`h-6 border-none rounded-md px-0`}
                        minDate={new Date()}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="shift"
              render={({ field, fieldState }) => (
                <FormItem>
                  <div className="rounded-sm bg-white  p-1 border border-[#A2A1A8] w-full laptop:w-[242px]">
                    <FormLabel>Shift</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger
                          disabled={disabled}
                          style={{
                            color: !field.value ? "var(--secondary)" : "black",
                          }}
                          className="h-6 rounded-none px-0 disabled:opacity-100"
                        >
                          <SelectValue className="w-full" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {SHIFT_STATUS.map((item) => {
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
            <FormField
              control={form.control}
              name="status"
              render={({ field, fieldState }) => {
                return (
                  <FormItem>
                    <div
                      className={twMerge(
                        "rounded-sm bg-white  p-1 border border-[#A2A1A8] w-full laptop:w-[242px]",
                        mode == FormModeType.EDIT && "border-gray-400"
                      )}
                    >
                      <FormLabel
                        className={
                          mode == FormModeType.EDIT ? "text-gray-400" : ""
                        }
                      >
                        Status
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger
                            disabled={disabled || mode == FormModeType.EDIT}
                            style={{
                              color: !field.value
                                ? "var(--secondary)"
                                : "black",
                            }}
                            className="h-6 rounded-none px-0 disabled:opacity-100"
                          >
                            <p
                              className={twMerge(
                                "w-full  text-left",
                                mode == FormModeType.EDIT && "text-gray-400"
                              )}
                            >
                              {
                                LEAVE_STATUS.find(
                                  (item) => item.value == field.value
                                )?.name
                              }
                            </p>
                            {/* <SelectValue /> */}
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          {LEAVE_STATUS.map((item) => {
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
                );
              }}
            />
          </div>
          <FormField
            disabled={disabled}
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <div className="bg-white flex flex-col rounded-sm p-1 border border-[#A2A1A8] w-full">
                  <div className="flex flex-row items-center">
                    <FormLabel>Reason for Leave</FormLabel>
                    {mode == FormModeType.EDIT && (
                      <p className={"text-red-500 leading-none"}>*</p>
                    )}
                  </div>
                  <FormControl>
                    <div className="p-0 h-[60px] overflow-y-auto cursor-not-allowed">
                      {leave?.cancel_request != CancelRequestValue.None && (
                        <p className="text-sm whitespace-pre-wrap">
                          <span className="font-bold">
                            (Cancel request Reason:
                          </span>
                          <span className="text-sm">
                            {leave?.cancel_request_desc}
                          </span>
                          <span className="font-bold"> )</span>
                        </p>
                      )}
                      <Textarea
                        className="p-0 hide-scrollbar"
                        {...field}
                        maxLength={MAX_LENGTH_TEXT}
                      />
                    </div>
                  </FormControl>
                </div>
                <FormMessage />
                <div className="flex flex-row justify-between">
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
            disabled={disabled}
            control={form.control}
            name="other_info"
            render={({ field }) => (
              <FormItem>
                <div className="flex bg-white flex-col rounded-sm p-1 border border-[#A2A1A8] w-full">
                  <FormLabel>Other Infomation</FormLabel>
                  <FormControl>
                    <Textarea
                      className="p-0 min-h-[60px]"
                      {...field}
                      maxLength={MAX_LENGTH_TEXT}
                      placeholder="Person in charge/project in charge/work status"
                    />
                  </FormControl>
                </div>
                <FormMessage />
                <div className="flex flex-row justify-between">
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
          <div className="flex  flex-col laptop:flex-row justify-between gap-[18px] laptop:gap-0">
            <div
              className={twMerge(
                "rounded-sm p-1 bg-white  border border-[#A2A1A8] w-full laptop:w-[242px] h-full",
                mode == FormModeType.EDIT && "border-gray-400"
              )}
            >
              <FormField
                disabled={disabled || mode == FormModeType.EDIT}
                control={form.control}
                name={"created_at"}
                render={({ field }) => (
                  <FormItem className="w-full ">
                    <div className="flex flex-row items-center">
                      <FormLabel
                        className={
                          mode == FormModeType.EDIT ? "text-gray-400" : ""
                        }
                      >
                        Created date
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        className={twMerge(
                          "p-0 h-6 ",
                          mode == FormModeType.EDIT && "text-gray-400"
                        )}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div
              className={twMerge(
                "rounded-sm bg-white  p-1 border border-[#A2A1A8] w-full laptop:w-[242px] h-full",
                mode == FormModeType.EDIT && "border-gray-400"
              )}
            >
              <FormField
                disabled={disabled || mode == FormModeType.EDIT}
                control={form.control}
                name="approval_date"
                render={({ field }) => {
                  return (
                    <FormItem>
                      <div className="flex flex-row items-center">
                        <FormLabel
                          className={
                            mode == FormModeType.EDIT ? "text-gray-400" : ""
                          }
                        >
                          Approval date
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Input className="p-0 h-6" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
            <div className="rounded-sm p-1 bg-white  border border-[#A2A1A8] w-full laptop:w-[242px] ">
              <FormField
                control={form.control}
                name={"approverId"}
                render={({ field, fieldState }) => {
                  return (
                    <FormItem>
                      <div className="flex flex-row items-center">
                        <FormLabel>Approver</FormLabel>
                        {mode == FormModeType.EDIT && (
                          <p className={"text-red-500 leading-none"}>*</p>
                        )}
                      </div>
                      {mode == FormModeType.VIEW ? (
                        <Input
                          disabled
                          className="p-0 h-6 hover:cursor-not-allowed"
                          value={`${leave?.approver_name}(${leave?.approver_idkey})`}
                        />
                      ) : (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger
                              disabled={disabled}
                              style={{
                                color: !field.value
                                  ? "var(--secondary)"
                                  : "black",
                              }}
                              className="h-6 rounded-none px-0 disabled:opacity-100"
                            >
                              <SelectValue className="w-full" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white">
                            {approvalDataLeaderId.map((item) => {
                              return (
                                <SelectItem
                                  key={item.value}
                                  value={String(item.value)}
                                >
                                  {item.name} {`(${item.idkey})`}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      )}

                      {fieldState.error?.message && (
                        <p className={"text-red-500 text-[10px]"}>
                          {fieldState.error?.message}
                        </p>
                      )}
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};
export default React.forwardRef(FormLeave);
