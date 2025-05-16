import { DeleteUsersParams } from "@/apis/modules/user";
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
import { DeleteStaffUseCase } from "@/core/application/usecases/staff-master/deleteStaff.usecase";
import { User } from "@/core/entities/models/user.model";
import { UserRepositoryImpl } from "@/core/infrastructure/repositories/user.repo";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";

const userRepo = new UserRepositoryImpl();
const deleteStaffUseCase = new DeleteStaffUseCase(userRepo);

interface Props {
  user: User;
  onClose?(): void;
}
export function ALertDialogDeleteStaff(props: Props) {
  const { user, onClose = () => {} } = props;
  const [loading, setLoading] = useState(false);
  const i18nCommon = useTranslations("Common");

  const onConfirmDelete = async () => {
    try {
      setLoading(true);
      if (!user?.updated_at || !user?.id) return;
      const params: DeleteUsersParams = {
        id: user.id,
        updated_at: user.updated_at,
      };
      const result = await deleteStaffUseCase.execute(params);
      if (result?.code == 0) {
        toast({
          description: "Delete staff successfully.",
          color: "bg-blue-200",
        });
        onClose();
      } else {
        toast({
          description: "Delete staff failed",
          color: "bg-red-100",
        });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <StyledOverlay isVisible={loading} />
      <AlertDialogTrigger asChild>
        <Image
          alt="Delete"
          src={IconTrash}
          className="h-[24px] aspect-square hover:cursor-pointer"
        />
      </AlertDialogTrigger>
      <AlertDialogContent className="gap-4">
        <AlertDialogHeader>
          <AlertDialogTitle className="mb-2">Notification</AlertDialogTitle>
          <AlertDialogDescription className={"text-left"}>
            Are you sure to delete
            <span className="font-bold text-[16px] mx-1">{user.fullname}?</span>
            ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex flex-1 items-center justify-end gap-2 ">
            <AlertDialogCancel className="mt-0 w-[120px]">
              {i18nCommon("cancelButton")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDelete}
              className="mb-0 w-[120px] text-white bg-red_login_hover"
            >
              {i18nCommon("deleteButton")}
            </AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
