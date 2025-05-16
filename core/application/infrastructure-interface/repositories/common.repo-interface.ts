import { ExportPDFResponse } from "@/apis/modules/common";
import { CommonResponse } from "@/core/entities/models/responseCommon.model";

export interface CommonRepository {
    exportPDF(params: ExportPDFResponse): Promise<CommonResponse | any>;
  }