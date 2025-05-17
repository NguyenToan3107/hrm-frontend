"use client";
import SideBarComponent from "@/components/common/SideBarComponent";
import { StyledBreadcrumb } from "@/components/common/StyledBreadcrumb";
import StyledHeader from "@/components/common/StyledHeader";
import StyledOverlay from "@/components/common/StyledOverlay";
import StyledPagination from "@/components/common/StyledPagination";
import { useCheckPermission } from "@/hooks/useCheckPermission";
import useWindowSize from "@/hooks/useWindowSize";
import { useCommonStore } from "@/stores/commonStore";
import { ITEM_PER_PAGE } from "@/utilities/static-value";
import { useEffect, useMemo, useState } from "react";
import { isMobile } from "react-device-detect";
import SearchArea from "./components/SearchArea";
import StyledDayOffsTable from "./components/StyledDayOffsTable";
// import StyledLeavesTableMobile from "./components/StyledLeavesTableMobile";
// import { SearchAreaPopup } from "./components/SearchAreaPopup";
import { GetDayOffsParams } from "@/apis/modules/schedule";
import { Button } from "@/components/ui/button";
import { GetDayOffsUseCase } from "@/core/application/usecases/schedule/getDayOffs.usecase";
import { ScheduleRepositoryImpl } from "@/core/infrastructure/repositories/schedule.repo";
import { useScheduleStore } from "@/stores/scheduleStore";
import { useUserStore } from "@/stores/userStore";
import { CountryType } from "@/utilities/enum";
import { useRouter } from "next/navigation";

const scheduleRepo = new ScheduleRepositoryImpl();
const getDayOffsUseCase = new GetDayOffsUseCase(scheduleRepo);

export default function DayoffsScreen() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const windowSize = useWindowSize();
  const router = useRouter();
  const { sidebarStatus, updateSideBarStatus } = useCommonStore();
  const { updateDayOffListData, updateSearchParams, totalItems, searchParams } =
    useScheduleStore((state) => state);
  const { user } = useUserStore();

  const onPageChange = async (page: number) => {
    try {
      setLoading(true);
      const params = { ...searchParams, page };
      const response = await getDayOffsUseCase.execute(params);
      setPage(page);
      updateSearchParams(params);
      updateDayOffListData(response?.data || [], response?.totalItem || 0);
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
      const params: GetDayOffsParams = {
        country: CountryType.VN,
        page: 1,
        limit: ITEM_PER_PAGE,
      };
      const response = await getDayOffsUseCase.execute(params);
      updateSearchParams(params);
      updateDayOffListData(response?.data || [], response?.totalItem || 0);
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

  const isCreateLeavebutton = useMemo(() => {
    const userRole = user?.role;
    return userRole?.permissions?.includes("leave_create");
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
              {isCreateLeavebutton && (
                <Button
                  onClick={goToCreatePage}
                  className="w-[80px] font-normal h-8 text-white text-[12px] bg-button-create  hover:bg-button-create-hover"
                >
                  Create
                </Button>
              )}
              {/* <SearchAreaPopup
                loading={loading}
                setLoading={setLoading}
                setPage={setPage}
                currentPage={page}
              /> */}
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
              //   <StyledLeavesTableMobile
              //     loading={loading}
              //     setLoading={setLoading}
              //     currentPage={page}
              //   />
              ""
            ) : (
              <StyledDayOffsTable
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
    </div>
  );
}
