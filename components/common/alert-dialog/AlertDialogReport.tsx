import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  tabIndex?: number;
  title?: string;
  mode?: string;
  open: boolean;
  checkedIds: number[];
  onConfirm(): void;
  onOpenChange(open: boolean): void;
}
export function AlertDialogReport(props: Props) {
  const onConfirmOK = async () => {
    props.onConfirm();
  };

  return (
    <AlertDialog open={props.open} onOpenChange={props.onOpenChange}>
      <AlertDialogContent className="gap-4 h-[160px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-start text-[16px] font-normal">
            {props.title}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex flex-1 items-end justify-center gap-2 laptop:justify-end">
            {props.checkedIds.length > 0 ? (
              <>
                <AlertDialogCancel className="mt-0 w-[120px]">
                  No
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onConfirmOK}
                  className="mb-0 w-[120px] text-white"
                >
                  Confirm
                </AlertDialogAction>
              </>
            ) : (
              <AlertDialogCancel className="mt-0 w-[120px] border border-none text-white bg-[#BD0D10]">
                Close
              </AlertDialogCancel>
            )}
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
