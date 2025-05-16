import React from "react";

interface Props {
  year: number; // nguyên thủy
  isSelectedYear: boolean; // nguyên thủy
  setSelectedYear(year: number): void; // kiểu dữ liệu do người dùng định nghĩa ( hàm của state thì react tự hiểu được )
}

function Year(props: Props) {
  const { year, isSelectedYear, setSelectedYear } = props;
  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
  };
  return (
    <button
      key={year}
      onClick={() => handleYearSelect(year)}
      className={`py-1 max-h-[34px] min-h-[34px] min-w-[60px] rounded-md border border-gray-200 ${
        isSelectedYear ? "bg-primary text-white" : "text-gray-700"
      } hover:bg-primary-hover hover:text-white`}
    >
      {year}
    </button>
  );
}

export default React.memo(Year);
