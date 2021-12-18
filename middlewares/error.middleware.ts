import { HttpException } from '../exceptions/http-exception';
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (error: HttpException, request: Request, response: Response, next: NextFunction) => {
   const status = error.status || 500;
   response.status(status).send({ status, message: error.message });
};
