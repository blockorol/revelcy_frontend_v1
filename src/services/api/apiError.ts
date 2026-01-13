// api/apiError.ts
export type ApiErrorCode =
  | "invite_code_not_found"
  | "invite_code_already_applied"
  | "validation_error"
  | string;

export interface ApiErrorResponse {
  error: string;
  code: ApiErrorCode;
  field?: string | null;
  message?: string | null;
  errors?: Array<{
    field: string;
    code: ApiErrorCode;
    message: string;
  }> | null;
}

export type HttpError = Error & { status?: number; details?: unknown };

export function extractApiError(err: unknown): ApiErrorResponse | null {
  const e1 = err as (Error & { details?: unknown }) | null;
  const fromDetails = e1?.details;

  const e2 = err as any;
  const fromAxios = e2?.response?.data;

  const d = fromDetails ?? fromAxios;
  if (!d || typeof d !== "object") return null;

  const maybe = d as Partial<ApiErrorResponse>;
  if (typeof maybe.code !== "string" || typeof maybe.error !== "string") return null;

  return maybe as ApiErrorResponse;
}
