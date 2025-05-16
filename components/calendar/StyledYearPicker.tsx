import { useMemo } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Year from "./Year";
import { isMobile } from "react-device-detect";

interface Props {
  selectedYear: number;
  setSelectedYear(year: number): void;
}
function StyledYearPicker(props: Props) {
  const { selectedYear, setSelectedYear } = props;
  const currentYear = new Date().getFullYear();

  const years = useMemo(() => {
    return Array.from(
      { length: currentYear + 2 - 2024 },
      (_, index) => 2024 + index
    );
  }, [currentYear]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-none ">
          <p className="cursor-pointer text-[16px]">{selectedYear}</p>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`${
          isMobile ? "absolute top-0 -left-[92px]" : "top-[44px] left-0"
        } flex row w-[290px] flex-wrap z-10 bg-white shadow-lg rounded-md p-3 gap-x-2 gap-y-3 border border-border max-h-[196px] min-h-[196px] overflow-scroll hide-scrollbar`}
      >
        {years.map((year) => (
          <Year
            key={year.toString()}
            year={year}
            isSelectedYear={year === selectedYear}
            setSelectedYear={setSelectedYear}
          />
        ))}
      </PopoverContent>
    </Popover>
  );
}

export default StyledYearPicker;
