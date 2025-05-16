import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";

interface Props {
  title?: string;
  description?: string;
  open: boolean;
  onOpenChange(open: boolean): void;
  onOK(): void;
}
export function StyledMessageAlertDialog(props: Props) {
  const i18nCommon = useTranslations("Common");

  const onOK = async () => {
    props.onOK();
  };

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent className="gap-4 mobile:w-3/4 rounded-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{props?.title || "Defaul title"}</AlertDialogTitle>
          <AlertDialogDescription className={"text-left"}>
            {props?.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex flex-1 items-center justify-center gap-2 laptop:justify-end">
            <AlertDialogAction
              onClick={onOK}
              className="mb-0 w-[120px] text-white text-[12px] laptop:text-[14px] h-8 laptop:h-10"
            >
              {i18nCommon("okButton")}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
