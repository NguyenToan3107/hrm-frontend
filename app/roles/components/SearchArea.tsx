import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { ITEM_PER_PAGE } from "@/utilities/static-value";

import { GetRoleListParams } from "@/apis/modules/role";
import IconAdd from "@/app/assets/icons/iconAdd.svg";
import IconSearch from "@/app/assets/icons/iconSearch.svg";
import { GetRoleListUseCase } from "@/core/application/usecases/role/getRoleList.usecase";
import { RoleRepositoryImpl } from "@/core/infrastructure/repositories/role.repo";
import { useRoleStore } from "@/stores/roleStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";

const roleRepo = new RoleRepositoryImpl();
const getRoleListUseCase = new GetRoleListUseCase(roleRepo);

const formSchema = z.object({
  name: z.string().optional(),
});

interface Props {
  loading: boolean;
  setLoading(loading: boolean): void;
  setPage(page: number): void;
}

export default function SearchArea(props: Props) {
  const { setLoading, setPage } = props;
  const route = useRouter();
  const i18nRole = useTranslations("Role");

  const { updateRoleListData, updateSearchParams } = useRoleStore(
    (state) => state
  );

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const params: GetRoleListParams = {
        page: 1,
        name: data?.name,
        limit: ITEM_PER_PAGE,
      };
      const response = await getRoleListUseCase.execute(params);
      setPage(1);
      updateRoleListData(response?.data, response?.totalItem || 0);
      updateSearchParams(params);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onAddNewRole = () => {
    route.push("/roles/create-role");
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  return (
    <div className="h-full laptop:h-[100px]">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className=" w-full flex flex-row items-end"
        >
          <div className="flex flex-col laptop:flex-row flex-1 laptop:items-center gap-x-4 ">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full laptop:w-[220px]">
                  <FormLabel className=" font-normal text-[16px]">
                    Role name
                  </FormLabel>
                  <FormControl>
                    <Input
                      tabIndex={1}
                      placeholder="Role Name"
                      {...field}
                      className="border border-border focus:border-primary px-2 "
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="items-center gap-x-4 flex justify-end ">
            <Button
              tabIndex={5}
              className="w-[124px] h-11 font-normal text-white text-[16px] bg-button-search hover:bg-button-search-hover"
              type="submit"
            >
              <Image
                src={IconSearch}
                alt=""
                width={20}
                height={20}
                className="mr-2"
              />
              {i18nRole("searchButton")}
            </Button>
            <Button
              tabIndex={6}
              className="w-[124px] font-normal h-11 text-white text-[16px] bg-button-create  hover:bg-button-create-hover"
              type="button"
              onClick={onAddNewRole}
            >
              <Image
                src={IconAdd}
                alt=""
                width={24}
                height={24}
                className="mr-2"
              />
              {i18nRole("createButton")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
