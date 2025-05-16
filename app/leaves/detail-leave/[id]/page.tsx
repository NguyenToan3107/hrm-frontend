"use client";
import {
  GetLeaveDetailParams,
  UpdateLeaveByUserParams,
} from "@/apis/modules/leave";
import CanRequestIcon from "@/app/assets/icons/iconCanRequest.svg";
import CanRequestIconBlue from "@/app/assets/icons/iconCanRequestBlue.svg";
import CanRequestIconGray from "@/app/assets/icons/iconCanRequestGray.svg";
import { message } from "@/app/assets/locales/en";
import ButtonGrid from "@/app/leaves/components/ButtonGrid";
import FormLeave from "@/app/leaves/components/FormLeave";
import { AlertDialogSubmitFormButton } from "@/components/common/alert-dialog/AlertDialogSubmitFormButton";
import SideBarComponent from "@/components/common/SideBarComponent";
import { StyledBreadcrumb } from "@/components/common/StyledBreadcrumb";
import StyledHeader from "@/components/common/StyledHeader";
import { Button } from "@/components/ui/button";
import { GetLeaveDetailUseCase } from "@/core/application/usecases/leave/getLeaveDetail";
import { UpdateLeaveByUserUseCase } from "@/core/application/usecases/leave/updateLeave";
import { Leave } from "@/core/entities/models/leave.model";
import { LeaveRepositoryImpl } from "@/core/infrastructure/repositories/leave.repo";
import useWindowSize from "@/hooks/use-dimession";
import { toast } from "@/hooks/use-toast";
import { useCheckPermission } from "@/hooks/useCheckPermission";
import { CancelRequestValue, FormModeType } from "@/utilities/enum";
import { formatDateToString } from "@/utilities/format";
import { convertHourToDay } from "@/utilities/helper";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

const leaveRepo = new LeaveRepositoryImpl();
const getLeaveDetailUseCase = new GetLeaveDetailUseCase(leaveRepo);
const updateLeaveDetailUseCase = new UpdateLeaveByUserUseCase(leaveRepo);

const formSchema = z.object({
  // day_leaves: z.union([z.string(), z.date()]).refine(
  //   (value) => {
  //     const isPastDate = isTargetBeforeCurrent(formatDateToString(value));
  //     return !isPastDate;
  //   },
  //   {
  //     message: "You cannot select the current or a past date",
  //   }
  // ),
  day_leaves: z.union([
    z.string({ message: "Leave Date is required" }),
    z.date(),
  ]),
  shift: z.string().trim().optional(),
  status: z.string().trim().optional(),
  description: z.string().trim()?.optional(),
  other_info: z.string().trim(),
  created_at: z.string().trim().optional(),
  approval_date: z.string().trim().optional(),
  approverId: z.string().trim(),
});

