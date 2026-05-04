import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: PrismaService) {}

  async getAchievements(clubId: string) {
    return this.prisma.achievement.findMany({ where: { clubId } });
  }

  async createAchievement(clubId: string, data: any) {
    return this.prisma.achievement.create({ data: { ...data, clubId } });
  }

  async getPromoCodes(clubId: string) {
    return this.prisma.promoCode.findMany({ where: { clubId }, orderBy: { createdAt: 'desc' } });
  }

  async createPromoCode(clubId: string, data: any) {
    return this.prisma.promoCode.create({ data: { ...data, clubId } });
  }

  async applyPromoCode(code: string, clubId: string, playerId: string) {
    const promo = await this.prisma.promoCode.findFirst({
      where: { code, clubId, isActive: true },
    });

    if (!promo) return { success: false, message: 'Промокод не знайдено' };
    if (promo.maxUses && promo.usedCount >= promo.maxUses) return { success: false, message: 'Промокод вичерпано' };
    if (promo.expiresAt && promo.expiresAt < new Date()) return { success: false, message: 'Промокод прострочено' };

    await this.prisma.promoCode.update({
      where: { id: promo.id },
      data: { usedCount: { increment: 1 } },
    });

    if (promo.type === 'bonus_points') {
      await this.prisma.player.update({
        where: { id: playerId },
        data: { bonusPoints: { increment: Number(promo.value) } },
      });
    }

    return { success: true, type: promo.type, value: promo.value };
  }
}
