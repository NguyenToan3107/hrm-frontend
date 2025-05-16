import { CommonResponse } from "@/core/entities/models/responseCommon.model";
import { CommonRepository } from "@/core/application/infrastructure-interface/repositories/common.repo-interface";
import { ExportPDFResponse } from "@/apis/modules/common";

export class ExportPDFUseCase {
  private commonRepo: CommonRepository;
  constructor(commonRepo: CommonRepository) {
    this.commonRepo = commonRepo;
  }

  async execute(
    params: ExportPDFResponse
  ): Promise<CommonResponse | null> {
    const response = await this.commonRepo.exportPDF(params);
    return response;
  }
}
