"use client";
import IconUserWhite from "@/app/assets/icons/iconUserWhite.svg";
import IconLeaves from "@/app/assets/icons/iconLeaves.svg";
import SideBarComponent from "@/components/common/SideBarComponent";
import StyledHeader from "@/components/common/StyledHeader";
import useWindowSize from "@/hooks/useWindowSize";
import Image from "next/image";
import StyledUserInfoTab from "../components/StyledUserInfoTab";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import IconBackRoute from "@/app/assets/icons/iconBackRoute.svg";
import { useStaffStore } from "@/stores/staffStore";
import { useState } from "react";
import { AlertDialogCancelFormButton } from "@/components/common/alert-dialog/AlertDialogCancelFormButton";
import { useTranslations } from "next-intl";
import { StyledBreadcrumb } from "@/components/common/StyledBreadcrumb";
import { useCheckPermission } from "@/hooks/useCheckPermission";
import { isMobile } from "react-device-detect";

export default function CreateStaffScreen() {
  // const [loading, setLoading] = useState(false);
  const windowSize = useWindowSize();
  const router = useRouter();
  const { isDirty, updateIsDirty } = useStaffStore((state) => state);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [openBreadcrumbDialog, setOpenBreadcrumbDialog] = useState(false);
  const { resetEdittingStaff } = useStaffStore((state) => state);
  const i18nStaff = useTranslations("Staff");

  const onClickStaffList = () => {
    if (isDirty) {
      setOpenCancelDialog(true);
    } else {
      resetEdittingStaff();
      router.replace("/staffs");
    }
  };

  const goToStaffList = () => {
    resetEdittingStaff();
    router.replace("/staffs");
  };

  const { loading: roleLoading } = useCheckPermission(["staff_master"]);
  if (roleLoading) return null;

  return (
    <div className="w-full flex ">
      <SideBarComponent />
      {/* <StyledOverlay isVisible={loading} /> */}
      <div className="w-full max-h-screen block bg-white  ">
        <StyledHeader />
        <StyledBreadcrumb
          items={["Master", "Staffs", "Create Staff"]}
          links={["", "/staffs", `/staffs/create-staff`]}
          triggerClass={"pb-0"}
          isDirty={isDirty}
          onUpdateIsDirty={updateIsDirty}
          open={openBreadcrumbDialog}
          onOpenChange={setOpenBreadcrumbDialog}
        />
        <div className=" w-full px-6 hidden laptop:flex justify-end items-end ">
          <Button
            onClick={onClickStaffList}
            type="button"
            className="text-black font-normal border border-border min-w-[150px] bg-white hover:bg-secondary"
          >
            <Image
              alt=""
              src={IconBackRoute}
              width={24}
              height={24}
              className="text-black mr-2"
            />
            {i18nStaff("backStaffListButton")}
          </Button>
        </div>
        <div
          style={{
            maxHeight: windowSize.height - (isMobile ? 56 : 140) - 32,
            minHeight: windowSize.height - (isMobile ? 56 : 140) - 32,
          }}
          className="px-2 laptop:px-5 laptop:py-5 w-full"
        >
          <div
            className="w-full border border-border rounded-md py-1 laptop:px-5 laptop:py-6 flex flex-col laptop:flex-row gap-x-8"
            style={{
              maxHeight: windowSize.height - (isMobile ? 56 : 140) - 32 - 40,
              minHeight: windowSize.height - (isMobile ? 56 : 140) - 32 - 40,
            }}
          >
            <div className="w-full hidden laptop:flex laptop:w-[242px] h-[110px] border border-border rounded-md items-center justify-center flex-row laptop:flex-col">
              <div className="flex h-[52px] flex-1 items-center justify-start px-5 bg-primary w-full rounded-tl-md rounded-tr-none laptop:rounded-tr-md rounded-bl-md laptop:rounded-bl-none">
                <Image alt="" src={IconUserWhite} />
                <p className="text-[16px] font-semibold text-white">Profile</p>
              </div>
              <div className="flex  h-[52px] flex-1 items-center justify-start px-5 bg-white w-full rounded-bl-md rounded-br-md hover:cursor-not-allowed">
                {/* <div className="h-3 w-3 rounded-full bg-white mx-2" /> */}
                <Image alt="" src={IconLeaves} width={24} height={24} />
                <p className="text-[16px] font-semibold ">Leaves</p>
              </div>
            </div>
            <div
              style={{
                maxHeight: windowSize.height - (isMobile ? 56 : 140) - 32 - 40 - 28,
                minHeight: windowSize.height - (isMobile ? 56 : 140) - 32 - 40 - 28,
              }}
              className="w-full flex items-center justify-center flex-col rounded-md "
            >
              <StyledUserInfoTab mode={"create"} />
            </div>
          </div>
        </div>
      </div>
      <AlertDialogCancelFormButton
        tabIndex={16}
        title={"Back to staff list page."}
        onConfirm={goToStaffList}
        // mode={props.mode}
        open={openCancelDialog}
        onOpenChange={setOpenCancelDialog}
      />
    </div>
  );
}
