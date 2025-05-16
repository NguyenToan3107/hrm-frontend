import { Button } from "@/components/ui/button";
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
  ITEM_PER_PAGE,
  MAX_ROLE_DROPDOWN_SIZE,
  STAFF_STATUS,
  STAFF_STATUS_WORKING,
} from "@/utilities/static-value";

import { GetStaffListParams } from "@/apis/modules/user";
import IconAdd from "@/app/assets/icons/iconAdd.svg";
import IconSearch from "@/app/assets/icons/iconSearch.svg";
import StyledSelected from "@/app/staffs/components/StyledSelected";
import ArrowDownIcon from "@/app/assets/icons/icon-arrow-down.svg";
import { GetStaffListUseCase } from "@/core/application/usecases/staff-master/getUserList.usecase";
import { UserRepositoryImpl } from "@/core/infrastructure/repositories/user.repo";
import { useStaffStore } from "@/stores/staffStore";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GetRoleListUseCase } from "@/core/application/usecases/role/getRoleList.usecase";
import { RoleRepositoryImpl } from "@/core/infrastructure/repositories/role.repo";
import { GetRoleListParams } from "@/apis/modules/role";
import StyledSelectedRoleName from "@/app/roles/components/StyledSelectedRoleName";

const userRepo = new UserRepositoryImpl();
const getStaffListUseCase = new GetStaffListUseCase(userRepo);

const roleRepo = new RoleRepositoryImpl();
const getRoleListUseCase = new GetRoleListUseCase(roleRepo);

const formSchema = z.object({
  keyword: z.string().optional(),
  // position: z.string(),
  status: z.string().optional(),
  role: z.string().optional(),
  statusWorking: z.string().optional(),
});

interface Props {
  loading: boolean;
  setLoading(loading: boolean): void;
  setPage(page: number): void;
}
export default function SearchArea(props: Props) {
  const { setLoading, setPage } = props;
  const route = useRouter();

  const { updateStaffListData, updateSearchParams, searchParams } =
    useStaffStore((state) => state);
  // const { positionData } = useCommonStore((state) => state);
  const [listRole, setListRole] = useState();
  const i18nStaff = useTranslations("Staff");
  const queryParams = useSearchParams();

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const params: GetStaffListParams = {
        page: 1,
        // position: data?.position == "-1" ? undefined : data?.position,
        status: !data?.status ? undefined : Number(data?.status),
        type:
          !data?.statusWorking || data?.statusWorking == "-1"
            ? undefined
            : Number(data?.statusWorking),
        keyword: data?.keyword,
        role: data?.role,
        limit: ITEM_PER_PAGE,
      };

      const response = await getStaffListUseCase.execute(params);
      setPage(1);
      updateStaffListData(response?.data, response?.totalItem || 0);
      updateSearchParams(params);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onAddNewStaff = () => {
    route.push("/staffs/create-staff");
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      keyword: "",
      role: "All",
      status: "1",
      statusWorking: "-1",
    },
  });

  const onListRole = async () => {
    try {
      const params: GetRoleListParams = { limit: MAX_ROLE_DROPDOWN_SIZE };
      const response = await getRoleListUseCase.execute(params);
      setListRole(response?.data);
    } catch (error) {}
  };
  useEffect(() => {
    if (searchParams?.keyword) {
      form.setValue("keyword", searchParams?.keyword || "");
    }
    if (searchParams?.type) {
      form.setValue("statusWorking", String(searchParams?.type) || "-1");
    }
    if (searchParams?.role) {
      form.setValue("role", String(searchParams?.role) || "-1");
    }
    onListRole();
  }, []);

  useEffect(() => {
    if (queryParams.get("role") || queryParams.get("status")) {
      const roleName = queryParams.get("role") || "";
      const status = queryParams.get("status") || "-1";

      form.setValue("role", roleName);
      form.setValue("status", status);
      form.handleSubmit(onSubmit)();
    }
  }, [listRole]);

  return (
    <div className="h-full laptop:h-[150px]">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-col w-full"
        >
          <div className="flex flex-col laptop:flex-row w-full flex-1 laptop:items-center gap-x-4 ">
            <FormField
              control={form.control}
              name="keyword"
              render={({ field }) => (
                <FormItem className="w-full laptop:w-[220px]">
                  <FormLabel className=" font-normal text-[16px]">
                    Keyword:
                  </FormLabel>
                  <FormControl>
                    <Input
                      tabIndex={1}
                      placeholder="ID, Name, Email"
                      {...field}
                      className=" border border-border focus:border-primary px-2 "
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => {
                return (
                  <FormItem className="w-full laptop:w-[220px]">
                    <FormLabel className=" font-normal text-[16px]">
                      Role
                    </FormLabel>
                    <StyledSelectedRoleName
                      items={[
                        { value: -1, id: -1, role_name: "All" },
                        ...(listRole || []),
                      ]}
                      field={field}
                      tabIndex={2}
                    />
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="statusWorking"
              render={({ field }) => {
                return (
                  <FormItem className="w-full laptop:w-[220px]">
                    <FormLabel className=" font-normal text-[16px]">
                      Working Status
                    </FormLabel>
                    <StyledSelected
                      items={[
                        { value: "-1", name: "All" },
                        ...STAFF_STATUS_WORKING,
                      ]}
                      field={field}
                      tabIndex={4}
                      iconRight={ArrowDownIcon}
                    />
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => {
                return (
                  <FormItem className="w-full laptop:w-[220px]">
                    <FormLabel className=" font-normal text-[16px]">
                      Status
                    </FormLabel>
                    <StyledSelected
                      items={[{ value: "-1", name: "All" }, ...STAFF_STATUS]}
                      field={field}
                      tabIndex={5}
                      iconRight={ArrowDownIcon}
                    />
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>
          <div className="items-center gap-x-4 flex justify-end mt-4">
            <Button
              tabIndex={5}
              className="w-[124px] font-normal h-11 text-white text-[16px] bg-button-search hover:bg-button-search-hover"
              type="submit"
            >
              <Image
                src={IconSearch}
                alt=""
                width={20}
                height={20}
                className="mr-2"
              />
              {i18nStaff("searchButton")}
            </Button>
            <Button
              tabIndex={6}
              className="w-[124px] h-11 font-normal text-white text-[16px] bg-button-create hover:bg-button-create-hover"
              type="button"
              onClick={onAddNewStaff}
            >
              <Image
                src={IconAdd}
                alt=""
                width={24}
                height={24}
                className="mr-2"
              />
              Create
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
