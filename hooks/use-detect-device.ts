"use client";
import { useCommonStore } from "@/stores/commonStore";
import { useEffect } from "react";
import useWindowSize from "./useWindowSize";
import { isMobile } from "react-device-detect";

export const useDetectDevice = () => {
  const { updateSideBarStatus } = useCommonStore((state) => state);
  const windowSize = useWindowSize();
  useEffect(() => {
    if (isMobile) updateSideBarStatus(false);
    else {
      if (windowSize.width == 0) {
      } else {
        if (windowSize.width >= 1024) {
          updateSideBarStatus(true);
        } else {
          updateSideBarStatus(false);
        }
      }
    }
  }, [windowSize.width]);
};
