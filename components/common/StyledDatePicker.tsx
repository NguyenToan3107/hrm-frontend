"use client";

import { format } from "date-fns";

import IconCalendar from "@/app/assets/icons/iconCalendar.svg";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DATE } from "@/utilities/format";
import Image from "next/image";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  title: string;
  field: any;
  tabIndex?: number;
  disabled?: boolean;
  triggerClass?: string;
  minDate?: Date;
}
export function StyledDatePicker(props: Props) {
  const { field, disabled = false, triggerClass, minDate } = props;
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          className={cn(
            "w-full h-10 justify-end text-left px-2 bg-white font-normal border border-border focus:border-primary disabled:opacity-100  ",
            !field.value && "text-muted-foreground",
            triggerClass
          )}
          tabIndex={props.tabIndex}
        >
          {field.value ? (
            <p
              style={{
                color: !field.value ? "var(--secondary)" : "black",
              }}
              className="w-full text-secondary h-5"
            >
              {format(field?.value, DATE)}
            </p>
          ) : (
            <p className="w-full text-secondary h-5">{props.title}</p>
          )}
          <Image src={IconCalendar} alt="" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white" side="bottom" align="end">
        <div className=" relative">
          <DatePicker
            dateFormat={"dd/MM/yyyy"}
            disabled={disabled}
            selected={field.value}
            onChange={field.onChange}
            onCalendarClose={() => {
              setOpen(false);
            }}
            minDate={minDate}
            renderDayContents={(day, date) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected =
                field.value &&
                date.toDateString() === field.value.toDateString(); // Kiểm tra nếu ngày được chọn

              return (
                <span
                  className={`${
                    isToday && !isSelected
                      ? "bg-gray-200 rounded-[6px] px-[9px] py-[6px] z-[-1000]"
                      : ""
                  }`}
                >
                  {day}
                </span>
              );
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
