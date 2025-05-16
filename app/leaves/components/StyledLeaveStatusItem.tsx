import { LeaveStatus } from "@/utilities/enum";
import { LEAVE_STATUS } from "@/utilities/static-value";

interface Props {
  value: string;
  cancelRequest?: string;
}
// --green: #50D23E;
// --green-hover: #DBF5DD;
// --block: #C4C940;
// --block-hover: #F6F8EC

export default function StyledLeaveStatusItem(props: Props) {
  if (props.value == LEAVE_STATUS[0].value) {
    return (
      <div
        className={
          "flex bg-block_hover items-center justify-center w-fit px-1 laptop:px-2 laptop:py-1 rounded-sm h-5 laptop:h-6"
        }
      >
        <p className={"text-block font-normal text-[10px] latop:text-[12px]"}>
          {LeaveStatus.Waiting}
        </p>
      </div>
    );
  }
  if (props.value == LEAVE_STATUS[1].value) {
    return (
      <div
        className={`${" bg-active_hover"}  flex items-center justify-center w-fit px-1 laptop:px-2 laptop:py-1 rounded-sm h-5 laptop:h-6`}
      >
        <p className={"text-active font-normal text-[10px] latop:text-[12px]"}>
          {LeaveStatus.Confirmed}
        </p>
      </div>
    );
  }
  if (props.value == LEAVE_STATUS[2].value) {
    return (
      <div
        className={
          "flex bg-inactive_hover items-center justify-center w-fit  px-1 laptop:px-2 laptop:py-1 rounded-sm h-5 laptop:h-6"
        }
      >
        <p
          className={"text-inactive font-normal text-[10px] latop:text-[12px]"}
        >
          {LeaveStatus.Canceled}
        </p>
      </div>
    );
  }
  return (
    <div
      className={
        "flex bg-block_hover items-center justify-center w-fit  px-1 laptop:px-2 laptop:py-1 rounded-sm h-5 laptop:h-6"
      }
    >
      <p className={"text-block font-normal text-[10px] latop:text-[12px]"}>
        {LeaveStatus.Waiting}
      </p>
    </div>
  );
}
