"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FormControl } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useCommonStore } from "@/stores/commonStore";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

export const options: Option[] = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
  { id: 4, name: "Date" },
  { id: 5, name: "Huang Wei" },
  { id: 6, name: "Ma Chi Down" },
  { id: 7, name: "Dieng Gia" },
  { id: 8, name: "HuaWei" },
];

interface Props {
  field: any;
  form: any;
  disable: boolean;
}

type Option = {
  id: number;
  name: string;
};

export function StyledComboboxDepartment(props: Props) {
  const { field, form, disable } = props;

  const [selectedItems, setSelectedItems] = useState<Option[]>([]);

  const { departmentData } = useCommonStore((state) => state);

  useEffect(() => {
    setSelectedItems(field?.value || []);
  }, [field.value]);
  // Function to toggle selection of an option
  const toggleSelection = (item: Option) => {
    setSelectedItems((prevSelectedItems) => {
      const newItem = prevSelectedItems.some((i) => i.id === item.id)
        ? prevSelectedItems.filter((i) => i.id !== item.id)
        : [...prevSelectedItems, item];
      form.setValue(field.name, newItem);
      form.setValue("leaderId", null);
      form.trigger(field.name);
      return newItem;
    });
  };

  const renderListDepartment = () => {
    return (
      <div className=" flex w-full h-10 items-center overflow-x-auto hide-scrollbar">
        {selectedItems.map((item) => (
          <p
            key={item.id}
            className="px-2 py-1 bg-gray-300 mx-1 rounded-sm"
          >
            {item.name}
          </p>
        ))}
      </div>
    );
  };

  return (
    <Popover>
      <PopoverTrigger disabled={disable} asChild>
        <FormControl>
          <Button
            disabled={disable}
            role="combobox"
            className={cn(
              "border border-border focus:border-primary px-2 h-10 bg-white w-full justify-start disabled:opacity-100"
            )}
          >
            {selectedItems?.length == 0 ? (
              <p className="text-[14px] font-normal"></p>
            ) : (
              renderListDepartment()
            )}
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="flex flex-col flex-1 bg-white p-0 max-h-[340px] overflow-y-auto ">
        <Command>
          <CommandList>
            <CommandEmpty>No Data.</CommandEmpty>
            <CommandGroup>
              {departmentData.map((i) => (
                <CommandItem
                  key={i.id}
                  value={i.name}
                  onSelect={() => {
                    toggleSelection(i);
                  }}
                  className="w-full bg-red-white hover:bg-gray-200 hover:cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedItems.map((i) => i.name).includes(i.name)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {i.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
