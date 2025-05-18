"use client";
import SideBarComponent from "@/components/common/SideBarComponent";
import StyledHeader from "@/components/common/StyledHeader";
import { GetLeavesListUseCase } from "@/core/application/usecases/leave/getLeaveList";
import { LeaveRepositoryImpl } from "@/core/infrastructure/repositories/leave.repo";
import useWindowSize from "@/hooks/useWindowSize";
import { useCommonStore } from "@/stores/commonStore";
import { useLeaveStore } from "@/stores/leavesStore";
import { useEffect, useMemo, useState } from "react";
import SearchArea from "./components/SearchArea";
import StyledLeavesTable from "./components/StyledLeavesTable";
import { isMobile } from "react-device-detect";
import { GetLeaveListParams } from "@/apis/modules/leave";
import { ITEM_PER_PAGE } from "@/utilities/static-value";
import StyledPagination from "@/components/common/StyledPagination";
import StyledOverlay from "@/components/common/StyledOverlay";
import { StyledBreadcrumb } from "@/components/common/StyledBreadcrumb";
import { useCheckPermission } from "@/hooks/useCheckPermission";
import StyledLeavesTableMobile from "./components/StyledLeavesTableMobile";
import { SearchAreaPopup } from "./components/SearchAreaPopup";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import Image from "next/image";
import IconStat from "@/app/assets/icons/IconStats1.png";
import { AlertDialogViewLeaveDetail } from "@/components/common/alert-dialog/AlertDialogViewLeaveDetail";

const leaveRepo = new LeaveRepositoryImpl();
const getLeavesListUseCase = new GetLeavesListUseCase(leaveRepo);

export default function LeavesScreen() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const windowSize = useWindowSize();
  const router = useRouter();
  const totalItems = useLeaveStore((state) => state.totalItems);
  const { sidebarStatus, updateSideBarStatus } = useCommonStore();
  const [isViewLeave, setIsViewLeave] = useState(false);

  const { searchParams, updateLeaveListData, updateSearchParams } =
    useLeaveStore((state) => state);
  const { user } = useUserStore();

  const onPageChange = async (page: number) => {
    try {
      setLoading(true);
      const params = { ...searchParams, page };
      const response = await getLeavesListUseCase.execute(params);
      setPage(page);
      updateSearchParams(params);
      updateLeaveListData(response?.data, response?.totalItem || 0);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    onFirstLoad();
    if (isMobile) updateSideBarStatus(false);
  }, []);

  const onFirstLoad = async () => {
    try {
      setLoading(true);
      let params: GetLeaveListParams = {
        page: 1,
        limit: ITEM_PER_PAGE,
      };
      if (searchParams) {
        if (searchParams?.page && searchParams?.page > 1) {
          params = {
            ...searchParams,
            limit: ITEM_PER_PAGE,
          };
          setPage(searchParams?.page);
        } else {
          params = { ...searchParams, page, limit: ITEM_PER_PAGE };
        }
      }
      const response = await getLeavesListUseCase.execute(params);
      updateLeaveListData(response?.data, response?.totalItem || 0);
      updateSearchParams(params);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const goToCreatePage = () => {
    if (isMobile) {
      router.push(`/leaves/create-leave`);
    }
  };

  const goToAdminCreate = () => {
    if (isMobile) {
      router.push(`/leaves/admin-create-leave`);
    }
  };
  const isCreateLeavebutton = useMemo(() => {
    const userRole = user?.role;
    return userRole?.permissions?.includes("leave_create");
  }, [user]);

  const isAdminCreateLeavebutton = useMemo(() => {
    const userRole = user?.role;
    return userRole?.permissions?.includes("add_supplementary");
  }, [user]);

  const { loading: roleLoading } = useCheckPermission(["leave_list"]);
  if (roleLoading) return null;

  return (
    <div className="flex flex-1 w-full h-full max-h-screen overflow-y-none overscroll-none">
      <SideBarComponent />
      <StyledOverlay isVisible={loading} />
      <div className="block w-full max-h-screen">
        <StyledHeader />
        {/* <StyledBreadcrumb items={["Leaves"]} links={["/leaves"]} /> */}
        <div className="flex flex-row items-center justify-between pr-4 py-2">
          <StyledBreadcrumb items={[" Leaves"]} links={["/leaves"]} />
          {isMobile && (
            <div className="flex flex-row gap-x-2">
              <div
                className="bg-primary w-auto p-3 h-8 flex justify-center items-center cursor-pointer rounded-lg"
                onClick={() => {
                  setIsViewLeave(true);
                }}
              >
                <Image
                  src={IconStat}
                  alt=""
                  width={20}
                  height={20}
                  className=""
                />
              </div>
              {isCreateLeavebutton && (
                <Button
                  onClick={goToCreatePage}
                  className="w-[80px] font-normal h-8 text-white text-[12px] bg-button-create  hover:bg-button-create-hover"
                >
                  Create
                </Button>
              )}
              {isAdminCreateLeavebutton && (
                <Button
                  onClick={goToAdminCreate}
                  className="w-[100px] font-normal h-8 text-white text-[12px] bg-button-create  hover:bg-button-create-hover"
                >
                  Supplementary
                </Button>
              )}
              <SearchAreaPopup
                loading={loading}
                setLoading={setLoading}
                setPage={setPage}
                currentPage={page}
              />
            </div>
          )}
        </div>
        <div
          style={{
            maxWidth: sidebarStatus
              ? windowSize.width - (isMobile ? 0 : 244)
              : windowSize.width - (isMobile ? 0 : 72),
          }}
          className="px-2 laptop:px-4 w-full pb-4  flex flex-col gap-1"
        >
          <div
            style={{
              maxHeight: windowSize.height - (isMobile ? 64 : 100) - 30 - 60,
              minHeight: windowSize.height - (isMobile ? 64 : 100) - 30 - 60,
            }}
            className="border w-full rounded-sm px-2 py-1 laptop:px-5 laptop:py-2 "
          >
            {!isMobile && (
              <SearchArea
                loading={loading}
                setLoading={setLoading}
                setPage={setPage}
                currentPage={page}
              />
            )}
            {isMobile ? (
              <StyledLeavesTableMobile
                loading={loading}
                setLoading={setLoading}
                currentPage={page}
              />
            ) : (
              <StyledLeavesTable
                loading={loading}
                setLoading={setLoading}
                currentPage={page}
              />
            )}
          </div>
          <StyledPagination
            totalItems={totalItems}
            itemsPerPage={ITEM_PER_PAGE}
            currentPage={page}
            onPageChange={onPageChange}
          />
        </div>
      </div>
      <AlertDialogViewLeaveDetail
        open={isViewLeave}
        onOpenChange={setIsViewLeave}
        searchParams={searchParams}
        onClose={() => {
          setIsViewLeave(false);
        }}
      />
    </div>
  );
}
