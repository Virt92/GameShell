import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginStaffDto, SendSmsDto, VerifySmsDto, RefreshTokenDto } from './auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Авторизація персоналу' })
  loginStaff(@Body() dto: LoginStaffDto) {
    return this.authService.loginStaff(dto.email, dto.password);
  }

  @Post('player/sms')
  @ApiOperation({ summary: 'Відправити SMS-код гравцю' })
  sendSms(@Body() dto: SendSmsDto) {
    return this.authService.sendPlayerSms(dto.phone, dto.clubId);
  }

  @Post('player/verify')
  @ApiOperation({ summary: 'Верифікація SMS-коду' })
  verifySms(@Body() dto: VerifySmsDto) {
    return this.authService.verifyPlayerSms(dto.phone, dto.code, dto.clubId);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Оновити токен' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }
}
