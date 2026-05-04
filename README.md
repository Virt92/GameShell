# GameShell

Комплексна система управління комп'ютерним клубом / кібер-ареною.

## Що це?

GameShell — українська платформа для управління ігровими клубами, яка включає:

- **Shell Client** (C# WPF) — клієнтський додаток на ігрових ПК (лаунчер ігор, таймер сесій, блокування)
- **Agent** (C# Worker Service) — фоновий сервіс на ПК (телеметрія, віддалене управління, встановлення ігор)
- **Backend API** (NestJS) — серверна частина (сесії, біллінг, аналітика, управління)
- **Admin Panel** (Vue 3) — веб-панель адміністрування
- **Local Hub** (Node.js) — локальний сервер в клубі (offline-режим, управління PlayStation, IoT)

## Архітектура

```
┌─────────── Хмара (VPS) ──────────────┐
│  Backend API ←→ PostgreSQL + Redis    │
│  Admin Panel (SPA)                    │
└──────────────┬────────────────────────┘
               │ WSS / HTTPS
┌──────────────▼────────────────────────┐
│         Локальна мережа клубу          │
│                                        │
│  Local Hub ──→ Shell Client (×35 ПК)  │
│           ──→ PS5 (playactor)         │
│           ──→ PS2 (Tasmota relay)     │
│           ──→ TV (HDMI-CEC)          │
└────────────────────────────────────────┘
```

## Стек технологій

| Компонент | Технологія |
|-----------|-----------|
| Shell Client | C# / WPF / .NET 8 |
| Agent | C# / .NET 8 Worker Service |
| Backend API | NestJS + TypeScript + Prisma |
| Admin Panel | Vue 3 + TypeScript + Tailwind CSS |
| Local Hub | Node.js + TypeScript |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| PS5 Control | playactor (TypeScript) |
| IoT | Tasmota (ESP8266) + MQTT (Mosquitto) |
| HDMI-CEC | cec-utils + Raspberry Pi |

## Структура проєкту

```
gameshell/
├── apps/
│   ├── backend/        # NestJS API
│   ├── admin/          # Vue 3 Admin Panel
│   ├── shell/          # C# WPF Shell Client
│   ├── agent/          # C# Worker Service Agent
│   └── local-hub/      # Node.js Local Hub
├── packages/
│   └── shared/         # Спільні типи та утиліти
├── docker-compose.yml  # PostgreSQL, Redis, Mosquitto
└── .github/workflows/  # CI/CD
```

## Швидкий старт

```bash
# 1. Клонувати
git clone https://github.com/Virt92/gameshell.git
cd gameshell

# 2. Запустити інфраструктуру
docker compose up -d

# 3. Backend
cd apps/backend
npm install
npx prisma migrate dev
npm run start:dev

# 4. Admin Panel
cd apps/admin
npm install
npm run dev
```

## Ролі користувачів

| Роль | Опис |
|------|------|
| **Owner** | Повний доступ, фінанси, налаштування |
| **DevOps** | Обладнання, ігри, моніторинг |
| **Operator** | Сесії, каса, обслуговування |
| **Accountant** | Фінансові звіти, зарплати |
| **Player** | Ігри, магазин, бонуси |

## Ліцензія

Proprietary. Всі права захищені.
