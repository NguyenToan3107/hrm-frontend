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
  id?: number | string;
  activeId?: number | string;
  title?: string;
  description?: string;
  onConfirm(): void;
  open: boolean;
  onOpenChange(open: boolean): void;
}
export function AlertDialogConfirmActiveUser(props: Props) {
  const i18nCommon = useTranslations("Common");
  const onConfirmOK = async () => {
    props.onConfirm();
  };

  return (
    <AlertDialog
      key={props.id}
      open={props.open && props.activeId == props.id}
      onOpenChange={props.onOpenChange}
    >
      <AlertDialogContent key={props.id} className="gap-4 mobile:w-3/4 rounded-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title}</AlertDialogTitle>
          <AlertDialogDescription className={"text-left"}>
            {props?.description ? props?.description : "Description default"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex flex-1 items-center justify-center gap-2 laptop:justify-end">
            <AlertDialogCancel className="mt-0 w-[120px] text-[12px] laptop:text-[14px] h-8 laptop:h-10">
              {i18nCommon("cancelButton")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmOK}
              className="mb-0 w-[120px] text-white text-[12px] laptop:text-[14px] h-8 laptop:h-10"
            >
              {i18nCommon("confirmButton")}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
