import { GetRoleListParams } from "@/apis/modules/role";
import IconFilter from "@/app/assets/icons/iconFilter.svg";
import IconFilterWhite from "@/app/assets/icons/iconFilterWhite.svg";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { GetRoleListUseCase } from "@/core/application/usecases/role/getRoleList.usecase";
import { RoleRepositoryImpl } from "@/core/infrastructure/repositories/role.repo";
import { useRoleStore } from "@/stores/roleStore";
import { ITEM_PER_PAGE } from "@/utilities/static-value";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { KeyboardEvent, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
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

export function SearchAreaPopup(props: Props) {
  const { setLoading, setPage } = props;

  const roleNameInputRef = useRef<HTMLInputElement>(null);
  const buttonSearchRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  const { updateRoleListData, updateSearchParams, searchParams } = useRoleStore(
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
      setOpen(false);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Image
          height={28}
          width={36}
          src={searchParams?.name?.length ? IconFilterWhite : IconFilter}
          alt=""
          className={twMerge(
            "hover:cursor-pointer hover:bg-slate-100 rounded-sm px-1",
            searchParams?.name?.length && "bg-button-search"
          )}
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-semibold">
            Filter
          </DialogTitle>
        </DialogHeader>
        <div className="gap-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className=" w-full flex flex-col items-end"
            >
              <div className="flex flex-col w-full flex-1  gap-x-4 ">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className=" font-normal text-[14px]">
                        Role
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          ref={roleNameInputRef}
                          onKeyDown={handleKeyDown}
                          placeholder="Role Name"
                          enterKeyHint="done"
                          className="border border-border focus:border-primary px-2 text-[14px] w-full"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
        <DialogFooter className="flex items-center">
          <Button
            ref={buttonSearchRef}
            onClick={form.handleSubmit(onSubmit)}
            type="submit"
            className="text-[14px] bg-button-search hover:bg-button-search-hover text-white w-[80px] h-8 "
          >
            Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
