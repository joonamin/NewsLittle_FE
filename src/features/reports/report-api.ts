import { apiRequest, jsonRequest } from "@/lib/api-client";

import type { CreateReportRequest, CreatedReport } from "./report-models";

export const reportApi = {
  submit: (request: CreateReportRequest) =>
    apiRequest<CreatedReport>("/api/v1/reports", jsonRequest("POST", request)),
};
