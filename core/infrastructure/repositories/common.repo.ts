import { ExportPDFResponse, getCommonsExportPDFRequest } from "@/apis/modules/common";
import { CommonRepository } from "@/core/application/infrastructure-interface/repositories/common.repo-interface";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";

export class CommonRepositoryImpl implements CommonRepository {
    async exportPDF(params: ExportPDFResponse): Promise<CommonResponse | null> {
        try {
        const response: any = await getCommonsExportPDFRequest(params);
        return response;
        } catch (error: any) {
        return error;
        }
    }
}
  