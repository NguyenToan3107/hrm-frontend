import IconArrowLeft from "@/app/assets/icons/iconArrowLeft.svg";
import IconChevronsLeft from "@/app/assets/icons/iconChevronsLeft.svg";
import IconChevronsRight from "@/app/assets/icons/iconChevronsRight.svg";
import Image from "next/image";
import { isMobile } from "react-device-detect";

interface Props {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange(page: number): void;
}
const StyledPagination = (props: Props) => {
  const { totalItems, itemsPerPage, currentPage, onPageChange } = props;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Function to handle page changes
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Generate an array of page numbers
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const renderNumberItem = (number: number) => {
    return (
      <button
        key={number}
        className={`h-8 w-8 items-center justify-center text-[14px] laptop:text-[16px] font-semibold ${
          currentPage === number &&
          "border border-primary text-primary text-gray-500"
        } rounded-lg ${isMobile ? '' : 'hover:bg-gray-200'}`}
        onClick={() => handlePageChange(number)}
      >
        {number}
      </button>
    );
  };

  const renderPageNumberList = () => {
    if (pageNumbers.length == 0)
      return (
        <button
          key={1}
          className={`h-8 w-8 items-center justify-center text-[14px] laptop:text-[16px] font-semibold ${"border border-primary text-primary text-gray-500"} rounded-lg ${isMobile ? '' : 'hover:bg-gray-200'}`}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
      );
    else if (pageNumbers.length < (isMobile ? 4 : 6)) {
      return pageNumbers.map((number) => renderNumberItem(number));
    } else {
      return (
        <div className={"flex items-center justify-center gap-x-1"}>
          {currentPage <= (isMobile ? 2 : 3) && (
            <div className={"flex items-center justify-center gap-x-1"}>
              {renderNumberItem(1)}
              {renderNumberItem(2)}
              {renderNumberItem(3)}
              {!isMobile && renderNumberItem(4)}
              {!isMobile && renderNumberItem(5)}
            </div>
          )}
          {(isMobile ? 2 : 3) < currentPage &&
            currentPage <= totalPages - (isMobile ? 2 : 3) && (
              <div className={"flex items-center justify-center gap-x-1"}>
                {!isMobile && renderNumberItem(currentPage - 2)}
                {renderNumberItem(currentPage - 1)}
                {renderNumberItem(currentPage)}
                {renderNumberItem(currentPage + 1)}
                {!isMobile && renderNumberItem(currentPage + 2)}
              </div>
            )}
          {currentPage >= totalPages - (isMobile ? 1 : 2) && (
            <div className={"flex items-center justify-center gap-x-1"}>
              {!isMobile && renderNumberItem(totalPages - 4)}
              {!isMobile && renderNumberItem(totalPages - 3)}
              {renderNumberItem(totalPages - 2)}
              {renderNumberItem(totalPages - 1)}
              {renderNumberItem(totalPages)}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="flex flex-1 items-center justify-between gap-x-1">
      <div className=" ">
        {!isMobile ? (
          <p>{`Showing ${(currentPage - 1) * itemsPerPage + 1} to ${
            currentPage * itemsPerPage < totalItems
              ? currentPage * itemsPerPage
              : totalItems
          } out of ${totalItems} records`}</p>
        ) : (
          <p
            className={"text-[14px] laptop:text-[16px] w-fit"}
          >{`Total ${totalItems}`}</p>
        )}
      </div>
      <div>
        <div className="flex items-center justify-center laptop:justify-end h-10 laptop:mt-2">
          <button
            className="h-8 w-8 flex items-center justify-center text-sm font-medium  rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <Image
              src={IconChevronsLeft}
              className="h-5 w-5 self-center"
              alt=""
            />
          </button>
          <button
            className="h-8 w-8 flex items-center justify-center text-sm font-medium  rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <Image src={IconArrowLeft} className="h-5 w-5 self-center" alt="" />
          </button>
          {renderPageNumberList()}
          <button
            className=" flex h-8 w-8 items-center justify-center text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <Image src={IconArrowLeft} className="h-5 w-5 rotate-180 " alt="" />
          </button>
          <button
            className=" flex h-8 w-8 items-center justify-center text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <Image src={IconChevronsRight} className="h-5 w-5" alt="" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StyledPagination;
