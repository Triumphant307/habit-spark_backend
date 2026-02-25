export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    // 4xx = client's fault ("fail"), 5xx = server's fault ("error")
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
  }
}
