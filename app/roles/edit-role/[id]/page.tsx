"use client";
import { EditRoleParams, GetRoleDetailParams } from "@/apis/modules/role";
import { AlertDialogCancelFormButton } from "@/components/common/alert-dialog/AlertDialogCancelFormButton";
import { AlertDialogSubmitFormButton } from "@/components/common/alert-dialog/AlertDialogSubmitFormButton";
import NestedCheckbox from "@/components/common/NestedCheckbox";
import SideBarComponent from "@/components/common/SideBarComponent";
import { StyledBreadcrumb } from "@/components/common/StyledBreadcrumb";
import StyledHeader from "@/components/common/StyledHeader";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EditRoleUseCase } from "@/core/application/usecases/role/editRole.usecase";
import { GetPermissionListUseCase } from "@/core/application/usecases/role/getPermissionList.usecase";
import { GetRoleDetailUseCase } from "@/core/application/usecases/role/getRoleDetail.usecase";
import { RoleRepositoryImpl } from "@/core/infrastructure/repositories/role.repo";
import { toast } from "@/hooks/use-toast";
import useWindowSize from "@/hooks/useWindowSize";
import { useRoleStore } from "@/stores/roleStore";
import { formatDataSelectedPermission } from "@/utilities/helper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PermissionProps } from "../../create-role/page";
import { DefaultRoleId } from "@/utilities/enum";
import { useCheckPermission } from "@/hooks/useCheckPermission";
import { isMobile } from "react-device-detect";

interface Role {
  id?: number;
  name?: string;
  guard_name?: string;
  role_name?: string;
  description?: string;
}

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  description: z.string().trim().min(1, { message: "Description is required" }),
  permissions: z.any(),
});

const roleRepo = new RoleRepositoryImpl();
const getRoleUseCase = new GetRoleDetailUseCase(roleRepo);
const getPermissionListUseCase = new GetPermissionListUseCase(roleRepo);
const editRoleUseCase = new EditRoleUseCase(roleRepo);

