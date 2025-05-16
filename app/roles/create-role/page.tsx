"use client";
import { CreateRoleParams } from "@/apis/modules/role";
import IconBackRoute from "@/app/assets/icons/iconBackRoute.svg";
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
import { CreateRoleUseCase } from "@/core/application/usecases/role/createRole.usecase";
import { GetPermissionListUseCase } from "@/core/application/usecases/role/getPermissionList.usecase";
import { RoleRepositoryImpl } from "@/core/infrastructure/repositories/role.repo";
import { toast } from "@/hooks/use-toast";
import { useCheckPermission } from "@/hooks/useCheckPermission";
import useWindowSize from "@/hooks/useWindowSize";
import { useRoleStore } from "@/stores/roleStore";
import { formatDataSelectedPermission } from "@/utilities/helper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  fullname: z.string().trim().min(1, { message: "Name is required" }),
  description: z.string().trim().min(1, { message: "Description is required" }),
  permissions: z.any(),
});

type FormData = z.infer<typeof formSchema>;

export interface PermissionProps {
  feature_name: string;
  permission_cd: string;
  permission_nm: string;
  permission_desc: string;
  level: number;
  permission_id: number | string;
}

const roleRepo = new RoleRepositoryImpl();
const createRoleUseCase = new CreateRoleUseCase(roleRepo);
const getPermissionListUseCase = new GetPermissionListUseCase(roleRepo);

