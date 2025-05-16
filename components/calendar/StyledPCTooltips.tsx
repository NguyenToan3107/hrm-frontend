import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface Props {
  // type:
}
export default function StyledPCTooltips(props: Props) {
  const {} = props;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>Hover</TooltipTrigger>
        <TooltipContent>
          <div className="bg-white p-5">
            <p className="font-semibold text-[20px]">Day information</p>
            <p className="font-semibold text-[20px]">Leaves information</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
