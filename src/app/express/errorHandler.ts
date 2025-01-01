import { ApplicationError } from '@hireverse/service-common/dist/app.errors';
import { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        message: 'Resource not found',
        url: req.originalUrl
    });
};

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if(process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    let statusCode = 500; 
    let message = 'Internal Server Error';

    if(err instanceof ApplicationError) {
        statusCode = err.code;
        message = err.message
    }

    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        url: req.originalUrl
    });
};