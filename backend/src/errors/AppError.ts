class AppError {
  public readonly message: string;
  public readonly statusCode: number;
  public readonly level: string;
  public readonly stack?: string;

  constructor(
    message: string, 
    statusCode = 400, 
    level = "warn",
    stack?: string
  ) {
    this.message = message;
    this.statusCode = statusCode;
    this.level = level;
    this.stack = stack;
  }
}

export default AppError;