"use client";
import { GetStaffListParams } from "@/apis/modules/user";
import SideBarComponent from "@/components/common/SideBarComponent";
import StyledHeader from "@/components/common/StyledHeader";
import StyledOverlay from "@/components/common/StyledOverlay";
import StyledPagination from "@/components/common/StyledPagination";
import { GetStaffListUseCase } from "@/core/application/usecases/staff-master/getUserList.usecase";
import { UserRepositoryImpl } from "@/core/infrastructure/repositories/user.repo";
import useWindowSize from "@/hooks/useWindowSize";
import { useCommonStore } from "@/stores/commonStore";
import { useStaffStore } from "@/stores/staffStore";
import { ITEM_PER_PAGE } from "@/utilities/static-value";
import { useEffect, useState } from "react";
import SearchArea from "./components/SearchArea";
import StyledStaffMasterTable from "./components/StyledStaffMasterTable";
import { isMobile } from "react-device-detect";
import { StyledBreadcrumb } from "@/components/common/StyledBreadcrumb";
import { useCheckPermission } from "@/hooks/useCheckPermission";
import { useRouter, useSearchParams } from "next/navigation";
import StyledStaffMasterTableMobile from "@/app/staffs/components/StyledStaffMasterTableMobile";
import { Button } from "@/components/ui/button";
import { SearchAreaMobile } from "@/app/staffs/components/SearchAreaMobile";
const userRepo = new UserRepositoryImpl();
const getStaffListUseCase = new GetStaffListUseCase(userRepo);

export default function StaffScreen() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const totalItems = useStaffStore((state) => state.totalItems);
  const windowSize = useWindowSize();
  const { sidebarStatus, updateSideBarStatus } = useCommonStore();
  const route = useRouter();

  const { searchParams, updateStaffListData, updateSearchParams } =
    useStaffStore((state) => state);

  const onPageChange = async (page: number) => {
    try {
      setLoading(true);
      const params = { ...searchParams, page };
      const response = await getStaffListUseCase.execute(params);
      setPage(page);
      updateSearchParams(params);
      updateStaffListData(response?.data, response?.totalItem || 0);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const queryParams = useSearchParams();
  useEffect(() => {
    if (!queryParams.get("role") && !queryParams.get("status")) {
      onFirstLoad();
    }
    if (isMobile) updateSideBarStatus(false);
  }, []);

  const onFirstLoad = async () => {
    try {
      setLoading(true);
      let params: GetStaffListParams = {
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
      const response = await getStaffListUseCase.execute(params);
      updateStaffListData(response?.data, response?.totalItem || 0);
      updateSearchParams(params);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const goToCreateScreen = () => {
    route.push("/staffs/create-staff");
  };

  const { loading: roleLoading } = useCheckPermission(["staff_master"]);
  if (roleLoading) return null;

  return (
    <div className="flex flex-1 w-full h-full max-h-screen overflow-y-none overscroll-none">
      <SideBarComponent />
      <StyledOverlay isVisible={loading} />
      <div className="w-full block max-h-screen">
        <StyledHeader />
        <div className="flex flex-row items-center justify-between pr-4 py-2">
          <StyledBreadcrumb
            items={["Master", "Staffs"]}
            links={["", "/staffs"]}
          />
          {isMobile && (
            <div className="flex flex-row gap-x-2">
              <Button
                onClick={goToCreateScreen}
                className="w-[80px] font-normal h-8 text-white text-[12px] bg-button-create  hover:bg-button-create-hover"
              >
                Create
              </Button>
              <SearchAreaMobile
                loading={loading}
                setLoading={setLoading}
                setPage={setPage}
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
          className="px-2 laptop:px-4 w-full pb-4 flex flex-col gap-1"
        >
          <div
            style={{
              maxHeight: windowSize.height - (isMobile ? 64 : 100) - 40 - 50,
              minHeight: windowSize.height - (isMobile ? 64 : 100) - 40 - 50,
            }}
            className="border w-full rounded-sm px-2 py-1 laptop:px-5 laptop:py-2"
          >
            {!isMobile && (
              <SearchArea
                loading={loading}
                setLoading={setLoading}
                setPage={setPage}
              />
            )}
            {isMobile ? (
              <StyledStaffMasterTableMobile
                loading={loading}
                setLoading={setLoading}
                currentPage={page}
              />
            ) : (
              <StyledStaffMasterTable
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
