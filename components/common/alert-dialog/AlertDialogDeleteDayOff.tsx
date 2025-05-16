import { DeleteDayOffParams } from "@/apis/modules/schedule";
import IconTrash from "@/app/assets/icons/iconTrash.svg";
import StyledOverlay from "@/components/common/StyledOverlay";
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
import { DeleteDayOffUseCase } from "@/core/application/usecases/schedule/deleteDayOff.usecase";
import { ScheduleRepositoryImpl } from "@/core/infrastructure/repositories/schedule.repo";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  id: number;
  updatedAt: string;
  onClose: () => void;
  updateReload: (reload: boolean) => void;
}

const scheduleRepo = new ScheduleRepositoryImpl();
const deleteDayOffListUseCase = new DeleteDayOffUseCase(scheduleRepo);

export function ALertDialogDeleteDayOff(props: Props) {
  const { id, updatedAt, onClose, updateReload } = props;
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const i18nCommon = useTranslations("Common");

  const onConfirmDelete = async () => {
    try {
      setLoading(true);
      if (!updatedAt || !id) return;
      const params: DeleteDayOffParams = {
        id: id,
        updated_at: updatedAt,
      };
      const result = await deleteDayOffListUseCase.execute(params);
      if (result?.code == 0) {
        setIsOpen(false);
        toast({
          description: "Delete day off successfully.",
          color: "bg-blue-200",
        });
        onClose();
        updateReload(true);
      } else {
        toast({
          description: "Delete day off failed",
          color: "bg-red-100",
        });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <StyledOverlay isVisible={loading} />
      <AlertDialogTrigger asChild>
        <Image
          alt="Delete"
          src={IconTrash}
          className="h-[24px] aspect-square hover:cursor-pointer"
        />
      </AlertDialogTrigger>
      <AlertDialogContent className="gap-4 mobile:w-3/4 rounded-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="mb-2">Notification</AlertDialogTitle>
          <AlertDialogDescription className={"text-left"}>
            Are you sure to delete day off
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex flex-1 items-center justify-end gap-2 ">
            <AlertDialogCancel className="mt-0 w-[120px] text-[12px] laptop:text-[14px] h-8 laptop:h-11">
              {i18nCommon("cancelButton")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDelete}
              className="mb-0 w-[120px] text-white bg-red_login_hover text-[12px] laptop:text-[14px] h-8 laptop:h-11"
            >
              {i18nCommon("deleteButton")}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
