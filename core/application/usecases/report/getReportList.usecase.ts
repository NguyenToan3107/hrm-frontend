import { GetStaffReportParams } from "@/apis/modules/report";
import { ReportRepository } from "@/core/application/infrastructure-interface/repositories/report.repo-interface";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";

export class GetReportListUseCase {
  private reportRepo: ReportRepository;
  constructor(reportRepo: ReportRepository) {
    this.reportRepo = reportRepo;
  }

  async execute(params: GetStaffReportParams): Promise<CommonResponse | null> {
    const response = await this.reportRepo.getStaffReportList(params);
    return response;
  }
}
