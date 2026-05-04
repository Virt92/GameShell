import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Loyalty')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('achievements')
  @ApiOperation({ summary: 'Список досягнень' })
  getAchievements(@CurrentUser('clubId') clubId: string) {
    return this.loyaltyService.getAchievements(clubId);
  }

  @Get('promo-codes')
  @ApiOperation({ summary: 'Список промокодів' })
  getPromoCodes(@CurrentUser('clubId') clubId: string) {
    return this.loyaltyService.getPromoCodes(clubId);
  }

  @Post('promo-codes')
  @ApiOperation({ summary: 'Створити промокод' })
  createPromoCode(@CurrentUser('clubId') clubId: string, @Body() data: any) {
    return this.loyaltyService.createPromoCode(clubId, data);
  }

  @Post('promo-codes/apply')
  @ApiOperation({ summary: 'Застосувати промокод' })
  applyPromoCode(@CurrentUser('clubId') clubId: string, @CurrentUser('id') userId: string, @Body('code') code: string) {
    return this.loyaltyService.applyPromoCode(code, clubId, userId);
  }
}
