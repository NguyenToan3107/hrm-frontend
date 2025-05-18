"use client";
import ArrowDownIcon from "@/app/assets/icons/icon-arrow-down.svg";
import ArrowUpIcon from "@/app/assets/icons/iconArrowUp.svg";
import { AlertDialogCancelFormButton } from "@/components/common/alert-dialog/AlertDialogCancelFormButton";
import { StyledTooltip } from "@/components/common/StyledToolTip";
import {
  useCommonStore,
  useEditingStore,
  useFileStore,
} from "@/stores/commonStore";
import { useLeaveStore } from "@/stores/leavesStore";
import { useReportStore } from "@/stores/reportStore";
import { useRoleStore } from "@/stores/roleStore";
import { useScheduleStore } from "@/stores/scheduleStore";
import { useStaffStore } from "@/stores/staffStore";
import { useUserStore } from "@/stores/userStore";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";

export interface SideBarItemProps {
  icon: StaticImport;
  iconActive: StaticImport;
  title: string;
  route: string;
  pathname?: string;
  permission: string[];
  subRoute?: SideBarItemProps[];
}

const SideBarItem = (props: SideBarItemProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [openSubRoute, setOpenSubRoute] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const { user } = useUserStore();

  const { clearImage } = useFileStore();
  const { isDirty } = useStaffStore((state) => state);
  const {
    isDirtyRole,
    searchParams: searchParamRole,
    updateIsDirtyRole,
    updateSearchParams: updateSearchParamsRole,
  } = useRoleStore((state) => state);
  const {
    sidebarStatus,
    updateSideBarStatus,
    sidebarItemSelected,
    updateSideBarItemSelected,
    arraySidebarItem,
    updateArraySidebarItem,
  } = useCommonStore();
  const { isEditing, setIsEditing, isDirtyMyPage, setIsDirtyMyPage } =
    useEditingStore((state) => state);
  const { resetEdittingStaff, searchParams, updateSearchParams } =
    useStaffStore((state) => state);
  const { selectedStaffIds, updateSelectedStaffIds } = useReportStore(
    (state) => state
  );
  const {
    isDirtyLeave,
    searchParams: searchParamsLeave,
    updateIsDirtyLeave,
    updateSearchParams: updateSearchParamsLeave,
  } = useLeaveStore();

  const { updateIsDirtyDayOff, isDirtyDayOff } = useScheduleStore();

  const isLoading = useMemo(() => {
    const userRole = user?.role;
    if (props?.permission.length > 1) {
      return props?.permission?.some((permission) =>
        userRole?.permissions?.includes(permission)
      );
    }
    return props?.permission?.every((permission) =>
      userRole?.permissions?.includes(permission)
    );
  }, []);

  useEffect(() => {
    if (!props?.subRoute) updateSideBarItemSelected(pathname);
  }, [pathname]);

  const isSelect = useMemo(() => {
    if (!props?.subRoute) return props.route === pathname;
    return props.subRoute
      ?.map((item) => item.route)
      .includes(sidebarItemSelected);
  }, [props.subRoute, sidebarItemSelected, props.pathname]);

  const isMenuSelected = useMemo(() => {
    if (!props?.subRoute) return props.route === pathname;
    else
      return props.subRoute
        ?.map((item) => item.route)
        .includes(sidebarItemSelected);
  }, [props.subRoute, sidebarItemSelected, props.pathname]);

  useEffect(() => {
    if (arraySidebarItem.includes(props.route)) setOpenSubRoute(true);
    // else setOpenSubRoute(false);
  }, [sidebarItemSelected]);

  const handleLinkClick = (event: React.MouseEvent) => {
    if (props?.subRoute && props.subRoute.length > 0) {
      setOpenSubRoute(!openSubRoute);
      event.preventDefault();
    } else if (
      isDirtyMyPage ||
      isDirty ||
      isDirtyRole ||
      isDirtyLeave ||
      isDirtyDayOff
    ) {
      event.preventDefault();
      setOpenCancelDialog(true);
    } else {
      if (isEditing) {
        setIsEditing(!isEditing);
      }
    }
    if (isMobile) {
      if (props?.subRoute && props.subRoute?.length > 0) return;
      updateSideBarStatus(!sidebarStatus);
    }

    // clear search param staff
    if (searchParams) {
      updateSearchParams({});
    }
    // clear search param role
    if (searchParamRole) {
      updateSearchParamsRole({});
    }
    // clear search param leave
    if (searchParamsLeave) {
      updateSearchParamsLeave({});
    }

    if (!props?.subRoute) updateSideBarItemSelected(props.route);
    if (props?.subRoute && props.subRoute?.length > 0) {
      if (arraySidebarItem.includes(props.route)) {
        updateArraySidebarItem(
          arraySidebarItem.filter((item) => item !== props.route)
        );
      } else {
        updateArraySidebarItem([...arraySidebarItem, props.route]);
      }
    }
    if (selectedStaffIds.length > 0) {
      updateSelectedStaffIds([]);
    }
  };

  const handleSubRouteClick = (
    event: React.MouseEvent,
    item: SideBarItemProps
  ) => {
    if (
      isDirtyMyPage ||
      isDirty ||
      isDirtyRole ||
      isDirtyLeave ||
      isDirtyDayOff
    ) {
      event.preventDefault();
      setOpenCancelDialog(true);
    } else {
      if (isEditing) {
        setIsEditing(!isEditing);
      }
    }
    if (isMobile) {
      updateSideBarStatus(!sidebarStatus);
    }
    // clear search param staff
    if (searchParams) {
      updateSearchParams({});
    }
    // clear search param role
    if (searchParamRole) {
      updateSearchParamsRole({});
    }
    updateSideBarItemSelected(item.route);
    if (selectedStaffIds.length > 0) {
      updateSelectedStaffIds([]);
    }
  };

  const cancelEditingMode = () => {
    if (isDirtyMyPage) {
      setIsDirtyMyPage(!isDirtyMyPage);
      clearImage();
    }
    if (isEditing) {
      setIsEditing(!isEditing);
    }

    if (isDirtyRole) {
      updateIsDirtyRole(!isDirtyRole);
    }
    if (isDirtyLeave) {
      updateIsDirtyLeave(!isDirtyLeave);
    }

    if (isDirtyDayOff) {
      updateIsDirtyDayOff(!isDirtyDayOff);
    }

    resetEdittingStaff();
    router.push(sidebarItemSelected);
  };

  const renderItem = (item: SideBarItemProps) => {
    const isSelected = item.route === `/${pathname.split("/")[1]}`;

    const isShow = () => {
      const userRole = user?.role;
      if (item?.permission.length > 1) {
        return item?.permission?.some((permission) =>
          userRole?.permissions?.includes(permission)
        );
      }
      return item?.permission?.every((permission) =>
        userRole?.permissions?.includes(permission)
      );
    };
    if (!isShow()) return null;
    return (
      <StyledTooltip
        key={item.route}
        content={item.title}
        disable={sidebarStatus}
      >
        <Link
          href={item.route}
          onClick={(e) => handleSubRouteClick(e, item)}
          className="flex items-center h-12 w-full justify-center hover:bg-sidebar-hover"
          style={{
            justifyContent: sidebarStatus ? "flex-start" : "center",
            backgroundColor: isSelected ? "#2B4CD20D" : "",
          }}
        >
          {/* check color of icon  */}
          {sidebarStatus ? null : isSelected ? (
            <Image src={item.iconActive} alt="" className="h-6 w-6 mr-2 ml-2" />
          ) : (
            <Image src={item.icon} alt="" className="h-6 w-6 mr-2 ml-2" />
          )}
          {/* open will show menu title  */}
          {sidebarStatus && (
            <p
              style={{
                color: isSelected ? "var(--primary)" : "black",
              }}
              className={"text-[16px] pl-[44px] "}
            >
              {item.title}
            </p>
          )}
        </Link>
      </StyledTooltip>
    );
  };

  const renderMobileMenu = () => {
    if (props.route === "/report") return <div className="h-0 py-0 my-0" />;
    return (
      <Link
        href={props.route}
        onClick={handleLinkClick}
        // className="flex items-center hover:bg-sidebar-hover rounded-r-xl h-12 w-full mt-3 justify-center"
        className={`flex items-center  rounded-r-xl h-12 w-full justify-center mt-3 ${
          openSubRoute ? "bg-sidebar-hover" : ""
        } `}
        style={{
          borderTopRightRadius: sidebarStatus ? 16 : 4,
          borderBottomRightRadius: sidebarStatus ? 16 : 4,
          borderTopLeftRadius: sidebarStatus ? 0 : 4,
          borderBottomLeftRadius: sidebarStatus ? 0 : 4,
          justifyContent: sidebarStatus ? "flex-start" : "center",
        }}
      >
        <div
          className={"bg-primary w-1 h-12 rounded-sm"}
          style={{
            backgroundColor: isSelect ? "var(--primary)" : "transparent",
          }}
        />

        {isSelect ? (
          <Image src={props.iconActive} alt="" className="h-6 w-6 mr-2 ml-2" />
        ) : (
          <Image src={props.icon} alt="" className="h-6 w-6 mr-2 ml-2" />
        )}

        {sidebarStatus && (
          <p
            style={{
              color: isSelect ? "var(--primary)" : "black",
            }}
            className={"text-[16px] "}
          >
            {props.title}
          </p>
        )}
        {props?.subRoute && props.subRoute.length > 0 && sidebarStatus && (
          <span className={`h-5 w-5 mr-2 ml-auto`}>
            <Image
              src={openSubRoute ? ArrowUpIcon : ArrowDownIcon}
              alt=""
              className="h-5 w-5 mr-2"
            />
          </span>
        )}
      </Link>
    );
  };

  if (!isLoading) return null;
  return (
    <li>
      {isMobile ? (
        renderMobileMenu()
      ) : (
        <StyledTooltip content={props.title} disable={sidebarStatus}>
          <Link
            href={props.route}
            onClick={handleLinkClick}
            className={`flex items-center hover:bg-sidebar-hover rounded-r-xl h-12 w-full justify-center mt-3 ${
              isMenuSelected || openSubRoute
                ? "bg-sidebar-hover"
                : "hover:bg-sidebar-hover"
            } 
            `}
            style={{
              borderTopRightRadius: sidebarStatus ? 16 : 4,
              borderBottomRightRadius: sidebarStatus ? 16 : 4,
              borderTopLeftRadius: sidebarStatus ? 0 : 4,
              borderBottomLeftRadius: sidebarStatus ? 0 : 4,
              justifyContent: sidebarStatus ? "flex-start" : "center",
            }}
          >
            {sidebarStatus && (
              <div
                className={"bg-primary w-1 h-12 rounded-sm"}
                style={{
                  backgroundColor: isMenuSelected
                    ? "var(--primary)"
                    : "transparent",
                }}
              />
            )}
            {/* check color of icon  */}
            {isMenuSelected ? (
              <Image
                src={props.iconActive}
                alt=""
                className="h-6 w-6 mr-2 ml-2"
              />
            ) : (
              <Image src={props.icon} alt="" className="h-6 w-6 mr-2 ml-2" />
            )}
            {/* open will show menu title  */}
            {sidebarStatus && (
              <p
                style={{
                  color: isMenuSelected ? "var(--primary)" : "black",
                }}
                className={"text-[16px] "}
              >
                {props.title}
              </p>
            )}
            {props?.subRoute && props.subRoute.length > 0 && sidebarStatus && (
              <span className={`h-5 w-5 mr-2 ml-auto`}>
                <Image
                  src={openSubRoute ? ArrowUpIcon : ArrowDownIcon}
                  alt=""
                  className="h-5 w-5 mr-2"
                />
              </span>
            )}
          </Link>
        </StyledTooltip>
      )}

      {isMobile ? (
        <div className="bg-[#2B4CD20D]  mt-1">
          {props.route != "/report" &&
            openSubRoute &&
            !!props.subRoute?.length &&
            props.subRoute?.length > 0 &&
            props.subRoute?.map((i: SideBarItemProps) => renderItem(i))}
        </div>
      ) : (
        <div className="bg-[#2B4CD20D] mt-1">
          {openSubRoute &&
            !!props.subRoute?.length &&
            props.subRoute?.length > 0 &&
            props.subRoute?.map((i: SideBarItemProps) => renderItem(i))}
        </div>
      )}
      <AlertDialogCancelFormButton
        tabIndex={16}
        title={"Cancel your data in form"}
        onConfirm={cancelEditingMode}
        // mode={props.mode}
        open={openCancelDialog}
        onOpenChange={setOpenCancelDialog}
      />
    </li>
  );
};

const isEqual = (preProps: SideBarItemProps, nextProps: SideBarItemProps) => {
  return (
    preProps.route === nextProps.route &&
    preProps.icon === nextProps.icon &&
    preProps.iconActive === nextProps.iconActive &&
    preProps.title === nextProps.title &&
    preProps.pathname === nextProps.pathname
  );
};

export default React.memo(SideBarItem, isEqual);
