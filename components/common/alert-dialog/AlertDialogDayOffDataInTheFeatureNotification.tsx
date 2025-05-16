import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DayOffNotificationItem from "@/app/dashboard/components/DayOffNotificationItem";
import {
  DATE_REVERSE_YMD,
  formatDateToAnyString,
  formatDateToString,
  formatStringToDate,
} from "@/utilities/format";
import { add, addDays, getDay } from "date-fns";
import { WEEKDAYS_TITLE } from "@/utilities/static-value";
import StyledRadioButton from "@/components/common/StyledRadioButton";
import { useState } from "react";
import { UserRepositoryImpl } from "@/core/infrastructure/repositories/user.repo";
import { UpdateNotificationUseCase } from "@/core/application/usecases/my-page/updateNotification.usecase";
import { toast } from "@/hooks/use-toast";
import { useUserStore } from "@/stores/userStore";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { useTranslations } from "next-intl";

interface Props {
  isOpen: boolean;
  data?: any[];

  setIsOpen(isOpen: boolean): void;
}

const userRepo = new UserRepositoryImpl();
const updateNotificationUseCase = new UpdateNotificationUseCase(userRepo);

const AlertDialogDayOffDataInTheFeatureNotification = (props: Props) => {
  const { isOpen, setIsOpen, data = [] } = props;
  const [selectedTime, setSelectedTime] = useState("1");
  const { setUser } = useUserStore();
  const i18nCommon = useTranslations("Common");
  const onCLickOk = async () => {
    try {
      const featureDate = add(new Date(), { days: Number(selectedTime) });
      const response = await updateNotificationUseCase.execute({
        hide_notification_to: formatDateToAnyString(
          featureDate,
          DATE_REVERSE_YMD
        ),
      });
      if (response?.code == 0) {
        setUser(response.data);
        toast({
          description: `Successfully turned off notifications for ${
            selectedTime == "1" ? `1 day` : `${selectedTime} days`
          } `,
          color: "bg-blue-200",
        });
      } else {
        toast({
          description: "Failed to turn off notifications",
          color: "bg-red-100",
        });
      }
    } catch (e) {
    } finally {
      setIsOpen(false);
    }
  };
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent
        onEscapeKeyDown={(e) => e.preventDefault()}
        className={
          "w-full latop:w-1/2 laptop:min-w-[800px] bg-white rounded-sm items-center "
        }
      >
        <AlertDialogHeader>
          <AlertDialogTitle className={"self-start text-2xl mb-4"}>
            Sanshin special calendar day notification{" "}
          </AlertDialogTitle>
          <div className={"flex"}>
            <p className={"text-[16px] font-semibold"}>From</p>
            <p className={"text-[16px] mx-2"}>
              {formatDateToString(new Date())}
            </p>
            <p className={"text-[16px] font-semibold"}>To</p>
            <p className={"text-[16px] mx-2"}>
              {formatDateToString(addDays(new Date(), 14))}
            </p>
          </div>
          <div
            className={"flex gap-y-2 flex-col max-h-[400px] overflow-scroll"}
          >
            {data.map((item) => {
              const itemWeekDayName =
                WEEKDAYS_TITLE[getDay(formatStringToDate(item.day_off))];
              return (
                <DayOffNotificationItem
                  key={item.day_off}
                  date={item.day_off}
                  type={item.status}
                  description={item.description}
                  weekDayName={itemWeekDayName}
                />
              );
            })}
          </div>
          <div className={"flex flex-col gap-y-3"}>
            <p className={"text-[16px] self-start"}>
              I understand, don&#39;t show again for:
            </p>
            <StyledRadioButton
              setSelected={setSelectedTime}
              selected={selectedTime}
            />
          </div>
        </AlertDialogHeader>
        <AlertDialogDescription></AlertDialogDescription>
        <AlertDialogFooter className={"w-full flex items-center"}>
          <AlertDialogAction
            onClick={onCLickOk}
            className={"text-white text-[16px] w-[172px]"}
          >
            {i18nCommon("okButton")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertDialogDayOffDataInTheFeatureNotification;
