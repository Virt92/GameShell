import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create club
  const club = await prisma.club.upsert({
    where: { slug: 'demo-club' },
    update: {},
    create: {
      name: 'Demo CyberArena',
      slug: 'demo-club',
      address: 'м. Київ, вул. Хрещатик, 1',
      timezone: 'Europe/Kyiv',
    },
  });

  console.log('Club created:', club.name);

  // Create zones
  const zones = await Promise.all([
    prisma.zone.create({ data: { clubId: club.id, name: 'VIP', color: '#eab308', sortOrder: 0 } }),
    prisma.zone.create({ data: { clubId: club.id, name: 'Стандарт', color: '#3b82f6', sortOrder: 1 } }),
    prisma.zone.create({ data: { clubId: club.id, name: 'PlayStation', color: '#8b5cf6', sortOrder: 2 } }),
  ]);

  console.log('Zones created:', zones.length);

  // Create staff
  const passwordHash = await bcrypt.hash('admin123', 10);

  await Promise.all([
    prisma.staff.create({
      data: { clubId: club.id, name: 'Власник', email: 'owner@club.ua', role: 'owner', passwordHash },
    }),
    prisma.staff.create({
      data: { clubId: club.id, name: 'DevOps', email: 'devops@club.ua', role: 'devops', passwordHash },
    }),
    prisma.staff.create({
      data: { clubId: club.id, name: 'Оператор', email: 'operator@club.ua', role: 'operator', passwordHash, pinCode: '1234' },
    }),
    prisma.staff.create({
      data: { clubId: club.id, name: 'Бухгалтер', email: 'accountant@club.ua', role: 'accountant', passwordHash },
    }),
  ]);

  console.log('Staff created');

  // Create PCs (35)
  for (let i = 1; i <= 35; i++) {
    const zoneId = i <= 10 ? zones[0].id : zones[1].id;
    await prisma.host.create({
      data: {
        clubId: club.id,
        zoneId,
        name: `PC-${String(i).padStart(2, '0')}`,
        type: 'pc',
        status: 'online',
        macAddress: `AA:BB:CC:DD:${String(Math.floor(i / 16)).padStart(2, '0')}:${String(i % 16).padStart(2, '0')}`,
        ipAddress: `192.168.1.${100 + i}`,
        hostname: `GAMING-PC-${i}`,
        controlMethod: 'agent',
        hardware: { cpu: 'Intel i5-13400F', gpu: 'RTX 4060', ram: '16GB DDR5', os: 'Windows 11' },
        sortOrder: i,
      },
    });
  }

  console.log('35 PCs created');

  // Create PS5 consoles (3)
  for (let i = 1; i <= 3; i++) {
    await prisma.host.create({
      data: {
        clubId: club.id,
        zoneId: zones[2].id,
        name: `PS5-${String(i).padStart(2, '0')}`,
        type: 'ps5',
        status: 'online',
        ipAddress: `192.168.1.${200 + i}`,
        controlMethod: 'playactor',
        cecDeviceId: `cec-${i}`,
        tasmotaIp: `192.168.1.${210 + i}`,
        tasmotaTopic: `tasmota_ps5_${i}`,
        sortOrder: i,
      },
    });
  }

  console.log('3 PS5 created');

  // Create PS2 consoles (2)
  for (let i = 1; i <= 2; i++) {
    await prisma.host.create({
      data: {
        clubId: club.id,
        zoneId: zones[2].id,
        name: `PS2-${String(i).padStart(2, '0')}`,
        type: 'ps2',
        status: 'online',
        controlMethod: 'tasmota',
        tasmotaIp: `192.168.1.${220 + i}`,
        tasmotaTopic: `tasmota_ps2_${i}`,
        sortOrder: 10 + i,
      },
    });
  }

  console.log('2 PS2 created');

  // Create tariffs
  await Promise.all([
    prisma.tariff.create({ data: { clubId: club.id, name: '1 година', type: 'fixed', price: 80, duration: 60, appliesTo: 'pc' } }),
    prisma.tariff.create({ data: { clubId: club.id, name: '2 години', type: 'fixed', price: 140, duration: 120, appliesTo: 'pc' } }),
    prisma.tariff.create({ data: { clubId: club.id, name: '3 години', type: 'fixed', price: 180, duration: 180, appliesTo: 'pc' } }),
    prisma.tariff.create({ data: { clubId: club.id, name: 'Весь день', type: 'daily', price: 400, appliesTo: 'pc' } }),
    prisma.tariff.create({ data: { clubId: club.id, name: 'VIP 1 година', type: 'fixed', price: 120, duration: 60, appliesTo: 'pc', zoneId: zones[0].id } }),
    prisma.tariff.create({ data: { clubId: club.id, name: 'PS5 1 година', type: 'fixed', price: 150, duration: 60, appliesTo: 'ps5' } }),
    prisma.tariff.create({ data: { clubId: club.id, name: 'PS5 2 години', type: 'fixed', price: 250, duration: 120, appliesTo: 'ps5' } }),
    prisma.tariff.create({ data: { clubId: club.id, name: 'PS2 1 година', type: 'fixed', price: 50, duration: 60, appliesTo: 'ps2' } }),
  ]);

  console.log('Tariffs created');

  // Create games
  const games = [
    { name: 'Counter-Strike 2', category: 'FPS', launcher: 'Steam', launcherId: '730', sizeGb: 35 },
    { name: 'Dota 2', category: 'MOBA', launcher: 'Steam', launcherId: '570', sizeGb: 30 },
    { name: 'Fortnite', category: 'Battle Royale', launcher: 'Epic', sizeGb: 90 },
    { name: 'Valorant', category: 'FPS', launcher: 'Riot', sizeGb: 25 },
    { name: 'GTA V', category: 'Action', launcher: 'Steam', launcherId: '271590', sizeGb: 120 },
    { name: 'Minecraft', category: 'Sandbox', launcher: 'Custom', sizeGb: 1 },
    { name: 'FIFA 24', category: 'Спорт', launcher: 'EA', sizeGb: 50 },
    { name: 'Apex Legends', category: 'Battle Royale', launcher: 'Steam', launcherId: '1172470', sizeGb: 60 },
    { name: 'League of Legends', category: 'MOBA', launcher: 'Riot', sizeGb: 20 },
    { name: 'PUBG', category: 'Battle Royale', launcher: 'Steam', launcherId: '578080', sizeGb: 40 },
  ];

  for (const game of games) {
    await prisma.game.create({ data: { clubId: club.id, ...game } });
  }

  console.log('Games created:', games.length);

  // Create products (shop)
  const products = [
    { name: 'Кока-Кола 0.5л', category: 'Напої', price: 35 },
    { name: 'Пепсі 0.5л', category: 'Напої', price: 35 },
    { name: 'Вода 0.5л', category: 'Напої', price: 20 },
    { name: 'Red Bull 0.25л', category: 'Напої', price: 55 },
    { name: 'Чіпси Lays', category: 'Снеки', price: 45 },
    { name: 'Сухарики', category: 'Снеки', price: 25 },
    { name: 'Шоколадний батончик', category: 'Снеки', price: 30 },
    { name: 'Піца шматок', category: 'Їжа', price: 65 },
    { name: 'Хот-дог', category: 'Їжа', price: 50 },
  ];

  for (let i = 0; i < products.length; i++) {
    await prisma.product.create({
      data: { clubId: club.id, ...products[i], sortOrder: i },
    });
  }

  console.log('Products created:', products.length);

  console.log('Seed completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
