"use client";
import { DeleteRoleParams, GetRoleDetailParams } from "@/apis/modules/role";
import IconBackRoute from "@/app/assets/icons/iconBackRoute.svg";
import IconEditWhite from "@/app/assets/icons/iconEditWhite.svg";
import IconDeleteWhite from "@/app/assets/icons/iconTrashWhite.svg";
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
import { GetPermissionListUseCase } from "@/core/application/usecases/role/getPermissionList.usecase";
import { GetRoleDetailUseCase } from "@/core/application/usecases/role/getRoleDetail.usecase";
import { RoleRepositoryImpl } from "@/core/infrastructure/repositories/role.repo";
import useWindowSize from "@/hooks/useWindowSize";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PermissionProps } from "../../create-role/page";
import { DeleteRoleUseCase } from "@/core/application/usecases/role/deleteRole.usecase";
import { Role } from "@/core/entities/models/role.model";
import { toast } from "@/hooks/use-toast";
import { AlertDialogSubmitFormButton } from "@/components/common/alert-dialog/AlertDialogSubmitFormButton";
import { useCheckPermission } from "@/hooks/useCheckPermission";
import { isMobile } from "react-device-detect";

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  description: z.string().trim().min(1, { message: "Description is required" }),
  items: z.any(),
});

const roleRepo = new RoleRepositoryImpl();
const getRoleUseCase = new GetRoleDetailUseCase(roleRepo);
const getPermissionListUseCase = new GetPermissionListUseCase(roleRepo);
const deleteRoleUseCase = new DeleteRoleUseCase(roleRepo);

