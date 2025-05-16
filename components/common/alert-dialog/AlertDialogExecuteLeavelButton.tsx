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
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

interface Props {
  tabIndex: number;
  description: string;
  button: string;
  fullname?: string | undefined;
  onOK(): void;
}
export function AlertDialogExecuteLeavelButton(props: Props) {
  const i18nCommon = useTranslations("Common");
  const onConfirm = async () => {
    props?.onOK?.();
  };
  const [color, setColor] = useState(1);
  const checkColorButton = () => {
    if (props.button === "Confirm" || props.button === "Approve") {
      setColor(1);
    } else if (
      props.button === "Cancel" ||
      props.button === "Agree CR" ||
      props.button === "Disapprove"
    ) {
      setColor(2);
    } else if (props.button === "Skip CR") {
      setColor(3);
    }
  };

  const onOKButton = async () => {};

  useEffect(() => {
    checkColorButton();
  }, [props.button]);

  return (
    <AlertDialog>
      {color == 1 && (
        <AlertDialogTrigger asChild>
          <Button
            onClick={onOKButton}
            tabIndex={props.tabIndex}
            className={`min-w-[50px] laptop:w-[152px] h-[32px] laptop:h-[50px] font-normal bg-[#2B4CD2] hover:bg-[#5679E5] text-white text-[12px] laptop:text-[14px] rounded-[8px]`}
            type="button"
            variant="outline"
          >
            {props.button}
          </Button>
        </AlertDialogTrigger>
      )}

      {color == 2 && (
        <AlertDialogTrigger asChild>
          <Button
            onClick={onOKButton}
            tabIndex={props.tabIndex}
            className={`min-w-[50px] laptop:w-[152px] h-[32px] laptop:h-[50px] font-normal bg-[#BD0D10] hover:bg-[#E6393C] text-white text-[12px] laptop:text-[14px] rounded-[8px]`}
            type="button"
            variant="outline"
          >
            {props.button}
          </Button>
        </AlertDialogTrigger>
      )}

      {color == 3 && (
        <AlertDialogTrigger asChild>
          <Button
            onClick={onOKButton}
            tabIndex={props.tabIndex}
            className={`min-w-[50px] laptop:w-[152px] h-[32px] laptop:h-[50px] font-normal border-none text-black bg-[#DCFAFF] hover:bg-[#B3E6F2] text-[12px] laptop:text-[14px]  rounded-[8px]`}
            type="button"
            variant="outline"
          >
            {props.button}
          </Button>
        </AlertDialogTrigger>
      )}

      <AlertDialogContent className="gap-4 mobile:w-3/4  rounded-sm">
        <AlertDialogHeader>
          <VisuallyHidden>
            <AlertDialogTitle>Cancel Request Confirmation</AlertDialogTitle>
          </VisuallyHidden>
          <AlertDialogDescription
            className={"text-left text-[14px] laptop:text-[16px] font-normal"}
          >
            {props.fullname ? (
              <>
                {props.description} {`“`}
                <strong>{props.fullname}</strong>
                {`“.`}
              </>
            ) : (
              props.description
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex flex-1 items-center justify-center gap-2 laptop:gap-5 laptop:justify-end">
            <AlertDialogCancel className="mt-0 w-[120px] rounded-[8px] text-[12px] laptop:text-[14px] h-8 laptop:h-11">
              {i18nCommon("noButton")}
            </AlertDialogCancel>
            {color == 1 && (
              <AlertDialogAction
                onClick={onConfirm}
                className="mb-0 w-[120px] bg-[#2B4CD2] text-white rounded-[8px] text-[12px] laptop:text-[14px] h-8 laptop:h-11"
              >
                {props.button}
              </AlertDialogAction>
            )}
            {color == 2 && (
              <AlertDialogAction
                onClick={onConfirm}
                className="mb-0 w-[120px] bg-[#BD0D10] text-white rounded-[8px] text-[12px] laptop:text-[14px] h-8 laptop:h-11"
              >
                {props.button}
              </AlertDialogAction>
            )}
            {color == 3 && (
              <AlertDialogAction
                onClick={onConfirm}
                className="mb-0 w-[120px] bg-[#DCFAFF] rounded-[8px] text-[12px] laptop:text-[14px] h-8 laptop:h-11"
              >
                {i18nCommon("skipButton")}
              </AlertDialogAction>
            )}
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
