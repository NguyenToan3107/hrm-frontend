"use client";
import StyledCalendar from "@/components/calendar/StyledCalendar";
import { AlertDialogChangeInfoPersonal } from "@/components/common/alert-dialog/AlertDialogChangeInfoPersonal";
import { AlertDialogChangePassword } from "@/components/common/alert-dialog/AlertDialogChangePassword";
import AlertDialogDayOffDataInTheFeatureNotification from "@/components/common/alert-dialog/AlertDialogDayOffDataInTheFeatureNotification";
import SideBarComponent from "@/components/common/SideBarComponent";
import { StyledBreadcrumb } from "@/components/common/StyledBreadcrumb";
import StyledHeader from "@/components/common/StyledHeader";
import { GetDayOffNotificationUseCase } from "@/core/application/usecases/schedule/getDayOffNotification.usecase";
import { ScheduleRepositoryImpl } from "@/core/infrastructure/repositories/schedule.repo";
import { useCheckPermission } from "@/hooks/useCheckPermission";
import { useUserStore } from "@/stores/userStore";
import { PasswordChanged } from "@/utilities/enum";
import { formatStringToDateYMD2 } from "@/utilities/format";
import { isBefore } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";

const scheduleRepo = new ScheduleRepositoryImpl();
const getDayOffNotificationUseCase = new GetDayOffNotificationUseCase(
  scheduleRepo
);

const MainScreen = () => {
  const { user } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [dataNotification, setDataNotification] = useState([]);
  const { loading } = useCheckPermission(["dashboard_view"]);

  const checkInfoPersonalUser = useMemo(() => {
    return (
      user?.image == null ||
      user?.address == null ||
      user?.fullname == null ||
      user?.birth_day == null ||
      user?.country == null ||
      user?.phone == null
    );
  }, [
    user?.image,
    user?.address,
    user?.fullname,
    user?.birth_day,
    user?.country,
    user?.phone,
  ]);

  const getDataDayOff = async () => {
    try {
      const data = await getDayOffNotificationUseCase.execute();
      if (data?.code == 0) {
        setDataNotification(data?.data?.day_offs || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    getDataDayOff();
  }, []);

  const showNotification = useMemo(() => {
    if (dataNotification.length > 0) {
      if (!!user?.hide_notification_to) {
        return isBefore(
          formatStringToDateYMD2(user?.hide_notification_to),
          new Date()
        );
      } else return true;
    }
    return false;
  }, [user?.hide_notification_to, dataNotification.length]);

  useEffect(() => {
    setIsOpen(showNotification);
  }, [showNotification]);

  if (loading) return <></>;
  return (
    <div className="flex flex-1 w-full h-full max-h-screen overflow-y-none overscroll-none">
      {!showNotification &&
        user?.password_changed == PasswordChanged.UNCHANGED && (
          <AlertDialogChangePassword />
        )}
      {!showNotification &&
        user?.password_changed == PasswordChanged.CHANGED &&
        checkInfoPersonalUser && <AlertDialogChangeInfoPersonal />}
      <SideBarComponent />
      <div className="block w-full">
        <StyledHeader />
        <StyledBreadcrumb
          items={["Dashboard"]}
          links={["/dashboard"]}
          triggerClass="pb-2"
        />
        <div className="px-4 w-full flex flex-col">
          {isMobile && (
            <p className="mx-1 font-semibold max-w-screen text-[18px]">
              Work Schedule Calendar
            </p>
          )}
          <div className="flex flex-1 gap-x-2  max-h-screen w-full ">
            <StyledCalendar type={isMobile ? "single" : "fullyear"} />
          </div>
        </div>
      </div>
      <AlertDialogDayOffDataInTheFeatureNotification
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        data={dataNotification}
      />
    </div>
  );
};

export default MainScreen;
