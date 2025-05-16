import {
  CheckLeaderStatusParams,
  DeleteUsersParams,
} from "@/apis/modules/user";
import IconLock from "@/app/assets/icons/iconLock.svg";
import IconLockInactive from "@/app/assets/icons/iconLockInactive.svg";
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
import { CheckLeaderStatusUsecase } from "@/core/application/usecases/staff-master/checkLeaderStatus.usecase";
import { DeleteStaffUseCase } from "@/core/application/usecases/staff-master/deleteStaff.usecase";
import { User } from "@/core/entities/models/user.model";
import { UserRepositoryImpl } from "@/core/infrastructure/repositories/user.repo";
import { toast } from "@/hooks/use-toast";
import { UserStatus } from "@/utilities/enum";
import { STAFF_STATUS } from "@/utilities/static-value";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

interface Props {
  user: User;
  onClose?(): void;
  setConfirmActiveUser(value: boolean): void;
  setSelectedUser(value: User): void;
}

const userRepo = new UserRepositoryImpl();
const getInactiveUserUseCase = new DeleteStaffUseCase(userRepo);
const checkLeaderStatusUsecase = new CheckLeaderStatusUsecase(userRepo);

export function AlertDialogGoBackWillClearData(props: Props) {
  const { user, onClose, setConfirmActiveUser, setSelectedUser } = props;
  const [loading, setLoading] = useState(false);
  const i18nCommon = useTranslations("Common");

  const onActiveUser = async () => {
    try {
      setLoading(true);
      const checkStatusParams: CheckLeaderStatusParams = {
        id: user.id,
      };
      const checkStatusResponse = await checkLeaderStatusUsecase.execute(
        checkStatusParams
      );
      if (checkStatusResponse?.code == 0) {
        const activeParams: DeleteUsersParams = {
          id: user.id,
          updated_at: user.updated_at,
        };
        const activeResponse = await getInactiveUserUseCase.execute(
          activeParams
        );
        if (activeResponse?.code == 0) {
          onClose?.();
        }
      } else {
        if (
          checkStatusResponse?.data?.LEADER_INACTIVE?.[0] == "LEADER_INACTIVE"
        ) {
          onClose?.();
          setSelectedUser(user);
          setTimeout(() => {
            setConfirmActiveUser(true);
          }, 500);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const onInActiveUser = async () => {
    try {
      setLoading(true);
      const params: DeleteUsersParams = {
        id: user.id,
        updated_at: user.updated_at,
      };
      const response = await getInactiveUserUseCase.execute(params);
      if (response?.code == 0) {
        onClose?.();
      } else {
        if (
          response?.data?.LEADER_OF_ACTIVE_STAFF?.[0] ==
          "LEADER_OF_ACTIVE_STAFF"
        ) {
          toast({
            description:
              "You cannot inactive this staff as they are the leader of at least 1 active staff.",
            color: "bg-red-100",
          });
        } else if (
          response?.data?.CANNOT_INACTIVATE_YOURSELF?.[0] ==
          "CANNOT_INACTIVATE_YOURSELF"
        ) {
          toast({
            description: "An admin cannot inactive themselves.",
            color: "bg-red-100",
          });
        } else if (
          response?.data?.ONLY_ONE_ACTIVE_ADMIN?.[0] == "ONLY_ONE_ACTIVE_ADMIN"
        ) {
          toast({
            description: "HRM system must always be at least 1 active admin.",
            color: "bg-red-100",
          });
        }
      }
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };

  const onConfirm = async () => {
    if (user.status == UserStatus.Active) {
      onInActiveUser();
    } else {
      onActiveUser();
    }
  };

  return (
    <AlertDialog>
      <StyledOverlay isVisible={loading} />
      {user.status != STAFF_STATUS[0].value && (
        <AlertDialogTrigger asChild>
          <Image
            alt="Delete"
            src={IconLock}
            className="h-5 laptop:h-[24px] aspect-square hover:cursor-pointer"
          />
        </AlertDialogTrigger>
      )}
      {user.status == STAFF_STATUS[0].value && (
        <AlertDialogTrigger asChild>
          <Image
            alt="Delete"
            src={IconLockInactive}
            className="h-5 laptop:h-[24px] aspect-square hover:cursor-pointer"
          />
        </AlertDialogTrigger>
      )}
      {user.status != STAFF_STATUS[0].value && (
        <AlertDialogContent className="gap-4 mobile:w-3/4  rounded-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="laptop:mb-2">Inactive</AlertDialogTitle>
            <AlertDialogDescription className={"text-left"}>
              Are you sure to inactive
              <span className="font-bold text-[16px] mx-1">
                {user.fullname}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="flex flex-1 items-center justify-center laptop:justify-end gap-2 ">
              <AlertDialogCancel className="mt-0 w-[120px] text-[12px] laptop:text-[14px] h-8 laptop:h-10">
                {i18nCommon("cancelButton")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onConfirm}
                className="mb-0 w-[120px] text-white bg-red_login_hover text-[12px] laptop:text-[14px] h-8 laptop:h-10"
              >
                {i18nCommon("inactiveButton")}
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
      {user.status == STAFF_STATUS[0].value && (
        <AlertDialogContent className="gap-4 mobile:w-3/4  rounded-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="laptop:mb-2">Active</AlertDialogTitle>
            <AlertDialogDescription className={"text-left"}>
              Are you sure to active
              <span className="font-bold text-[16px] mx-1">
                {user.fullname}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="flex flex-1 items-center justify-center laptop:justify-end gap-2 ">
              <AlertDialogCancel className="mt-0 w-[120px] text-[12px] laptop:text-[14px] h-8 laptop:h-10">
                {i18nCommon("cancelButton")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onConfirm}
                className="mb-0 w-[120px] text-white text-[12px] laptop:text-[14px] h-8 laptop:h-10"
              >
                {i18nCommon("activeButton")}
              </AlertDialogAction>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
