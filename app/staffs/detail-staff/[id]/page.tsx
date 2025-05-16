"use client";
import IconBackRoute from "@/app/assets/icons/iconBackRoute.svg";
import IconEditWhite from "@/app/assets/icons/iconEditWhite.svg";
import IconLeaves from "@/app/assets/icons/iconLeaves.svg";
import IconLeavesWhite from "@/app/assets/icons/iconLeavesWhite.svg";
// import IconExport from "@/app/assets/icons/iconExport.svg";
import IconUserBlack from "@/app/assets/icons/iconUser.svg";
import IconUserWhite from "@/app/assets/icons/iconUserWhite.svg";
import StyledMyLeave from "@/app/staffs/components/StyledMyLeave";
import SideBarComponent from "@/components/common/SideBarComponent";
import StyledAvatarUser from "@/components/common/StyledAvatarUser";
import StyledHeader from "@/components/common/StyledHeader";
import StyledPagination from "@/components/common/StyledPagination";
import { Button } from "@/components/ui/button";
import { GetMyLeaveUseCase } from "@/core/application/usecases/leave/getMyLeave";
import { LeaveRepositoryImpl } from "@/core/infrastructure/repositories/leave.repo";
import useWindowSize from "@/hooks/useWindowSize";

import ExportPDFDialog from "@/app/staffs/components/ExportPDFDialog";
import { StyledBreadcrumb } from "@/components/common/StyledBreadcrumb";
import { useCheckPermission } from "@/hooks/useCheckPermission";
import { useLeaveStore } from "@/stores/leavesStore";
import { useStaffStore } from "@/stores/staffStore";
import { ITEM_PER_PAGE } from "@/utilities/static-value";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { isMobile } from "react-device-detect";
import StyledUserInfoTab from "../../components/StyledUserInfoTab";

const leaveRepo = new LeaveRepositoryImpl();
const getMyLeaveUseCase = new GetMyLeaveUseCase(leaveRepo);

