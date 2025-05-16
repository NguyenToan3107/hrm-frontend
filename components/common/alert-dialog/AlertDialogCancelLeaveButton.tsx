import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { isMobile } from "react-device-detect";
import { useTranslations } from "next-intl";

interface Props {
  isOpen: boolean;
  tabIndex: number;
  onClose(): void;
}
export function AlertDialogCancelLeaveButton(props: Props) {
  const i18nCommon = useTranslations("Common");
  const onConfirmOK = async () => {
    props.onClose();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild className="mx-2">
        <Button
          tabIndex={props.tabIndex}
          className={` laptop:w-[152px] ${
            isMobile ? "mx-0 p-0" : "mx-4"
          }  laptop:mx-0 h-8 laptop:h-[50px] w-[100px] font-normal bg-white text-[#16151C] text-[12px] laptop:text-[16px] border border-[#A2A1A880] hover:bg-gray-100 rounded-[8px]`}
          type="button"
          variant="outline"
        >
          {isMobile ? 'Back' : 'Cancel'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="gap-4 mobile:w-3/4  rounded-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel create leave</AlertDialogTitle>
          <AlertDialogDescription className={"text-left"}>
            Be sure to ignore the information on the form
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex flex-1 items-center justify-center gap-2 laptop:justify-end">
            <AlertDialogCancel className="mt-0 font-normal w-[120px] text-[12px] laptop:text-[14px] h-8 laptop:h-11">
              {i18nCommon("noButton")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmOK}
              className="mb-0 w-[120px] font-normal text-white text-[12px] laptop:text-[14px] h-8 laptop:h-11"
            >
              {i18nCommon("yesButton")}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
