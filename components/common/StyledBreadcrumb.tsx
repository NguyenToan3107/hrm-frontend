"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { AlertDialogBreadcrumbButton } from "./alert-dialog/AlertDialogBreadcrumbButton";

interface Props {
  triggerClass?: string;
  items: string[];
  links: string[];
  isDirty?: boolean;
  open?: boolean;
  onOpenChange?(open: boolean): void;
  onUpdateIsDirty?(isDirty: boolean): void;
}

export function StyledBreadcrumb(props: Props) {
  const {
    items,
    triggerClass,
    links,
    isDirty = false,
    open = false,
    onOpenChange,
    onUpdateIsDirty,
  } = props;
  const router = useRouter();
  const pathname = usePathname();
  const [pendingLink, setPendingLink] = useState<string | null>(null);

  const goToPage = () => {
    if (onUpdateIsDirty) {
      onUpdateIsDirty(false);
    }
    if (pendingLink) {
      if (pendingLink == pathname) {
        window.location.href = pendingLink;
      } else {
        router.push(pendingLink);
      }
      setPendingLink(null);
      if (onOpenChange) {
        onOpenChange(false);
      }
    }
  };

  const onClickLinks = (event: React.MouseEvent, link: string) => {
    setPendingLink(link);
    if (isDirty && onOpenChange) {
      event.preventDefault();
      onOpenChange(true);
    } else {
      goToPage();
    }
  };

  return (
    <div className="h-6 laptop:h-8 flex items-center justify-start">
      <Breadcrumb className={cn("px-6 ", triggerClass)}>
        <BreadcrumbList>
          {items.map((item, index) => {
            const lastItemIndex = items.length - 1;
            return (
              <React.Fragment key={`${item}-${index}`}>
                <BreadcrumbItem key={item}>
                  {index !== 0 || items.length === 1 ? (
                    <BreadcrumbLink
                      href={links[index]}
                      className="hover:underline cursor-pointer"
                      onClick={(event) => onClickLinks(event, links[index])}
                    >
                      {item}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index !== lastItemIndex && (
                  <BreadcrumbSeparator key={`separator-${index}`} />
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <AlertDialogBreadcrumbButton
        tabIndex={16}
        title={"Cancel your data in form"}
        onConfirm={goToPage}
        open={open}
        onOpenChange={onOpenChange ?? (() => {})}
      />
    </div>
  );
}
