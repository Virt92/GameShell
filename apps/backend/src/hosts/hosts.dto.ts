import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class RegisterHostDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clubId: string;

  @ApiProperty({ example: 'PC-01' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'pc', enum: ['pc', 'ps5', 'ps4', 'ps2', 'xbox', 'switch'] })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: 'AA:BB:CC:DD:EE:FF', required: false })
  @IsString()
  @IsOptional()
  macAddress?: string;

  @ApiProperty({ example: '192.168.1.101', required: false })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  hostname?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  hardware?: Record<string, unknown>;

  @ApiProperty({ example: 'agent', enum: ['agent', 'playactor', 'tasmota', 'manual'], required: false })
  @IsString()
  @IsOptional()
  controlMethod?: string;
}

export class UpdateHostDto extends PartialType(RegisterHostDto) {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  zoneId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tasmotaIp?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  tasmotaTopic?: string;
}

export class HostCommandDto {
  @ApiProperty({ example: 'shutdown', enum: ['shutdown', 'restart', 'lock', 'unlock', 'message', 'wake'] })
  @IsString()
  @IsNotEmpty()
  command: string;

  @ApiProperty({ required: false, example: { message: 'Час вашої сесії закінчується через 5 хвилин' } })
  @IsObject()
  @IsOptional()
  payload?: Record<string, unknown>;
}
