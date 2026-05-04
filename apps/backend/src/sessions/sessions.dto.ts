import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSessionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clubId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  hostId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  playerId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tariffId?: string;

  @ApiProperty({ enum: ['prepaid', 'postpaid'] })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ required: false, description: 'Оплачені хвилини (для prepaid)' })
  @IsNumber()
  @IsOptional()
  durationMin?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  amount?: number;

  @ApiProperty({ required: false, enum: ['cash', 'card', 'balance', 'bonus'] })
  @IsString()
  @IsOptional()
  paymentMethod?: string;
}

export class UpdateSessionDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  durationMin?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  amount?: number;
}
