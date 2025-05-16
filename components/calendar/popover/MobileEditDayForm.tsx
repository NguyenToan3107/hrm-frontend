import {
  CreateDayOffParams,
  UpdateDayOffParams,
} from "@/apis/modules/schedule";
import { AlertDialogCancelFormButton } from "@/components/common/alert-dialog/AlertDialogCancelFormButton";
import { ALertDialogDeleteDayOff } from "@/components/common/alert-dialog/AlertDialogDeleteDayOff";
import { AlertDialogSubmitFormButton } from "@/components/common/alert-dialog/AlertDialogSubmitFormButton";
import StyledOverlay from "@/components/common/StyledOverlay";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { CreateDayOffUseCase } from "@/core/application/usecases/schedule/createDayOff.usecase";
import { UpdateDayOffUseCase } from "@/core/application/usecases/schedule/updateDayOff.usecase";
import { ScheduleRepositoryImpl } from "@/core/infrastructure/repositories/schedule.repo";
import { toast } from "@/hooks/use-toast";
import useWindowSize from "@/hooks/useWindowSize";
import { useScheduleStore } from "@/stores/scheduleStore";
import { useUserStore } from "@/stores/userStore";
import { MAX_LENGTH_TEXT } from "@/utilities/static-value";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface Props {
  dayType: "0" | "1" | "none";
  dayDescription: string;
  mode: "edit" | "create";
  title?: string;
  updatedAt: string;
  id: string;
  date: string;
  onClosePopover(): void;
}

const FormSchema = z.object({
  desciption: z
    .string({ message: "Description is required" })
    .max(MAX_LENGTH_TEXT, {
      message: `Description must not be longer than ${MAX_LENGTH_TEXT} characters.`,
    }),
  type: z.enum(["0", "1", "none"], {
    required_error: "Type is required",
  }),
});

const scheduleRepo = new ScheduleRepositoryImpl();
const createDayOff = new CreateDayOffUseCase(scheduleRepo);
const updateDayOff = new UpdateDayOffUseCase(scheduleRepo);

