import { isToday } from "date-fns";
import { StyledTooltip } from "../common/StyledToolTip";
import { useMemo } from "react";
import { formatDateToString } from "@/utilities/format";
import { useScheduleStore } from "@/stores/scheduleStore";
import DayContent from "./tooltip/DayContent";

export interface DateProps {
  title?: string;
  date: Date;
  isSpecial?: boolean;
  type: "off" | "work";
  description?: string;
  isDayOfOtherMonth?: boolean;
}

export default function Day(props: DateProps) {
  const { date, isSpecial = false, type, isDayOfOtherMonth = false } = props;
  const { dayOffList } = useScheduleStore((state) => state);
  const getDateInfo = useMemo(() => {
    return dayOffList.find(
      (item) => item.day_off === formatDateToString(props.date)
    );
  }, [dayOffList]);

  return (
    <StyledTooltip
      disable={!isSpecial}
      content={
        <DayContent
          dayType={getDateInfo?.status}
          dayDescription={getDateInfo?.description}
        />
      }
    >
      <div
        className={`relative flex flex-col h-6 w-6 hover:cursor-pointer ${
          isToday(date) ? `bg-primary` : `bg-transparent`
        } hover:bg-gray-200  rounded-full items-center justify-center ${
          isDayOfOtherMonth && "opacity-50 bg-transparent "
        }`}
      >
        <p
          className={`text-[14px] font-semibold ${
            isToday(date)
              ? isDayOfOtherMonth
                ? `text-black`
                : `text-white`
              : type == "work"
              ? `text-black`
              : "text-red-500"
          } hover:text-primary ${isDayOfOtherMonth && `text-black`}`}
        >
          {date.getDate().toString()}
        </p>
        {isSpecial && (
          <div
            className={`w-1 h-1 rounded-full ${
              isToday(date) ? `bg-white` : `bg-primary`
            } `}
          />
        )}
      </div>
    </StyledTooltip>
  );
}
