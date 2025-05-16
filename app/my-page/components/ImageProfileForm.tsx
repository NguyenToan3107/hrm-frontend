"use client";
import { Button } from "@/components/ui/button";
import { useEditingStore, useFileStore } from "@/stores/commonStore";
import { useUserStore } from "@/stores/userStore";
// import { StaticImport } from "next/dist/shared/lib/get-img-props";
import AvatarDefault from "@/app/assets/avatar/avatar_default.svg";
import IconEditWhite from "@/app/assets/icons/iconEditWhite.svg";
import AvatarCropDialog from "@/app/my-page/components/AvatarCropDialog ";
import { getCroppedImg } from "@/utilities/helper";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import IconBriefCase from "../../assets/icons/iconBriefcase.svg";
import IconCamera from "../../assets/icons/iconCamera.svg";
import IconEmail from "../../assets/icons/iconGmail.svg";
import { useTranslations } from "next-intl";

const ImageProfileForm: React.FC = () => {
  const { user } = useUserStore((state) => state);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false); // State to control modal visibility
  const { isEditing, setIsEditing } = useEditingStore((state) => state);
  const { setImage, setSelectedAvatarFile } = useFileStore();
  const [selectedImage, setSelectedImage] = useState<string>("");

  const [isDialogCropAvatarOpen, setIsDialogCropAvatarOpen] = useState(false);
  const [croppedArea, setCroppedArea] = useState(null);
  const myPage = useTranslations("MyPage");

  useEffect(() => {
    if (!isEditing) {
      setSelectedImage("");
    }
  }, [isEditing]);

  const handleImageClick = () => {
    setIsPreviewOpen(true);
  };

  const handleCloseModal = () => {
    setIsPreviewOpen(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChooseImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setSelectedAvatarFile(file);
      setSelectedImage(URL.createObjectURL(file));
      setIsDialogCropAvatarOpen(true);

      event.target.value = "";
    }
  };

  const handleCropComplete = async (croppedAreaPixels: any) => {
    setCroppedArea(croppedAreaPixels);
  };

  const handleSaveCroppedImage = async () => {
    try {
      const croppedBlob = await getCroppedImg(
        selectedImage as string,
        croppedArea
      );

      if (!croppedBlob) {
        throw new Error("Failed to crop the image");
      }
      const imageName = selectedImage
        ? `${
            selectedImage.split("/").pop()?.split(".")[0]
          }-${Date.now()}.png` || `${Date.now()}.png`
        : `${Date.now()}.png`;
      const croppedFile = new File([croppedBlob], imageName, {
        type: croppedBlob.type,
      });
      const previewUrl = URL.createObjectURL(croppedBlob);
      setSelectedImage(previewUrl); // lưu link ảnh đã crop
      setImage(croppedFile); // lưu vào store file ảnh đã crop
      setIsDialogCropAvatarOpen(false);
    } catch (error) {}
  };

  const handleClickImage = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (user.image) {
      setSelectedImage(
        `${process.env.NEXT_PUBLIC_BASE_URL_IMAGE}${user?.image_root}`
      );
    } else {
      setSelectedImage(AvatarDefault.src);
    }
    setIsDialogCropAvatarOpen(true);
  };

  return (
    <>
      {user && (
        <div className="laptop:flex flex-row justify-between items-center ml-3 hidden">
          <div className="flex items-center gap-4 p-4">
            <div
              className="relative w-[100px] h-[100px]"
              onClick={isEditing ? undefined : handleImageClick}
            >
              <Image
                src={
                  selectedImage ||
                  (user?.image
                    ? `${process.env.NEXT_PUBLIC_BASE_URL_IMAGE}${user.image}`
                    : AvatarDefault)
                }
                alt=""
                width={100}
                height={100}
                className={`w-full h-full object-contain cursor-pointer rounded-md ${
                  isEditing ? "opacity-60" : ""
                }`}
              />
              {isEditing && (
                <>
                  <div className="absolute inset-0 flex justify-center items-center cursor-pointer">
                    <div className="p-1 rounded-full bg-white">
                      <Image src={IconCamera} alt="" className="shadow-lg" />
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onClick={handleClickImage}
                    onChange={handleChooseImage}
                    className="hidden"
                    id="fileInput"
                  />
                  <label
                    htmlFor="fileInput"
                    className="absolute inset-0 cursor-pointer"
                  />
                </>
              )}
            </div>
            {!isEditing && (
              <div className="flex flex-col justify-between gap-2">
                <p className="text-2xl font-semibold">{user.fullname}</p>
                <div className="flex flex-row gap-2">
                  <Image src={IconBriefCase} alt="" />
                  <p className="text-base">
                    {user?.role?.name
                      .charAt(0)
                      .toUpperCase()
                      .concat(user?.role?.name.slice(1))}
                  </p>
                </div>
                <div className="flex flex-row gap-2">
                  <Image src={IconEmail} alt="" />
                  <p className="text-base">{user.email}</p>
                </div>
              </div>
            )}
          </div>

          {!isEditing && (
            <Button
              tabIndex={6}
              className="w-[152px] h-10 font-normal text-white text-[16px] bg-button-edit hover:bg-button-edit-hover rounded-lg mr-11"
              type="button"
              onClick={handleEdit}
            >
              <Image
                alt=""
                src={IconEditWhite}
                width={24}
                height={24}
                className="text-white mr-2"
              />
              <p className={"text-white"}>{myPage("editButton")}</p>
            </Button>
          )}
        </div>
      )}

      {/* Modal for image preview */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
          onClick={handleCloseModal} // Close modal on background click
        >
          <div
            className="bg-white rounded shadow-lg relative w-[500px] h-[400px] overflow-hidden first-letter:flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            <div className="flex items-center justify-center bg-black w-full h-full">
              <Image
                src={
                  user?.image
                    ? `${process.env.NEXT_PUBLIC_BASE_URL_IMAGE}${user.image}`
                    : AvatarDefault || AvatarDefault
                }
                alt="Preview"
                width={500}
                height={500}
                className="max-w-full max-h-full  object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {isDialogCropAvatarOpen && (
        <AvatarCropDialog
          selectedImage={selectedImage}
          isDialogOpen={isDialogCropAvatarOpen}
          setIsDialogOpen={setIsDialogCropAvatarOpen}
          handleCropComplete={handleCropComplete}
          handleSaveCroppedImage={handleSaveCroppedImage}
          setSelectedImage={setSelectedImage}
        />
      )}
    </>
  );
};

export default ImageProfileForm;
