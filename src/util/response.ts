import { Response } from "express";

export type SuccessResponse<T = any> = {
  success: true;
  message: string;
  data?: T;
};

export type ErrorResponse = {
  success: false;
  message: string;
  error?: any;
};

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * Success Response Handler
 * @param res - Express Response object
 * @param message - Success message
 * @param data - Optional data to return
 * @param statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = <T = any>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200,
): Response<SuccessResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Error Response Handler
 * @param res - Express Response object
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 400)
 * @param error - Optional error details
 */
export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  error?: any,
): Response<ErrorResponse> => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};
