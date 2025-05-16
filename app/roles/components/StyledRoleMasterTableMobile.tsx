"use client";
import StyledHeaderColumn from "@/components/common/StyledHeaderColumn";
import useWindowSize from "@/hooks/useWindowSize";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import StyledNoDataGrid from "@/components/common/StyledNoDataGrid";
import { StyledTooltip } from "@/components/common/StyledToolTip";
import { GetRoleListUseCase } from "@/core/application/usecases/role/getRoleList.usecase";
import { Role } from "@/core/entities/models/role.model";
import { RoleRepositoryImpl } from "@/core/infrastructure/repositories/role.repo";
import { useRoleStore } from "@/stores/roleStore";
import { SortOrder } from "@/utilities/enum";
import { isMobile } from "react-device-detect";

const roleRepo = new RoleRepositoryImpl();
const getRoleListUseCase = new GetRoleListUseCase(roleRepo);

interface Props {
  setLoading(loading: boolean): void;
  loading: boolean;
}

export default function StyledRoleMasterTableMobile(props: Props) {
  const { loading, setLoading } = props;
  const windowSize = useWindowSize();
  const router = useRouter();

  const { roleList, searchParams, updateRoleListData, updateSearchParams } =
    useRoleStore((state) => state);

  const goToDetailPage = (role: Role) => {
    router.push(`/roles/detail-role/${role.id}`);
  };

  const onReSearch = async (
    sort_by: string,
    sort_order: SortOrder.ASC | SortOrder.DESC
  ) => {
    try {
      setLoading(true);
      let params = searchParams;
      params = { ...searchParams, sort_by, sort_order };
      const response = await getRoleListUseCase.execute(params);
      updateSearchParams(params);
      updateRoleListData(response?.data, response?.totalItem || 0);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const [currentSortedColumn, setCurrentSortedColumn] = useState("");

  const [sortDirection, setSortDirection] = useState<
    SortOrder.ASC | SortOrder.DESC | ""
  >(SortOrder.ASC);

  const onClickColumnHeader = async (sort_column: string) => {
    if (currentSortedColumn === sort_column) {
      const direction =
        sortDirection === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
      onReSearch(sort_column, direction);
      setSortDirection(direction);
    } else {
      await onReSearch(sort_column, SortOrder.ASC);
      setCurrentSortedColumn(sort_column);
      setSortDirection(SortOrder.ASC);
    }
  };

  const onOpenNewTab = (role: Role) => {
    if (window) {
      window.open(`/staffs?role=${role.role_name}&&status=-1`);
    }
  };

  useEffect(() => {
    if (!searchParams.sort_by) {
      setCurrentSortedColumn("");
      setSortDirection("");
    }
  }, [searchParams]);

  return (
    <div
      style={{
        maxHeight: windowSize.height - (isMobile ? 76 : 100) - 96,
        minHeight: windowSize.height - (isMobile ? 76 : 100) - 96,
        scrollbarWidth: "none",
      }}
      className="overflow-y-auto max-h-screen overscroll-none block rounded-sm w-full relative mt-1"
    >
      <table className="overflow-y-none overscroll-x-none max-h-screen overscroll-none w-full border-separate border-spacing-0 relative ">
        <thead className="border-border border-b sticky top-0">
          <tr className="align-center bg-white ">
            <th
              onClick={() => onClickColumnHeader("name")}
              className="text-white pl-2 bg-primary font-medium align-center text-start min-w-[84px] w-[84px] hover:bg-primary-hover hover:cursor-pointer border-b"
            >
              <StyledHeaderColumn
                columnName={`Role`}
                columnNameId={"name"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("description")}
              className="text-white pl-2 bg-primary font-medium align-center text-start min-w-[120px] hover:bg-primary-hover hover:cursor-pointer border-b"
            >
              <StyledHeaderColumn
                columnName={"Description"}
                columnNameId={"description"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("employee_number")}
              className="text-white pl-2 bg-primary font-medium align-center text-start min-w-[96px] w-[96px] hover:bg-primary-hover hover:cursor-pointer border-b"
            >
              <StyledHeaderColumn
                columnName={"Assigned"}
                columnNameId={"employee_number"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
          </tr>
        </thead>
        {roleList.length !== 0 && (
          <tbody className="hide-scrollbar ">
            {!!roleList?.length &&
              roleList?.map((role: Role, index: number) => {
                return (
                  <tr
                    onClick={() => goToDetailPage(role)}
                    key={role?.id ? role?.id.toString() : String(index)}
                    className="overflow-x-auto w-screen align-center h-[52px] hover:bg-slate-200"
                  >
                    <td className="pl-2 border-b border-[#F6F6F6] whitespace-pre-wrap  max-w-[100px]  ">
                      <StyledTooltip
                        content={String(
                          role?.name
                            ? role?.name?.charAt(0).toUpperCase() +
                                role?.name?.slice(1)
                            : ""
                        )}
                        contentClass=" max-h-[300px] "
                      >
                        <p className="text-[14px] text-ellipsis whitespace-pre-wrap break-words line-clamp-1">
                          {String(
                            role?.name
                              ? role?.name?.charAt(0).toUpperCase() +
                                  role?.name?.slice(1)
                              : ""
                          )}
                        </p>
                      </StyledTooltip>
                    </td>
                    <td className="pl-2 text-[16px] h-[52px] font-normal border-b border-[#F6F6F6]  overflow-hidden">
                      <StyledTooltip content={role.description}>
                        <p className="text-[14px] text-ellipsis whitespace-pre-wrap break-words line-clamp-2">
                          {role.description}
                        </p>
                      </StyledTooltip>
                    </td>
                    <td className="pl-2h-[52px] font-normal border-b border-[#F6F6F6] hover:cursor-pointer hover:text-primary hover:underline text-center text-primary">
                      <p
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenNewTab(role);
                        }}
                        className="underline text-[14px]"
                      >
                        {role.employee_number}
                      </p>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        )}
      </table>
      {roleList.length == 0 && !loading && <StyledNoDataGrid />}
    </div>
  );
}
