import { IsNumber, IsPositive, IsIn, IsUUID } from 'class-validator';

const CURRENCIES = ['USD', 'EUR', 'CHF', 'SGD', 'KYD', 'GBP'] as const;

export class CreateTradeDto {
  @IsUUID()
  assetId!: string;

  @IsUUID()
  vaultId!: string;

  @IsNumber({ maxDecimalPlaces: 8 })
  @IsPositive()
  quantity!: number;

  @IsIn(CURRENCIES)
  currency!: string;
}
