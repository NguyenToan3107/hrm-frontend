import { useScheduleStore } from "@/stores/scheduleStore";
import { formatDateToString } from "@/utilities/format";
import { isMobile } from "react-device-detect";
import { DateProps } from "./Day";
import MobilePopoverOfDay from "./popover/MobilePopoverOfDay";
import WebEditDayForm from "./popover/WebEditDayForm";

export interface WeekColumnProps {
  title: string;
  date: DateProps[];
}
export default function WeekColumn(props: WeekColumnProps) {
  const { date = [] } = props;
  const { dayOffList } = useScheduleStore((state) => state);

  return (
    <div className="flex flex-1 flex-col gap-y-2 justify-start items-center">
      <p className=" font-semibold text-[12px] text-gray-500">{props.title}</p>
      <div className={"flex flex-col gap-x-2 gap-y-[3px]"}>
        {date.map((item: DateProps, index: number) => {
          if (isMobile) {
            return (
              <MobilePopoverOfDay
                key={index.toString()}
                date={item.date}
                isSpecial={item.isSpecial}
                type={item.type}
                isDayOfOtherMonth={item.isDayOfOtherMonth}
              />
            );
          } else {
            const dateInfo = dayOffList.find(
              (i) => i.day_off == formatDateToString(item.date)
            );
            return (
              <WebEditDayForm
                key={index.toString()}
                type={item.type}
                isDayOfOtherMonth={item.isDayOfOtherMonth}
                // onClosePopover={handleClose}
                mode={item.isSpecial ? "edit" : "create"}
                title={dateInfo?.title}
                dayType={
                  dateInfo?.status === undefined ? "none" : dateInfo.status
                }
                dayDescription={dateInfo?.description || ""}
                updatedAt={String(dateInfo?.updated_at)}
                id={dateInfo?.id || ""}
                date={dateInfo?.day_off || formatDateToString(item.date) || ""}
              />
            );
          }
        })}
      </div>
    </div>
  );
}
