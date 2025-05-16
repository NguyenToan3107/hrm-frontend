import { GetDayOffListParams } from "@/apis/modules/schedule";
import IconArrowLeft from "@/app/assets/icons/iconArrowLeft.svg";
import { GetDayOffListUseCase } from "@/core/application/usecases/schedule/getDayOffList.usecase";
import { DayOff } from "@/core/entities/models/dayoff.model";
import { ScheduleRepositoryImpl } from "@/core/infrastructure/repositories/schedule.repo";
import useWindowSize from "@/hooks/use-dimession";
import { useScheduleStore } from "@/stores/scheduleStore";
import { CountryType } from "@/utilities/enum";
import { formatStringToDate } from "@/utilities/format";
import { listYears } from "@/utilities/helper";
import { getMonth, getYear } from "date-fns";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import StyledOverlay from "../common/StyledOverlay";
import { Button } from "../ui/button";
import Months from "./Months";
import StyledYearPicker from "./StyledYearPicker";
import { START_YEAR } from "@/utilities/static-value";

interface Props {
  type: "single" | "fullyear";
  year?: number;
  month?: number;
}

const scheduleRepo = new ScheduleRepositoryImpl();
const getDayOffListUseCase = new GetDayOffListUseCase(scheduleRepo);

export default function StyledCalendar(props: Props) {
  const { type = "single" } = props;
  const [loading, setLoading] = useState(false);

  const [selectedYear, setSelectedYear] = useState(getYear(new Date()));
  const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()));
  const { dayOffList, updateDayOffListData, reload, updateReload } =
    useScheduleStore((state) => state);

  useEffect(() => {
    setSelectedYear(getYear(new Date()));
    onFirstLoad();
  }, []);

  useEffect(() => {
    if (reload) {
      onFirstLoad();
      updateReload(false);
    }
  }, [reload]);

  useEffect(() => {
    onFirstLoad();
    updateReload(false);
  }, [selectedYear]);

  const onFirstLoad = async () => {
    try {
      setLoading(true);
      const params: GetDayOffListParams = {
        current_year: selectedYear,
        country: CountryType.VN,
      };
      const response = await getDayOffListUseCase.execute(params);
      if (!response?.data?.day_offs && response?.data.day_offs.length === 0)
        return;
      updateDayOffListData(response?.data?.day_offs || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const dayOffListFormatted = useMemo(() => {
    const data = dayOffList.map((item: DayOff) =>
      formatStringToDate(item.day_off || "")
    );
    return data;
  }, [dayOffList]);

  const onNextYear = () => {
    if (selectedYear >= getYear(new Date()) + 1) return;
    setSelectedYear((pre) => pre + 1);
  };

  const onBackYear = () => {
    if (selectedYear <= START_YEAR) return;
    setSelectedYear((pre) => pre - 1);
  };

  const onNextMonth = () => {
    if (selectedMonth >= 11) return;
    setSelectedMonth((pre) => pre + 1);
  };
  const onBackMonth = () => {
    if (selectedMonth <= 0) return;
    setSelectedMonth((pre) => pre - 1);
  };

  const onSelectToday = () => {
    setSelectedMonth(getMonth(new Date()));
    setSelectedYear(getYear(new Date()));
  };

  const windowSize = useWindowSize();

  return (
    <div
      style={{
        maxHeight: windowSize.height - 150,
        minHeight: windowSize.height - 150,
      }}
      className=" overflow-y-auto flex flex-1 flex-col"
    >
      <StyledOverlay isVisible={loading} />

      <div className="flex items-center justify-start gap-x-1">
        <div className="mx-1">
          {!isMobile && (
            <p className="font-semibold max-w-screen text-[18px]">
              Work Schedule Calendar
            </p>
          )}
          <p className=" flex laptop:hidden text-[14px] font-normal text-secondary">
            Year
          </p>
        </div>
        <div className="flex w-fit px-1 items-center justify-center">
          <Image
            onClick={onBackYear}
            src={IconArrowLeft}
            alt=" "
            className={`p-1 hover:cursor-pointer h-6 w-6 rounded-full  border border-gray-300  ${
              listYears()[0] == selectedYear
                ? `bg-gray-300 opacity-50`
                : `bg-white opacity-100`
            }`}
          />
          <div className="relative">
            <StyledYearPicker
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
            />
          </div>
          <Image
            onClick={onNextYear}
            src={IconArrowLeft}
            alt=" "
            className={`p-1 hover:cursor-pointer rotate-180  h-6 w-6 rounded-full border border-gray-300 ${
              listYears()[listYears().length - 1] == selectedYear
                ? `bg-gray-300 opacity-50`
                : `bg-white opacity-100`
            }`}
          />
        </div>
        <p className="flex laptop:hidden text-[14px] font-normal text-secondary  ml-4">
          Month
        </p>
        <div className="flex laptop:hidden w-fit px-1 items-center justify-center ">
          <Image
            onClick={onBackMonth}
            src={IconArrowLeft}
            alt=" "
            className={`p-1 hover:cursor-pointer  h-6 w-6 rounded-full  border border-gray-300  ${
              selectedMonth == 0
                ? `bg-gray-300 opacity-50`
                : `bg-white opacity-100`
            } `}
          />
          <p className="px-4">{selectedMonth + 1}</p>

          <Image
            onClick={onNextMonth}
            src={IconArrowLeft}
            alt=" "
            className={`p-1 hover:cursor-pointer  h-6 w-6 rounded-full  border border-gray-300  rotate-180 ${
              selectedMonth == 11
                ? `opacity-50 bg-gray-300`
                : `opacity-100 bg-white`
            } `}
          />
        </div>
        <Button
          variant="outline"
          onClick={onSelectToday}
          className=" h-8 border border-border hidden"
        >
          Today
        </Button>
      </div>
      {type == "fullyear" ? (
        <div className="flex flex-col w-full overflow-y-auto">
          <div className="flex items-center justify-center ">
            {[0, 1, 2, 3].map((item: number, index: number) => {
              return (
                <Months
                  key={index.toString()}
                  monthIndex={item}
                  year={selectedYear}
                  dayOffs={dayOffListFormatted}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-center">
            {[4, 5, 6, 7].map((item: number, index: number) => {
              return (
                <Months
                  key={index.toString()}
                  monthIndex={item}
                  year={selectedYear}
                  dayOffs={dayOffListFormatted}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-center">
            {[8, 9, 10, 11].map((item: number, index: number) => {
              return (
                <Months
                  key={index.toString()}
                  monthIndex={item}
                  year={selectedYear}
                  dayOffs={dayOffListFormatted}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col ">
          <Months
            dayOffs={dayOffListFormatted}
            monthIndex={selectedMonth}
            year={selectedYear}
          />
        </div>
      )}
    </div>
  );
}
