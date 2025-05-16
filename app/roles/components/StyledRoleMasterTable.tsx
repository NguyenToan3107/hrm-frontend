"use client";
import IconEdit from "@/app/assets/icons/iconEditBlack.svg";
import StyledHeaderColumn from "@/components/common/StyledHeaderColumn";
import useWindowSize from "@/hooks/useWindowSize";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import IconDetail from "@/app/assets/icons/iconViewDetail.svg";
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

export default function StyledRoleMasterTable(props: Props) {
  const { loading, setLoading } = props;
  const windowSize = useWindowSize();
  const router = useRouter();

  const { roleList, searchParams, updateRoleListData, updateSearchParams } =
    useRoleStore((state) => state);

  const goToEditPage = (role: Role) => {
    router.push(`/roles/edit-role/${role.id}`);
  };

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
        maxHeight: windowSize.height - (isMobile ? 56 : 100) - 210,
        minHeight: windowSize.height - (isMobile ? 56 : 100) - 210,
        scrollbarWidth: "none",
      }}
      className="overflow-y-auto laptop:mt-0 max-h-screen overscroll-none block rounded-sm w-full relative"
    >
      <table className="overflow-y-none overscroll-x-none max-h-screen overscroll-none w-full border-separate border-spacing-0 relative">
        <thead className="border-border border-b sticky top-0">
          <tr className=" align-center bg-white ">
            <th
              onClick={() => onClickColumnHeader("name")}
              className="text-[16px] text-white pl-2 bg-primary font-medium align-center text-start min-w-[160px] w-[160px] laptop:min-w-[280px] laptop:w-[280px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={`Role Name`}
                columnNameId={"name"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th
              onClick={() => onClickColumnHeader("description")}
              className=" text-[16px] text-white pl-2 bg-primary font-medium align-center text-start min-w-[120px] hover:bg-primary-hover hover:cursor-pointer  border-b"
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
              className=" text-[16px] text-white pl-2 bg-primary font-medium align-center text-start min-w-[180px] w-[180px] hover:bg-primary-hover hover:cursor-pointer  border-b"
            >
              <StyledHeaderColumn
                columnName={"Employee Number"}
                columnNameId={"employee_number"}
                currentSortedColumnId={currentSortedColumn}
                direction={sortDirection}
              />
            </th>
            <th className="text-[16px] text-white pl-2 bg-primary font-medium align-center text-start min-w-[112px] w-[112px] hover:bg-primary-hover hover:cursor-pointer  border-b">
              Action
            </th>
          </tr>
        </thead>
        {roleList.length !== 0 && (
          <tbody className="hide-scrollbar">
            {!!roleList?.length &&
              roleList?.map((role: Role, index: number) => {
                return (
                  <tr
                    key={role?.id ? role?.id.toString() : String(index)}
                    className="overflow-x-auto w-screen align-center h-[60px] laptop:h-[52px]"
                  >
                    <td className="pl-2 border-b border-[#F6F6F6]">
                      {String(
                        role?.name
                          ? role?.name?.charAt(0).toUpperCase() +
                              role?.name?.slice(1)
                          : ""
                      )}
                    </td>
                    <td className="pl-2 text-[16px] h-[60px] font-normal border-b border-[#F6F6F6]  overflow-hidden">
                      <StyledTooltip content={role.description}>
                        <p className="text-[16px]">{role.description}</p>
                      </StyledTooltip>
                    </td>
                    <td className="pl-2 text-[16px] h-[60px] font-normal border-b border-[#F6F6F6] hover:cursor-pointer hover:text-primary hover:underline text-center">
                      <p onClick={() => onOpenNewTab(role)}>
                        {role.employee_number}
                      </p>
                    </td>
                    <td className="pl-2 text-[16px] h-[60px] font-normal border-b border-[#F6F6F6]">
                      <div className="flex items-center justify-start w-full gap-x-2">
                        <Image
                          onClick={() => goToDetailPage(role)}
                          alt="Go to edit"
                          src={IconDetail}
                          className="h-[24px] aspect-square hover:cursor-pointer"
                        />
                        {role?.name != "admin" &&
                          role?.name != "staff" &&
                          role?.name != "leader" && (
                            <Image
                              onClick={() => goToEditPage(role)}
                              alt="Go to detail"
                              src={IconEdit}
                              className="h-[24px] aspect-square hover:cursor-pointer"
                            />
                          )}
                      </div>
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
