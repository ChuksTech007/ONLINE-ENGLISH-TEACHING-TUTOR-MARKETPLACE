import { Prisma } from '@prisma/client';

export const money = (value: Prisma.Decimal | number | string) =>
  new Prisma.Decimal(value);

export const moneyString = (value: Prisma.Decimal | number | string) =>
  new Prisma.Decimal(value).toFixed(2);
