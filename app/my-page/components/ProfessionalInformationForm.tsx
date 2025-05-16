"use client";
import { getCommonsUserAdminLeaderRequest } from "@/apis/modules/common";
import ArrowDownIcon from "@/app/assets/icons/icon-arrow-down.svg";
import IconInfo from "@/app/assets/icons/iconInfo.svg";
import StyledSelected from "@/app/staffs/components/StyledSelected";
import StyledOverlay from "@/components/common/StyledOverlay";
import { StyledTooltip } from "@/components/common/StyledToolTip";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ShowMyPageUseCase } from "@/core/application/usecases/my-page/showMyPage.usecase";
import { User } from "@/core/entities/models/user.model";
import { UserRepositoryImpl } from "@/core/infrastructure/repositories/user.repo";
import useWindowSize from "@/hooks/use-dimession";
import useFocus from "@/hooks/use-focus";
import { useToast } from "@/hooks/use-toast";
import { useCommonStore } from "@/stores/commonStore";
import { useUserStore } from "@/stores/userStore";
import { convertHourToDay, formatArrayToString } from "@/utilities/helper";
import { STAFF_STATUS_WORKING } from "@/utilities/static-value";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { isMobile } from "react-device-detect";
import { convertIdToObject } from "@/utilities/format";
import { StyledComboboxDepartment } from "@/components/common/StyledComboboxDepartment";
const formSchema = z.object({
  idkey: z.string().trim(),
  status_working: z.string().trim(),
  birth_day: z.string().trim(),
  started_at: z.string().trim(),
  department: z.any(),
  time_off_hours: z.string().trim(),
  username: z.string().trim(),
  email: z.string().trim(),
  role: z.any().refine(
    (value) => {
      return value?.length > 0;
    },
    {
      message: "Role is required",
    }
  ),
  ended_at: z.string().trim(),
  leaderId: z.string().trim(),
});
const userRepo = new UserRepositoryImpl();
const showMyPage = new ShowMyPageUseCase(userRepo);

