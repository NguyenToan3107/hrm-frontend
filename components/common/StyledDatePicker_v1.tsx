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
import { useEditingStore } from "@/stores/commonStore";
import { DATE } from "@/utilities/format";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";

interface Props {
  title?: string;
  field: any;
  tabIndex?: number;
}
export function StyledDatePicker_v1(props: Props) {
  const { field } = props;
  const { isEditing } = useEditingStore((state) => state);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        asChild
        className={`${isEditing ? "" : "pointer-events-none"}`}
      >
        <Button
          variant={"outline"}
          className={cn(
            "w-full h-[40px] justify-start text-left font-normal border border-border px-2 focus:border-primary",
            !field.value &&
              `text-muted-foreground px-0 ${
                !isEditing ? "hover:cursor-not-allowed" : ""
              }`
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
          <Image
            src={IconCalendar}
            alt=""
            className="mx-2 h-5 w-5 laptop:h-6 laptop:w-6"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white" side="bottom" align="end">
        <DatePicker
          dateFormat={"dd/MM/yyyy"}
          selected={field.value}
          onChange={field.onChange}
          onCalendarClose={() => {
            setIsOpen(false);
          }}
          className="mx-2"
          renderDayContents={(day, date) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected =
              field.value && date.toDateString() === field.value.toDateString(); // Kiểm tra nếu ngày được chọn

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
      </PopoverContent>
    </Popover>
  );
}
