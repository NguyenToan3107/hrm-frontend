"use client";
import SideBarComponent from "@/components/common/SideBarComponent";
import StyledHeader from "@/components/common/StyledHeader";
import MyPageTab from "./components/MyPageTab";
import ImageProfileForm from "@/app/my-page/components/ImageProfileForm";
import { StyledBreadcrumb } from "@/components/common/StyledBreadcrumb";
import { useCheckPermission } from "@/hooks/useCheckPermission";

export default function MyPageScreen() {
  const { loading: roleLoading } = useCheckPermission(["mypage"]);
  if (roleLoading) return null;
  return (
    <div className="flex flex-1 w-full h-full max-h-screen overflow-y-none overscroll-none">
      <SideBarComponent />
      <div className="block w-full">
        <StyledHeader />
        <StyledBreadcrumb items={["My Page"]} links={["/my-page"]} />
        <div className="laptop:border laptop:border-border laptop:rounded-md laptop:mx-5 laptop:pb-4">
          <ImageProfileForm />
          <div className="flex-1 px-4">
            <MyPageTab />
          </div>
        </div>
      </div>
    </div>
  );
}
