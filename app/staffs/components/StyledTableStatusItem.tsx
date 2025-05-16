import { STAFF_STATUS } from "@/utilities/static-value";
import { useMemo } from "react";

interface Props {
  value: string;
}
// --green: #50D23E;
// --green-hover: #DBF5DD;
// --block: #C4C940;
// --block-hover: #F6F8EC
export default function StyledTableStatusItem(props: Props) {
  const name = useMemo(() => {
    if (!props.value && props.value != "0") return STAFF_STATUS[0].name;
    const res = STAFF_STATUS.filter(
      (item) => item.value == String(props.value)
    );
    return res[0]?.name;
  }, [props.value]);

  if (props.value == "0") {
    return (
      <div
        className={
          " bg-inactive_hover items-center justify-center w-fit px-2 py-1 rounded-sm"
        }
      >
        <p className={"text-inactive font-normal text-[12px]"}>{name}</p>
      </div>
    );
  }
  if (props.value == "1") {
    return (
      <div
        className={
          "bg-active_hover   items-center justify-center w-fit px-2 py-1 rounded-sm"
        }
      >
        <p className={"text-active font-normal text-[12px]"}>{name}</p>
      </div>
    );
  }
  if (props.value == "2") {
    return (
      <div
        className={
          "bg-block_hover items-center justify-center w-fit px-2 py-1 rounded-sm"
        }
      >
        <p className={"text-block font-normal text-[12px]"}>{name}</p>
      </div>
    );
  }
  return (
    <div
      className={
        " bg-inactive_hover items-center justify-center w-fit px-2 py-1 rounded-sm"
      }
    >
      <p className={"text-inactive font-normal text-[12px]"}>{name}</p>
    </div>
  );
}
