"use client";
import {
  GetCommonAdminLeaderOfDepartment,
  getCommonsUserAdminLeaderOfDepartmentRequest,
  getCommonsUserAdminLeaderRequest,
  getCommonsUserDetailRequest,
  getRoleListRequest,
} from "@/apis/modules/common";
import {
  CreateUsersParams,
  ResetPasswordParams,
  UpdateUsersParams,
} from "@/apis/modules/user";
import ArrowDownIcon from "@/app/assets/icons/icon-arrow-down.svg";
import IconInfo from "@/app/assets/icons/iconInfo.svg";
import { message } from "@/app/assets/locales/en";
import { AlertDialogCancelFormButton } from "@/components/common/alert-dialog/AlertDialogCancelFormButton";
import { AlertDialogSubmitFormButton } from "@/components/common/alert-dialog/AlertDialogSubmitFormButton";
import { StyledComboboxDepartment } from "@/components/common/StyledComboboxDepartment";
import { StyledDatePicker } from "@/components/common/StyledDatePicker";
import StyledOverlay from "@/components/common/StyledOverlay";
import { StyledSelectUserDropdown } from "@/components/common/StyledSelectUserDropdown";
import { StyledTooltip } from "@/components/common/StyledToolTip";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CreateStaffUseCase } from "@/core/application/usecases/staff-master/createNewStaff.usecase";
import { EditStaffUseCase } from "@/core/application/usecases/staff-master/editStaff.usecase";
import { ResetPasswordStaffUseCase } from "@/core/application/usecases/staff-master/resetPasswordStaff.usecase";
import { User } from "@/core/entities/models/user.model";
import { UserRepositoryImpl } from "@/core/infrastructure/repositories/user.repo";
import { toast } from "@/hooks/use-toast";
import useScrollToTopOnKeyboardHide from "@/hooks/useScrollToTopOnKeyboardHide";
import useWindowSize from "@/hooks/useWindowSize";
import { useCommonStore } from "@/stores/commonStore";
import { useStaffStore } from "@/stores/staffStore";
import {
  convertIdToObject,
  formatDateToString,
  formatStringToDate,
} from "@/utilities/format";
import { convertHourToDay, formatArrayToString } from "@/utilities/helper";
import {
  GENDER,
  LEAVE_STEP,
  STAFF_STATUS_WORKING,
  STATUS_WORKING_DESCRIPTION,
} from "@/utilities/static-value";
import { EMAIL_REGEX } from "@/utilities/validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import { useForm } from "react-hook-form";
import { z } from "zod";
import StyledSelected from "./StyledSelected";

const formSchema = z
  .object({
    fullname: z
      .string({ message: "Fullname is required" })
      .min(1, {
        message: "Fullname must be at least 1 characters long",
      })
      .trim(),
    idkey: z
      .string({ message: "Id Key is required" })
      .min(6, {
        message: "Invalid Id Key",
      })
      .trim(),
    email: z
      .string({ message: "Email is required" })
      .regex(EMAIL_REGEX, "Invalid email format"),
    statusWorking: z.any().refine(
      (value) => {
        const numValue = Number(value);
        return !isNaN(numValue) && numValue >= 0;
      },
      {
        message: "Working status is required",
      }
    ),
    department: z
      .preprocess(
        (val) => (val === undefined ? [] : val),
        z.array(z.object({ id: z.number(), name: z.string() }))
      )
      .refine((value) => value?.length > 0, {
        message: "Department is required",
      }),
    role: z.any().refine(
      (value) => {
        return value?.length > 0;
      },
      {
        message: "Role is required",
      }
    ),
    gender: z.any().refine(
      (value) => {
        return value?.length > 0;
      },
      {
        message: "Gender is required",
      }
    ),
    joiningDate: z
      .union([
        z.string({
          message: "Joining date is required",
        }),
        z.date(),
      ])
      .refine(
        (value) => {
          const date = new Date(value);
          const today = new Date();
          return date < today;
        },
        {
          message: "Joining date must be in the past",
        }
      )
      .transform((value) => new Date(value)),
    terminationDate: z.any(),
    leaveThisYear: z.string({ message: "Leave hour is required" }).min(1, {
      message: "Leave is required",
    }),
    leaveLastYear: z.string({ message: "Last time hour is required" }).min(1, {
      message: "Leave is required",
    }),
    leaderId: z.any().refine(
      (value) => {
        const numValue = Number(value);
        return !isNaN(numValue) && numValue >> 0;
      },
      {
        message: "Leader Id is required",
      }
    ),
  })
  .superRefine((data, ctx) => {
    // Sau khi các giá trị đã được kiểm tra, ta có thể thêm kiểm tra giữa joiningDate và terminationDate tại đây.
    const joiningDate = new Date(data.joiningDate);
    const terminationDate = new Date(data.terminationDate);

    if (
      data?.terminationDate &&
      data?.terminationDate != null &&
      terminationDate <= joiningDate
    ) {
      ctx.addIssue({
        path: ["terminationDate"],
        message: "Termination date must be later than joining date",
        code: z.ZodIssueCode.custom,
      });
    }
  });

const userRepo = new UserRepositoryImpl();
const createStaff = new CreateStaffUseCase(userRepo);
const editStaff = new EditStaffUseCase(userRepo);
const resetPasswordStaff = new ResetPasswordStaffUseCase(userRepo);

