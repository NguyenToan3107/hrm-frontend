import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { StyledDatePickerForSearch } from "./StyledDatePickerForSearch";
import { StyledDatePicker } from "@/components/common/StyledDatePicker";
import { isMobile } from "react-device-detect";

interface Props {
  form: any;
  label: string;
  nameStartDate: string;
  nameEndDate: string;
  defaultStartDate?: Date;
  defaultEndDate?: Date;
}
export default function StyledMultipleDatePicker(props: Props) {
  const { form, label, nameStartDate, nameEndDate, defaultStartDate, defaultEndDate } = props;
  return (
    <div className="flex-1 flex flex-col">
      <p className="font-normal text-[16px]">{label}</p>
      <div className="flex flex-row gap-1 justify-between items-center w-full">
        {
          isMobile ? (<StyledDatePickerForSearch
          title="Select leave start date"
          form={form}
          name={nameStartDate}
        />) : (<FormField
          defaultValue={defaultStartDate}
          control={form.control}
          name={nameStartDate}
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col">
              <FormControl>
                <StyledDatePicker
                  tabIndex={3}
                  field={field}
                  title={""}
                  triggerClass="flex-1 flex border rounded-md px-2"
                />
              </FormControl>
            </FormItem>
          )}
        />)
        }
        <p>-</p>
        {
          isMobile ? (<StyledDatePickerForSearch
          title="Select leave end date"
          form={form}
          name={nameEndDate}
        />) : (<FormField
          control={form.control}
          defaultValue={defaultEndDate}
          name={nameEndDate}
          render={({ field }) => (
            <FormItem className="flex-1 flex flex-col">
              <FormControl>
                <StyledDatePicker
                  tabIndex={3}
                  field={field}
                  title={""}
                  triggerClass="flex-1 flex border rounded-md px-2"
                />
              </FormControl>
            </FormItem>
          )}
        />)
        }
      </div>
    </div>
  );
}
