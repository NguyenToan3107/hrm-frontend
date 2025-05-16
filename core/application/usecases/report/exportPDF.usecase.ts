import { ExportPDFParams } from "@/apis/modules/report";
import { ReportRepository } from "@/core/application/infrastructure-interface/repositories/report.repo-interface";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";

export class ExportPDFReportUseCase {
  private reportRepo: ReportRepository;
  constructor(reportRepo: ReportRepository) {
    this.reportRepo = reportRepo;
  }

  async execute(params: ExportPDFParams): Promise<CommonResponse | null> {
    const response = await this.reportRepo.exportPDF(params);
    return response;
  }
}
