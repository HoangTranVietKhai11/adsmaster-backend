import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export interface AppError extends Error {
    statusCode?: number;
    code?: string;
}

export function errorHandler(
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    logger.error(`[${statusCode}] ${message}`, {
        stack: err.stack,
        code: err.code,
    });

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
}

export function createError(message: string, statusCode: number = 500): AppError {
    const error: AppError = new Error(message);
    error.statusCode = statusCode;
    return error;
}
