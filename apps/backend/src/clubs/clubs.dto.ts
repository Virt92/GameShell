import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateClubDto {
  @ApiProperty({ example: 'CyberArena Kyiv' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'cyberarena-kyiv' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: 'м. Київ, вул. Хрещатик, 1', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'Europe/Kyiv', required: false })
  @IsString()
  @IsOptional()
  timezone?: string;
}

export class UpdateClubDto extends PartialType(CreateClubDto) {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  shellBgUrl?: string;
}
