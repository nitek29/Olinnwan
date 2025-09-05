import { Request, Response, NextFunction } from 'express';
import status from 'http-status';
import Joi from 'joi';

export default function validateSchema(schema: Joi.ObjectSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validateAsync(req.body, { abortEarly: false });
      next();
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        console.error('Validation error:', error.message);
        console.error('Validation details:', error.details);
        console.error('Request body:', req.body);

        const errorResponse = {
          error: true,
          message: error.message,
          details: error.details.map((detail: Joi.ValidationErrorItem) => ({
            message: detail.message,
            path: detail.path,
            value: detail.context?.value,
          })),
        };

        console.error('Error response:', errorResponse);
        res.status(status.BAD_REQUEST).json(errorResponse);
      } else {
        console.error('Non-validation error:', error);
        next(error);
      }
    }
  };
}
