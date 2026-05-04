import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  async create(clubId: string, data: { name: string; email: string; phone?: string; role: string; password: string; pinCode?: string }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.prisma.staff.create({
      data: {
        clubId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role as any,
        passwordHash,
        pinCode: data.pinCode,
      },
    });
  }

  async findByClub(clubId: string) {
    return this.prisma.staff.findMany({
      where: { clubId },
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
    });
  }

  async update(id: string, data: { name?: string; email?: string; phone?: string; role?: string; isActive?: boolean }) {
    return this.prisma.staff.update({ where: { id }, data: data as any });
  }

  async remove(id: string) {
    return this.prisma.staff.update({ where: { id }, data: { isActive: false } });
  }
}
