import { IsString, IsEnum, IsOptional } from 'class-validator';
import { PaymentRail } from '@prisma/client';

export class CreateOrderDto {
  @IsString()
  quoteId!: string;

  @IsEnum(PaymentRail)
  paymentRail!: PaymentRail;

  @IsOptional()
  @IsString()
  shipName?: string;

  @IsOptional()
  @IsString()
  shipAddress?: string;

  @IsOptional()
  @IsString()
  shipCity?: string;

  @IsOptional()
  @IsString()
  shipState?: string;

  @IsOptional()
  @IsString()
  shipZip?: string;

  @IsOptional()
  @IsString()
  shipCountry?: string;
}
