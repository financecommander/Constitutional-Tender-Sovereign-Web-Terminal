import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateTeleportDto {
  @IsUUID()
  assetId!: string;

  @IsUUID()
  fromVaultId!: string;

  @IsUUID()
  toVaultId!: string;

  @IsNumber({ maxDecimalPlaces: 8 })
  @IsPositive()
  quantity!: number;
}
