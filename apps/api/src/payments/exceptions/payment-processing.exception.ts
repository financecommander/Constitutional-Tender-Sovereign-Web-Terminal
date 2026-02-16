import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Payment Processing Exception
 * 
 * Custom exception for payment-related errors
 */
export class PaymentProcessingException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(message, statusCode);
  }
}
