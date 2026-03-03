import { IsString, IsInt, Min, IsEnum } from 'class-validator';
import { DeliveryType } from '@prisma/client';

export class LockQuoteDto {
  @IsString()
  sku!: string;

  @IsString()
  offerId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsEnum(DeliveryType)
  deliveryType!: DeliveryType;
}
