import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentProcessingException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        message: message,
        error: 'Payment Processing Failed',
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}
