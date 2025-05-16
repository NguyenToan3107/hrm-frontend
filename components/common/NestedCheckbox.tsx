import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { twMerge } from "tailwind-merge";
interface RawPermission {
  feature_name: string;
  permission_cd: string;
  permission_nm: string;
  permission_desc: string;
  level: number;
  permission_id: number | string;
}
interface Permission {
  key: string;
  name: string;
  checked: boolean;
  level: number;
  permission_id: number | string;
  permission_desc: string;
}
interface FeatureGroup {
  key: string;
  checked: boolean;
  children: Permission[];
}
// interface FormData {
//   fullname: string;
//   description: string;
//   permissions: { [key: string]: boolean };
// }
interface NestedCheckboxProps {
  data: RawPermission[];
  form: any;
  disable?: boolean;
  selectedPermissionCds?: string[];
}
const NestedCheckbox = ({
  data,
  form,
  selectedPermissionCds = [],
  disable = false,
}: NestedCheckboxProps) => {
  const { control, setValue, watch } = form;

  const groupData = (initialPermissions: { [key: string]: boolean }) => {
    const featureMap: { [key: string]: FeatureGroup } = {};

    data.forEach((item) => {
      if (!featureMap[item.feature_name]) {
        featureMap[item.feature_name] = {
          key: item.feature_name,
          checked: false,
          children: [],
        };
      }
      const isChecked =
        selectedPermissionCds.includes(item.permission_cd) ||
        initialPermissions[item.permission_cd] ||
        false;

      featureMap[item.feature_name].children.push({
        key: item.permission_cd,
        name: item.permission_nm,
        checked:
          item.permission_cd == "MY011" || item.permission_cd == "DA011"
            ? true
            : isChecked,
        level: item.level,
        permission_id: item.permission_id,
        permission_desc: item.permission_desc,
      });
    });

    return Object.values(featureMap).map((group) => ({
      ...group,
      checked: group.children.every((child) => child.checked),
    }));
  };

  const [checkboxes, setCheckboxes] = useState<FeatureGroup[]>(
    groupData(watch("permissions") || {})
  );

  const checkboxRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    const newCheckboxes = groupData(watch("permissions") || {});
    setCheckboxes(newCheckboxes);
    updateFormValues(newCheckboxes);
  }, []);

  const updateFormValues = (newCheckboxes: FeatureGroup[]) => {
    newCheckboxes.forEach((group) => {
      group.children.forEach((child) => {
        setValue(`permissions.${child.key}`, child.checked, {
          shouldValidate: true,
        });
      });
    });
  };

  const updateState = (newCheckboxes: FeatureGroup[]) => {
    setCheckboxes(newCheckboxes);
    newCheckboxes.forEach((group) => {
      group.children.forEach((child) => {
        setValue(`permissions.${child.key}`, child.checked, {
          shouldValidate: true,
        });
      });
    });
  };

  const handleParentChange =
    (featureKey: string) => (e: ChangeEvent<HTMLInputElement>) => {
      const isChecked = e.target.checked;
      const newCheckboxes = checkboxes.map((group) =>
        group.key === featureKey
          ? {
              ...group,
              checked: isChecked,
              children: group.children.map((child) => ({
                ...child,
                checked: isChecked,
              })),
            }
          : group
      );
      updateState(newCheckboxes);
    };

  const handleChildChange =
    (featureKey: string, permissionKey: string) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const isChecked = e.target.checked;
      const newCheckboxes = checkboxes.map((group) => {
        if (group.key === featureKey) {
          const updatedChildren = group.children.map((child) => {
            if (child.key === permissionKey) {
              return { ...child, checked: isChecked };
            }
            if (
              child.level === 1 &&
              isChecked &&
              group.children.find((c) => c.key === permissionKey)?.level === 2
            ) {
              return { ...child, checked: true };
            }
            if (
              child.level === 2 &&
              !isChecked &&
              group.children.find((c) => c.key === permissionKey)?.level === 1
            ) {
              return { ...child, checked: false };
            }
            return child;
          });
          return {
            ...group,
            children: updatedChildren,
            checked: updatedChildren.every((child) => child.checked),
          };
        }
        return group;
      });
      updateState(newCheckboxes);
    };

  useEffect(() => {
    checkboxes.forEach((group) => {
      if (group.children.length > 1) {
        const ref = checkboxRefs.current[group.key];
        if (ref) {
          const allChecked = group.children.every((child) => child.checked);
          const someChecked = group.children.some((child) => child.checked);
          ref.indeterminate = !allChecked && someChecked;
        }
      }
    });
  }, [checkboxes]);

  useEffect(() => {
    setCheckboxes(groupData(watch('permissions')))
  }, [watch('permissions')])

  return (
    <div className=" w-full flex flex-col laptop:flex-wrap laptop:overflow-x-auto overflow-y-auto hide-scrollbar">
      {checkboxes.map((group) => (
        <div key={group.key} className="mb-1">
          {group.children.length === 1 && group.children[0].key == "MY011" ? (
            <Controller
              name={`permissions.${group.children[0].key}`}
              control={control}
              render={({ field }) => (
                <div className=" hover:bg-gray-200  rounded-sm w-fit">
                  <label
                    className={twMerge(
                      "flex items-center space-x-2 cursor-pointer w-[300px] p-1",
                      (disable || group.children[0].key == "MY011") &&
                        "hover:cursor-not-allowed"
                    )}
                  >
                    <input
                      disabled={disable || group.children[0].key == "MY011"}
                      type="checkbox"
                      checked={field.value || false}
                      onChange={(e) => {
                        field.onChange(e.target.checked);
                        handleChildChange(group.key, group.children[0].key)(e);
                      }}
                      className={twMerge(
                        "w-4 h-4 laptop:w-5 laptop:h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition duration-200",
                        disable && "hover:cursor-not-allowed"
                      )}
                    />
                    <span className="text-gray-700 font-medium text-[14px]">{`${group.children[0].name.toUpperCase()} `}</span>
                  </label>
                  <p className="text-gray-600 text-[12px] ml-9">{`${group.children[0].permission_desc}`}</p>
                </div>
              )}
            />
          ) : (
            <div className=" hover:bg-gray-100 w-fit p-1 rounded-sm ">
              <label
                className={twMerge(
                  "flex items-center space-x-2 cursor-pointer mb-1 mr-2 w-[284px]",
                  (group.key.toUpperCase() == "DASHBOARD" || disable) &&
                    "hover:cursor-not-allowed"
                )}
              >
                <input
                  disabled={group.key.toUpperCase() == "DASHBOARD" || disable}
                  type="checkbox"
                  ref={(el: any) => (checkboxRefs.current[group.key] = el)}
                  checked={group.checked}
                  onChange={handleParentChange(group.key)}
                  className={twMerge(
                    `w-4 h-4 laptop:w-5 laptop:h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition duration-200 `,
                    (group.key.toUpperCase() == "DASHBOARD" || disable) &&
                      "hover:cursor-not-allowed"
                  )}
                />
                <span className="text-gray-700 font-medium text-[14px]">{`${group.key.toUpperCase()}`}</span>
              </label>
              <div className="space-y-1">
                {group.children.map((child) => (
                  <Controller
                    key={child.key}
                    name={`permissions.${child.key}`}
                    control={control}
                    render={({ field }) => (
                      <div className=" hover:bg-gray-200 ml-8 rounded-sm">
                        <label
                          className={twMerge(
                            "flex items-center space-x-2 cursor-pointer hover:bg-gray-200 p-1",
                            (disable || child.key == "DA011") &&
                              "cursor-not-allowed"
                          )}
                        >
                          <input
                            type="checkbox"
                            disabled={disable || child.key == "DA011"}
                            checked={field.value || false}
                            onChange={(e) => {
                              field.onChange(e.target.checked);
                              handleChildChange(group.key, child.key)(e);
                            }}
                            className={twMerge(
                              "w-4 h-4 laptop:w-5 laptop:h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition duration-200",
                              disable && "hover:cursor-not-allowed"
                            )}
                          />
                          <p className="text-gray-600 text-[14px]">{`${child.name}`}</p>
                        </label>
                        <p className="text-gray-600 text-[12px] ml-8">{`${child.permission_desc}`}</p>
                      </div>
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
export default NestedCheckbox;
