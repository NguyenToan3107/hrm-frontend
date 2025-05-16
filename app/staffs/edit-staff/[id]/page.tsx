"use client";
import IconLeaves from "@/app/assets/icons/iconLeaves.svg";
import IconUserWhite from "@/app/assets/icons/iconUserWhite.svg";
import SideBarComponent from "@/components/common/SideBarComponent";
import StyledAvatarUser from "@/components/common/StyledAvatarUser";
import StyledHeader from "@/components/common/StyledHeader";
import useWindowSize from "@/hooks/useWindowSize";
import { useStaffStore } from "@/stores/staffStore";
import Image from "next/image";
import StyledUserInfoTab from "../../components/StyledUserInfoTab";
import { StyledBreadcrumb } from "@/components/common/StyledBreadcrumb";
import { useParams } from "next/navigation";
import { useState } from "react";
import { isMobile } from "react-device-detect";
import { useCheckPermission } from "@/hooks/useCheckPermission";

export default function EditStaffScreen() {
  const windowSize = useWindowSize();
  const params = useParams();

  const { selectedStaff, isDirty, updateIsDirty } = useStaffStore(
    (state) => state
  );
  const [openBreadcrumbDialog, setOpenBreadcrumbDialog] = useState(false);

  const { loading: roleLoading } = useCheckPermission(["staff_master"]);
  if (roleLoading) return null;

  return (
    <div className="w-full flex ">
      <SideBarComponent />
      <div className="w-full max-h-screen block bg-white ">
        <StyledHeader />
        <StyledBreadcrumb
          items={["Master", "Staffs", "Edit Staff"]}
          links={["", "/staffs", `/staffs/edit-staff/${params?.id}`]}
          triggerClass={"pb-0"}
          isDirty={isDirty}
          onUpdateIsDirty={updateIsDirty}
          open={openBreadcrumbDialog}
          onOpenChange={setOpenBreadcrumbDialog}
        />
        <div className="px-2 laptop:p-5">
          <div
            style={{
              maxHeight:
                windowSize.height - (isMobile ? 56 : 100) - 40 - 20 - 12,
              minHeight:
                windowSize.height - (isMobile ? 56 : 100) - 40 - 20 - 12,
            }}
            className="w-full border border-border rounded-md "
          >
            <div className="h-[92px] laptop:h-[120px] flex justify-between items-end px-2 laptop:px-4 rounded-sm bg-white w-full">
              <StyledAvatarUser
                id={selectedStaff?.idkey || ""}
                fullName={selectedStaff?.fullname || ""}
                role={selectedStaff?.role?.name || ""}
                imageUrl={selectedStaff?.image}
                email={selectedStaff?.email || ""}
              />
            </div>

            <div
              className="w-full flex flex-col laptop:flex-row gap-x-8 px-2 laptop:px-4 py-2 laptop:py-4 "
              style={{
                maxHeight: windowSize.height - (isMobile ? 56 : 100) - 120 - 20,
                minHeight: windowSize.height - (isMobile ? 56 : 100) - 120 - 20,
              }}
            >
              <div className="w-full hidden laptop:flex laptop:w-[242px] h-[52px] laptop:h-[110px] border border-border rounded-md items-center justify-center flex-row laptop:flex-col">
                <div className="flex h-[52px] py-3 laptop:py-0 flex-1 items-center justify-start px-5 bg-primary w-full rounded-tl-md rounded-tr-none laptop:rounded-tr-md rounded-bl-md laptop:rounded-bl-none">
                  <Image alt="" src={IconUserWhite} />
                  <p className="text-[16px] font-semibold text-white mx-2">
                    Profile
                  </p>
                </div>
                <div className="flex h-[48px] py-3 laptop:py-0 flex-1 items-center justify-start px-5 bg-white w-full rounded-bl-md rounded-br-md hover:cursor-not-allowed">
                  {/* <div className="h-3 w-3 rounded-full bg-white mx-2" /> */}
                  <Image alt="" src={IconLeaves} width={24} height={24} />
                  <p className="text-[16px] font-semibold text-secondary mx-2">
                    Leaves
                  </p>
                </div>
              </div>
              <div
                style={{
                  maxHeight:
                    windowSize.height - (isMobile ? 56 : 130) - 120 - 48 - 20,
                  minHeight:
                    windowSize.height - (isMobile ? 56 : 130) - 120 - 48 - 20,
                }}
                className="w-full laptop:border border-border flex items-center justify-center flex-col rounded-md "
              >
                <StyledUserInfoTab mode={"edit"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
