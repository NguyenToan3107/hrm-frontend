import { Checkbox } from "@/components/ui/checkbox";
import { PermissionName } from "@/utilities/enum";
import React from "react";

interface Props {
  name: string;
  description: string;
  checked: any;
  disabled?: boolean;
  onCheckedChange(checked: boolean): void;
}

export default function StyledCheckbox(props: Props) {
  const { name, description, checked, onCheckedChange, disabled } = props;

  const checkDisable = () => {
    if (
      name == PermissionName.DASHBOARD_VIEW ||
      name == PermissionName.MY_PAGE
    ) {
      return true;
    }
    return disabled;
  };
  return (
    <div className="items-top flex space-x-2 mt-1">
      <Checkbox
        id={`checkbox-${name}`}
        className={`w-4 h-4 text-secondary bg-white border-secondary rounded-sm data-[state=checked]:text-white ${
          checkDisable() ? "disabled:data-[state=checked]:bg-secondary" : ""
        }`}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={checkDisable()}
      />
      <div className="grid gap-1.5 leading-none">
        <label htmlFor={`checkbox-${name}`} className="text-[16px]">
          {name}
        </label>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}
