"use client";
import SideBarComponent from "@/components/common/SideBarComponent";
import StyledHeader from "@/components/common/StyledHeader";
import { useCommonStore } from "@/stores/commonStore";
import { useEffect } from "react";
import { isMobile } from "react-device-detect";

function ScheduleScreen() {
  const { updateSideBarStatus } = useCommonStore();
  useEffect(() => {
    if (isMobile) updateSideBarStatus(false);
  }, []);

  return (
    <div className="flex flex-1 w-full h-full max-h-screen overflow-y-none overscroll-none">
      <SideBarComponent />
      {/* <StyledOverlay isVisible={loading} /> */}
      <div className="w-full block max-h-screen">
        <StyledHeader />
      </div>
    </div>
  );
}

export default ScheduleScreen;