export default function MobileEditDayForm(props: Props) {
  const { mode } = props;

  // const [enableEdit, setEnableEdit] = useState(mode == "create");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { updateReload } = useScheduleStore((state) => state);
  const { user } = useUserStore();
  const windowSize = useWindowSize();
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  const isEditDashboard = useMemo(() => {
    const userRole = user?.role;
    return ["dashboard_edit"]?.every((permission) =>
      userRole?.permissions?.includes(permission)
    );
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const onCreateDayOff = async (data: z.infer<typeof FormSchema>) => {
    const createParams: CreateDayOffParams = {
      description: data.desciption,
      status: data.type == "0" ? "0" : "1",
      day_off: props.date,
    };
    const result = await createDayOff.execute(createParams);
    if (result?.code == 0) {
      toast({
        description: "Create day off successfully",
        color: `bg-blue-200`,
      });
      handleClose();
      updateReload(true);
    } else {
      toast({
        description: "Create day off failed",
        color: "bg-red-100",
      });
    }
  };

  const onUpdateDayOff = async (data: z.infer<typeof FormSchema>) => {
    const updateParams: UpdateDayOffParams = {
      id: props.id,
      updated_at: props.updatedAt,
      description: data.desciption,
      status: data.type == "0" ? "0" : "1",
      day_off: props.date,
    };
    const result = await updateDayOff.execute(updateParams);
    if (result?.code == 0) {
      toast({
        description: "Update day off information successfully",
        color: `bg-blue-200`,
      });
      handleClose();
      updateReload(true);
    } else {
      toast({
        description: "Update day off information failed",
        color: "bg-red-100",
      });
    }
  };

  const onSubmitButtonResolve = async () => {
    const data = form.getValues();
    try {
      setLoading(true);
      if (mode == "edit") {
        await onUpdateDayOff(data);
      } else {
        await onCreateDayOff(data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
      props.onClosePopover();
    }
  };

  const onSubmit = () => {
    setOpenSubmitDialog(true);
  };

  const typeField = form.getFieldState("type", form.formState);
  const descriptionField = form.getFieldState("desciption", form.formState);

  const isDirtyForm = useMemo(() => {
    // if (!enableEdit) return false;
    const isDirty = descriptionField.isDirty || typeField.isDirty;
    return isDirty;
  }, [typeField.isDirty, descriptionField.isDirty]);

  useEffect(() => {
    if (mode === "edit") {
      form.setValue("desciption", props.dayDescription || "");
      form.setValue(
        "type",
        props.dayType == "0" ? "0" : props.dayType == "1" ? "1" : "none"
      );
    }
  }, [props?.dayDescription, props?.dayType]);

  const handleClose = () => {
    form.reset();
    setOpen(false);
  };

  const onCancelForm = () => {
    if (isDirtyForm) {
      setOpenCancelDialog(true);
    } else {
      handleClose();
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isEditDashboard && (
        <DialogTrigger className="p-0 mx-0 w-full" disabled={!isEditDashboard}>
          <Button
            variant={"outline"}
            className={"text-black border-border w-full"}
          >
            {mode == "create" ? "Create Information" : "Edit Information"}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        id="modal-content"
        className="flex flex-col  px-5 py-5 w-[90%] h-[90%] rounded-md "
      >
        <DialogTitle></DialogTitle>
        <p className="p-0 m-0 font-semibold">Selected day: {props.date}</p>
        {mode == "create" ? (
          <DialogTitle className="text-[20px] font-semibold ">
            Create infomation
          </DialogTitle>
        ) : (
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[20px] font-semibold gap-2 flex items-center">
              Edit infomation
              {/* {!enableEdit ? (
                <Image
                  onClick={toggleEditStatus}
                  alt="Edit"
                  src={IconEdit}
                  className="h-4 aspect-square hover:cursor-pointer"
                />
              ) : (
                <Image
                  onClick={toggleEditStatus}
                  alt="Edit"
                  src={IconEditing}
                  className="h-6 aspect-square hover:cursor-pointer "
                />
              )} */}
            </DialogTitle>
            <ALertDialogDeleteDayOff
              id={Number(props.id)}
              updatedAt={props.updatedAt}
              onClose={handleClose}
              updateReload={updateReload}
            />
          </div>
        )}
        <StyledOverlay isVisible={loading} />
        <Form {...form}>
          <form
            contentEditable={false}
            onSubmit={form.handleSubmit(onSubmit)}
            style={{
              maxHeight: 500,
              minHeight: windowSize.height * 0.6,
            }}
            className=" flex flex-1 space-y-4 flex-col mt-1 w-full p-2 laptop:p-5  rounded-md  overflow-y-auto hide-scrollbar"
          >
            <div className={"flex flex-1 flex-col gap-x-5  w-full "}>
              <FormField
                control={form.control}
                name={"desciption"}
                // disabled={!enableEdit}
                render={({ field, fieldState }) => (
                  <FormItem className="w-full " tabIndex={1}>
                    <FormLabel
                      className={"font-normal text-[14px] text-secondary "}
                    >
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description"
                        className=" resize-none border border-border focus:border-primary h-[200px] items-start justify-start bg-white rounded-sm "
                        maxLength={MAX_LENGTH_TEXT}
                        {...field}
                      />
                    </FormControl>
                    <div className="flex flex-row justify-between">
                      {fieldState.error?.message && (
                        <p className={"text-red-500 text-[10px]"}>
                          {fieldState.error?.message}
                        </p>
                      )}
                      <div
                        className={`text-[12px] ${
                          field.value?.length >= MAX_LENGTH_TEXT
                            ? "text-red-500"
                            : "text-gray-500"
                        }  ml-auto`}
                      >
                        {field.value?.length || 0} / {MAX_LENGTH_TEXT}
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                // disabled={!enableEdit}
                render={({ field, fieldState }) => {
                  return (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-semibold text-[16px] ">
                        Select Type
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          // disabled={!enableEdit}
                          value={String(field.value)}
                          onValueChange={field.onChange}
                          className="flex items-center gap-x-4"
                        >
                          <FormItem className="flex items-center space-x-1">
                            <FormControl>
                              <RadioGroupItem value={"0"} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Day Off
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-1 ">
                            <FormControl>
                              <RadioGroupItem value={"1"} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Work Day
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      {fieldState.error?.message && (
                        <p className={"text-red-500 text-[10px]"}>
                          {fieldState.error?.message}
                        </p>
                      )}
                    </FormItem>
                  );
                }}
              />
            </div>

            <div className={" flex w-full gap-x-2"}>
              {/* <DialogClose className="w-full laptop:w-[152px]"> */}
              <Button
                onClick={onCancelForm}
                variant={"outline"}
                tabIndex={3}
                className="w-full laptop:w-[152px] h-[50px] font-normal border-border text-[14px] hover:bg-secondary"
                type="button"
              >
                Cancel
              </Button>
              {/* </DialogClose> */}
              <Button
                // disabled={!enableEdit}
                tabIndex={3}
                className="w-full laptop:w-[152px] h-[50px] font-normal text-white text-[14px] hover:bg-primary-hover rounded-lg"
                type="submit"
              >
                Apply
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
      <AlertDialogSubmitFormButton
        tabIndex={16}
        title={"Submit form"}
        onConfirm={onSubmitButtonResolve}
        // mode={props.mode}
        open={openSubmitDialog}
        onOpenChange={setOpenSubmitDialog}
      />

      <AlertDialogCancelFormButton
        tabIndex={16}
        title={"Close form"}
        onConfirm={handleClose}
        // mode={props.mode}
        open={openCancelDialog}
        onOpenChange={setOpenCancelDialog}
      />
    </Dialog>
  );
}