export default function DettailRoleScreen() {
  const windowSize = useWindowSize();
  const [permissionList, setPermissionList] = useState<PermissionProps[]>([]);
  const [permissionSelected, setPermissionSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [roleDetail, setRoleDetail] = useState<Role>();
  const router = useRouter();
  const params = useParams();
  const idRole = params?.id;
  const i18nRole = useTranslations("Role");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: roleDetail?.role_name || "",
      description: roleDetail?.description || "",
      items: [],
    },
  });

  const onSubmit = () => {};

  const onBackToList = () => {
    router.replace(`/roles`);
  };

  const isCheckRole = useMemo(() => {
    if (idRole == "1" || idRole == "2" || idRole == "3") {
      return false;
    }
    return true;
  }, []);

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
    listPermissions();
  }, []);

  useEffect(() => {
    if (permissionList?.length) {
      getRoleDetailData();
    }
  }, [permissionList]);

  const goToEditScreen = () => {
    router.push(`/roles/edit-role/${params?.id || "undefined"}`);
  };

  const deleteRoleForm = () => {
    setOpenSubmitDialog(true);
  };

  const deleteRole = async () => {
    try {
      setIsLoading(true);
      const param: DeleteRoleParams = {
        id: Number(idRole),
        updated_at: roleDetail?.updated_at,
      };
      const response = await deleteRoleUseCase.execute(param);
      if (response?.code == 1) {
        if (
          response.data?.EXIST_USER_OF_ROLE &&
          response.data.EXIST_USER_OF_ROLE[0] == "EXIST_USER_OF_ROLE"
        ) {
          toast({
            description:
              "This role cannot be deleted because there are staff members assigned to it",
            color: "bg-red-100",
          });
        }
      } else {
        toast({
          description: "Role deleted successfully",
          color: "bg-blue-200",
        });
        router.replace(`/roles`);
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };
  const { loading: roleLoading } = useCheckPermission(["role_master"]);
  if (roleLoading) return null;
  return (
    <div className="w-full flex ">
      <SideBarComponent />
      <div className="w-full max-h-screen block bg-white  ">
        <StyledHeader />
        <StyledBreadcrumb
          items={["Master", "Roles", "Detail Role"]}
          links={["", "/roles", `/roles/detail-role/${idRole}`]}
          triggerClass={"pb-0"}
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
              <div className="flex flex-row justify-end items-end">
                <div
                  className={`w-full hidden ${
                    isCheckRole ? "laptop:flex" : "laptop:hidden"
                  } justify-end items-end pr-2`}
                >
                  <Button
                    onClick={deleteRoleForm}
                    type="button"
                    className="text-white font-normal min-w-[150px] bg-red_login hover:bg-red_login_hover"
                  >
                    <Image
                      alt=""
                      src={IconDeleteWhite}
                      width={24}
                      height={24}
                      className="text-white mr-2"
                    />
                    Delete
                  </Button>
                </div>

                {roleDetail &&
                  roleDetail?.name != "admin" &&
                  roleDetail?.name != "staff" &&
                  roleDetail?.name != "leader" && (
                    <Button
                      type="button"
                      onClick={goToEditScreen}
                      className="hidden font-normal laptop:flex min-w-[150px] bg-button-edit hover:bg-button-edit-hover"
                    >
                      <Image
                        alt=""
                        src={IconEditWhite}
                        width={24}
                        height={24}
                        className="text-white mr-2"
                      />
                      <p className={"text-white"}>{i18nRole("editButton")}</p>
                    </Button>
                  )}
                <div className="w-full pl-2 hidden laptop:flex justify-end items-end ">
                  <Button
                    onClick={() => {
                      router.replace(`/roles`);
                    }}
                    type="button"
                    className="text-black font-normal min-w-[150px] bg-white border border-border hover:bg-gray-200"
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
                </div>
              </div>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col laptop:space-y-2 w-full p-2 pb-0 laptop:pb-2 laptop:px-5 rounded-md overflow-y-auto hide-scrollbar bg-orange-50 border border-border"
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
                    disabled={true}
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
                    disabled={true}
                    render={({ field, fieldState }) => (
                      <FormItem className="w-full laptop:w-2/3">
                        <FormLabel
                          className={
                            "font-normal text-[14px] laptop:text-[16px]"
                          }
                        >
                          Description
                        </FormLabel>
                        <FormControl tabIndex={2}>
                          <Input
                            {...field}
                            className="border border-border focus:border-primary px-2 h-8 laptop:h-10 text-[14px] laptop:text-[16px] "
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
                        disable
                        selectedPermissionCds={permissionSelected}
                        data={permissionList}
                        form={form}
                      />
                    )}
                </div>
                {isMobile && (
                  <div className="fixed bottom-[8px] laptop:bottom-[60px] right-0 laptop:right-[62px] left-0 laptop:left-auto flex flex-1 flex-row justify-end items-end gap-x-2 laptop:gap-x-4 gap-y-2 laptop:gap-y-3 mx-4 laptop:mx-0">
                    <Button
                      onClick={deleteRoleForm}
                      type="button"
                      className={`${isCheckRole ? 'flex' : 'hidden'} w-[100px] laptop:w-[152px] h-[32px] laptop:h-[50px] font-normal border border-border text-white bg-red_login hover:bg-red_login_hover text-[12px] laptop:text-[14px] rounded-lg`}
                    >
                      Delete
                    </Button>
                    {roleDetail &&
                      roleDetail?.name != "admin" &&
                      roleDetail?.name != "staff" &&
                      roleDetail?.name != "leader" && (
                        <Button
                          type="button"
                          onClick={goToEditScreen}
                          className="w-[100px] laptop:w-[152px] h-[32px] laptop:h-[50px] font-normal border border-border bg-button-edit hover:bg-button-edit-hover text-[12px] laptop:text-[14px] rounded-lg"
                        >
                          <p className={"text-white"}>Edit</p>
                        </Button>
                      )}
                    <Button
                      type="button"
                      className="w-[100px] laptop:w-[152px] h-[32px] laptop:h-[50px] font-normal border border-border bg-white text-[12px] laptop:text-[14px] hover:bg-gray-200 rounded-lg"
                      onClick={onBackToList}
                    >
                      Role List
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>

      <AlertDialogSubmitFormButton
        tabIndex={16}
        title={"Delete role"}
        onConfirm={deleteRole}
        open={openSubmitDialog}
        onOpenChange={setOpenSubmitDialog}
        description="Are you sure you want to delete this role?"
      />
    </div>
  );
}
