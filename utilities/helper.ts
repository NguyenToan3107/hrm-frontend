import { message } from "@/app/assets/locales/en";
import { PermissionProps } from "@/app/roles/create-role/page";
import { toast } from "@/hooks/use-toast";
import { MonthInYear, ShiftValue } from "@/utilities/enum";
import {
  addDays,
  addSeconds,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfYear,
  format,
  getDay,
  isAfter,
  isBefore,
  isEqual,
  startOfMonth,
  startOfToday,
  startOfYear,
  subDays,
} from "date-fns";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { formatStringToDate } from "./format";
import { WEEKDAYS_TITLE } from "./static-value";

const now = new Date();
const currentYear = new Date().getFullYear();
export const expirationDate = (expirationTime: number) =>
  addSeconds(now, expirationTime);

// Kiểm tra nếu targetDate trước thời gian hiện tại
export const isTargetBeforeCurrent = (targetDate: string | any) => {
  const parsedTargetDate = formatStringToDate(targetDate); // Parse the target date
  return isBefore(parsedTargetDate, now); // Compare the two dates
};

export const isTargetAfterCurrent = (targetDate: string | any) =>
  isAfter(new Date(targetDate), now);

export const isMorningTime = () => {
  const hours = now.getHours();
  return hours < 12;
};

export const checkMonthInThePast = (year: number, monthIndex: number) => {
  const dateToCheck = new Date(year, monthIndex, 1); // Ngày đầu tiên của tháng

  const startOfCurrentMonth = startOfMonth(startOfToday());

  return isBefore(startOfMonth(dateToCheck), startOfCurrentMonth);
};

export const commonIsEqual = (a: any, b: any) => {
  return isEqual(a, b);
};

export const getDataOfYear = (year: number) => {
  const start = startOfYear(new Date(year, 0, 1)); // Ngày đầu năm
  const end = endOfYear(new Date(year, 0, 1)); // Ngày cuối năm

  // Lấy danh sách tất cả các ngày trong năm
  const datesInYear = eachDayOfInterval({ start, end }).map((date) =>
    format(date, "yyyy-MM-dd")
  );
  let months: any = {};

  datesInYear.forEach((date) => {
    const month = format(date, "MMMM"); // Tên tháng
    const dayOfWeek = format(date, "EEEE"); // Tên ngày trong tuần

    // Khởi tạo tháng nếu chưa có
    if (!months[month]) {
      months[month] = {};
    }

    // Khởi tạo nhóm ngày trong tuần nếu chưa có
    if (!months[month][dayOfWeek]) {
      months[month][dayOfWeek] = [];
    }

    // Thêm ngày vào nhóm tương ứng
    months[month][dayOfWeek].push(format(date, "yyyy-MM-dd"));
  });
};

export const getMonthData = (year: number, month: number) => {
  const start = new Date(year, month, 1);
  const end = endOfMonth(start);
  const firstDayOfWeek = subDays(start, getDay(start));
  const lastDayOfWeek = addDays(end, 6 - getDay(end));
  let daysInRange = eachDayOfInterval({
    start: firstDayOfWeek,
    end: lastDayOfWeek,
  });
  if (daysInRange.length <= 35 && daysInRange.length > 28) {
    daysInRange = eachDayOfInterval({
      start: firstDayOfWeek,
      end: addDays(end, 6 - getDay(end) + 7),
    });
  } else if (daysInRange.length <= 28) {
    daysInRange = eachDayOfInterval({
      start: firstDayOfWeek,
      end: addDays(end, 6 - getDay(end) + 14),
    });
  }
  const columns: any = Array.from({ length: 7 }, () => ({
    title: "",
    date: [],
  }));
  const dayNames = WEEKDAYS_TITLE;
  dayNames.forEach((name, index) => {
    columns[index].title = name;
  });

  daysInRange.forEach((day) => {
    const dayIndex = getDay(day); // 0: CN, 1: T2, ..., 6: T7
    const isSpecial = false; // Xác định nếu đây là ngày đặc biệt
    const isDayOfOtherMonth = day.getMonth() !== month; // Kiểm tra nếu ngày thuộc tháng khác
    const type = dayIndex === 0 || dayIndex === 6 ? "off" : "work";
    columns[dayIndex].date.push({
      date: day,
      type,
      isSpecial,
      isDayOfOtherMonth,
    });
  });

  const monthNames = Object.values(MonthInYear);

  return {
    title: `${monthNames[month]}`, // Tháng bắt đầu từ 0
    columns,
  };
};

