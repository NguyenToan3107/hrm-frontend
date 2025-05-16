"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";

import DecreaseIcon from "@/app/assets/icons/decreaseIcon.svg";
import SortIcon from "@/app/assets/icons/sortIcon.svg";
import { SortOrder } from "@/utilities/enum";
import { isMobile } from "react-device-detect";
import { twMerge } from "tailwind-merge";

interface Props {
  currentSortedColumnId?: string;
  direction?: SortOrder.ASC | SortOrder.DESC | "";
  columnName: string;
  columnNameId: string;
  style?: string;
  isQuickSearch?: boolean;
  onQuickSearch?(): void;
}
export default function StyledHeaderColumn(props: Props) {
  const {
    currentSortedColumnId,
    direction,
    columnName,
    columnNameId,
    style,
    // isQuickSearch = false,
    // onQuickSearch = () => {},
  } = props;
  if (currentSortedColumnId === undefined) {
    return (
      <div className="flex  ">
        <p
          className={twMerge(
            "laptop:text-[16px] text-[14px] text-white text-start line-clamp-2 text-ellipsis w-full",
            style
          )}
        >
          {columnName}
        </p>
      </div>
    );
  }

  const iconSize = isMobile ? 20 : 24;
  return (
    <div className="flex items-center justify-start text-center hover:cursor-pointer ">
      {currentSortedColumnId !== columnNameId ? (
        <Image height={iconSize} width={iconSize} src={SortIcon} alt="" />
      ) : (
        <Image
          height={iconSize}
          width={iconSize}
          src={DecreaseIcon}
          alt=""
          className={cn(direction === SortOrder.ASC && "rotate-180")}
        />
      )}
      <p
        className={cn(
          "laptop:text-[16px] text-[14px] text-white text-start line-clamp-2 text-ellipsis whitespace-pre-wrap",
          style
        )}
      >
        {columnName}
      </p>
      {/* {isQuickSearch && (
        <p
          onClick={(e) => {
            e.stopPropagation();
            onQuickSearch();
          }}
          className={cn(
            "p-[2px] ml-2 laptop:text-[12px] text-[12px] text-start line-clamp-2 text-ellipsis whitespace-pre-wrap text-white underline hover:bg-sky-300",
            style
          )}
        >
          * me
        </p>
      )} */}
    </div>
  );
}
