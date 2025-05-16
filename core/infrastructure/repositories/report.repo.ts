import {
  ExportPDFParams,
  getCheckedStaffExportPDFRequest,
  GetCheckedStaffReportParams,
  getExportPDFRequest,
  GetStaffReportParams,
  getStaffReportRequest,
} from "@/apis/modules/report";
import { ReportRepository } from "@/core/application/infrastructure-interface/repositories/report.repo-interface";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";

export class ReportRepositoryImpl implements ReportRepository {
  async getStaffReportList(
    params: GetStaffReportParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await getStaffReportRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }
  async exportPDF(params: ExportPDFParams): Promise<CommonResponse | null> {
    try {
      const response: any = await getExportPDFRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }
  async getCheckedStaffExportPDF(
    params: GetCheckedStaffReportParams
  ): Promise<CommonResponse | null> {
    try {
      const response: any = await getCheckedStaffExportPDFRequest(params);
      return response;
    } catch (error: any) {
      return error;
    }
  }
}
