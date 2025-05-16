"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useRef, useState } from "react";

interface Props extends React.HTMLProps<HTMLDivElement> {
  content: string;
  cancelRequestContent?: string;
  // disable: boolean;
}

export function StyledTooltipLeave(props: Props) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      setIsOverflowing(textRef.current.scrollHeight > 52);
    }
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <p
            ref={textRef}
            className="text-[16px] max-h-[52px] font-normal pl-2 line-clamp-2 overflow-hidden break-words"
            // style={{
            //   display: "-webkit-box",
            //   WebkitLineClamp: 2, // Giới hạn số dòng
            //   WebkitBoxOrient: "vertical",
            //   maxHeight: "52px", // Chiều cao tối đa
            //   whiteSpace: "normal",
            //   overflow: "hidden",
            // }}
          >
            {props.content}
          </p>
        </TooltipTrigger>
        {isOverflowing && (
          <TooltipContent className="bg-white p-1 whitespace-pre-wrap text-black">
            {props.cancelRequestContent && (
              <p className="text-sm whitespace-pre-wrap">
                <span className="font-bold">(Cancel request Reason:</span>
                <span className="text-sm">{props?.cancelRequestContent}</span>
                <span className="font-bold"> )</span>
              </p>
            )}
            <p className="text-sm whitespace-pre-wrap">{props.content}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
