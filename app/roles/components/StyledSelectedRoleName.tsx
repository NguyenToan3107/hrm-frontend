import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import ArrowDownIcon from "@/app/assets/icons/icon-arrow-down.svg";
import Image from "next/image";

interface Props {
  disabled?: boolean;
  field?: any;
  items?: any[];
  tabIndex?: number;
  triggerClass?: string;
  triggerContentClass?: string;
}

export default function StyledSelectedRoleName(props: Props) {
  const { field, disabled, items = [], tabIndex, triggerClass, triggerContentClass } = props;

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
        <SelectValue>
          {items.find((item) => item.role_name == field.value)?.role_name}
        </SelectValue>
        <Image src={ArrowDownIcon} alt="" className="h-5 w-5" />
      </SelectTrigger>
      {items.length > 0 && (
        <SelectContent className="bg-white">
          <div
            className={cn(
              `max-h-[180px]`,
              triggerContentClass
            )}
          >
            {items.map((item, index) => {
              return (
                <SelectItem
                  key={String(index)}
                  value={item.role_name}
                  className=" px-2"
                >
                  <div className="flex flex-row w-full items-center gap-x-1 ">
                    {field.value == item.role_name ? (
                      <Check className={`h-4 w-4`} />
                    ) : (
                      <div className={`h-4 w-4`} />
                    )}
                    <p> {item.role_name}</p>
                  </div>
                </SelectItem>
              );
            })}
          </div>
        </SelectContent>
      )}
    </Select>
  );
}
