"use client";

import IconCalendar from "@/app/assets/icons/iconCalendar.svg";
import { format } from "date-fns";

import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import Image from "next/image";

interface Props {
  form: any;
  name: string;
  label?: string;
  title?: string;
}
export function StyledDatePickerForSearch(props: Props) {
  const calendarRef = useRef<any>(null);
  const { form, name, label = "", title = "" } = props;
  const [open, setOpen] = useState(false);
  useEffect(() => {
    // Hàm để đóng khi nhấp ra ngoài
    const handleClickOutside = (event: any) => {
      if (
        calendarRef.current &&
        !calendarRef.current?.contains?.(event.target)
      ) {
        setOpen(false); // Đóng khi nhấp ra ngoài
      }
    };

    // Gắn sự kiện click cho document
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up sự kiện khi component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setOpen]);
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem className="flex flex-col w-full">
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div
                onClick={() => {
                  setOpen(true);
                }}
                className={cn(
                  "w-full p-2 h-10 laptop:h-11 rounded-[8px] text-left font-normal border border-border flex items-center justify-center"
                )}
              >
                {field.value ? (
                  format(field.value, "yyyy/MM/dd")
                ) : (
                  <span>Select date</span>
                )}
                <Image src={IconCalendar} alt="" className="ml-auto" />
              </div>
            </FormControl>
            {open && (
              <>
                {isMobile && (
                  <div
                    className="fixed inset-0 bg-transparent z-[999] border"
                    onClick={() => setOpen(false)}
                  />
                )}
                <div
                  ref={calendarRef}
                  className={cn(
                    "absolute bg-white border border-border p-1 shadow-md w-auto z-[1000]",
                    isMobile
                      ? "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      : "mt-4 transform  translate-y-12"
                  )}
                >
                  <p className="text-[16px] laptop:text-[20px] text-center font-semibold mt-2 ">
                    {title}
                  </p>
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(value) => {
                      field.onChange(value);
                      setOpen(false);
                    }}
                    disabled={(date) => date < new Date("1900-01-01")}
                    className="z-[1000]"
                  />
                </div>
              </>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
