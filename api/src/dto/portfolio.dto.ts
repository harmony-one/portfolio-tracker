import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class GetPortfolioSnapshotsDto {
  @ApiProperty({ type: String, required: false })
  @Type(() => String)
  @IsString()
  @IsOptional()
  walletAddress?: string;

  @ApiProperty({ type: Number, required: false, default: '1000' })
  @Type(() => String)
  @IsString()
  @IsOptional()
  limit: number;

  @ApiProperty({ type: Number, required: false, default: '0' })
  @Type(() => String)
  @IsString()
  @IsOptional()
  offset: number;
}
