import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TariffsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(clubId: string, data: any) {
    return this.prisma.tariff.create({ data: { ...data, clubId } });
  }

  async findByClub(clubId: string) {
    return this.prisma.tariff.findMany({
      where: { clubId, isActive: true },
      include: { zone: true },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.tariff.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.tariff.update({ where: { id }, data: { isActive: false } });
  }
}
