import Image from "next/image";
import React from "react";
import DefaultImage from "@/app/assets/avatar/avatar_default.svg";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import PositionIcon from "@/app/assets/icons/iconBriefcase.svg";
import EmailIcon from "@/app/assets/icons/iconMail.svg";
import StyledAvatarPreview from "@/components/common/StyledAvatarPreview";

interface Props {
  fullName: string;
  role: string;
  email: string;
  imageUrl?: string | StaticImport;
  id?: string;
}
export default function StyledAvatarUser(props: Props) {
  const { fullName, role, email, imageUrl, id } = props;
  return (
    <div className="flex justify-center items-center gap-x-4 w-full ">
      <div className="h-[84px] laptop:h-[100px] aspect-square flex justify-center">
        <StyledAvatarPreview
          image={
            imageUrl
              ? `${process.env.NEXT_PUBLIC_BASE_URL_IMAGE}${imageUrl}`
              : DefaultImage
          }
          className="object-contain w-full h-full cursor-pointer aspect-square"
          height={100}
          width={100}
        />
      </div>
      <div className="h-[84px] laptop:h-[100px] flex flex-col gap-y-2 w-full justify-center line-clamp-1 text-ellipsis break-words">
        <p className="font-semibold text-[17px] laptop:text-[24px] w-full max-w-full line-clamp-1 text-ellipsis break-words">
          {`${fullName} (${id})`}
        </p>
        <div className="flex items-center">
          <Image alt="" src={PositionIcon} /> 
          <p className=" font-normal text-[16px] ml-2">
            {role.charAt(0).toUpperCase().concat(role.slice(1))}
          </p>
        </div>
        <div className="flex items-center">
          <Image alt="" src={EmailIcon} />
          <p className="font-normal text-[16px] ml-2 line-clamp-1 text-ellipsis break-words">{email}</p>
        </div>
      </div>
    </div>
  );
}