export default function CreateRoleScreen() {
  const windowSize = useWindowSize();
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openBreadcrumbDialog, setOpenBreadcrumbDialog] = useState(false);
  const [permissionList, setPermissionList] = useState<PermissionProps[]>([]);
  const [permissionSelected, setPermissionSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [roleDetail, setRoleDetail] = useState<Role>();
  // const [permissionDetail, setPermissionDetail] = useState<PermissionProps[]>();
  const router = useRouter();
  const params = useParams();
  const idRole = params?.id;
  const i18nRole = useTranslations("Role");
  const { updateIsDirtyRole } = useRoleStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: roleDetail?.role_name || "",
      description: roleDetail?.description || "",
      permissions:
        permissionList.length > 0
          ? permissionList.reduce(
              (acc, item: PermissionProps) => ({
                ...acc,
                [item?.permission_cd]: false,
              }),
              {}
            )
          : [],
    },
  });

  const onSubmit = () => {
    setOpenSubmitDialog(true);
  };

  const onSubmitForm = async () => {
    try {
      const data = form.getValues();
      const selectedPermissions: number[] = formatDataSelectedPermission(
        permissionList,
        data.permissions
      );
      const params: EditRoleParams = {
        id: Number(idRole),
        fullname: data?.name,
        description: data?.description,
        permissions: selectedPermissions,
      };

      const response = await editRoleUseCase.execute(params);
      if (response?.code == 1) {
        if (response?.data?.fullname) {
          toast({
            description: "The Role name has already been taken.",
            color: "bg-red-100",
          });
        } else if (response?.data?.description) {
          toast({
            description: "Description is required",
            color: "bg-red-100",
          });
        } else {
          toast({
            description: "Role edit failed",
            color: "bg-red-100",
          });
        }
      } else {
        toast({
          description: "Role edit successfully",
          color: "bg-blue-200",
        });
        setRoleDetail(response?.data?.role);
        // setPermissionDetail(response?.data?.permissions);
        updateIsDirtyRole(false);
        router.push(`/roles/detail-role/${idRole}`);
      }
    } catch (error) {}
  };

  const getRoleDetailData = async () => {
    try {
      setIsLoading(true);
      const param: GetRoleDetailParams = {
        id: Number(idRole),
      };
      const response = await getRoleUseCase.execute(param);

      if (!response) return;
      setRoleDetail(response?.data?.role);
      form.setValue("name", response?.data?.role?.role_name);
      form.setValue("description", response?.data?.role?.description);
      const formatSelectedItemCd = response.data?.permissions.map(
        (item: PermissionProps) => item.permission_cd
      );
      setPermissionSelected(formatSelectedItemCd);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const listPermissions = async () => {
    try {
      const response = await getPermissionListUseCase.execute();
      setPermissionList(response?.data);
    } catch (error) {}
  };

  useEffect(() => {
    if (
      Number(idRole) == DefaultRoleId.Admin ||
      Number(idRole) == DefaultRoleId.Staff ||
      Number(idRole) == DefaultRoleId.Leader
    ) {
      router.replace("/error");
      return;
    }
    listPermissions();
  }, []);

  useEffect(() => {
    if (permissionList?.length) {
      getRoleDetailData();
    }
  }, [permissionList]);

  const isDirtyEdit = useMemo(() => {
    const values = form.getValues();
    const selectedPermissions: string[] = formatDataSelectedPermission(
      permissionList,
      form.getValues("permissions"),
      "permission_cd"
    );
    if (!permissionSelected.length || !selectedPermissions.length) return false;
    const isDirtyItem =
      permissionSelected.every((p) => {
        return selectedPermissions.includes(p);
      }) && permissionSelected.length == selectedPermissions.length;
    return (
      values.name?.trim() !== roleDetail?.role_name ||
        values.description?.trim() !== roleDetail?.description,
      !isDirtyItem
    );
  }, [
    ...Object.values(form.watch()),
    formatDataSelectedPermission(permissionList, form.getValues("permissions")),
  ]);

  useEffect(() => {
    updateIsDirtyRole(isDirtyEdit);
  }, [isDirtyEdit]);

  const onCancelForm = () => {
    if (isDirtyEdit) {
      setOpenCancelDialog(true);
    } else {
      goToDetailPage();
    }
  };

  const goToDetailPage = () => {
    updateIsDirtyRole(false);
    router.push(`/roles/detail-role/${idRole}`);
  };

  const { loading: roleLoading } = useCheckPermission(["role_master"]);
  if (roleLoading) return null;

  return (
    <div className="w-full flex ">
      <SideBarComponent />
      <div className="w-full max-h-screen block bg-white  ">
        <StyledHeader />
        <StyledBreadcrumb
          items={["Master", "Roles", "Edit Role"]}
          links={["", "/roles", `/roles/edit-role/${idRole}`]}
          triggerClass={"pb-0"}
          isDirty={isDirtyEdit}
          onUpdateIsDirty={updateIsDirtyRole}
          open={openBreadcrumbDialog}
          onOpenChange={setOpenBreadcrumbDialog}
        />
        <div
          style={{
            maxHeight: isMobile
              ? windowSize.height - 56
              : windowSize.height - 88 - 40,
            minHeight: isMobile
              ? windowSize.height - 132
              : windowSize.height - 88 - 40,
          }}
          className="px-2 py-2 laptop:py-5 laptop:px-5 w-full"
        >
          <div
            className="w-full border border-border rounded-md px-2 py-2 laptop:px-5 laptop:py-6 flex flex-col gap-x-8"
            style={{
              maxHeight: isMobile
                ? windowSize.height - 56 - 20
                : windowSize.height - 88 - 72,
              minHeight: isMobile
                ? windowSize.height - 132 - 20
                : windowSize.height - 88 - 72,
            }}
          >
            <div className="w-full flex pb-2 justify-center laptop:justify-between items-center ">
              <p className="text-[20px] font-semibold laptop:text-[24px] w-fit text-center">
                Role Information
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col laptop:space-y-2 w-full px-2 pt-2 laptop:px-5 rounded-md overflow-y-auto hide-scrollbar border border-border"
                style={{
                  maxHeight: isMobile
                    ? windowSize.height - 56 - 40 - 20
                    : windowSize.height - 88 - 156,
                  minHeight: isMobile
                    ? windowSize.height - 132 - 40 - 20
                    : windowSize.height - 88 - 156,
                }}
              >
                <div
                  className={
                    "flex flex-col laptop:flex-row items-start justify-between  gap-x-0 laptop:gap-x-5 space-y-2 laptop:space-y-0"
                  }
                >
                  <FormField
                    control={form.control}
                    name={"name"}
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full laptop:w-1/3">
                        <div className="flex flex-row items-center">
                          <FormLabel
                            className={
                              "font-normal text-[14px] laptop:text-[16px]"
                            }
                          >
                            Role name
                          </FormLabel>
                          <p className={"text-red-500 text-[14px]"}>*</p>
                        </div>
                        <FormControl tabIndex={1}>
                          <Input
                            {...field}
                            className="border border-border focus:border-primary px-2  h-8 laptop:h-10 text-[14px] laptop:text-[16px]"
                            placeholder="Role name"
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
                    name={"description"}
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full laptop:w-2/3">
                        <div className="flex flex-row items-center">
                          <FormLabel
                            className={
                              "font-normal text-[14px] laptop:text-[16px]"
                            }
                          >
                            Description
                          </FormLabel>
                          <p className={"text-red-500 text-[14px]"}>*</p>
                        </div>
                        <FormControl tabIndex={2}>
                          <Input
                            {...field}
                            className="border border-border focus:border-primary px-2 h-8 laptop:h-10 text-[14px] laptop:text-[16px]"
                            placeholder="Enter description"
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
                <p className="font-normal text-[14px] laptop:text-[16px] mt-2">
                  Role permission:
                </p>
                <div
                  className="flex flex-col laptop:flex-row w-full overflow-y-auto hide-scrollbar"
                  style={{
                    maxHeight: isMobile
                      ? windowSize.height - 56 - 272 - 20
                      : windowSize.height - 88 - 292,
                    minHeight: isMobile
                      ? windowSize.height - 56 - 272 - 20
                      : windowSize.height - 88 - 292,
                  }}
                >
                  {!isLoading &&
                    permissionSelected.length > 0 &&
                    permissionList?.length > 0 && (
                      <NestedCheckbox
                        selectedPermissionCds={permissionSelected}
                        data={permissionList}
                        form={form}
                      />
                    )}
                </div>
                {isMobile ? (
                  <div className="fixed bottom-[8px] laptop:bottom-[60px] right-[4px] laptop:right-[62px] left-0 laptop:left-auto flex flex-1 flex-row justify-end items-end gap-x-2 laptop:gap-x-4 gap-y-2 laptop:gap-y-3 mx-4 laptop:mx-0">
                    <Button
                      type="button"
                      className="w-[100px] laptop:w-[152px] h-[32px] laptop:h-[50px] font-normal border border-border bg-white text-[12px] laptop:text-[14px] hover:bg-gray-200 rounded-lg"
                      onClick={onCancelForm}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="w-[100px] laptop:w-[152px] h-[32px] laptop:h-[50px] font-normal border border-border text-white hover:bg-primary-hover  text-[12px] laptop:text-[14px] rounded-lg"
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="fixed bottom-[20px] laptop:bottom-[82px] right-0 laptop:right-[68px] left-0 laptop:left-auto flex flex-1 flex-row justify-end items-end gap-x-4 gap-y-3 mx-4 laptop:mx-0">
                    <Button
                      tabIndex={3}
                      type="button"
                      className="w-full laptop:w-[152px] h-[50px] font-normal border border-border bg-white text-[14px] hover:bg-gray-100 rounded-lg"
                      onClick={onCancelForm}
                    >
                      {i18nRole("cancelButton")}
                    </Button>
                    <Button
                      tabIndex={4}
                      className="w-full laptop:w-[152px] h-[50px] font-normal text-white text-[14px] hover:bg-primary-hover rounded-lg"
                      type="submit"
                    >
                      {i18nRole("saveButton")}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>
      <AlertDialogCancelFormButton
        tabIndex={16}
        title={"Cancel edit role"}
        onConfirm={goToDetailPage}
        open={openCancelDialog}
        onOpenChange={setOpenCancelDialog}
      />
      <AlertDialogSubmitFormButton
        tabIndex={16}
        title={"Submit form"}
        onConfirm={onSubmitForm}
        open={openSubmitDialog}
        onOpenChange={setOpenSubmitDialog}
      />
    </div>
  );
}
