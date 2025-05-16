"use client";
import { AlertDialogLogoutButton } from "@/components/common/alert-dialog/AlertDialogLogoutButton";
import { useCommonStore } from "@/stores/commonStore";
import { SIDEBAR_ITEMS } from "@/utilities/static-value";
import Image from "next/image";
import { usePathname } from "next/navigation";
import ToggleIcon from "../../app/assets/icons/iconToggleSideBar.svg";
import SideBarLogo from "../../app/assets/logo/logoSideBar.png";
import SideBarItem, { SideBarItemProps } from "./SideBarItem";
import { isMobile } from "react-device-detect";

const SideBarComponent = () => {
  const { sidebarStatus, updateSideBarStatus } = useCommonStore();
  const pathname = usePathname();

  const toggleSidebar = () => {
    updateSideBarStatus(!sidebarStatus);
  };

  const handleOutsideClick = () => {
    if (sidebarStatus) updateSideBarStatus(false);
  };

  return (
    <>
    {isMobile && sidebarStatus && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-10 laptop:hidden"
          onClick={handleOutsideClick}
        />
    )}
    <div
      className={`absolute z-10 laptop:relative flex ${
        sidebarStatus
          ? "w-7/12 laptop:w-72"
          : "w-0 laptop:w-[72px] invisible laptop:visible"
      } h-screen bg-sidebar-primary text-white transition-width duration-300 justify-center items-center`}
      onClick={(e) => isMobile && e.stopPropagation()}
     >
      <div className="flex flex-col py-5 justify-between h-full items-center w-full">
        <div className="flex justify-center flex-col w-full rounded-xl h-full bg-re">
          <button
            className="flex items-center justify-center h-10 rounded-none px-0"
            onClick={toggleSidebar}
          >
            {sidebarStatus && (
              <Image src={SideBarLogo} alt="" className="h-6 w-auto mr-3" />
            )}
            <Image src={ToggleIcon} alt="" className="h-8 w-8" />
          </button>
          <ul
            className="mt-4 flex flex-1 flex-col "
            style={{
              paddingLeft: sidebarStatus ? 32 : 12,
              paddingRight: sidebarStatus ? 32 : 12,
            }}
          >
            {SIDEBAR_ITEMS.map((i: SideBarItemProps) => (
              <SideBarItem
                key={i.title}
                icon={i.icon}
                iconActive={i.iconActive}
                title={i.title}
                route={i.route}
                permission={i.permission}
                pathname={`/${pathname.split("/")[1]}`}
                subRoute={i?.subRoute}
              />
            ))}
          </ul>

          <div className="hidden laptop:flex">
            <AlertDialogLogoutButton isOpen={sidebarStatus} />
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default SideBarComponent;
