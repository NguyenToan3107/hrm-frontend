"use client";
import React from "react";
import IconAuthentication from "@/app/assets/icons/iconNoAuthentication.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SIDEBAR_ITEMS } from "@/utilities/static-value";

export default function page() {
  const backToDashboard = () => {
    window.location.replace(`${SIDEBAR_ITEMS[0].route}`);
  };
  return (
    <div className="flex flex-col items-center justify-center gap-4 min-h-screen">
      <Image src={IconAuthentication} width={48} height={48} alt="" />
      <p>You do not have permission to access this link.</p>
      <Button
        className="w-[268px] h-[36px] border border-primary text-primary text-[16px] bg-white hover:bg-gray-100"
        onClick={backToDashboard}
      >
        Back To Dashboard
      </Button>
    </div>
  );
}
