import {
  ExportPDFParams,
  GetCheckedStaffReportParams,
  GetStaffReportParams,
} from "@/apis/modules/report";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";

export interface ReportRepository {
  getStaffReportList(
    params: GetStaffReportParams
  ): Promise<CommonResponse | null>;
  exportPDF(params: ExportPDFParams): Promise<CommonResponse | any>;
  getCheckedStaffExportPDF(
    params: GetCheckedStaffReportParams
  ): Promise<CommonResponse | any>;
}
