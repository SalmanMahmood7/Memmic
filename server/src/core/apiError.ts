export class ApiError extends Error {
  status: number;
  headers?: Record<string, string>;

  constructor(status: number, detail: string, headers?: Record<string, string>) {
    super(detail);
    this.status = status;
    this.headers = headers;
  }
}