export default function DetailStaffScreen() {
  const [loading, setLoading] = useState(false);
  const windowSize = useWindowSize();
  const router = useRouter();
  const params = useParams();
  const [page, setPage] = useState(1);
  const [selectedTab, setSelectedTab] = useState("profile");
  const [isOpenExportPDF, setIsOpenExportPDF] = useState(false);
  const i18nStaff = useTranslations("Staff");

  const {
    searchMyLeaveParams,
    totalMyLeave,
    updateMyLeaveData,
    updateSearchMyLeaveParams,
  } = useLeaveStore((state) => state);

  const onPageChange = async (page: number) => {
    try {
      setLoading(true);
      const params = { ...searchMyLeaveParams, page };
      const response = await getMyLeaveUseCase.execute(params);
      setPage(page);
      updateSearchMyLeaveParams(params);
      updateMyLeaveData(response?.data, response?.totalItem || 0);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const { selectedStaff } = useStaffStore((state) => state);
  const goToDetailScreen = () => {
    router.push(`/staffs/edit-staff/${params?.id || "undefined"}`);
  };

  // const openExportPDF = () => {
  //   setIsOpenExportPDF(true);
  // };

  const { loading: roleLoading } = useCheckPermission(["staff_master"]);
  if (roleLoading) return null;
  return (
    <div className="w-full flex ">
      <SideBarComponent />
      <div className="w-full max-h-screen block bg-white">
        <StyledHeader />
        <StyledBreadcrumb
          items={["Master", "Staffs", "Detail Staff"]}
          links={["", "/staffs", `/staffs/detail-staff/${params?.id}`]}
          triggerClass={"pb-0"}
        />
        <div className="px-2 laptop:p-5">
          <div
            style={{
              maxHeight: windowSize.height - (isMobile ? 56 : 100) - 40 - 20 - 12,
              minHeight: windowSize.height - (isMobile ? 56 : 100) - 40 - 20 - 12,
            }}
            className="w-full rounded-md border border-border"
          >
            <div className=" h-[92px] laptop:h-[120px] flex pt-2 justify-between items-start laptop:items-end px-2 laptop:px-4 rounded-sm w-full">
              <StyledAvatarUser
                id={selectedStaff?.idkey || ""}
                fullName={selectedStaff?.fullname || ""}
                role={selectedStaff?.role?.name || ""}
                imageUrl={selectedStaff?.image}
                email={selectedStaff?.email || ""}
              />
              {selectedTab == "profile" && (
                <div className="w-full px-2 hidden laptop:flex justify-end items-end ">
                  <Button
                    type="button"
                    onClick={goToDetailScreen}
                    className="hidden font-normal laptop:flex min-w-[150px] bg-button-edit hover:bg-button-edit-hover"
                  >
                    <Image
                      alt=""
                      src={IconEditWhite}
                      width={24}
                      height={24}
                      className="text-white mr-2"
                    />
                    <p className={"text-white"}>{i18nStaff("editButton")}</p>
                  </Button>
                </div>
              )}

              <Button
                onClick={() => {
                  router.replace(`/staffs`);
                }}
                type="button"
                className="hidden laptop:flex text-black font-normal border border-border min-w-[150px] bg-white hover:bg-secondary"
              >
                <Image
                  alt=""
                  src={IconBackRoute}
                  width={24}
                  height={24}
                  className="text-white mr-2"
                />
                {i18nStaff("backStaffListButton")}
              </Button>
            </div>
            <div
              className="w-full flex flex-col laptop:flex-row gap-x-8 px-2 laptop:px-4 py-2 laptop:py-4"
              style={{
                maxHeight: windowSize.height - (isMobile ? 56 : 100) - 40 - 20,
                minHeight: windowSize.height - (isMobile ? 56 : 100) - 40 - 20,
              }}
            >
              <div className="w-full hidden laptop:flex laptop:w-[242px] h-[52px] laptop:h-[110px] border border-border rounded-md items-center justify-center flex-row laptop:flex-col">
                <div
                  className={`flex h-full py-3 laptop:py-0 flex-1 items-center justify-start px-5 w-full rounded-tl-md rounded-tr-none laptop:rounded-tr-md rounded-bl-md laptop:rounded-bl-none
                          ${
                            selectedTab === "profile"
                              ? "bg-primary text-white"
                              : "bg-white"
                          }`}
                  onClick={() => setSelectedTab("profile")}
                  style={{ cursor: "pointer" }}
                >
                  <Image
                    alt=""
                    src={
                      selectedTab === "profile" ? IconUserWhite : IconUserBlack
                    }
                  />
                  <p
                    className={`text-[16px] ${
                      selectedTab === "profile" ? "text-white" : "text-black"
                    } font-semibold mx-2`}
                  >
                    Profile
                  </p>
                </div>
                <div
                  className={`flex h-full py-3 laptop:py-0 flex-1 items-center justify-start px-5 w-full rounded-bl-none laptop:rounded-bl-md rounded-br-md rounded-tr-md laptop:rounded-tr-none 
                  ${
                    selectedTab === "leaves"
                      ? "bg-primary text-white"
                      : "bg-white"
                  }`}
                  onClick={() => setSelectedTab("leaves")}
                  style={{ cursor: "pointer" }}
                >
                  <Image
                    alt=""
                    src={
                      selectedTab === "leaves" ? IconLeavesWhite : IconLeaves
                    }
                    width={24}
                    height={24}
                  />
                  <p
                    className={`text-[16px] ${
                      selectedTab === "leaves" ? "text-white" : "text-black"
                    } font-semibold mx-2`}
                  >
                    Leaves
                  </p>
                </div>
              </div>
              <div
                style={{
                  maxHeight:
                    windowSize.height -
                    (isMobile ? 56 : 100) -
                    30 -
                    120 -
                    48 -
                    20,
                  minHeight:
                    windowSize.height -
                    (isMobile ? 56 : 100) -
                    30 -
                    120 -
                    48 -
                    20,
                }}
                className="w-full laptop:border border-border rounded-md"
              >
                {selectedTab == "profile" ? (
                  <StyledUserInfoTab mode={"view"} />
                ) : (
                  <StyledMyLeave
                    loading={loading}
                    setLoading={setLoading}
                    id={String(params?.id)}
                  />
                )}
                {selectedTab == "leaves" && (
                  <div className="flex flex-row justify-between laptop:px-5 w-full">
                    <StyledPagination
                      totalItems={totalMyLeave}
                      itemsPerPage={ITEM_PER_PAGE}
                      currentPage={page}
                      onPageChange={onPageChange}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExportPDFDialog
        isOpenExportPDF={isOpenExportPDF}
        setIsOpenExportPDF={setIsOpenExportPDF}
      />
    </div>
  );
}
