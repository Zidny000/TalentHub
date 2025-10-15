import { Response } from 'express';

/**
 * Utility class to format API responses consistently
 */
export class ResponseFormatter {
  /**
   * Send a success response
   * @param res - Express response object
   * @param message - Success message
   * @param data - Response data payload
   * @param statusCode - HTTP status code
   */
  static success(res: Response, message: string, data?: any, statusCode: number = 200): void {
    res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data
    });
  }

  /**
   * Send an error response
   * @param res - Express response object
   * @param message - Error message
   * @param errorDetails - Optional error details
   * @param statusCode - HTTP status code
   */
  static error(res: Response, message: string, errorDetails?: any, statusCode: number = 400): void {
    const response: any = {
      success: false,
      message
    };

    if (errorDetails) {
      response.errorDetails = errorDetails;
    }

    res.status(statusCode).json(response);
  }

  /**
   * Send an unauthorized error response
   * @param res - Express response object
   * @param message - Error message
   * @param errorDetails - Optional error details
   */
  static unauthorized(res: Response, message: string = 'Unauthorized access.', errorDetails?: any): void {
    this.error(res, message, errorDetails, 401);
  }

  /**
   * Send a forbidden error response
   * @param res - Express response object
   * @param message - Error message
   * @param errorDetails - Optional error details
   */
  static forbidden(res: Response, message: string = 'Unauthorized access.', errorDetails?: any): void {
    this.error(res, message, errorDetails, 403);
  }

  /**
   * Send a validation error response
   * @param res - Express response object
   * @param message - Error message
   * @param errorDetails - Validation error details
   */
  static validationError(res: Response, message: string = 'Validation error occurred.', errorDetails: any): void {
    this.error(res, message, errorDetails, 400);
  }

  /**
   * Send a resource not found error response
   * @param res - Express response object
   * @param message - Error message
   */
  static notFound(res: Response, message: string = 'Resource not found.'): void {
    this.error(res, message, undefined, 404);
  }

}