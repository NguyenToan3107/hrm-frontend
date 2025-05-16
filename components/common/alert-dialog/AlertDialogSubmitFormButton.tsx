import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";

interface Props {
  id?: number;
  tabIndex?: number;
  title?: string;
  description?: string;
  onConfirm(): void;
  mode?: string;
  open: boolean;
  onOpenChange(open: boolean): void;
}
export function AlertDialogSubmitFormButton(props: Props) {
  const i18nCommon = useTranslations("Common");
  const onConfirmOK = async () => {
    props.onConfirm();
  };

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent className="gap-4 mobile:w-3/4  rounded-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[16px] laptop:text-[20px]">
            {props.title}
          </AlertDialogTitle>
          <AlertDialogDescription
            className={"text-left text-[14px] laptop:text-[16px]"}
          >
            {props?.description
              ? props?.description
              : "Be sure to submit the information on the form."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex flex-1 items-center justify-center gap-2 laptop:justify-end">
            <AlertDialogCancel className="mt-0 w-[120px] text-[12px] laptop:text-[14px] h-8 laptop:h-11">
              {i18nCommon("noButton")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmOK}
              className="mb-0 w-[120px] text-white text-[12px] laptop:text-[14px] h-8 laptop:h-11"
            >
              {i18nCommon("yesButton")}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
