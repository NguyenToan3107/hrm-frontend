"use client";
import DefaultImage from "@/app/assets/avatar/avatar_default.svg";
import { Leave } from "@/core/entities/models/leave.model";
import { LeaveRepositoryImpl } from "@/core/infrastructure/repositories/leave.repo";
import useWindowSize from "@/hooks/useWindowSize";
import { useLeaveStore } from "@/stores/leavesStore";
import { LeaveType, SalaryValue } from "@/utilities/enum";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import StyledLeaveStatusItem from "@/app/leaves/components/StyledLeaveStatusItem";
import { GetMyLeaveUseCase } from "@/core/application/usecases/leave/getMyLeave";
import { useCommonStore } from "@/stores/commonStore";

interface Props {
  setLoading(loading: boolean): void;
  loading: boolean;
  id: string;
}

const leaveRepo = new LeaveRepositoryImpl();
const getMyLeaveUseCase = new GetMyLeaveUseCase(leaveRepo);
export default function StyledMyLeave(props: Props) {
  const { setLoading } = props;
  const windowSize = useWindowSize();
  const { sidebarStatus } = useCommonStore();
  const tableWidth = useMemo(() => {
    if (sidebarStatus) {
      return windowSize.width - 288 - 242 - 100;
    } else {
      return windowSize.width - 72 - 242 - 100;
    }
  }, [sidebarStatus]);

  const {
    myLeave,
    searchMyLeaveParams,
    updateSearchMyLeaveParams,
    updateMyLeaveData,
  } = useLeaveStore((state) => state);

  const onFirstLoadData = async () => {
    try {
      setLoading(true);
      const id = props.id;
      const params = { ...searchMyLeaveParams, page: 1, id };
      const response = await getMyLeaveUseCase.execute(params);
      updateSearchMyLeaveParams(params);
      updateMyLeaveData(response?.data, response?.totalItem || 0);
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    onFirstLoadData();
  }, []);

  return (
    <div
      style={{
        maxHeight:
          windowSize.height -
          100 -
          52 -
          (windowSize.width > 1024 ? 150 : 150 + 18) -
          80,
        minHeight:
          windowSize.height -
          100 -
          52 -
          (windowSize.width > 1024 ? 150 : 150 + 18) -
          80,
        maxWidth: tableWidth,
        minWidth: tableWidth,
        scrollbarWidth: "none",
      }}
      className="overflow-y-auto mobile:mt-[18px] laptop:mt-0 max-h-screen block rounded-sm relative"
    >
      <table
        className="overflow-y-none overscroll-x-none max-h-screen border-separate border-spacing-0 relative w-full"
        style={{
          maxWidth: tableWidth,
          minWidth: tableWidth,
          scrollbarWidth: "none",
        }}
      >
        <thead
          className="border-border border-b sticky top-0 bg-blue-500"
          style={{
            maxWidth: tableWidth,
            minWidth: tableWidth,
            scrollbarWidth: "none",
          }}
        >
          <tr className=" align-center bg-white ">
            <th className="text-[16px] text-gray-400 pl-2 font-medium align-center min-w-[180px] w-[200px]  text-start hover:bg-gray-100 hover:cursor-pointer border-b ">
              Employee Name
            </th>
            <th className="text-[16px] text-gray-400 pl-2 font-medium align-center text-start min-w-[260px] hover:bg-gray-100 hover:cursor-pointer  border-b">
              Description
            </th>
            <th className=" text-[16px] text-gray-400 pl-2 font-medium align-center text-start min-w-[120px] w-[200px] hover:bg-gray-100 hover:cursor-pointer  border-b">
              Type
            </th>
            <th className="text-[16px] text-gray-400 pl-2 font-medium align-center text-start min-w-[160px] w-[200px] hover:bg-gray-100 hover:cursor-pointer  border-b">
              Create date
            </th>
            <th className="text-[16px] text-gray-400 pl-2 font-medium align-center text-start min-w-[160px] w-[200px] hover:bg-gray-100 hover:cursor-pointer  border-b">
              Leave date
            </th>
            <th className="text-[16px] text-gray-400 pl-2 font-medium align-center text-start min-w-[96px] w-[144px] hover:bg-gray-100 hover:cursor-pointer  border-b">
              Status
            </th>
          </tr>
        </thead>
        <tbody
          className="hide-scrollbar"
          style={{
            maxWidth: tableWidth,
            minWidth: tableWidth,
            scrollbarWidth: "none",
          }}
        >
          {myLeave?.map((leave: Leave, index: number) => {
            return (
              <tr
                key={leave?.id ? leave?.id.toString() : String(index)}
                className="overflow-x-auto w-screen align-center h-[52px]"
              >
                <td className="pl-2 min-w-[80px] laptop:min-w-[260px] border-b border-[#F6F6F6]">
                  <div className="flex justify-start items-center laptop:gap-x-2">
                    <Image
                      alt=""
                      src={
                        !leave?.image
                          ? DefaultImage
                          : `${process.env.NEXT_PUBLIC_BASE_URL_IMAGE}${leave.image}`
                      }
                      className={"contain-size h-8 w-8 rounded-full"}
                      height={44}
                      width={44}
                    />
                    <p className=" text-[16px] font-normal pl-2">
                      {leave.employee_name}
                    </p>
                  </div>
                </td>
                <td className="pl-2 min-w-[260px] text-start text-[16px] font-normal border-b border-[#F6F6F6]">
                  {leave.description}
                </td>
                <td className="pl-2 w-[200px] text-[16px] font-normal border-b border-[#F6F6F6]">
                  {leave.salary == String(SalaryValue.UnPaidLeave)
                    ? LeaveType.Unpaid
                    : leave.salary == String(SalaryValue.PaidLeave)
                    ? LeaveType.Paid
                    : "Waiting"}
                </td>
                <td className="pl-2 w-[200px] text-[16px] font-normal border-b border-[#F6F6F6]">
                  {leave.created_at}
                </td>
                <td className="pl-2 w-[200px] text-[16px] font-normal border-b border-[#F6F6F6]">
                  {leave.day_leaves}
                </td>
                <td className="pl-2 w-[144px] text-[16px] font-normal border-b border-[#F6F6F6]">
                  <StyledLeaveStatusItem value={leave?.status || ""} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
