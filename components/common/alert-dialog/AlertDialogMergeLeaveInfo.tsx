import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";

interface Props {
  tabIndex?: number;
  title?: string;
  description?: string;
  leaveFirstIdkey?: string;
  leaveSecondIdkey?: string;
  onConfirm(): void;
  open: boolean;
  onOpenChange(open: boolean): void;
}
export function AlertDialogMergeLeaveInfo(props: Props) {
  const i18nCommon = useTranslations("Common");
  const onConfirmOK = async () => {
    props.onConfirm();
  };

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent className="gap-4 mobile:w-3/4  rounded-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title}</AlertDialogTitle>
          <AlertDialogDescription className={"text-left"}>
            {props?.description
              ? props?.description
              : "The two leave requests for the morning and afternoon on the same day have been merged into a single all-day leave request:"}
            <div className="mt-2">
              <li>Merged Leave ID: {props.leaveFirstIdkey}</li>
              {props.leaveSecondIdkey && (
                <li>
                  Deleted Leave ID after merging: {props.leaveSecondIdkey}
                </li>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex flex-1 items-center justify-center gap-2 laptop:justify-end">
            <AlertDialogCancel
              onClick={onConfirmOK}
              className="mb-0 w-[120px] font-normal text-[12px] laptop:text-[16px] h-8 laptop:h-11 border bg-white border-[#A2A1A880] hover:bg-gray-100 rounded-[10px]"
            >
              {i18nCommon("closeButton")}
            </AlertDialogCancel>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
