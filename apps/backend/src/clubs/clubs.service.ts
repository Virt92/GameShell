import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClubDto, UpdateClubDto } from './clubs.dto';

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClubDto) {
    return this.prisma.club.create({ data: dto });
  }

  async findAll() {
    return this.prisma.club.findMany({
      include: {
        _count: { select: { hosts: true, staff: true, players: true } },
      },
    });
  }

  async findOne(id: string) {
    const club = await this.prisma.club.findUnique({
      where: { id },
      include: {
        zones: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { hosts: true, staff: true, players: true } },
      },
    });
    if (!club) throw new NotFoundException('Клуб не знайдено');
    return club;
  }

  async update(id: string, dto: UpdateClubDto) {
    return this.prisma.club.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.club.delete({ where: { id } });
  }
}
