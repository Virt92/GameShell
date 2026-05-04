import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class ShopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ws: WebsocketGateway,
  ) {}

  async getProducts(clubId: string) {
    return this.prisma.product.findMany({
      where: { clubId, inStock: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async createOrder(data: { clubId: string; playerId?: string; hostId?: string; items: { productId: string; quantity: number }[]; paymentMethod?: string }) {
    const products = await this.prisma.product.findMany({
      where: { id: { in: data.items.map(i => i.productId) } },
    });

    const total = data.items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? Number(product.price) * item.quantity : 0);
    }, 0);

    const order = await this.prisma.order.create({
      data: {
        clubId: data.clubId,
        playerId: data.playerId,
        hostId: data.hostId,
        total,
        paymentMethod: data.paymentMethod as any,
        items: {
          create: data.items.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product?.price ?? 0,
            };
          }),
        },
      },
      include: { items: { include: { product: true } }, host: true },
    });

    this.ws.emitNewOrder(data.clubId, {
      orderId: order.id,
      hostName: order.host?.name,
      items: order.items.map(i => ({ name: i.product.name, qty: i.quantity })),
      total,
    });

    return order;
  }

  async updateOrderStatus(id: string, status: string) {
    return this.prisma.order.update({ where: { id }, data: { status: status as any } });
  }
}
