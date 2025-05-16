import * as React from "react";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: StaticImport;
  endIcon?: StaticImport;
  endIconOnClick?(): void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, endIconOnClick, ...props }, ref) => {
    const StartIcon = startIcon;
    const EndIcon = endIcon;

    return (
      <div className="w-full relative">
        {StartIcon && (
          <div className="absolute left-1.5 top-1/2 transform -translate-y-1/2">
            <Image
              src={StartIcon}
              alt=""
              className="text-muted-foreground h-4 w-4"
            />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md  bg-background py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed ",
            startIcon ? "pl-8" : "",
            endIcon ? "pr-8" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        {EndIcon && (
          <div
            onClick={endIconOnClick}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
          >
            <Image
              src={EndIcon}
              alt=""
              className="text-muted-foreground h-4 w-4"
            />
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
