"use client";

import { Check } from "lucide-react";
import * as React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { StyledTooltip } from "./StyledToolTip";

interface Props {
  disabled?: boolean;
  field?: any;
  items?: any[];
  tabIndex?: number;
  triggerClass?: string;
  triggerButtonClass?: string;
  loading: boolean;
}

export function StyledSelectUserDropdown(props: Props) {
  const {
    field,
    loading,
    items = [],
    tabIndex,
    triggerClass,
    triggerButtonClass,
    disabled,
  } = props;

  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    field.onChange(value);
  }, [value]);

  React.useEffect(() => {
    setValue('')
  }, [items]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        disabled={loading || disabled}
        tabIndex={tabIndex}
        className={cn(
          "border border-border focus:border-primary h-6 disabled:opacity-100 w-full",
          triggerClass
        )}
      >
        <button
          role="combobox"
          aria-expanded={open}
          style={{
            color: !field.value ? "var(--secondary)" : "black",
          }}
          className={cn(
            "flex bg-white w-full justify-start text-black px-0 rounded-md ",
            triggerButtonClass
          )}
        >
          <StyledTooltip
            disable={false}
            content={
              value
                ? items.find((item) => item.value == value)?.name
                : field.value
                ? items.find((item) => item.value == field?.value)?.name
                : "Select users..."
            }
          >
            <p className="w-full text-[14px] px-0 line-clamp-1 text-ellipsis text-start">
              {value
                ? items.find((item) => item.value == value)?.name
                : field.value
                ? items.find((item) => item.value == field?.value)?.name
                : "Select users..."}
            </p>
          </StyledTooltip>
        </button>
      </PopoverTrigger>
      {loading && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-10 flex items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <>
            <svg
              className="w-5 h-5 mr-2 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="white"
                d="M4 12a8 8 0 018-8v8l5 3-5 3V4a8 8 0 00-8 8z"
              />
            </svg>
          </>
        </div>
      )}
      <PopoverContent className="w-full min-w-[var(--radix-popper-anchor-width)] flex-1 p-0 bg-white">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandList>
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup>
              {items.map((i) => {
                return (
                  <CommandItem
                    key={i.value}
                    value={i.value}
                    onSelect={() => {
                      setValue(i?.value === value ? "" : i?.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value == i.value
                          ? "opacity-100"
                          : field.value == i.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {i.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
