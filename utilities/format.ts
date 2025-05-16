import { format, parse, isValid } from "date-fns";

export const DATE = "dd/MM/yyyy";
export const FULL_DATE = "dd/MM-/yyy HH:mm:ss";
export const DATE_REVERSE = "yyyy/MM/dd";
export const DATE_REVERSE_YMD = "yyyy-MM-dd";
export const FULL_DATE_REVERSE = "dd/MM-/yyy HH:mm:ss";
export const SHORT_DATE = "dd/MM";

export const formatDateToShortDateString = (date: Date | string) => {
  if (!date) return "";
  return format(date, SHORT_DATE);
};
export const formatStringToDate = (date?: string) => {
  if (!date) return new Date();
  return parse(date || "", DATE, new Date()) || new Date();
};

export const formatStringToDateYMD = (date: string) => {
  return parse(date, DATE_REVERSE, new Date()) || new Date();
};

export const formatStringToDateYMD2 = (date: string) => {
  return parse(date, DATE_REVERSE_YMD, new Date()) || new Date();
};

export const formatFullStringToDate = (date: string) => {
  if (!date) return new Date();
  return parse(date || "", FULL_DATE, new Date()) || new Date();
};

export const formatDateToString = (date: Date | string) => {
  if (!date) return "";
  return format(date, DATE);
};

export const formatDateToAnyString = (
  date: Date | string,
  formatString: string
) => {
  return format(date, formatString);
};

export const formatDateToFullString = (date: string) => {
  if (!date) return new Date();
  return parse(date || "", FULL_DATE, new Date()) || new Date();
};

export const convertIdToObject = (ids: number[], data: any[]) => {
  if (!ids.length || !data.length) return [];
  return ids?.map((id: any) => {
    const name = data.find((opt: any) => opt.id == id);
    return {
      id: id,
      name: data.find((opt: any) => opt.id == id)?.name,
    };
  });
};
