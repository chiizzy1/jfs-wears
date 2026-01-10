import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

// List of safe error codes that can have their messages exposed
const SAFE_ERROR_CODES = [400, 401, 403, 404, 409, 422];

// Generic error messages for different status codes
const GENERIC_MESSAGES: Record<number, string> = {
  500: "An unexpected error occurred. Please try again later.",
  502: "Service temporarily unavailable. Please try again.",
  503: "Service temporarily unavailable. Please try again.",
  504: "Request timed out. Please try again.",
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  private readonly isProduction = process.env.NODE_ENV === "production";

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  /**
   * Sanitize error message for production
   * Only expose messages for safe error codes
   */
  private sanitizeMessage(exception: unknown, httpStatus: number): string {
    // In development, return the actual message
    if (!this.isProduction) {
      return exception instanceof HttpException ? exception.message : "Internal server error";
    }

    // For safe error codes, return the actual message
    if (SAFE_ERROR_CODES.includes(httpStatus) && exception instanceof HttpException) {
      const message = exception.message;
      // Don't expose stack traces or internal details
      if (message.includes("stack") || message.includes("Error:") || message.length > 200) {
        return GENERIC_MESSAGES[httpStatus] || "An error occurred.";
      }
      return message;
    }

    // For server errors, return generic message
    return GENERIC_MESSAGES[httpStatus] || "An unexpected error occurred. Please try again later.";
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: this.sanitizeMessage(exception, httpStatus),
    };

    // Always log full error details server-side
    if (httpStatus === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error("Unhandled exception:", exception);
    } else {
      this.logger.warn(`Exception: ${httpStatus} - ${responseBody.path}`, {
        status: httpStatus,
        path: responseBody.path,
        message: exception instanceof HttpException ? exception.message : "Unknown",
      });
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
