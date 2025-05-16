"use client";
import { CancelRequestValue } from "@/utilities/enum";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import CanRequestIcon from "@/app/assets/icons/iconCancelRequestRed.svg";
import AgreeCanRequestIcon from "@/app/assets/icons/iconCancelRequestBlue.svg";
import SkipCanRequestIcon from "@/app/assets/icons/iconCancelRequestGray.svg";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

interface Props {
  cancelRequest?: string;
}

export default function StyledCancelRequestStatusItem(props: Props) {
  const { cancelRequest } = props;
  const [srcCancelRequest, setSrcCancelRequest] = useState<
    string | StaticImport
  >("");

  useEffect(() => {
    if (cancelRequest == CancelRequestValue.Waiting) {
      setSrcCancelRequest(CanRequestIcon);
    } else if (cancelRequest == CancelRequestValue.Skip) {
      setSrcCancelRequest(AgreeCanRequestIcon);
    } else if (cancelRequest == CancelRequestValue.Cancel) {
      setSrcCancelRequest(SkipCanRequestIcon);
    }
  }, [cancelRequest]);

  return (
    <div>
      {Number(cancelRequest) > 0 ? (
        <div className="h-full flex items-center justify-center">
          <Image
            src={srcCancelRequest}
            alt=""
            className={`object-cover rounded-lg ${
              cancelRequest == CancelRequestValue.Waiting
                ? "w-[24px]"
                : "w-[72px]"
            }  h-[24px]`}
            height={24}
            width={24}
            quality={100}
          />
        </div>
      ) : (
        ""
      )}
    </div>
  );
}
