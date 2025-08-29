export interface ApiResponse<T> {
  data: T;
  message: string;
}

export class ResponseHelper {
  static success<T>(data: T, message: string): ApiResponse<T> {
    return {
      data,
      message,
    };
  }
}