export default function LeaveDetailScreen() {
  const params = useParams();
  const windowSize = useWindowSize();
  const [leave, setLeave] = useState<Leave>();
  const idLeave = params?.id;
  const formLeaveRef = useRef<any>(null);
  const [mode, setMode] = useState(FormModeType.VIEW); // 0: view, 1: edit
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSetEditMode = async () => {
    formLeaveRef.current?.toggleDisable(false);
    setMode(FormModeType.EDIT);
  };

  const onLoadLeaveDetail = async () => {
    try {
      const params: GetLeaveDetailParams = { id: Number(idLeave) };
      const response = await getLeaveDetailUseCase.execute(params);
      setLeave(response?.data);
    } catch (error) {}
  };

  useEffect(() => {
    onLoadLeaveDetail();
  }, []);

  const onUpdateFormLeave = () => {
    setOpenSubmitDialog(true);
  };

  const onUpdateLeave = async () => {
    try {
      if (!leave?.id) return;
      const data = form.getValues();
      const params: UpdateLeaveByUserParams = {
        id: String(leave?.id),
        updated_at: leave?.updated_at,
        day_leave: formatDateToString(data.day_leaves || "") || "",
        other_info: data.other_info,
        shift: data.shift || "",
        approver_id: String(data.approverId),
        description: data.description || "",
      };
      const response = await updateLeaveDetailUseCase.execute(params);
      if (response?.code == 1) {
        if (
          response.data?.SHIFT_OF_LEAVE_EXISTED_ON_DAY &&
          response.data.SHIFT_OF_LEAVE_EXISTED_ON_DAY[0] ==
            "SHIFT_OF_LEAVE_EXISTED_ON_DAY"
        ) {
          toast({
            description:
              "A leave request for all day on the same date has already been approved.",
            color: "bg-red-100",
          });
        } else if (
          response.data?.SHIFT_OF_LEAVE_EXISTED_MORNING &&
          response.data.SHIFT_OF_LEAVE_EXISTED_MORNING[0] ==
            "SHIFT_OF_LEAVE_EXISTED_MORNING"
        ) {
          toast({
            description:
              "A leave request for the morning on the same date has already been approved.",
            color: "bg-red-100",
          });
        } else if (
          response.data?.SHIFT_OF_LEAVE_EXISTED_AFTERNOON &&
          response.data.SHIFT_OF_LEAVE_EXISTED_AFTERNOON[0] ==
            "SHIFT_OF_LEAVE_EXISTED_AFTERNOON"
        ) {
          toast({
            description:
              "A leave request for the afternoon on the same date has already been approved.",
            color: "bg-red-100",
          });
        } else if (
          response.data?.EXISTED_LEAVE_WAITING_ON_DAY &&
          response.data.EXISTED_LEAVE_WAITING_ON_DAY[0] ==
            "EXISTED_LEAVE_WAITING_ON_DAY"
        ) {
          toast({
            description:
              "A leave request for the same date already exists and is awaiting approval. Please modify the request if necessary.",
            color: "bg-red-100",
          });
        } else if (
          response?.data?.NO_CREATE_LEAVE_ON_DAY_OFF &&
          response?.data?.NO_CREATE_LEAVE_ON_DAY_OFF[0] ==
            "NO_CREATE_LEAVE_ON_DAY_OFF"
        ) {
          toast({
            description: "Cannot edit leave on day off",
            color: "bg-red-100",
          });
        } else if (
          response?.data?.DAY_IS_WEEKEND &&
          response?.data?.DAY_IS_WEEKEND[0] == "DAY_IS_WEEKEND"
        ) {
          toast({
            description: "Cannot edit leave on weekends",
            color: "bg-red-100",
          });
        } else {
          toast({
            description: "Updated leave failed",
            color: "bg-red-100",
          });
        }
      } else if (response?.code == -1) {
        toast({
          description: message.concurencyUpdate,
          color: "bg-red-100",
        });
      } else {
        toast({
          description: "Updated leave successfully",
          color: "bg-blue-200",
        });
        setMode(FormModeType.VIEW);
      }
    } catch (error) {
    } finally {
    }
  };

  const { loading: roleLoading } = useCheckPermission(["leave_list"]);
  if (roleLoading || !leave) return null;
  return (
    <div className="w-full flex px-2">
      <SideBarComponent />
      <div className="w-full max-h-screen block bg-white">
        <StyledHeader />
        <StyledBreadcrumb
          items={["Leaves", "Detail Leave"]}
          links={["/leaves", `/leaves/detail-leave/${idLeave}`]}
          triggerClass={"pb-0 laptop:px-6 px-4"}
        />
        <div
          style={{
            maxHeight: windowSize.height - 56 - 40 - 32,
            minHeight: windowSize.height - 132 - 40 - 32,
          }}
          className="px-2 w-full laptop:px-4 border border-border rounded-md"
        >
          <div className="flex flex-row justify-left items-center gap-x-2">
            <p className="text-[20px] font-semibold  w-fit text-center">
              Leave Information
            </p>
            <p className="font-bold text-xl">({leave?.idkey})</p>

            {leave?.cancel_request == CancelRequestValue.Waiting && (
              <div className="h-full relative">
                <Image
                  src={CanRequestIcon}
                  alt=""
                  className="object-cover rounded-lg w-[28px] h-[28px]"
                  height={40}
                  width={40}
                />
                <p className="text-white font-bold text-[12px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
                  CR
                </p>
              </div>
            )}
            {leave?.cancel_request == CancelRequestValue.Skip && (
              <div className="h-full relative">
                <Image
                  src={CanRequestIconBlue}
                  alt=""
                  className="object-cover rounded-lg w-[28px] h-[28px]"
                  height={40}
                  width={40}
                />
                <p className="text-white font-bold text-[12px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
                  CR
                </p>
              </div>
            )}
            {leave?.cancel_request == CancelRequestValue.Cancel && (
              <div className="h-full relative">
                <Image
                  src={CanRequestIconGray}
                  alt=""
                  className="object-cover rounded-lg w-[28px] h-[28px]"
                  height={40}
                  width={40}
                />
                <p className="text-white font-bold text-[12px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
                  CR
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-start w-full min-h-[132px]">
            <p className="font-semibold mb-1">Requestor Information</p>
            <div className="flex flex-row w-full justify-start gap-y-2 h-full rounded-[4px] border-[2px] border-opacity-25 border-black px-0 laptop:px-2 flex-1">
              <table className="w-full flex justify-start items-center px-1">
                <tbody className="w-full">
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-5">
                      Employee ID:
                    </td>
                    <td className="text-[14px] font-normal leading-5 px-2">
                      {leave?.user_idkey}
                    </td>
                  </tr>
                  <tr className="w-full">
                    <td className="text-[#16151C] font-semibold text-[14px] leading-5 min-w-[110px]">
                      Full name:
                    </td>
                    <td className="text-[14px] font-normal leading-5 px-2 h-6 w-full flex flex-1 line-clamp-1">
                      {leave?.employee_name?.trim()}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-5">
                      Contact:
                    </td>
                    <td className="text-[14px] font-normal leading-5 px-2">
                      {leave?.phone}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-5">
                      Leave hour:
                    </td>
                    <td className="text-[14px] font-normal leading-5 px-2">
                      {convertHourToDay(
                        leave?.time_off_hours,
                        leave?.last_year_time_off
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-[#16151C] font-semibold text-[14px] leading-6">
                      Allocated hour:
                    </td>
                    <td className="text-[14px] font-normal leading-6 px-2">
                      {convertHourToDay(leave?.allocated_hour, 0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="font-bold my-1">Leave Detail</p>
          <div
            className={twMerge(
              "flex flex-col items-start w-full overflow-x-auto py-2",
              mode == FormModeType.VIEW && `bg-orange-50`
            )}
            style={{
              maxHeight: windowSize.height - 56 - 292 + (isMobile ? 8 : 0),
              minHeight: windowSize.height - 56 - 292 + (isMobile ? 8 : 0),
            }}
          >
            <FormLeave
              form={form}
              leave={leave}
              ref={formLeaveRef}
              mode={mode}
            />
          </div>
          <div className="fixed bottom-[8px] right-0 left-0 flex flex-1 flex-row justify-end items-end gap-x-2 gap-y-2 mx-4">
            {mode == FormModeType.EDIT ? (
              <div className="flex flex-row justify-end gap-2 w-full mt-2">
                <Button
                  tabIndex={10}
                  onClick={() => setMode(FormModeType.VIEW)}
                  className="w-[100px] p-0 h-8 mt-0  font-normal bg-white hover:bg-gray-200 rounded-[8px] flex items-center justify-center border border-border"
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  tabIndex={10}
                  onClick={form.handleSubmit(onUpdateFormLeave)}
                  className="w-[100px] p-0 h-8 mt-0 text-white font-normal bg-primary hover:bg-primary-hover rounded-[8px] flex items-center justify-center "
                  type="button"
                >
                  Update
                </Button>
              </div>
            ) : (
              <ButtonGrid leave={leave} onSetEditMode={onSetEditMode} />
            )}
          </div>
        </div>
      </div>
      <AlertDialogSubmitFormButton
        tabIndex={16}
        title={"Submit form"}
        onConfirm={onUpdateLeave}
        // mode={props.mode}
        open={openSubmitDialog}
        onOpenChange={setOpenSubmitDialog}
      />
    </div>
  );
}
