import DashboardIcon from "../app/assets/icons/iconDashboard.svg";
import DashboardIconActive from "../app/assets/icons/iconDashboardActive.svg";
import MyPageIcon from "../app/assets/icons/iconMyPage.svg";
import MyPageIconActive from "../app/assets/icons/iconMyPageActive.svg";
// import CalendarIcon from "../app/assets/icons/iconCalendar.svg";
import LeavesIcon from "../app/assets/icons/iconLeaves.svg";
import LeavesIconActive from "../app/assets/icons/iconLeaveAvtice.svg";
import StaffIcon from "../app/assets/icons/iconStaff.svg";
import RoleIcon from "../app/assets/icons/iconRole.svg";
import RoleIconActive from "../app/assets/icons/iconRoleActive.svg";
import StaffIconActive from "../app/assets/icons/iconStaffActive.svg";
import AttendanceReportIcon from "@/app/assets/icons/iconAttendanceReport.svg";
import AttendanceReportActiceIcon from "@/app/assets/icons/iconAttendanceReportActive.svg";
import { SideBarItemProps } from "@/components/common/SideBarItem";
import ReportActiveIcon from "@/app/assets/icons/iconReportAvtice.svg";
import ReportIcon from "@/app/assets/icons/iconReport.svg";
import CalendarIcon from "@/app/assets/icons/IconCalendar.png";
import CalendarIconActive from "@/app/assets/icons/IconCalendarActive.png";
import MasterIcon from "@/app/assets/icons/iconMaster.svg";
import MasterActiveIcon from "@/app/assets/icons/iconMasterAvtice.svg";

export const ACCESS_TOKEN_KEY = "ACCESS_TOKEN_KEY";
export const REFRESH_TOKEN_KEY = "REFRESH_TOKEN_KEY";
// time test
// export const ACCESS_TOKEN_EXPIRED_TIME = 60;
// export const REFRESH_TOKEN_EXPIRED_TIME = 60 * 5;
// export const USER_INFO_EXPIRED_TIME = 60 * 5;

// time dev + production
export const ACCESS_TOKEN_EXPIRED_TIME = 60 * 60 * 24;
export const REFRESH_TOKEN_EXPIRED_TIME = 60 * 60 * 24 * 7;
export const USER_INFO_EXPIRED_TIME = 60 * 60 * 24 * 7;
export const ITEM_PER_PAGE = 10;
export const WEEKDAYS_TITLE = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
export const monthsArray = Array.from({ length: 12 }, (_, index) => index);
export const TIME_TOAST = 8000;
export const MAX_ROLE_DROPDOWN_SIZE = 100;
export const LEAVE_STEP = 4;
export interface CommonDataDropdown {
  value: string;
  name: string;
}

export const STAFF_STATUS = [
  {
    value: "0",
    name: "Inactive",
  },
  {
    value: "1",
    name: "Active",
  },
];

export const ROLE_DESCRIPTION =
  "* Admin là role có mọi quyền trong hệ thống.\n* Staff là role có quyền thấp nhất, chỉ có thể xem lịch làm việc, update thông tin cá nhân và tạo đơn xin nghỉ phép.\n* Leader là role có toàn bộ quyền của Staff và có thêm quyền duyệt đơn xin nghỉ.";

export const STATUS_WORKING_DESCRIPTION =
  "* Intern là nhân viên thực tập không có giờ nghỉ phép, sẽ phải nghỉ không lương nếu cần thiết.\n* Probation là nhân viên trong giai đoạn thử việc có giờ nghỉ phép, nhưng giờ phép chỉ được sử dụng sau khi trở thành nhân viên chính thức.\n* Official là nhân viên chính thức có giờ nghỉ phép, được sử dụng giờ phép để xin phép nghỉ khi cần . ";

export const STAFF_STATUS_WORKING = [
  {
    value: "1",
    name: "Intern",
  },
  {
    value: "2",
    name: "Probation",
  },
  {
    value: "3",
    name: "Official",
  },
];

export const CANCEL_REQUEST_VALUE = [
  {
    value: "0",
    name: "Not available",
  },
  {
    value: "1",
    name: "Pending request",
  },
  {
    value: "2",
    name: "Agreed",
  },
  {
    value: "3",
    name: "Skipped",
  },
];

export const LEAVE_TYPE = [
  {
    value: "0",
    name: "Unpaid",
  },
  {
    value: "1",
    name: "Paid",
  },
];

export const LEAVE_STATUS = [
  {
    value: "0",
    name: "Waiting",
  },
  {
    value: "1",
    name: "Approved",
  },
  {
    value: "2",
    name: "Disapproved",
  },
];

export const DAY_OFF_STATUS = [
  {
    value: "0",
    name: "Off",
  },
  {
    value: "1",
    name: "Working",
  },
];

export const SHIFT_STATUS = [
  {
    value: "0",
    name: "All Day",
  },
  {
    value: "1",
    name: "Morning",
  },
  {
    value: "2",
    name: "Afternoon",
  },
];

export const COUNTRY = [
  {
    value: "vi",
    name: "Việt Nam",
  },
  {
    value: "jp",
    name: "Nhật Bản",
  },
];

export const JAPANESE_DAYS_OF_WEEK: { [key: number]: string } = {
  0: "Sun", // Sunday
  1: "Mon", // Monday
  2: "Tue", // Tuesday
  3: "Wed", // Wednesday
  4: "Thu", // Thursday
  5: "Fri", // Friday
  6: "Sat", // Saturday
};

export const GENDER = [
  {
    value: "0",
    name: "Female",
  },
  {
    value: "1",
    name: "Male",
  },
];

export const START_YEAR = 2024;
export const MAX_LENGTH_TEXT = 200;

export const SIDEBAR_ITEMS: SideBarItemProps[] = [
  {
    icon: DashboardIcon,
    iconActive: DashboardIconActive,
    title: "Dashboard",
    route: "/dashboard",
    permission: ["dashboard_view"],
  },
  {
    icon: MyPageIcon,
    iconActive: MyPageIconActive,
    title: "My Page",
    route: "/my-page",
    permission: ["mypage"],
  },
  {
    icon: CalendarIcon,
    iconActive: CalendarIconActive,
    title: "Day Offs",
    route: "/dayOffs",
    permission: ["staff_master"],
  },
  {
    icon: LeavesIcon,
    iconActive: LeavesIconActive,
    title: "Leaves",
    route: "/leaves",
    permission: ["leave_list"],
  },
  {
    icon: ReportIcon,
    iconActive: ReportActiveIcon,
    title: "Report",
    route: "/report",
    permission: ["exportPDF"],
    subRoute: [
      {
        icon: AttendanceReportIcon,
        iconActive: AttendanceReportActiceIcon,
        title: "Attendance",
        route: "/reports",
        permission: ["exportPDF"],
      },
    ],
  },
  {
    icon: MasterIcon,
    iconActive: MasterActiveIcon,
    title: "Master",
    route: "/master",
    permission: ["staff_master", "role_master"],
    subRoute: [
      {
        icon: StaffIcon,
        iconActive: StaffIconActive,
        title: "Staffs",
        route: "/staffs",
        permission: ["staff_master"],
      },
      {
        icon: RoleIcon,
        iconActive: RoleIconActive,
        title: "Roles",
        route: "/roles",
        permission: ["role_master"],
      },
    ],
  },
];