interface Props {
  changeTab(name: string): void;
  mode: "view" | "edit" | "create";
}

export default function ProfessionalInfoTab(props: Props) {
  const { mode } = props;
  const [loading, setLoading] = useState(false);
  const windowSize = useWindowSize();
  const paramsPage = useParams();
  const router = useRouter();
  const { roleData, departmentData, updateRolesData } = useCommonStore(
    (state) => state
  );
  const [users, setUsers] = useState<{ value: string; name: string }[]>([]);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
  const i18nStaff = useTranslations("Staff");
  useScrollToTopOnKeyboardHide();

  const {
    updateStaffEditing,
    updateSelectedStaff,
    editingStaff,
    selectedStaff,
    updateIsDirty,
    resetEdittingStaff,
  } = useStaffStore((state) => state);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email:
        mode == "create"
          ? editingStaff?.email || undefined
          : selectedStaff.email,
      idkey:
        mode == "create"
          ? editingStaff?.idkey || undefined
          : selectedStaff.idkey,
      joiningDate:
        mode == "create"
          ? editingStaff?.started_at
            ? formatStringToDate(editingStaff.started_at)
            : undefined
          : formatStringToDate(selectedStaff?.started_at || ""),
      terminationDate:
        mode == "create"
          ? editingStaff?.ended_at
            ? formatStringToDate(editingStaff.ended_at)
            : ""
          : selectedStaff?.ended_at
          ? formatStringToDate(selectedStaff?.ended_at)
          : "",
      leaveThisYear:
        mode == "create" ? "0" : String(selectedStaff.time_off_hours),
      leaveLastYear:
        mode == "create" ? "0" : String(selectedStaff.last_year_time_off),
      department:
        mode == "create"
          ? editingStaff?.department
            ? convertIdToObject(editingStaff.department, departmentData)
            : undefined
          : convertIdToObject(selectedStaff?.department || [], departmentData),
      statusWorking:
        mode == "create"
          ? editingStaff.status_working?.toString() || undefined
          : selectedStaff.status_working?.toString(),
      role:
        mode == "create"
          ? editingStaff.role?.name
            ? editingStaff.role?.name?.toString()
            : undefined
          : selectedStaff.role?.name?.toString(),
      leaderId:
        mode == "create"
          ? editingStaff.leader_id
            ? editingStaff.leader_id?.toString()
            : undefined
          : selectedStaff.leader_id?.toString(),
      gender:
        mode == "create"
          ? editingStaff.gender?.toString() || undefined
          : selectedStaff.gender?.toString(),
      fullname:
        mode == "create"
          ? editingStaff.fullname || undefined
          : selectedStaff.fullname,
    },
  });

  const roleDescription = useMemo(() => {
    let roleDescription = [];
    if (mode == "create") {
      if (form.getValues("role")) {
        const selectedRole = roleData?.find(
          (item: any) => item.name.toLowerCase() === form.getValues("role")
        );
        if (selectedRole) {
          roleDescription = [selectedRole?.description];
        }
      } else roleDescription = roleData.map((item: any) => item.description);
    } else if (mode == "view") {
      const selectedRole = roleData?.find(
        (item: any) => item.name.toLowerCase() === selectedStaff.role?.name
      );
      if (selectedRole) {
        roleDescription = [selectedRole?.description];
      }
    } else {
      const selectedRole = roleData?.find(
        (item: any) => item.name.toLowerCase() === form.getValues("role")
      );
      if (selectedRole) {
        roleDescription = [selectedRole?.description];
      }
    }
    return formatArrayToString(roleDescription);
  }, [roleData, selectedStaff.role?.name, form.getValues("role")]);

  const onUpdateProfessionalInfoStaff = async (
    data: z.infer<typeof formSchema>
  ) => {
    try {
      setLoading(true);
      const departmentIds = data.department?.map((i) => i.id);
      const joiningDateFormatted = formatDateToString(data.joiningDate || "");
      if (!paramsPage.id) {
        toast({
          description: "User id not found",
          color: `bg-blue-200`,
        });
      }
      let params: UpdateUsersParams = {
        id: paramsPage.id,
        idkey: data?.idkey || "",
        fullname: data?.fullname || "",
        phone: selectedStaff?.phone || "",
        birth_day: selectedStaff?.birth_day || "",
        address: selectedStaff?.address || "",
        country: selectedStaff?.country || "",
        status_working: data?.statusWorking || "",
        email: data.email || "",
        role: data.role,
        started_at: joiningDateFormatted || "",
        department_ids: departmentIds || [],
        updated_at: selectedStaff.updated_at || "",
        leader_id: data?.leaderId || "",
        time_off_hours: data?.leaveThisYear || 0,
        last_year_time_off: data?.leaveLastYear || 0,
        gender: data?.gender || "",
      };
      if (data?.terminationDate) {
        const terminationDateFomarted = formatDateToString(
          data.terminationDate || ""
        );
        params = { ...params, ended_at: terminationDateFomarted };
      }
      const result = await editStaff.execute(params);
      if (result?.code == 0) {
        toast({
          description: "Update staff information successfully",
          color: `bg-blue-200`,
        });
        updateSelectedStaff(result.data);
        goToDetailScreen();
      } else if (result?.code == -1) {
        toast({
          description: message.concurencyUpdate,
          color: "bg-red-100",
        });
      } else {
        toast({
          description: "Update staff information failed",
          color: "bg-red-100",
        });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onCreateStaff = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const departmentIds = data.department?.map((i) => i.id);
      const joiningDateFormatted = formatDateToString(data.joiningDate || "");
      const params: CreateUsersParams = {
        idkey: data?.idkey || "",
        status_working:
          data?.statusWorking || editingStaff?.status_working || "",
        email: data.email || editingStaff?.email || "",
        gender: data.gender || editingStaff?.gender || "",
        role: data.role || editingStaff?.role?.name || "staff",
        started_at: joiningDateFormatted || editingStaff.started_at || "",
        department_ids: departmentIds || editingStaff.department || [],
        leader_id: data?.leaderId || editingStaff?.leader_id || "",
        time_off_hours: data?.leaveThisYear || editingStaff.time_off_hours || 0,
        fullname: data?.fullname || editingStaff?.fullname,
        phone: editingStaff?.phone,
        birth_day: editingStaff?.birth_day,
        country: editingStaff?.country,
        address: editingStaff?.address,
      };
      const result = await createStaff.execute(params);
      if (result?.code == 0) {
        toast({
          description: "Create staff successfully",
          color: `bg-blue-200`,
        });
        form.reset();
        resetEdittingStaff();
        router.replace(`/staffs`);
      } else if (result?.code == -1) {
        toast({
          description: message.concurencyUpdate,
          color: "bg-red-100",
        });
      } else {
        if (result?.data?.idkey) {
          toast({
            description: "The idkey has been exist",
            color: "bg-red-100",
          });
        } else if (result?.data?.email) {
          toast({
            description: "The email has been exist",
            color: "bg-red-100",
          });
        } else {
          toast({
            description: "Create staff failed",
            color: `bg-red-100`,
          });
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onResetPasswordStaff = async () => {
    try {
      setLoading(true);
      if (!paramsPage.id) {
        toast({
          description: "User id not found",
          color: `bg-blue-200`,
        });
      }

      const params: ResetPasswordParams = {
        id: paramsPage.id,
        updated_at: selectedStaff.updated_at || "",
      };

      const response = await resetPasswordStaff.execute(params);
      if (response?.code == 0) {
        toast({
          description: "Reset password staff successfully",
          color: `bg-blue-200`,
        });
        updateSelectedStaff(response.data);
        // router.back();
      } else {
        toast({
          description: "Reset password staff failed",
          color: "bg-red-100",
        });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = () => {
    setOpenSubmitDialog(true);
  };

  const onGoPersonalTab = () => {
    props.changeTab("personal");
    const departmentIds = form.getValues().department?.map((i) => i.id);
    const joiningDateFormatted = formatDateToString(
      form.getValues().joiningDate || ""
    );
    updateStaffEditing({
      idkey: form.getValues().idkey,
      email: form.getValues().email,
      status_working: form.getValues().statusWorking,
      role: {
        name: form.getValues().role,
        permissions: [],
      },
      department: departmentIds,
      started_at: joiningDateFormatted,
      leader_id: form.getValues().leaderId,
      time_off_hours: form.getValues().leaveThisYear,
      last_year_time_off: form.getValues().leaveLastYear,
      fullname: form.getValues().fullname,
      gender: form.getValues().gender,
    });
  };

  const onCancelForm = () => {
    if (props.mode == "edit") {
      if (isDirtyEdit) {
        setOpenCancelDialog(true);
      } else {
        // goToStaffList();
        goToDetailScreen();
      }
    } else if (props.mode == "create") {
      form.handleSubmit(onGoPersonalTab)();
    }
  };

  const onSubmitForm = () => {
    const data = form.getValues();
    if (mode === "edit") onUpdateProfessionalInfoStaff(data);
    else onCreateStaff(data);
  };

  const onConfirmPopupStashList = () => {
    if (props.mode == "create") {
      if (isDirty) {
        setOpenCancelDialog(true);
      } else {
        router.replace(`/staffs`);
      }
    }
  };

  // const goToStaffList = () => {
  //   router.replace("/staffs");
  // };

  const goToDetailScreen = () => {
    if (props.mode == "create") {
      form.reset();
      resetEdittingStaff();
      router.replace(`/staffs`);
    } else if (props.mode == "edit") {
      if (selectedStaff?.id) {
        router.push(`/staffs/detail-staff/${selectedStaff?.id}`);
      }
    }
  };

  const goToEditScreen = () => {
    router.push(`/staffs/edit-staff/${selectedStaff?.id || "undefined"}`);
  };

  const onClickResetPasswordButton = () => {
    setOpenResetPasswordDialog(true);
  };

  const [formMaxHeight, setFormMaxHeight] = useState(windowSize.height);

  useEffect(() => {
    if (props.mode == "create") {
      setFormMaxHeight(
        !isMobile
          ? windowSize.height - (isMobile ? 56 : 100) - 40 - 48 - 50 - 20 - 120
          : windowSize.height - (isMobile ? 56 : 100) - 40 - 48 - 40
      );
    }
    if (props.mode == "view" || props.mode == "edit") {
      setFormMaxHeight(
        !isMobile
          ? windowSize.height -
              (isMobile ? 56 : 100) -
              40 -
              48 -
              50 -
              20 -
              120 -
              52
          : windowSize.height - (isMobile ? 56 : 100) - 40 - 48 - 40 - 116
      );
    }
  }, [props.mode, windowSize.height]);

  useEffect(() => {
    const joiningDate = new Date(form.getValues("joiningDate"));
    const terminationDate = new Date(form.getValues("terminationDate"));

    if (terminationDate > joiningDate) {
      form.clearErrors("terminationDate");
    }
  }, [form.watch("joiningDate")]);

  const getUserAdminLeaderDropdownData = async () => {
    try {
      const res = await getCommonsUserAdminLeaderRequest();
      const formatUserList = res.data?.map((item: User) => {
        return {
          value: item?.id,
          name: `${item?.fullname} (${item?.idkey})`,
        };
      });
      setUsers(formatUserList);
    } catch (error) {}
  };

  const getUserAdminLeaderOfDepartmentDropdownData = async (ids: number[]) => {
    try {
      const params: GetCommonAdminLeaderOfDepartment = {
        ids: ids,
      };
      const res = await getCommonsUserAdminLeaderOfDepartmentRequest(params);
      const formatUserList = res.data?.map((item: User) => {
        return {
          value: item?.id,
          name: `${item?.fullname} (${item?.idkey})`,
        };
      });
      setUsers(formatUserList);
    } catch (error) {}
  };

  const getUserDetailData = async (userId: string) => {
    try {
      const res = await getCommonsUserDetailRequest({ id: userId });
      if (mode == "view" || mode == "edit") {
        const dataUserSelect = res.data;
        updateSelectedStaff(dataUserSelect);
        form.setValue(
          "statusWorking",
          String(dataUserSelect?.status_working) || ""
        );
        form.setValue("role", dataUserSelect?.role?.name || "");
        form.setValue("leaderId", String(selectedStaff?.leader_id) || "");
        const departmentSelectedData = convertIdToObject(
          dataUserSelect?.department || [],
          departmentData
        );
        form.setValue("idkey", dataUserSelect.idkey || "");
        form.setValue("email", dataUserSelect?.email || "");
        if (
          departmentSelectedData?.length &&
          departmentSelectedData?.length > 0
        )
          form.setValue("department", departmentSelectedData || []);
        form.setValue(
          "joiningDate",
          formatStringToDate(dataUserSelect?.started_at)
        );
        if (dataUserSelect?.ended_at) {
          form.setValue(
            "terminationDate",
            formatStringToDate(dataUserSelect?.ended_at)
          );
        }
        if (mode == "view") {
          form.setValue(
            "leaveThisYear",
            `${convertHourToDay(dataUserSelect?.time_off_hours, 0)}`
          );
          form.setValue(
            "leaveLastYear",
            `${convertHourToDay(0, dataUserSelect?.last_year_time_off)}`
          );
        } else {
          form.setValue(
            "leaveThisYear",
            String(dataUserSelect?.time_off_hours) || "0"
          );
          form.setValue(
            "leaveLastYear",
            String(dataUserSelect?.last_year_time_off) || "0"
          );
        }

        form.setValue("fullname", dataUserSelect?.fullname || "");
        form.setValue("gender", String(dataUserSelect?.gender) || "");
      }
    } catch (error) {}
  };

  const getRoleList = async () => {
    try {
      setLoading(true);
      const response = await getRoleListRequest();
      if (response && response.data) {
        const formatted = response.data.map((i: any) => {
          return {
            value: i.role_name?.toLowerCase?.(),
            name: i.role_name,
            description: i.description,
          };
        });
        updateRolesData(formatted);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode == "create") {
      getUserAdminLeaderDropdownData();
    }
    getRoleList();
    getUserDetailData(String(paramsPage?.id));
  }, []);

  useEffect(() => {
    const department = form.getValues("department");
    if (Array.isArray(department)) {
      const departmentIds = form.getValues("department")?.map((i) => i.id);
      getUserAdminLeaderOfDepartmentDropdownData(departmentIds);
    } 
  }, [form.watch("department")]);

  const isDirty = useMemo(() => {
    const values = form.getValues();

    const idkey = values?.idkey?.trim() === "" ? undefined : values?.idkey;
    const email = values?.email?.trim() === "" ? undefined : values?.email;
    const fullname =
      values?.fullname?.trim() === "" ? undefined : values?.fullname;
    const joiningDate =
      values?.joiningDate === null ? undefined : values?.joiningDate;
    const department =
      Array.isArray(values?.department) && values.department.length === 0
        ? undefined
        : values.department;
    return (
      idkey !== undefined ||
      email !== undefined ||
      joiningDate !== undefined ||
      values?.leaderId !== undefined ||
      values?.role !== undefined ||
      department !== undefined ||
      values?.statusWorking !== undefined ||
      fullname !== undefined ||
      values?.gender !== undefined ||
      String(values?.leaveThisYear) !== "0"
    );
  }, Object.values(form.watch()));

  const isDirtyEdit = useMemo(() => {
    const values = form.getValues();

    if (users.length == 0) {
      return false;
    }
    const leaderId = selectedStaff?.leader_id ?? undefined;
    return (
      values?.idkey !== selectedStaff.idkey ||
      values?.email !== selectedStaff.email ||
      values?.role !== selectedStaff?.role?.name ||
      String(values?.leaderId) !== String(leaderId) ||
      String(values?.leaveThisYear) !== String(selectedStaff?.time_off_hours) ||
      String(values?.leaveLastYear) !==
        String(selectedStaff?.last_year_time_off) ||
      formatDateToString(values?.joiningDate) !== selectedStaff?.started_at ||
      values?.department?.[0]?.id !== selectedStaff?.department?.[0] ||
      String(values?.statusWorking) !== String(selectedStaff?.status_working) ||
      values?.fullname !== selectedStaff?.fullname ||
      String(values?.gender) !== String(selectedStaff?.gender)
    );
  }, Object.values(form.watch()));

  // logic chưa rõ
  // useEffect(() => {
  // if (isFocus) {
  //   if (editingStaff?.leader_id) {
  //     form.setValue("leaderId", editingStaff?.leader_id || "");
  //   }
  //   if (mode == "view" || mode == "edit") {
  //     if (selectedStaff?.leader_id) {
  //       form.setValue("leaderId", String(selectedStaff?.leader_id || ""));
  //     }
  //   }
  // }
  // }, [users]);

  useEffect(() => {
    if (props.mode == "edit") {
      updateIsDirty(isDirtyEdit);
    }
  }, [isDirtyEdit]);

  useEffect(() => {
    if (props.mode == "create") {
      updateIsDirty(isDirty);
    }
  }, [isDirty]);

  useEffect(() => {
    if (mode == "create") {
      if (editingStaff?.status_working)
        form.setValue(
          "statusWorking",
          String(editingStaff?.status_working) || ""
        );
      if (editingStaff?.role?.name)
        form.setValue("role", editingStaff?.role?.name || "");
      if (editingStaff?.leader_id) {
        form.setValue("leaderId", editingStaff?.leader_id || "");
      }
      const departmentSelectedData = convertIdToObject(
        editingStaff.department || [],
        departmentData
      );
      if (editingStaff?.email)
        form.setValue("email", editingStaff?.email || "");
      if (departmentSelectedData?.length && departmentSelectedData?.length > 0)
        form.setValue("department", departmentSelectedData || []);
      if (editingStaff?.started_at)
        form.setValue(
          "joiningDate",
          formatStringToDate(editingStaff?.started_at) || ""
        );
      if (editingStaff?.ended_at) {
        form.setValue(
          "terminationDate",
          formatStringToDate(editingStaff?.ended_at) || ""
        );
      }
      form.setValue("leaveThisYear", editingStaff?.time_off_hours || "0");
      form.setValue("leaveLastYear", editingStaff?.last_year_time_off || "0");
      if (editingStaff?.fullname)
        form.setValue("fullname", editingStaff?.fullname || "");
    }
    if (mode == "view" || mode == "edit") {
      if (selectedStaff?.status_working) {
        form.setValue(
          "statusWorking",
          String(selectedStaff?.status_working) || ""
        );
      }
      if (selectedStaff?.role?.name)
        form.setValue("role", selectedStaff?.role?.name || "");
      if (selectedStaff?.leader_id) {
        form.setValue("leaderId", String(selectedStaff?.leader_id) || "");
      }
      const departmentSelectedData = convertIdToObject(
        selectedStaff?.department || [],
        departmentData
      );
      form.setValue("idkey", selectedStaff.idkey || "");
      if (selectedStaff?.email)
        form.setValue("email", selectedStaff?.email || "");
      if (departmentSelectedData?.length && departmentSelectedData?.length > 0)
        form.setValue("department", departmentSelectedData || []);
      if (selectedStaff?.started_at)
        form.setValue(
          "joiningDate",
          formatStringToDate(selectedStaff?.started_at)
        );

      if (mode == "view") {
        form.setValue(
          "leaveThisYear",
          `${convertHourToDay(selectedStaff?.time_off_hours, 0)}`
        );
        form.setValue(
          "leaveLastYear",
          `${convertHourToDay(0, selectedStaff?.last_year_time_off)}`
        );
      } else {
        form.setValue(
          "leaveThisYear",
          String(selectedStaff?.time_off_hours) || "0"
        );
        form.setValue(
          "leaveLastYear",
          String(selectedStaff?.last_year_time_off) || "0"
        );
      }
      if (selectedStaff?.fullname)
        form.setValue("fullname", selectedStaff?.fullname || "");
      if (selectedStaff?.gender)
        form.setValue("gender", String(selectedStaff?.gender) || "");
    }
  }, [selectedStaff?.updated_at]);

  useEffect(() => {
    if (
      mode == "create" &&
      form.getValues("statusWorking") == STAFF_STATUS_WORKING[0].value
    ) {
      form.setValue("leaveThisYear", "0");
    }
  }, [form.watch("statusWorking")]);
  return (
    <div
      style={{
        maxHeight: formMaxHeight,
        minHeight: formMaxHeight,
        scrollbarWidth: "none",
      }}
      className="flex flex-1 h-full rounded-md max-h-screen overflow-y-auto"
    >
      <StyledOverlay isVisible={loading} />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          style={{
            maxHeight: formMaxHeight,
            minHeight: formMaxHeight,
          }}
          className="flex flex-col space-y-4 mt-1 w-full p-2 laptop:p-5 rounded-md overflow-y-auto hide-scrollbar"
        >
          <div
            className={
              "flex flex-col laptop:flex-row items-start justify-between gap-x-5  space-y-4 laptop:space-y-0"
            }
          >
            <FormField
              control={form.control}
              name={"idkey"}
              disabled={mode == "view"}
              render={({ field, fieldState }) => (
                <FormItem className="w-full laptop:w-1/2">
                  <div className="flex flex-row items-center">
                    <FormLabel
                      className={"font-normal text-[14px] text-secondary"}
                    >
                      Employee ID
                    </FormLabel>
                    {mode !== "view" && (
                      <p className={"text-red-500 leading-none"}>*</p>
                    )}
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      maxLength={6}
                      className="border border-border focus:border-primary px-2 h-10"
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
            <FormField
              control={form.control}
              name={"email"}
              disabled={mode == "view"}
              render={({ field, fieldState }) => (
                <FormItem className="w-full laptop:w-1/2">
                  <div className="flex flex-row items-center">
                    <FormLabel
                      className={"font-normal text-[14px] text-secondary"}
                    >
                      Email
                    </FormLabel>
                    {mode !== "view" && (
                      <p className={"text-red-500 leading-none"}>*</p>
                    )}
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      className="border border-border focus:border-primary px-2 h-10"
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
          <div
            className={
              "flex flex-col laptop:flex-row items-start justify-between gap-x-5 space-y-4 laptop:space-y-0"
            }
          >
            <FormField
              control={form.control}
              name={"fullname"}
              disabled={mode == "view"}
              render={({ field, fieldState }) => (
                <FormItem className="w-full laptop:w-1/2" tabIndex={1}>
                  <div className="flex flex-row items-center">
                    <FormLabel
                      className={"font-normal text-[14px] text-secondary"}
                    >
                      Full name
                    </FormLabel>
                    {mode !== "view" && (
                      <p className={"text-red-500 leading-none"}>*</p>
                    )}
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      className="border border-border focus:border-primary px-2 h-10"
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
            <FormField
              control={form.control}
              name="role"
              disabled={mode == "view"}
              render={({ field, fieldState }) => {
                return (
                  <FormItem className="w-full laptop:w-1/2">
                    <div className="flex flex-row items-center">
                      <FormLabel
                        className={"font-normal text-[14px] text-secondary"}
                      >
                        Role
                      </FormLabel>
                      {mode !== "view" && (
                        <p className={"text-red-500 leading-none"}>*</p>
                      )}
                      <StyledTooltip
                        disable={false}
                        content={roleDescription}
                        contentClass=" max-h-[300px] "
                      >
                        <Image src={IconInfo} alt="" className="h-4 w-4 ml-2" />
                      </StyledTooltip>
                    </div>
                    <StyledSelected
                      field={field}
                      disabled={mode == "view"}
                      items={[...roleData]}
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
          <div
            className={
              "flex flex-col laptop:flex-row items-start justify-between gap-x-5  space-y-4 laptop:space-y-0"
            }
          >
            <FormField
              control={form.control}
              name="department"
              render={({ field, fieldState }) => (
                <FormItem className="w-full laptop:w-1/2">
                  <div className="flex flex-row items-center">
                    <FormLabel
                      className={"font-normal text-[14px] text-secondary"}
                    >
                      Department
                    </FormLabel>
                    {mode !== "view" && (
                      <p className={"text-red-500 leading-none"}>*</p>
                    )}
                  </div>
                  <StyledComboboxDepartment
                    disable={mode == "view"}
                    field={field}
                    form={form}
                  />
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
              name="leaderId"
              disabled={mode == "view"}
              render={({ field, fieldState }) => {
                return (
                  <FormItem className="w-full laptop:w-1/2">
                    <div className="flex flex-row items-center">
                      <FormLabel
                        className={"font-normal text-[14px] text-secondary"}
                      >
                        Leader
                      </FormLabel>
                      {mode !== "view" && (
                        <p className={"text-red-500 leading-none"}>*</p>
                      )}
                    </div>
                    <StyledSelectUserDropdown
                      loading={loading}
                      field={field}
                      tabIndex={10}
                      disabled={mode == "view"}
                      items={users}
                      triggerClass={
                        "border border-border focus:border-primary h-10 disabled:opacity-100 font-normal"
                      }
                      triggerButtonClass={
                        "px-2 border border-border flex justify-center items-center"
                      }
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
          <div
            className={
              "flex flex-col laptop:flex-row items-start justify-between gap-x-5  space-y-4 laptop:space-y-0"
            }
          >
            <FormField
              control={form.control}
              name="statusWorking"
              render={({ field, fieldState }) => (
                <FormItem className="w-full laptop:w-1/2">
                  <div className="flex flex-row items-center">
                    <FormLabel
                      className={"font-normal text-[14px] text-secondary"}
                    >
                      Working Status
                    </FormLabel>
                    {mode !== "view" && (
                      <p className={"text-red-500 leading-none"}>*</p>
                    )}
                    <StyledTooltip
                      disable={false}
                      content={STATUS_WORKING_DESCRIPTION}
                    >
                      <Image src={IconInfo} alt="" className="h-4 w-4 ml-2" />
                    </StyledTooltip>
                  </div>
                  <StyledSelected
                    field={field}
                    disabled={mode == "view"}
                    items={STAFF_STATUS_WORKING}
                    iconRight={ArrowDownIcon}
                  />
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
              name="gender"
              render={({ field, fieldState }) => {
                return (
                  <FormItem className="w-full laptop:w-1/2">
                    <div className="flex flex-row items-center">
                      <FormLabel
                        className={"font-normal text-[14px] text-secondary"}
                      >
                        Gender
                      </FormLabel>
                      {mode !== "view" && (
                        <p className={"text-red-500 leading-none"}>*</p>
                      )}
                    </div>
                    <StyledSelected
                      field={field}
                      items={GENDER}
                      disabled={mode == "view"}
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
          <div
            className={
              "flex flex-col laptop:flex-row items-start justify-between gap-x-5  space-y-4 laptop:space-y-0"
            }
          >
            <FormField
              control={form.control}
              name={"joiningDate"}
              render={({ field, fieldState }) => (
                <FormItem className="w-full laptop:w-1/2">
                  <div className="flex flex-row items-center">
                    <FormLabel
                      className={"font-normal text-[14px] text-secondary"}
                    >
                      Joining Date
                    </FormLabel>
                    {mode !== "view" && (
                      <p className={"text-red-500 leading-none"}>*</p>
                    )}
                  </div>
                  <FormControl>
                    <StyledDatePicker
                      disabled={mode == "view"}
                      field={field}
                      title={""}
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
            <FormField
              control={form.control}
              name={"leaveThisYear"}
              render={({ field, fieldState }) => (
                <FormItem className="w-full laptop:w-1/2">
                  <div className="flex flex-row items-center">
                    <FormLabel
                      className={"font-normal text-[14px] text-secondary"}
                    >
                      Leave Hours{" "}
                      <span className="text-[12px] font-semibold text-primary">
                        {new Date().getFullYear()}
                      </span>
                    </FormLabel>
                    {mode !== "view" && (
                      <p className={"text-red-500 leading-none"}>*</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        disabled={true}
                        {...field}
                        className="border border-border focus:border-primary px-2 h-10"
                        enterKeyHint="done"
                      />
                    </FormControl>
                    {mode !== "view" && (
                      <>
                        <Button
                          type="button"
                          className="w-10 h-10 border border-border bg-white focus:border-primary text-lg flex items-center justify-center"
                          onClick={() => {
                            const current = parseInt(field.value || "0") || 0;
                            if (current > 0) {
                              field.onChange(String(current - LEAVE_STEP));
                            }
                          }}
                          disabled={field.value == "0"}
                        >
                          −
                        </Button>
                        <Button
                          type="button"
                          className="w-10 h-10 border border-border bg-white focus:border-primary text-lg flex items-center justify-center"
                          onClick={() =>
                            field.onChange(
                              String(
                                (parseInt(field.value || "0") || 0) + LEAVE_STEP
                              )
                            )
                          }
                          disabled={
                            mode == "create" &&
                            form.getValues("statusWorking") ==
                              STAFF_STATUS_WORKING[0].value
                          }
                        >
                          +
                        </Button>
                      </>
                    )}
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
          {mode !== "create" && (
            <div
              className={
                "flex flex-col-reverse laptop:flex-row items-start justify-between gap-x-5 gap-y-4 laptop:space-y-0"
              }
            >
              <FormField
                control={form.control}
                name={"terminationDate"}
                render={({ field, fieldState }) => (
                  <FormItem className="w-full laptop:w-1/2">
                    <div className="flex flex-row items-center">
                      <FormLabel
                        className={"font-normal text-[14px] text-secondary"}
                      >
                        Termination Date
                      </FormLabel>
                    </div>
                    <FormControl>
                      <StyledDatePicker
                        disabled={mode == "view"}
                        field={field}
                        title={""}
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
              <FormField
                control={form.control}
                name={"leaveLastYear"}
                render={({ field, fieldState }) => (
                  <FormItem className="w-full laptop:w-1/2">
                    <div className="flex flex-row items-center">
                      <FormLabel
                        className={"font-normal text-[14px] text-secondary"}
                      >
                        Leave Hours{" "}
                        <span className="text-[12px] font-semibold text-primary">
                          {new Date().getFullYear() - 1}
                        </span>
                      </FormLabel>
                    </div>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          disabled={true}
                          {...field}
                          value={field.value}
                          className="border border-border focus:border-primary px-2 h-10"
                          enterKeyHint="done"
                        />
                      </FormControl>
                      {mode !== "view" && (
                        <>
                          <Button
                            type="button"
                            className="w-10 h-10 border border-border bg-white focus:border-primary text-lg flex items-center justify-center"
                            onClick={() => {
                              const current = parseInt(field.value || "0") || 0;
                              if (current > 0) {
                                field.onChange(String(current - 4));
                              }
                            }}
                            disabled={field.value == "0"}
                          >
                            −
                          </Button>
                          <Button
                            type="button"
                            className="w-10 h-10 border border-border bg-white focus:border-primary text-lg flex items-center justify-center"
                            onClick={() =>
                              field.onChange(
                                String((parseInt(field.value || "0") || 0) + 4)
                              )
                            }
                          >
                            +
                          </Button>
                        </>
                      )}
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
          )}

          {props.mode == "view" && (
            <div className="fixed bottom-[8px] laptop:bottom-[52px] right-0 laptop:right-[68px] left-0 laptop:left-auto flex flex-1 flex-col-reverse laptop:flex-row justify-end items-end gap-x-4 gap-y-3 mx-4 laptop:mx-0">
              <div className="fixed bottom-[8px] laptop:bottom-[52px] right-0 laptop:right-[68px] laptop:left-auto flex flex-1 flex-row-reverse justify-end items-end gap-x-2 gap-y-3 mx-4 laptop:mx-0">
                <Button
                  type="button"
                  onClick={goToEditScreen}
                  className="w-[100px] laptop:hidden h-8 laptop:h-[50px] text-white text-[12px] font-normal laptop:text-[16px] bg-button-edit hover:bg-button-edit-hover rounded-lg"
                >
                  <p className={"text-white"}>{i18nStaff("editButton")}</p>
                </Button>
                <Button
                  onClick={onClickResetPasswordButton}
                  variant="outline"
                  tabIndex={3}
                  className="w-[100px] laptop:w-[152px]  h-8 laptop:h-[50px] text-[12px] font-normal laptop:text-[16px] border-border bg-primary text-white hover:bg-primary-hover rounded-lg"
                  type="button"
                >
                  {i18nStaff("resetPasswordButton")}
                </Button>
                <Button
                  onClick={() => {
                    router.replace(`/staffs`);
                  }}
                  type="button"
                  className="w-[100px] h-8 laptop:hidden font-normal text-[12px] bg-white hover:bg-secondary border border-border"
                >
                  {i18nStaff("backStaffListButton")}
                </Button>
              </div>
            </div>
          )}

          {props.mode === "create" && (
            <div className="fixed bottom-[8px] laptop:bottom-[52px] right-0 laptop:right-[68px] left-0 laptop:left-auto flex flex-1 flex-row justify-end items-end gap-x-2 gap-y-3 mx-4 laptop:mx-0">
              <Button
                onClick={onConfirmPopupStashList}
                type="button"
                className="laptop:hidden w-[100px] h-8 font-normal text-[12px] bg-white hover:bg-secondary border border-border"
              >
                {i18nStaff("backStaffListButton")}
              </Button>
              <Button
                onClick={onCancelForm}
                variant="outline"
                // disabled={loading}
                tabIndex={3}
                className="w-[100px] text-white laptop:w-[152px] h-8 laptop:h-[50px] font-normal border-border bg-button-create hover:bg-button-create-hover text-[12px] laptop:text-[14px] rounded-lg"
                type="button"
              >
                {i18nStaff("nextButton")}
              </Button>
              <Button
                // disabled={loading}
                tabIndex={3}
                className="w-[100px] laptop:w-[152px] h-8 laptop:h-[50px] font-normal text-white text-[12px] laptop:text-[14px] bg-button-create hover:bg-button-create-hover rounded-lg"
                type="submit"
              >
                {i18nStaff("createButton")}
              </Button>
            </div>
          )}
          {props.mode === "edit" && (
            <div className="fixed bottom-[8px] laptop:bottom-[52px] right-0 laptop:right-[68px] left-0 laptop:left-auto flex flex-1 flex-row laptop:flex-row justify-end items-end gap-x-2 gap-y-3 mx-4 laptop:mx-0">
              <Button
                onClick={onCancelForm}
                variant="outline"
                // disabled={loading}
                tabIndex={3}
                className="w-[100px] laptop:w-[152px] h-8 laptop:h-[50px] font-normal border-border bg-white text-[14px] hover:bg-gray-100 rounded-lg"
                type="button"
              >
                {i18nStaff("cancelButton")}
              </Button>
              <Button
                // disabled={loading}
                tabIndex={3}
                className="w-[100px] laptop:w-[152px]  h-8 laptop:h-[50px] font-normal text-white text-[14px] hover:bg-primary-hover rounded-lg"
                type="submit"
              >
                {i18nStaff("saveButton")}
              </Button>
            </div>
          )}
        </form>
      </Form>

      <AlertDialogCancelFormButton
        tabIndex={16}
        title={
          props.mode == "create"
            ? "Back to staff list page"
            : "Back to detail page"
        }
        onConfirm={goToDetailScreen}
        mode={props.mode}
        open={openCancelDialog}
        onOpenChange={setOpenCancelDialog}
      />

      <AlertDialogSubmitFormButton
        tabIndex={16}
        title={"Submit form"}
        onConfirm={onSubmitForm}
        // mode={props.mode}
        open={openSubmitDialog}
        onOpenChange={setOpenSubmitDialog}
      />

      <AlertDialogSubmitFormButton
        tabIndex={16}
        title={"Submit reset password"}
        onConfirm={onResetPasswordStaff}
        // mode={props.mode}
        open={openResetPasswordDialog}
        onOpenChange={setOpenResetPasswordDialog}
      />
    </div>
  );
}
