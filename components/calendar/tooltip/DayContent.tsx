import React, { useMemo } from "react";

interface Props {
  dayType?: string | number;
  dayDescription?: string;
}
export default function DayContent(props: Props) {
  const { dayType, dayDescription } = props;
  const dayTypeName = useMemo(() => {
    if (dayType == 0) return "Day off";
    else if (dayType == 1) return "Work day";
    return "";
  }, [dayType]);

  return (
    <div>
      <div className="p-5 w-full rounded-md">
        <p className="text-[20px] font-semibold">Day information</p>
        <div className={"flex flex-col gap-y-1 mt-2"}>
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
            <p className="pl-1 whitespace-pre-wrap text-start max-w-[300px]">
              {dayDescription}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
