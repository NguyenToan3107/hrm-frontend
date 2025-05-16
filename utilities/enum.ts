export enum LeaveStatus {
  Waiting = "Waiting",
  Confirmed = "Approved",
  Canceled = "Disapproved",
}

export enum DayOffType {
  WorkingDay = 1,
  DayOff = 0,
}

export enum UserStatus {
  Active = "1",
  InActive = "0",
}

export enum LeaveStatusValue {
  Waiting = "0",
  Confirmed = "1",
  Canceled = "2",
}

export enum LeaveType {
  Unpaid = "Unpaid",
  Paid = "Paid",
}

export enum FormModeType {
  EDIT = 1,
  VIEW = 0,
}

export enum CountryType {
  VN = "vi",
  JP = "jp",
}

export enum CancelRequestValue {
  None = "0",
  Waiting = "1",
  Skip = "2",
  Cancel = "3",
}

export enum PasswordChanged {
  UNCHANGED = "0",
  CHANGED = "1",
}

export enum JapaneseDayOfWeek {
  Sunday = "日", // Sunday
  Monday = "月", // Monday
  Tuesday = "火", // Tuesday
  Wednesday = "水", // Wednesday
  Thursday = "木", // Thursday
  Friday = "金", // Friday
  Saturday = "土", // Saturday
}

export enum LeaveSalary {
  HalfDayLeave = "有給で0.5日休み",
  HalfDayNoLeave = "無給で0.5日休み",
  DayLeave = "有給で1日休み",
  DayNoLeave = "無給1日休み",
}

export enum SalaryValue {
  PaidLeave = 1,
  UnPaidLeave = 0,
  UnPaidLeaveHalf = 2,
}

export enum ShiftValue {
  ShiftAllDay = 0,
  ShiftMorning = 1,
  ShiftAfternoon = 2,
}

export enum WorkTime {
  StartMorning = "8:30",
  EndMorning = "12:30",
  StartAfternoon = "13:30",
  EndAfternoon = "17:30",
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export enum PermissionID {
  DASHBOARD_VIEW = 1,
  DASHBOARD_EDIT = 2,
  MY_PAGE = 3,
  LEAVE_LIST = 4,
  LEAVE_CREATE = 5,
  LEAVE_EXECUTE = 6,
  STAFF_MASTER = 7,
  ROLE_MASTER = 8,
  EXPORT_PDF = 9,
}

export enum PermissionName {
  DASHBOARD_VIEW = "View Dashboard",
  DASHBOARD_EDIT = "Edit Dashboard",
  MY_PAGE = "My Page",
  LEAVE_LIST = "Leave List",
  LEAVE_CREATE = "Create Leave",
  LEAVE_EXECUTE = "Execute Leave",
  STAFF_MASTER = "Staff Master",
  ROLE_MASTER = "Role Master",
  EXPORT_PDF = "Export PDF",
}

export enum MonthInYear {
  JANUARY = "January",
  FEBRUARY = "February",
  MARCH = "March",
  APRIL = "April",
  MAY = "May",
  JUNE = "June",
  JULY = "July",
  AUGUST = "August",
  SEPTEMBER = "September",
  OCTOBER = "October",
  NOVEMBER = "November",
  DECEMBER = "December",
}

export enum DefaultRoleId {
  Admin = 1,
  Staff = 2,
  Leader = 3,
}
