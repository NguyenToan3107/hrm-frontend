"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { CancelRequestValue } from "@/utilities/enum";
import { MAX_LENGTH_TEXT } from "@/utilities/static-value";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface Props {
  canRequest: string | undefined;
  onOK(description: string): void;
  onClose(): void;
}

export default function StyledCancelRequestDialog(props: Props) {
  const { canRequest } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const i18nLeave = useTranslations("Leave");
  const i18nCommon = useTranslations("Common");

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  const handleOk = () => {
    try {
      if (description == "") {
        toast({
          description: "Please enter a reason for cancel leave.",
          color: "bg-red-100",
        });
        return;
      }
      props?.onOK?.(description);
      setDescription("");
      handleClose();
    } catch (error) {
    } finally {
    }
  };

  const onChangeDescription = (event: any) => {
    setDescription(event.target.value);
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {canRequest == CancelRequestValue.Waiting && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[50px] px-0 laptop:w-[152px] h-[32px] laptop:h-[50px] bg-[#A2A1A8] hover:bg-gray-400 text-[12px] laptop:text-[14px]  text-white border-none rounded-[8px]"
            onClick={handleOpen}
          >
            {"Cancel Request"}
          </Button>
        </DialogTrigger>
      )}
      {canRequest == CancelRequestValue.None && (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[50px] px-2 laptop:w-[152px] h-[32px] laptop:h-[50px] bg-[#BD0D10] hover:bg-[#E6393C] text-[12px] laptop:text-[14px]  text-white border-none rounded-[8px]"
            onClick={handleOpen}
          >
            {"Cancel Request"}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Cancel Leave</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-start gap-2">
          <Label htmlFor="reason" className="font-semibold">
            Reason for Cancelation:
          </Label>
          <div className="flex flex-col w-full">
            <div className="rounded-sm border w-full border-[#A2A1A8]">
              <Textarea
                value={description}
                onChange={onChangeDescription}
                id="reason"
                className="w-full"
                maxLength={MAX_LENGTH_TEXT}
              />
            </div>
            <div className="flex flex-row justify-between">
              <div
                className={`text-[12px] ${
                  description.length >= MAX_LENGTH_TEXT
                    ? "text-red-500"
                    : "text-gray-500"
                }  ml-auto`}
              >
                {description.length || 0} / {MAX_LENGTH_TEXT}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <div className="flex flex-row justify-center laptop:justify-end gap-3 laptop:gap-4">
            <button
              className="w-[100px] laptop:w-[132px] laptop:mx-0 h-8 text-[12px] laptop:text-[14px] laptop:h-10 font-normal border border-[#A2A1A880] hover:bg-gray-100 rounded-[8px]"
              onClick={handleClose}
            >
              {i18nCommon("noButton")}
            </button>
            <Button
              onClick={handleOk}
              type="button"
              className=" w-[100px] laptop:w-[132px] text-white rounded-[8px] h-8 laptop:h-10 text-[12px] laptop:text-[14px]"
            >
              {i18nLeave("saveChangeButton")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
