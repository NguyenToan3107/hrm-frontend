import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import React from "react";

interface Props {
  disabled?: boolean;
  field?: any;
  items?: any[];
  tabIndex?: number;
  triggerClass?: string;
  triggerContentClass?: string;
  iconRight?: string | StaticImport;
}

export default function StyledSelected(props: Props) {
  const {
    field,
    disabled,
    items = [],
    tabIndex,
    triggerClass,
    triggerContentClass,
    iconRight,
  } = props;
  return (
    <Select
      key={field.value}
      onValueChange={field.onChange}
      defaultValue={field?.value || ""}
      value={field.value || ""}
    >
      <SelectTrigger
        tabIndex={tabIndex}
        disabled={disabled}
        style={{
          color: !field.value ? "var(--secondary)" : "black",
        }}
        className={cn(
          "border border-border focus:border-primary px-2 h-10 disabled:opacity-100",
          triggerClass
        )}
      >
        <p>{items.find((item) => item.value == field.value)?.name}</p>
        {iconRight && <Image src={iconRight} alt="" className="h-5 w-5" />}
      </SelectTrigger>
      {items.length > 0 && (
        <SelectContent className={cn("bg-white", triggerContentClass)}>
          {items.map((item, index) => {
            return (
              <SelectItem
                key={String(index)}
                value={item.value}
                className=" px-2"
              >
                <div className="flex flex-row w-full items-center gap-x-1 ">
                  {field.value == item.value ? (
                    <Check className={` h-4 w-4`} />
                  ) : (
                    <div className={` h-4 w-4`} />
                  )}
                  <p> {item.name}</p>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      )}
    </Select>
  );
}
