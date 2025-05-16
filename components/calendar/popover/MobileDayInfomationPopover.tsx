import React, { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  dayType?: string | number;
  dayDescription?: string;
}

export default function MobileDayInfomationPopover(props: Props) {
  const { dayType, dayDescription } = props;
  const dayTypeName = useMemo(() => {
    if (dayType == 0) return "Day off";
    else if (dayType == 1) return "Work day";
    return "";
  }, [dayType]);

  return (
    <Dialog>
      <DialogTrigger className="p-0 mx-0 w-full">
        <Button className={"text-white w-full rounded-sm"}>Information</Button>
      </DialogTrigger>
      <DialogContent className="px-5 py-8 w-[90%] rounded-md">
        <DialogTitle className="text-[20px] font-semibold">
          Day information
        </DialogTitle>
        <DialogDescription className={"flex flex-col gap-y-1"}>
          <div
            className={
              "flex items-center justify-start text-[16px] font-normal text-[#A2A1A8] "
            }
          >
            <p>Type:</p>
            <p className="pl-1">{dayTypeName}</p>
          </div>
          <div
            className={
              "flex items-start justify-start text-[16px] font-normal text-[#A2A1A8] "
            }
          >
            <p>Description:</p>
            <p className="pl-1 whitespace-pre-wrap text-start max-w-full">
              {dayDescription}
            </p>
          </div>
        </DialogDescription>
        {/* <DialogTitle>Leaves infomation</DialogTitle>
        <DialogDescription className=" flex flex-col gap-y-1">
          <div
            className={
              "flex items-center justify-start text-[16px] font-normal text-[#A2A1A8] "
            }
          >
            <p>Description:</p>
            <p className=" pl-1"></p>
          </div>
          <div
            className={
              "flex items-center justify-start text-[16px] font-normal text-[#A2A1A8]"
            }
          >
            <p>Time:</p>
            <p className=" pl-1"></p>
          </div>
          <div
            className={
              "flex items-center justify-start text-[16px] font-normal text-[#A2A1A8]"
            }
          >
            <p>Status:</p>
            <p className=" pl-1"></p>
          </div>
          <div
            className={
              "flex items-center justify-start text-[16px] font-normal text-[#A2A1A8]"
            }
          >
            <p>Type:</p>
            <p className=" pl-1"></p>
          </div>
        </DialogDescription> */}
      </DialogContent>
    </Dialog>
  );
}