export default function ProfessionalInformationForm() {
  const { toast } = useToast();
  const useDimession = useWindowSize();
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useUserStore((state) => state);
  const { departmentData, roleData } = useCommonStore((state) => state);
  const [users, setUsers] = useState<{ value: string; name: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idkey: user?.idkey,
      status_working: user?.status_working,
      department: user?.department,
      started_at: user?.started_at,
      time_off_hours: `${convertHourToDay(
        user?.time_off_hours,
        user?.last_year_time_off
      )}`,
      username: user?.username,
      email: user?.email,
      role:
        user?.role?.name.replace(/^./, user?.role?.name[0].toUpperCase()) || "",
      ended_at: user?.ended_at || "",
      leaderId: user?.leader_id,
    },
  });

  const isReserveForm = form.watch("idkey");
  const isFocus = useFocus();
  useEffect(() => {
    if (isFocus) {
      const departmentSelectedData = convertIdToObject(
        user?.department || [],
        departmentData
      );
      form.setValue("idkey", user?.idkey || "");
      form.setValue("status_working", String(user?.status_working) || "");
      form.setValue("department", departmentSelectedData || []);
      form.setValue(
        "time_off_hours",
        `${convertHourToDay(user?.time_off_hours, user?.last_year_time_off)}`
      );
      form.setValue("started_at", String(user?.started_at) || "");
      form.setValue("username", user?.username || "");
      form.setValue("email", user?.email || "");
      form.setValue(
        "role",
        user?.role?.name.replace(/^./, user?.role?.name[0].toUpperCase()) || ""
      );
      
      if (user?.ended_at) {
        form.setValue("ended_at", user?.ended_at);
      }
      form.setValue("leaderId", String(user?.leader_id) || "");
    }
  }, [isReserveForm, isFocus, form.watch("leaderId")]);

  const getMyPage = async () => {
    try {
      setLoading(true);
      const res: any = await showMyPage.execute();
      setUser(res.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Unable to get user information.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async () => {};

  const getUserAdminLeaderDropdownData = async () => {
    try {
      const res = await getCommonsUserAdminLeaderRequest();
      const formatUserList = res.data?.map((item: User) => {
        return { value: item?.id, name: item?.fullname };
      });
      setUsers(formatUserList);
    } catch (error) {}
  };

  useEffect(() => {
    getUserAdminLeaderDropdownData();
    getMyPage();
  }, []);

  const roleDescription = useMemo(() => {
    let roleDescription: any[] = [];
    const selectedRole = roleData?.find(
      (item: any) =>
        item.name.toLowerCase() === form.getValues("role").toLowerCase()
    );
    if (selectedRole) {
      roleDescription = [selectedRole?.description];
    }
    return formatArrayToString(roleDescription);
  }, [roleData, form.getValues("role")]);

  return (
    <div
      className="flex flex-1 h-full p-4 flex-col max-h-screen overflow-y-auto"
      style={{
        maxHeight: useDimession.height - 100 - 100 - (isMobile ? 0 - 56 : 120 + 36),
        minHeight: useDimession.height - 100 - 100 - (isMobile ? 0 - 56 : 120 + 36),
        scrollbarWidth: "none",
      }}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          {user ? (
            <div className="grid grid-cols-1 laptop:grid-cols-2 gap-5 w-full">
              <div className="flex flex-col pb-2 col-span-1 gap-5">
                <div className="flex flex-col">
                  <FormField
                    control={form.control}
                    name={"idkey"}
                    render={({ field }) => {
                      return (
                        <FormItem className={`w-full`}>
                          <FormLabel className="text-[#A2A1A8] font-light text-[0.9rem]">
                            Employee ID
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              tabIndex={2}
                              disabled
                              className={`text-[#16151C] text-base focus:ring-0 border p-0 px-2 border-border focus:border-primary w-full hover:cursor-not-allowed`}
                              style={{ color: "#16151", opacity: 1 }}
                            />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <FormField
                    control={form.control}
                    name={"status_working"}
                    render={({ field }) => {
                      const selectedStatus =
                        STAFF_STATUS_WORKING.find(
                          (item) => String(item.value) === String(field.value)
                        ) || STAFF_STATUS_WORKING[0];

                      return (
                        <FormItem className={`w-full`}>
                          <FormLabel className="text-[#A2A1A8] font-light text-[0.9rem]">
                            Working Status
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={selectedStatus.name}
                              tabIndex={2}
                              disabled
                              className={`text-[#16151C] text-base focus:ring-0 border p-0 px-2 border-border focus:border-primary w-full hover:cursor-not-allowed`}
                              style={{ color: "#16151", opacity: 1 }}
                            />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <FormField
                    control={form.control}
                    name={"department"}
                    render={({ field }) => {
                      return (
                        <FormItem className={`w-full`}>
                          <FormLabel className="text-[#A2A1A8] font-light text-[0.9rem]">
                            Department
                          </FormLabel>
                          <FormControl>
                            <StyledComboboxDepartment
                              disable={true}
                              field={field}
                              form={form}
                            />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <FormField
                    control={form.control}
                    name={"started_at"}
                    render={({ field }) => {
                      return (
                        <FormItem className={`w-full`}>
                          <FormLabel className="text-[#A2A1A8] font-light text-[0.9rem]">
                            Joining Date
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              tabIndex={2}
                              disabled
                              className={`text-[#16151C] text-base focus:ring-0 border p-0 px-2 border-border focus:border-primary w-full hover:cursor-not-allowed`}
                              style={{ color: "#16151", opacity: 1 }}
                            />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <FormField
                    control={form.control}
                    name={"time_off_hours"}
                    render={({ field }) => {
                      return (
                        <FormItem className={`w-full`}>
                          <FormLabel className="text-[#A2A1A8] font-light text-[0.9rem]">
                            Remaining leave hours
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              tabIndex={2}
                              disabled
                              className={`text-[#16151C] text-base focus:ring-0 border p-0 px-2 border-border focus:border-primary w-full hover:cursor-not-allowed`}
                              style={{ color: "#16151", opacity: 1 }}
                            />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col pb-2 gap-5 col-span-1">
                <div className="flex flex-col">
                  <FormField
                    control={form.control}
                    name={"username"}
                    render={({ field }) => {
                      return (
                        <FormItem className={`w-full`}>
                          <FormLabel className="text-[#A2A1A8] font-light text-[0.9rem]">
                            Username
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              tabIndex={2}
                              disabled
                              className={`text-[#16151C] text-base focus:ring-0 border p-0 px-2 border-border focus:border-primary w-full hover:cursor-not-allowed`}
                              style={{ color: "#16151", opacity: 1 }}
                            />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <FormField
                    control={form.control}
                    name={"email"}
                    render={({ field }) => {
                      return (
                        <FormItem className={`w-full`}>
                          <FormLabel className="text-[#A2A1A8] font-light text-[0.9rem]">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              tabIndex={2}
                              disabled
                              className={`text-[#16151C] text-base focus:ring-0 border p-0 px-2 border-border focus:border-primary w-full hover:cursor-not-allowed`}
                              style={{ color: "#16151", opacity: 1 }}
                            />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <FormField
                    control={form.control}
                    name={"role"}
                    render={({ field }) => {
                      return (
                        <FormItem className={`w-full`}>
                          <div className="flex flex-row items-center">
                            <FormLabel className="text-[#A2A1A8] font-light text-[0.9rem]">
                              Role
                            </FormLabel>
                            <StyledTooltip
                              disable={false}
                              content={roleDescription}
                              contentClass=" max-h-[300px] "
                            >
                              <Image
                                src={IconInfo}
                                alt=""
                                className="h-4 w-4 ml-2"
                              />
                            </StyledTooltip>
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              tabIndex={2}
                              disabled
                              className={`text-[#16151C] text-base focus:ring-0 border p-0 px-2 border-border focus:border-primary w-full hover:cursor-not-allowed`}
                              style={{ color: "#16151", opacity: 1 }}
                            />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <FormField
                    control={form.control}
                    name="leaderId"
                    render={({ field, fieldState }) => {
                      return (
                        <FormItem className="w-full">
                          <FormLabel
                            className={
                              "font-normal text-[0.9rem] text-secondary"
                            }
                          >
                            Leader Id
                          </FormLabel>
                          <StyledSelected
                            field={field}
                            items={users}
                            disabled={true}
                            iconRight={ArrowDownIcon}
                          />
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
                <div className="flex flex-col">
                  <FormField
                    control={form.control}
                    name={"ended_at"}
                    render={({ field }) => {
                      const formattedDate = field.value
                        ? new Date(field.value).toLocaleDateString("en-GB")
                        : "";
                      return (
                        <FormItem className={`w-full`}>
                          <FormLabel className="text-[#A2A1A8] font-light text-[0.9rem]">
                            Terminate Date
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              tabIndex={2}
                              disabled
                              value={formattedDate}
                              className={`text-[#16151C] text-base focus:ring-0 border p-0 px-2 border-border focus:border-primary w-full hover:cursor-not-allowed`}
                              style={{ color: "#16151", opacity: 1 }}
                            />
                          </FormControl>
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <StyledOverlay isVisible={loading} />
          )}
        </form>
      </Form>
    </div>
  );
}
