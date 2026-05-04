import { IsEmail, IsNotEmpty, IsString, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginStaffDto {
  @ApiProperty({ example: 'admin@club.ua' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class SendSmsDto {
  @ApiProperty({ example: '+380991234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'club-uuid-here' })
  @IsString()
  @IsNotEmpty()
  clubId: string;
}

export class VerifySmsDto {
  @ApiProperty({ example: '+380991234567' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'club-uuid-here' })
  @IsString()
  @IsNotEmpty()
  clubId: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