export const monthsOfYear = (year: number) => {
  const start = startOfYear(new Date(year, 0, 1));
  const end = endOfYear(new Date(year, 0, 1));
  const months = eachMonthOfInterval({ start, end });
};

export const checkDateInArray = (dateToCheck: Date, dateArray: Date[]) => {
  return dateArray.some((date) => {
    return isEqual(dateToCheck, date);
  });
};

export const listYears = () => {
  return Array.from(
    { length: currentYear + 2 - 2024 },
    (_, index) => 2024 + index
  );
};

export const errorHandler = ({
  response,
  successCallback,
  serverErrorCallback,
  successMessage,
  errorMessage,
}: {
  response: any;
  successCallback?: any;
  serverErrorCallback?: any;
  successMessage?: string;
  errorMessage?: string;
}) => {
  if (response?.code == 1) {
    toast({
      description: errorMessage,
      color: "bg-red-100",
    });
  } else if (response?.code == 0) {
    toast({
      description: successMessage,
      color: "bg-blue-200",
    });
    successCallback?.();
  } else {
    toast({
      description: message.concurencyUpdate,
      color: "bg-red-100",
    });
    serverErrorCallback?.();
  }
};

/////////////////////////////////////////////////////

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: any,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");

  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    return null;
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // As Base64 string
  // return croppedCanvas.toDataURL('image/jpeg');

  // As a blob
  // Trả về ảnh dưới dạng Blob
  return new Promise<Blob>((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas is empty"));
        }
      },
      "image/jpeg", // Hoặc "image/png"
      1 // Chất lượng ảnh
    );
  });
}

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // Cần thiết để tránh vấn đề về cross-origin
    image.src = url;
  });

export const exportPDF = async (idUser: string | number, fileName: string) => {
  const input: any = document.getElementById(`pdf-${idUser}`);
  await html2canvas(input, {
    scale: 3,
    useCORS: true,
    backgroundColor: "#ffffff",
  }).then((canvas) => {
    const imgData: any = canvas.toDataURL("image/png");
    const pdf = new jsPDF("portrait", "pt", "a4", true);

    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, "JPEG", 0, 0, width, height);
    pdf.save(fileName);
  });
};

export const convertHourToDay = (
  timeOff: string | number | undefined,
  lastYearTimeOff: string | number | undefined
) => {
  const hours = Number(timeOff) + Number(lastYearTimeOff);
  if (hours == 0) return "0";
  const days = Math.floor(hours / 8);
  const remainingHours = (hours % 8) / 8;
  const totalDays = days + remainingHours;
  return totalDays > 1
    ? `${hours} (${totalDays} days)`
    : `${hours} (${totalDays} day)`;
};

export const calculateSalary = (
  timeOffHours: number,
  lastYearTimeOff: number,
  shift: string | undefined
) => {
  const timeLeave = shift == String(ShiftValue.ShiftAllDay) ? 8 : 4;
  if (timeOffHours + lastYearTimeOff < timeLeave) return false;
  return true;
};

export const formatDataSelectedPermission = (
  permissionList: PermissionProps[],
  permissions: any,
  isCd?: string
) => {
  const selectedPermissions: any[] = Object.entries(permissions)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, checked]) => checked)
    .map(([permission_cd]) => {
      const permission = permissionList.find(
        (p) => p.permission_cd === permission_cd
      );
      return isCd == "permission_cd"
        ? permission?.permission_cd
        : Number(permission?.permission_id);
    });
  return selectedPermissions;
};

export function formatArrayToString(arr: string[]) {
  return arr.map((item: string) => `* ${item}`).join("\n");
}
