"use client";
import AvatarDefault from "@/app/assets/avatar/avatar_default.svg";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useFileStore } from "@/stores/commonStore";
import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";

interface Props {
  selectedImage: string;
  isDialogOpen: boolean;
  setIsDialogOpen(isDialogOpen: boolean): void;
  handleCropComplete(croppedAreaPixels: any): void;
  handleSaveCroppedImage(): Promise<void>;
  setSelectedImage(selectedImage: string): void;
}

const AvatarCropDialog = (props: Props) => {
  const {
    selectedImage,
    isDialogOpen,
    setIsDialogOpen,
    handleCropComplete,
    handleSaveCroppedImage,
    setSelectedImage,
  } = props;
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const { setImage, setSelectedAvatarFile } = useFileStore();

  const handleChooseImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileCrop = event.target.files?.[0];
    if (fileCrop) {
      setImage(fileCrop);
      setSelectedAvatarFile(fileCrop);
      setSelectedImage(URL.createObjectURL(fileCrop));
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      event.target.value = "";
    }
  };

  useEffect(() => {
    if (!selectedImage) {
      setSelectedImage(AvatarDefault.src);
    }
  }, []);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="w-full laptop:w-[500px] transform-none !scale-100">
        <DialogTitle className="text-lg font-semibold">Crop Avatar</DialogTitle>
        <div className="relative w-full h-[260px]">
          <Cropper
            image={
              selectedImage
                ? (selectedImage as string)
                : (AvatarDefault.src as string)
            }
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={(_, croppedAreaPixels) => {
              handleCropComplete(croppedAreaPixels);
            }}
            onZoomChange={setZoom}
            objectFit="contain"
            minZoom={1}
            maxZoom={5}
          />
        </div>
        <div className="flex justify-end mt-4">
          <Label className="h-8 laptop:h-10 w-[130px] px-2 py-2 mr-2 font-normal bg-button-edit hover:bg-button-edit-hover text-white text-[12px] laptop:text-[14px] rounded-lg cursor-pointer text-center">
            Change image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleChooseImage}
            />
          </Label>
          <button
            className="h-8 laptop:h-10 w-[92px] px-4 py-2 mr-2 font-normal bg-white text-[#16151C] text-[12px] laptop:text-[14px] border border-[#A2A1A8] hover:bg-gray-100 rounded-lg"
            onClick={() => setIsDialogOpen(false)}
          >
            No Crop
          </button>
          <button
            className="h-8 laptop:h-10 w-[92px] px-4 py-2 bg-primary font-normal text-white text-[12px] laptop:text-[14px] hover:bg-primary-hover rounded-lg"
            onClick={handleSaveCroppedImage}
          >
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarCropDialog;
