import { GetRoleListParams } from "@/apis/modules/role";
import { GetStaffListParams } from "@/apis/modules/user";
import ArrowDownIcon from "@/app/assets/icons/icon-arrow-down.svg";
import IconFilter from "@/app/assets/icons/iconFilter.svg";
import IconFilterWhite from "@/app/assets/icons/iconFilterWhite.svg";
import StyledSelectedRoleName from "@/app/roles/components/StyledSelectedRoleName";
import StyledSelected from "@/app/staffs/components/StyledSelected";
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
import { GetRoleListUseCase } from "@/core/application/usecases/role/getRoleList.usecase";
import { GetStaffListUseCase } from "@/core/application/usecases/staff-master/getUserList.usecase";
import { RoleRepositoryImpl } from "@/core/infrastructure/repositories/role.repo";
import { UserRepositoryImpl } from "@/core/infrastructure/repositories/user.repo";
import { useStaffStore } from "@/stores/staffStore";
import {
  ITEM_PER_PAGE,
  MAX_ROLE_DROPDOWN_SIZE,
  STAFF_STATUS,
  STAFF_STATUS_WORKING,
} from "@/utilities/static-value";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { KeyboardEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { X } from "lucide-react";

const userRepo = new UserRepositoryImpl();
const getStaffListUseCase = new GetStaffListUseCase(userRepo);
const roleRepo = new RoleRepositoryImpl();
const getRoleListUseCase = new GetRoleListUseCase(roleRepo);
const formSchema = z.object({
  keyword: z.string().optional(),
  status: z.string().optional(),
  role: z.string().optional(),
  statusWorking: z.string().optional(),
});

interface Props {
  loading: boolean;
  setLoading(loading: boolean): void;
  setPage(page: number): void;
}

export function SearchAreaMobile(props: Props) {
  const { setLoading, setPage } = props;
  const [open, setOpen] = useState(false);
  const [listRole, setListRole] = useState();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  const { updateStaffListData, updateSearchParams, searchParams } =
    useStaffStore((state) => state);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const params: GetStaffListParams = {
        page: 1,
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
      setOpen(false);
    } catch (error) {
    } finally {
      setLoading(false);
    }
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

  const checkSearchParamExist = () => {
    const checkSearchParam =
      form.getValues("keyword") != "" ||
      form.getValues("role") != "All" ||
      form.getValues("status") != "1" ||
      form.getValues("statusWorking") != "-1";
    if (checkSearchParam) return true;
    else return false;
  };

   const handleClose = () => {
    setOpen(false)
   };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-80 z-10 laptop:hidden ${
          open ? "visible" : "hidden"
        }`}
        onClick={handleClose}
      />
      <div>
        {/* Trigger button */}
        <div onClick={() => setOpen(!open)}>
          <Image
            height={28}
            width={36}
            src={checkSearchParamExist() ? IconFilterWhite : IconFilter}
            alt=""
            className={twMerge(
              "hover:cursor-pointer hover:bg-slate-100 rounded-sm px-1 py-[2px]",
              checkSearchParamExist() && "bg-button-search"
            )}
          />
        </div>

        {open && (
          <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-[425px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg border border-border">
            <div
              onClick={handleClose}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </div>
            <div className="text-[20px] font-semibold mb-4 text-center">
              Filter
            </div>
            <div className="gap-2">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex-col"
                >
                  <div className="flex flex-col w-full flex-1 gap-x-4 gap-y-3">
                    <FormField
                      control={form.control}
                      name="keyword"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel className=" font-normal text-[14px]">
                            Keyword:
                          </FormLabel>
                          <FormControl>
                            <Input
                              tabIndex={1}
                              onKeyDown={handleKeyDown}
                              placeholder="ID, Name, Email"
                              {...field}
                              className=" border border-border focus:border-primary px-2"
                              enterKeyHint="done"
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
                          <FormItem className="w-full">
                            <FormLabel className=" font-normal text-[14px]">
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
                    <div className="flex flex-row gap-x-3">
                      <FormField
                        control={form.control}
                        name="statusWorking"
                        render={({ field }) => {
                          return (
                            <FormItem className="w-full">
                              <FormLabel className=" font-normal text-[14px]">
                                Working Status
                              </FormLabel>
                              <StyledSelected
                                items={[
                                  { value: "-1", name: "All" },
                                  ...STAFF_STATUS_WORKING,
                                ]}
                                field={field}
                                tabIndex={3}
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
                            <FormItem className="w-full">
                              <FormLabel className=" font-normal text-[14px]">
                                Status
                              </FormLabel>
                              <StyledSelected
                                items={[
                                  { value: "-1", name: "All" },
                                  ...STAFF_STATUS,
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
                    </div>
                  </div>
                  <div className="flex items-center justify-center mt-6">
                    <Button
                      onClick={form.handleSubmit(onSubmit)}
                      type="submit"
                      className="text-[14px] bg-button-search hover:bg-button-search-hover text-white w-[80px] h-8 "
                    >
                      Search
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
