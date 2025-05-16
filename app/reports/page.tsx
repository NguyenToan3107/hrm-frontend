"use client";
import { GetStaffListParams } from "@/apis/modules/user";
import SearchArea from "@/app/reports/components/SearchArea";
import StyledExportPDF from "@/app/reports/components/StyledExportPDF";
import StyledReportMasterTable from "@/app/reports/components/StyledReportMasterTable";
import SideBarComponent from "@/components/common/SideBarComponent";
import { StyledBreadcrumb } from "@/components/common/StyledBreadcrumb";
import StyledHeader from "@/components/common/StyledHeader";
import StyledOverlay from "@/components/common/StyledOverlay";
import StyledPagination from "@/components/common/StyledPagination";
import { GetReportListUseCase } from "@/core/application/usecases/report/getReportList.usecase";
import { ReportRepositoryImpl } from "@/core/infrastructure/repositories/report.repo";
import { useCheckPermission } from "@/hooks/useCheckPermission";
import useWindowSize from "@/hooks/useWindowSize";
import { useCommonStore } from "@/stores/commonStore";
import { useReportStore } from "@/stores/reportStore";
import { ITEM_PER_PAGE } from "@/utilities/static-value";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";

const reportRepo = new ReportRepositoryImpl();
const getReportListUseCase = new GetReportListUseCase(reportRepo);

export default function ReportScreen() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const windowSize = useWindowSize();
  const { sidebarStatus, updateSideBarStatus } = useCommonStore();

  const {
    searchParams,
    totalItems,
    updateReportStaffListData,
    updateSearchParams,
  } = useReportStore((state) => state);

  const onPageChange = async (page: number) => {
    try {
      setLoading(true);
      const params = { ...searchParams, page };
      const response = await getReportListUseCase.execute(params);
      setPage(page);
      updateSearchParams(params);
      updateReportStaffListData(response?.data, response?.totalItem || 0);
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
      const response = await getReportListUseCase.execute(params);
      updateReportStaffListData(response?.data, response?.totalItem || 0);
      updateSearchParams(params);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const { loading: roleLoading } = useCheckPermission(["exportPDF"]);
  if (roleLoading) return null;

  return (
    <div className="flex flex-1 w-full h-full max-h-screen overflow-y-none overscroll-none">
      <SideBarComponent />
      <StyledOverlay isVisible={loading} />
      <div className="w-full block max-h-screen">
        <StyledHeader />
        <StyledBreadcrumb
          items={["Reports", "Attendance Report"]}
          links={["/reports", "/reports"]}
        />
        <div
          style={{
            maxWidth: sidebarStatus
              ? windowSize.width - (isMobile ? 0 : 244)
              : windowSize.width - (isMobile ? 0 : 72),
          }}
          className="px-5 w-full pb-4"
        >
          <div
            style={{
              maxHeight: windowSize.height - 100 - 40 - 20 - 44 - 32 - 16 - 36,
              minHeight: windowSize.height - 100 - 40 - 20 - 44 - 32 - 16 - 36,
            }}
            className="laptop:border w-full rounded-sm laptop:px-5 laptop:py-2"
          >
            <SearchArea
              loading={loading}
              setLoading={setLoading}
              setPage={setPage}
            />
            <StyledReportMasterTable
              loading={loading}
              setLoading={setLoading}
              currentPage={page}
            />
          </div>
          <StyledExportPDF />
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
