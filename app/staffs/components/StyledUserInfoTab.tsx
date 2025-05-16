import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useState } from "react";

import { AlertDialogCancelFormButton } from "@/components/common/alert-dialog/AlertDialogCancelFormButton";
import { useStaffStore } from "@/stores/staffStore";
import ProfessionalIcon from "../../assets/icons/iconBriefcase.svg";
import ProfessionalActiveIcon from "../../assets/icons/iconBriefcaseActive.svg";
import PersonalIcon from "../../assets/icons/iconUser.svg";
import PersonalActiveIcon from "../../assets/icons/iconUserActive.svg";
import PersonalInfoTab from "./PersonalInfoTab";
import ProfessionalInfoTab from "./ProfessionalInfoTab";

interface Props {
  mode: "view" | "edit" | "create";
}

export default function StyledUserInfoTab(props: Props) {
  const [tab, changeTab] = useState("professional");
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const { isDirty } = useStaffStore((state) => state);
  const onChangeTab = (tab: string) => {
    if (isDirty && props.mode !== "create") {
      setOpenCancelDialog(true);
    } else {
      changeTab(tab);
    }
  };
  const onTab = () => {
    if (tab == "personal") {
      changeTab("professional");
    } else {
      changeTab("personal");
    }
  };

  return (
    <Tabs
      value={tab}
      onValueChange={onChangeTab}
      defaultValue="personal"
      className={`flex flex-1 flex-col h-full w-full min-w-full rounded-md mt-4 laptop:mt-0 ${
        props.mode == "view" ? "bg-orange-50" : "bg-white"
      } `}
    >
      <TabsList className="w-full justify-start laptop:border-b border-border rounded-none py-0 mobile:max-w-screen mobile:overflow-x-auto hide-scrollbar">
        <TabsTrigger
          disabled={props.mode === "create"}
          value="professional"
          className="flex-col"
        >
          <div className="flex items-center h-9">
            <div className="w-5 h-5 laptop:w-6 laptop:h-6 mr-1 laptop:mr-2">
              {tab === "professional" ? (
                <Image
                  src={ProfessionalActiveIcon}
                  alt=""
                  className="w-5 h-5 laptop:w-6 laptop:h-6 laptop:mx-1"
                />
              ) : (
                <Image
                  src={ProfessionalIcon}
                  alt=""
                  className="w-5 h-5 laptop:w-6 laptop:h-6 laptop:mx-1"
                />
              )}
            </div>
            <p
              className="text-[16px] font-semibold"
              style={{
                // fontWeight: tab === "professional" ? "700" : "400",
                color: tab === "professional" ? "var(--primary)" : "black",
              }}
            >
              {/* Professional Information */}
              <span className="hidden laptop:flex">
                Professional Information
              </span>
              <span className="laptop:hidden">Professional Info</span>
            </p>
          </div>

          <div
            className="h-[4px] w-full"
            style={{
              backgroundColor:
                tab === "professional" ? "var(--primary)" : "transparent",
            }}
          />
        </TabsTrigger>

        <TabsTrigger
          disabled={props.mode === "create"}
          value="personal"
          className="flex-col px-0 laptop:px-3"
        >
          <div className="flex items-center h-9">
            <div className="w-5 h-5 laptop:w-6 laptop:h-6 mr-1 laptop:mr-2">
              {tab === "personal" ? (
                <Image
                  src={PersonalActiveIcon}
                  alt=""
                  className="w-5 h-5 laptop:w-6 laptop:h-6 mx-1"
                />
              ) : (
                <Image
                  src={PersonalIcon}
                  alt=""
                  className="w-5 h-5 laptop:w-6 laptop:h-6 mx-1"
                />
              )}
            </div>
            <p
              className="text-[16px] font-semibold"
              style={{
                color: tab === "personal" ? "var(--primary)" : "black",
              }}
            >
              {/* Personal Information */}
              <span className="hidden laptop:flex">Personal Information</span>
              <span className="laptop:hidden">Personal Info</span>
            </p>
          </div>
          <div
            className="h-[4px] w-full "
            style={{
              backgroundColor:
                tab === "personal" ? "var(--primary)" : "transparent",
            }}
          />
        </TabsTrigger>
      </TabsList>
      <TabsContent value="professional">
        <ProfessionalInfoTab mode={props.mode} changeTab={onChangeTab} />
      </TabsContent>
      <TabsContent value="personal">
        <PersonalInfoTab mode={props.mode} changeTab={onChangeTab} />
      </TabsContent>

      <AlertDialogCancelFormButton
        tabIndex={16}
        title={"Back to tab"}
        onConfirm={onTab}
        mode={props.mode}
        open={openCancelDialog}
        onOpenChange={setOpenCancelDialog}
      />
    </Tabs>
  );
}
