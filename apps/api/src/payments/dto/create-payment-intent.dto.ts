import { IsNumber, Min, Max } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsNumber()
  @Min(100)
  @Max(500000)
  declare amount: number;
}
