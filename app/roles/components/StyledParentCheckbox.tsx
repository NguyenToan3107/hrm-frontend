"use client";
import StyledCheckbox from "@/app/roles/components/StyledCheckbox";
import { PermissionID } from "@/utilities/enum";
import { useEffect, useState } from "react";

interface Permission {
  id: number;
  name: string;
  description: string;
  permission_name: string;
}

interface CheckboxGroupProps {
  feature: string;
  feature_desc: string;
  permissions: Permission[];
}

interface Props {
  items: CheckboxGroupProps;
  value: number[];
  disabled?: boolean;
  onChange: (selectedPermissionIds: number[]) => void;
}

export default function StyledParentCheckbox(props: Props) {
  const { items, value, onChange, disabled } = props;
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
    value || []
  );

  const handleParentChange = () => {
    const isChecked = selectedPermissions.length === items.permissions.length;
    const newPermissions = isChecked ? [] : items.permissions.map((p) => p.id);
    setSelectedPermissions(newPermissions);
    onChange(newPermissions);
  };

  const handleChildChange = (permission: Permission) => {
    const isChecked = selectedPermissions.some((p) => p === permission.id);
    let newPermissions = isChecked
      ? selectedPermissions.filter((p) => p !== permission.id)
      : [...selectedPermissions, permission.id];

    if (
      permission.id == PermissionID.LEAVE_CREATE ||
      permission.id == PermissionID.LEAVE_EXECUTE
    ) {
      if (!newPermissions.includes(PermissionID.LEAVE_LIST)) {
        newPermissions = [...newPermissions, PermissionID.LEAVE_LIST];
      }
    }

    setSelectedPermissions(newPermissions);
    onChange(newPermissions);
  };

  useEffect(() => {
    setSelectedPermissions(value || []);
  }, [value]);

  return (
    <div>
      <div className="flex items-start space-x-2">
        <StyledCheckbox
          disabled={disabled}
          name={items.feature}
          description={items.feature_desc}
          checked={selectedPermissions.length === items.permissions.length}
          onCheckedChange={handleParentChange}
        />
      </div>
      {items.permissions.length > 1 && (
        <div className="flex flex-col ml-6">
          {items.permissions.map((permission) => (
            <div key={permission.id} className="items-top flex space-x-2 mt-1">
              <StyledCheckbox
                disabled={disabled}
                name={permission.permission_name}
                description={permission.description}
                checked={
                  selectedPermissions.length === items.permissions.length ||
                  selectedPermissions.some((p) => p === permission.id)
                }
                onCheckedChange={() => handleChildChange(permission)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
