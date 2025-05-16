"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { isMobile } from "react-device-detect";

interface Props extends React.HTMLProps<HTMLDivElement> {
  content: any;
  disable?: boolean;
  contentClass?: string;
}
export function StyledTooltip(props: Props) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    if (isMobile) {
      setOpen((prev) => !prev)
    }
  };

  return (
    <TooltipProvider>
      <Tooltip open={isMobile ? open : undefined} onOpenChange={setOpen}>
        <TooltipTrigger asChild className=" hover:cursor-pointer" onClick={handleClick}>
          {props.children}
        </TooltipTrigger>
        <TooltipContent
          hidden={props.disable}
          className={twMerge(
            "bg-white p-1 whitespace-pre-wrap text-black overflow-y-auto",
            isMobile ? "max-w-[100vw] z-50 text-[12px]" : "",
            props.contentClass
          )}
        >
          {props.content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
