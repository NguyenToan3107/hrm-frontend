import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { useEditingStore } from "@/stores/commonStore";
import { useTranslations } from "next-intl";

export function AlertDialogChangeInfoPersonal() {
  const router = useRouter();
  const { setIsEditing } = useEditingStore((state) => state);
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const i18nCommon = useTranslations("Common");
  const onConfirmOK = async () => {
    setIsEditing(true);
    router.push(`/my-page`);
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogContent
        className="gap-4 mobile:w-3/4 rounded-sm"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Notification</AlertDialogTitle>
          <AlertDialogDescription className={"text-left"}>
            Please enter complete personal information.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex flex-1 items-center justify-center gap-2 laptop:justify-end">
            <AlertDialogAction
              onClick={onConfirmOK}
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
