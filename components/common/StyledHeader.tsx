import { useCommonStore } from "@/stores/commonStore";
import { isMorningTime } from "@/utilities/helper";
import Image from "next/image";
import AppsIcon from "../../app/assets/icons/iconApps.svg";
import GoodMorningIcon from "../../app/assets/icons/iconSunrise.svg";
import GoodAfternoonIcon from "../../app/assets/icons/iconSunset.svg";
import DefaultImage from "@/app/assets/avatar/avatar_default.svg";
import { useUserStore } from "@/stores/userStore";
import { AlertDialogLogoutButton } from "@/components/common/alert-dialog/AlertDialogLogoutButton";
import StyledAvatarPreview from "@/components/common/StyledAvatarPreview";

export default function StyledHeader() {
  const { sidebarStatus, updateSideBarStatus } = useCommonStore();
  const { user } = useUserStore((state) => state);
  const toggleSidebar = () => {
    updateSideBarStatus(!sidebarStatus);
  };

  return (
    <div className="h-[56px] laptop:h-[88px] w-full px-4 py-4 flex items-center laptop:items-start ">
      <div
        className=" visible laptop:invisible flex items-center justify-center h-10 rounded-none px-0 hover:cursor-pointer"
        onClick={toggleSidebar}
      >
        {!sidebarStatus && <Image src={AppsIcon} alt="" className="h-6 w-6" />}
      </div>
      <div className="flex-1 flex-col px-2 justify-between">
        <p className="text-[15px] laptop:text-[24px] font-semibold line-clamp-1">
          {`Welcome ${user?.fullname} 👋`}
        </p>
        <div className="flex items-center">
          <Image
            src={isMorningTime() ? GoodMorningIcon : GoodAfternoonIcon}
            alt=""
            className="h-3 w-3 laptop:h-4 laptop:w-4 mr-2"
          />
          <p className="text-[12px] laptop:text-[14px] text-secondary">
            {isMorningTime() ? "Good Morning" : "Good Afternoon"}
          </p>
        </div>
      </div>
      <div className="laptop:hidden">
        <AlertDialogLogoutButton isOpen={sidebarStatus} />
      </div>
      {user && (
        <div className="hidden laptop:flex flex-row items-center justify-start border border-border rounded-lg min-w-[160px] w-auto h-[50px] mr-1">
          <div className="flex items-center justify-center h-full aspect-square">
            <StyledAvatarPreview
              image={
                user.image
                  ? `${process.env.NEXT_PUBLIC_BASE_URL_IMAGE}${user.image}`
                  : DefaultImage
              }
              className="object-contain rounded-lg w-10 h-10 cursor-pointer"
              height={40}
              width={40}
            />
          </div>
          <div className="h-full flex flex-col items-start justify-center mr-3">
            <p className="text-[#16151C] font-semibold text-[16px]">
              {user.fullname}
            </p>
            <div className="flex items-center justify-center">
              <p className="text-[#A2A1A8] font-normal text-[12px]">
                {user.role
                  ? user?.role?.name
                      .charAt(0)
                      .toUpperCase()
                      .concat(user?.role?.name.slice(1))
                  : ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
