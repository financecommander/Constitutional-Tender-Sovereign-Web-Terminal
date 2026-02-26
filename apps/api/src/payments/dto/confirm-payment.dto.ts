import { IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @IsString()
  declare paymentIntentId: string;
}
