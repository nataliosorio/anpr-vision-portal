/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  details?: any;
}
