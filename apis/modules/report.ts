import api from "../request";

export interface GetStaffReportParams {
  page?: number;
  sort_by?: string;
  sort_order?: string;
  keyword?: string;
  status?: number;
  limit?: number;
}

export function getStaffReportRequest(params: GetStaffReportParams) {
  return api.get(`/reports`, { params });
}

export interface ExportPDFParams {
  items?: Array<{ id: number }>;
  month?: number;
  year?: number;
}

export function getExportPDFRequest(params: ExportPDFParams) {
  return api.get(`/reports/export-pdf`, { params });
}

export interface GetCheckedStaffReportParams {
  items?: Array<{ id: number }>;
  month?: number;
  year?: number;
  sort_by?: string;
  sort_order?: string;
}

export function getCheckedStaffExportPDFRequest(
  params: GetCheckedStaffReportParams
) {
  return api.get(`/reports/check`, { params });
}