export default function CreateRoleScreen() {
  const router = useRouter();
  const windowSize = useWindowSize();
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openBackListDialog, setOpenBackListDialog] = useState(false);
  const [openBreadcrumbDialog, setOpenBreadcrumbDialog] = useState(false);
  const i18nRole = useTranslations("Role");
  const [permissionList, setPermissionList] = useState<PermissionProps[]>([]);
  const { updateIsDirtyRole } = useRoleStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: "",
      description: "",
      permissions:
        permissionList.length > 0
          ? permissionList.reduce(
              (acc, item: PermissionProps) => {
                if(item.permission_cd == "DA011" || item.permission_cd == "MY011") {
                  return ({
                ...acc,
                [item?.permission_cd]: true,
              })
              } return ({
                ...acc,
                [item?.permission_cd]: false,
              })},
              {}
            )
          : [],
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    console.log("data", data);
    setOpenSubmitDialog(true);
  };

  const onSubmitForm = async () => {
    try {
      const data = form.getValues();
      const selectedPermissions: number[] = formatDataSelectedPermission(
        permissionList,
        data.permissions
      );

      const params: CreateRoleParams = {
        fullname: data?.fullname,
        description: data?.description,
        permissions: selectedPermissions || [],
      };

      const response = await createRoleUseCase.execute(params);
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
            description: "Role created failed",
            color: "bg-red-100",
          });
        }
      } else {
        toast({
          description: "Role created successfully",
          color: "bg-blue-200",
        });
        updateIsDirtyRole(false);
        router.replace("/roles");
      }
    } catch (error) {}
  };

  const isDirty = useMemo(() => {
    const values = form.getValues();
    const selectedPermissions: string[] = formatDataSelectedPermission(
      permissionList,
      form.getValues("permissions")
    );
    const isItemsDirty = selectedPermissions.length > 2;

    return (
      values.fullname.trim() !== "" ||
      values.description?.trim() !== "" ||
      isItemsDirty
    );
  }, [
    ...Object.values(form.watch()),
    formatDataSelectedPermission(permissionList, form.getValues("permissions")),
  ]);

  const onClear = () => {
    if (isDirty) {
      setOpenCancelDialog(true);
    } else {
      onClearForm()
    }
  };

  const onBackToList = () => {
    if (isDirty) {
      setOpenBackListDialog(true);
    } else {
      router.replace(`/roles`);
    }
  };

  const backToList = () => {
    updateIsDirtyRole(false);
    router.replace(`/roles`);
  };

  const onClearForm = () => {
    form.reset({
      fullname: "",
      description: "",
      permissions:
        permissionList.length > 0
          ? permissionList.reduce(
              (acc, item: PermissionProps) => {
                if(item.permission_cd == "DA011" || item.permission_cd == "MY011") {
                  return ({
                ...acc,
                [item?.permission_cd]: true,
              })
              } return ({
                ...acc,
                [item?.permission_cd]: false,
              })},
              {}
            )  
          : [],
    });
  };

  const listPermissions = async () => {
    try {
      const response = await getPermissionListUseCase.execute();
      setPermissionList(response?.data);
    } catch (error) {}
  };

  useEffect(() => {
    listPermissions();
  }, []);

  useEffect(() => {
    updateIsDirtyRole(isDirty);
  }, [isDirty]);

  const { loading: roleLoading } = useCheckPermission(["role_master"]);
  if (roleLoading) return null;

  return (
    <div className="w-full flex ">
      <SideBarComponent />
      <div className="w-full max-h-screen block bg-white  ">
        <StyledHeader />
        <StyledBreadcrumb
          items={["Master", "Roles", "Create Role"]}
          links={["", "/roles", "/roles/create-role"]}
          triggerClass={"pb-0"}
          isDirty={isDirty}
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
          className="px-2 py-2 laptop:py-5 w-full"
        >
          <div
            className="flex flex-col w-full border border-border rounded-md px-2 py-2 laptop:px-5 laptop:py-4 gap-x-8"
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
              {!isMobile && (
                <Button
                  onClick={onBackToList}
                  type="button"
                  className="text-black font-normal min-w-[150px] bg-white  laptop:border laptop:border-border hover:bg-gray-200"
                >
                  <Image
                    alt=""
                    src={IconBackRoute}
                    width={24}
                    height={24}
                    className="text-white mr-2"
                  />
                  Role list
                </Button>
              )}
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col laptop:space-y-2 w-full laptop:py-2 laptop:px-5 rounded-md overflow-y-auto hide-scrollbar laptop:border laptop:border-border"
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
                    "flex flex-col laptop:flex-row items-start justify-between gap-x-0 laptop:gap-x-5 space-y-2 laptop:space-y-0"
                  }
                >
                  <FormField
                    control={form.control}
                    name={"fullname"}
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
                          <p
                            className={
                              "text-red-500 text-[12px] laptop:text-[14px]"
                            }
                          >
                            *
                          </p>
                        </div>
                        <FormControl tabIndex={1}>
                          <Input
                            {...field}
                            className="border border-border focus:border-primary px-2 h-8 laptop:h-10 text-[14px] laptop:text-[16px]"
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
                          <p
                            className={
                              "text-red-500 text-[12px] laptop:text-[14px]"
                            }
                          >
                            *
                          </p>
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
                      ? windowSize.height - 56 - 260 - 20
                      : windowSize.height - 88 - 292,
                    minHeight: isMobile
                      ? windowSize.height - 56 - 260 - 20
                      : windowSize.height - 88 - 292,
                  }}
                >
                  {permissionList.length > 0 && (
                    <NestedCheckbox data={permissionList} form={form} />
                  )}
                </div>

                <div className="fixed bottom-[8px] laptop:bottom-[60px] right-0 laptop:right-[62px] left-0 laptop:left-auto flex flex-1 flex-row justify-end items-end gap-x-2 laptop:gap-x-4 gap-y-2 laptop:gap-y-3 mx-4 laptop:mx-0">
                  <Button
                    type="button"
                    className="w-[100px] laptop:w-[152px] h-[32px] laptop:h-[50px] font-normal border border-border bg-white text-[12px] laptop:text-[14px] hover:bg-gray-200 rounded-lg"
                    onClick={onBackToList}
                  >
                    Role List
                  </Button>
                  <Button
                    type="button"
                    className="w-[100px] laptop:w-[152px] h-[32px] laptop:h-[50px] font-normal border border-border bg-white text-[12px] laptop:text-[14px] hover:bg-gray-200 rounded-lg"
                    onClick={onClear}
                  >
                    {i18nRole("clearButton")}
                  </Button>
                  <Button
                    tabIndex={3}
                    className="w-[100px] laptop:w-[152px]  h-[32px] laptop:h-[50px] font-normal text-white text-[12px] laptop:text-[14px] bg-button-create hover:bg-button-create-hover rounded-lg"
                    type="button"
                    onClick={form.handleSubmit(onSubmit)}
                  >
                    {i18nRole("createButton")}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
      <AlertDialogSubmitFormButton
        tabIndex={16}
        title={"Submit form"}
        onConfirm={onSubmitForm}
        open={openSubmitDialog}
        onOpenChange={setOpenSubmitDialog}
      />
      <AlertDialogCancelFormButton
        tabIndex={16}
        title={"Clear form"}
        onConfirm={onClearForm}
        // mode={props.mode}
        open={openCancelDialog}
        onOpenChange={setOpenCancelDialog}
      />

      <AlertDialogCancelFormButton
        tabIndex={16}
        title={"Role list"}
        onConfirm={backToList}
        open={openBackListDialog}
        onOpenChange={setOpenBackListDialog}
      />
    </div>
  );
}
