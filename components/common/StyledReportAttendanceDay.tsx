import {
  LeaveSalary,
  SalaryValue,
  ShiftValue,
  WorkTime,
} from "@/utilities/enum";
import { JAPANESE_DAYS_OF_WEEK } from "@/utilities/static-value";
import React, { useEffect, useMemo, useState } from "react";

interface Row {
  month: number;
  year: number;
  day: string;
  day_of_week_jp: number;
  is_working_day: boolean;
  salary: number | null;
  shift: number | null;
  day_off: null | 0 | 1;
  leave: boolean | null;
  is_weekend_day: boolean | null;
}

interface Props {
  row: Row;
}

const StyledReportAttendanceDay = (props: Props) => {
  const { row } = props;
  const [isLeave, setIsLeave] = useState<string>("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  useEffect(() => {
    if (row.is_working_day && row?.salary != null ) {
      if (row.shift === ShiftValue.ShiftMorning) {
        setStartTime(WorkTime.StartAfternoon);
        setEndTime(WorkTime.EndAfternoon);
      } else if (row.shift === ShiftValue.ShiftAfternoon) {
        setStartTime(WorkTime.StartMorning);
        setEndTime(WorkTime.EndMorning);
      } else if (row.shift === null) {
        setStartTime(WorkTime.StartMorning);
        setEndTime(WorkTime.EndAfternoon);
      } else if (row.shift === ShiftValue.ShiftAllDay) {
        setStartTime("");
        setEndTime("");
      }
    } else {
      setStartTime("");
      setEndTime("");
    }

    if (row?.leave) {
      if (row?.salary == SalaryValue.PaidLeave) {
        if (
          row?.shift == ShiftValue.ShiftMorning ||
          row?.shift == ShiftValue.ShiftAfternoon
        ) {
          setIsLeave(LeaveSalary.HalfDayLeave);
        } else if (row?.shift == ShiftValue.ShiftAllDay) {
          setIsLeave(LeaveSalary.DayLeave);
        }
      } else if (row?.salary == SalaryValue.UnPaidLeave) {
        if (
          row?.shift == ShiftValue.ShiftMorning ||
          row?.shift == ShiftValue.ShiftAfternoon
        ) {
          setIsLeave(LeaveSalary.HalfDayNoLeave);
        } else if (row?.shift == ShiftValue.ShiftAllDay) {
          setIsLeave(LeaveSalary.DayNoLeave);
        }
      } else if (row?.salary == SalaryValue.UnPaidLeaveHalf) {
        if (row?.shift == ShiftValue.ShiftAllDay) {
          setIsLeave(LeaveSalary.HalfDayNoLeave);
        }
      }
    }
  }, [row]);

  const backgroundColorRow = useMemo(() => {
    if(row?.is_weekend_day) {
      if (row?.day_off == null || row?.day_off == 0) return "#C5D9F1";
      else {
        if (row.shift == ShiftValue.ShiftAllDay) return "#FFFFCC";
        else "#FFFFFF";
      }
    } else {
        if (!row?.is_working_day || row.shift == ShiftValue.ShiftAllDay)
          return "#FFFFCC";
        else "#FFFFFF";
    }
  }, [row])

  return (
    <div
      className="flex w-full text-[10px] bg-white font-semibold"
      style={{
        backgroundColor: backgroundColorRow,
      }}
    >
      <div className="flex w-[15%] h-5 border border-t-0 border-black items-center ">
        <div className="flex w-1/3 h-5 border-r-0.5 border-black items-center justify-center">
          {row.month}
        </div>
        <div className="flex w-1/3 h-5 border-r-0.5 border-black items-center justify-center">
          {new Date(row.day).getDate()}
        </div>
        <div className="flex w-1/3 h-5 border-black items-center justify-center">
          {JAPANESE_DAYS_OF_WEEK[row.day_of_week_jp]}
        </div>
      </div>
      <div className="flex w-[19%] h-5 border border-t-0 border-black items-center">
        <div className="w-1/2 h-5 border-r border-black flex items-center justify-center">
          {startTime}
        </div>
        <div className="w-1/2 h-5 border-black flex items-center justify-center">
          {endTime}
        </div>
      </div>
      <div className="flex w-[19%] h-5 border border-t-0 border-black items-center">
        <div className="w-1/2 h-5 border-r border-black flex items-center justify-center"></div>
        <div className="w-1/2 h-5 border-black flex items-center justify-center"></div>
      </div>
      <div className="flex w-[30%] h-5 border border-t-0 border-black items-center">
        <div className="w-[40%] text-[9px] h-5 border-r border-black flex items-center justify-end pr-1">
          時間
        </div>
        <div className="w-[30%] text-[9px] h-5 border-r border-black flex items-center justify-end pr-1">
          時間
        </div>
        <div className="w-[30%] text-[9px] h-5 border-black flex items-center justify-end pr-1">
          時間
        </div>
      </div>
      <div className="flex w-[22%] h-5 border border-t-0 border-black items-center">
        <div className="w-[45%] h-5 border-r border-black flex items-center justify-center"></div>
        <div className="w-[55%] h-5 text-[8px] border-black text-red-500 flex items-center justify-center">
          {isLeave}
        </div>
      </div>
    </div>
  );
};

export default StyledReportAttendanceDay;
