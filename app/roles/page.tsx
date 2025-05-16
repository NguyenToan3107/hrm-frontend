"use client";
import { GetRoleListParams } from "@/apis/modules/role";
import SearchArea from "@/app/roles/components/SearchArea";
import StyledRoleMasterTable from "@/app/roles/components/StyledRoleMasterTable";
import SideBarComponent from "@/components/common/SideBarComponent";
import { StyledBreadcrumb } from "@/components/common/StyledBreadcrumb";
import StyledHeader from "@/components/common/StyledHeader";
import StyledOverlay from "@/components/common/StyledOverlay";
import StyledPagination from "@/components/common/StyledPagination";
import { Button } from "@/components/ui/button";
import { GetRoleListUseCase } from "@/core/application/usecases/role/getRoleList.usecase";
import { RoleRepositoryImpl } from "@/core/infrastructure/repositories/role.repo";
import { useCheckPermission } from "@/hooks/useCheckPermission";
import useWindowSize from "@/hooks/useWindowSize";
import { useCommonStore } from "@/stores/commonStore";
import { useRoleStore } from "@/stores/roleStore";
import { ITEM_PER_PAGE } from "@/utilities/static-value";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import StyledRoleMasterTableMobile from "./components/StyledRoleMasterTableMobile";

import { useRouter } from "next/navigation";
import { SearchAreaPopup } from "./components/SearchAreaPopup";
const roleRepo = new RoleRepositoryImpl();
const getRoleListUseCase = new GetRoleListUseCase(roleRepo);

export default function RoleScreen() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const windowSize = useWindowSize();
  const { sidebarStatus, updateSideBarStatus } = useCommonStore();

  const route = useRouter();
  const { searchParams, updateRoleListData, updateSearchParams, totalItems } =
    useRoleStore((state) => state);

  const onPageChange = async (page: number) => {
    try {
      setLoading(true);
      const params = { ...searchParams, page };
      const response = await getRoleListUseCase.execute(params);
      setPage(page);
      updateSearchParams(params);
      updateRoleListData(response?.data, response?.totalItem || 0);
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
      let params: GetRoleListParams = {
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
      const response = await getRoleListUseCase.execute(params);
      updateRoleListData(response?.data, response?.totalItem || 0);
      updateSearchParams(params);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const goToCreateScreen = () => {
    route.push("/roles/create-role");
  };

  const { loading: roleLoading } = useCheckPermission(["role_master"]);
  if (roleLoading) return null;

  return (
    <div className="flex flex-1 w-full h-full max-h-screen overflow-y-none overscroll-none">
      <SideBarComponent />
      <StyledOverlay isVisible={loading} />
      <div className="w-full block max-h-screen">
        <StyledHeader />
        <div className="flex flex-row items-center justify-between pr-4 py-2">
          <StyledBreadcrumb
            items={["Master", "Roles"]}
            links={["", "/roles"]}
          />
          {isMobile && (
            <div className="flex flex-row gap-x-2">
              <Button
                onClick={goToCreateScreen}
                className="w-[80px] font-normal h-8 text-white text-[12px] bg-button-create  hover:bg-button-create-hover"
              >
                Create
              </Button>
              <SearchAreaPopup
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
              maxHeight: windowSize.height - (isMobile ? 64 : 100) - 30 - 60,
              minHeight: windowSize.height - (isMobile ? 64 : 100) - 30 - 60,
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
              <StyledRoleMasterTableMobile
                loading={loading}
                setLoading={setLoading}
              />
            ) : (
              <StyledRoleMasterTable
                loading={loading}
                setLoading={setLoading}
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
