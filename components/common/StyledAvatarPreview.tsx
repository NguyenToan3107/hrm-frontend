"use client";
import { default as AvatarDefault } from "@/app/assets/avatar/avatar_default.svg";
import Image, { StaticImageData } from "next/image";
import { useState } from "react";

interface Props {
  image: string;
  className: string;
  width: number;
  height: number;
}

export default function StyledAvatarPreview(props: Props) {
  const { image, className, width, height } = props;

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<
    string | StaticImageData | null
  >(null);

  const handleImageClick = (image: any) => {
    setPreviewImage(image);
    setIsPreviewOpen(true);
  };

  const handleCloseModal = () => {
    setIsPreviewOpen(false);
  };
  return (
    <>
      <div
        onClick={() => {
          handleImageClick(image);
        }}
      >
        <Image
          alt=""
          src={image}
          className={className}
          height={height}
          width={width}
        />
      </div>
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
                src={previewImage || AvatarDefault}
                alt="Preview"
                width={500}
                height={500}
                className="max-w-full max-h-full object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
