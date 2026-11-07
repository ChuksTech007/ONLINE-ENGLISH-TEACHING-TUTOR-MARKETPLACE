import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, WalletTxType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { publicReference } from '../common/utils/ids';
import { moneyString } from '../common/utils/money';
import { NotificationsService } from '../notifications/notifications.service';

export class InsufficientCreditError extends BadRequestException {
  constructor() {
    super({
      code: 'INSUFFICIENT_CREDIT',
      message:
        'This teacher is not accepting new student enquiries right now. Please choose another teacher.',
    });
  }
}

@Injectable()
export class WalletsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async getForTeacherUser(userId: string) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { userId },
      include: { wallet: true },
    });
    if (!teacher?.wallet) throw new NotFoundException('Wallet not found');
    return this.serialize(teacher.wallet, teacher.id);
  }

  async transactionsForTeacherUser(userId: string) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { userId },
      include: { wallet: true },
    });
    if (!teacher?.wallet) throw new NotFoundException('Wallet not found');
    const rows = await this.prisma.walletTransaction.findMany({
      where: { walletId: teacher.wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return rows.map((tx) => this.serializeTx(tx));
  }

  async listPackages() {
    return this.prisma.creditPackage.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async purchasePackage(userId: string, packageId: string) {
    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { userId },
      include: { wallet: true },
    });
    if (!teacher?.wallet) throw new NotFoundException('Wallet not found');
    const pack = await this.prisma.creditPackage.findUnique({
      where: { id: packageId },
    });
    if (!pack || !pack.active) {
      throw new NotFoundException('Credit package not found');
    }

    // MVP checkout: credits are applied immediately after a recorded purchase.
    // Full spec will replace this with Stripe/PayPal webhook verification.
    const wallet = await this.creditWallet({
      teacherId: teacher.id,
      amount: pack.creditAmount,
      type: WalletTxType.PURCHASE,
      description: `Purchased ${pack.name} package`,
      metadata: {
        packageId: pack.id,
        packageName: pack.name,
        price: pack.price.toFixed(2),
        currency: pack.currency,
      },
    });

    await this.notifications.create({
      userId,
      type: 'WALLET_RECHARGE',
      title: 'Advertising credits added',
      body: `${moneyString(pack.creditAmount)} credits were added to your wallet.`,
      link: '/dashboard/wallet',
    });

    return wallet;
  }

  async creditWallet(params: {
    teacherId: string;
    amount: Prisma.Decimal | number | string;
    type: WalletTxType;
    description: string;
    adminId?: string;
    enquiryId?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    const amount = new Prisma.Decimal(params.amount);
    if (amount.lte(0)) throw new BadRequestException('Amount must be positive');

    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Wallet" WHERE "teacherId" = ${params.teacherId} FOR UPDATE`;
      const wallet = await tx.wallet.findUnique({
        where: { teacherId: params.teacherId },
      });
      if (!wallet) throw new NotFoundException('Wallet not found');

      const previous = wallet.balance;
      const next = previous.plus(amount);
      const purchased =
        params.type === WalletTxType.PURCHASE ||
        params.type === WalletTxType.ADMIN_CREDIT
          ? wallet.totalPurchased.plus(amount)
          : wallet.totalPurchased;

      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: next, totalPurchased: purchased },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: params.type,
          amount,
          previousBalance: previous,
          newBalance: next,
          reference: publicReference('cr'),
          description: params.description,
          enquiryId: params.enquiryId,
          adminId: params.adminId,
          metadata: params.metadata,
        },
      });

      return this.serialize(updated, params.teacherId);
    });
  }

  async adminAdjust(params: {
    teacherId: string;
    amount: number;
    type: 'ADMIN_CREDIT' | 'ADMIN_DEBIT' | 'REFUND';
    reason: string;
    adminId: string;
    enquiryId?: string;
  }) {
    const amount = new Prisma.Decimal(params.amount);
    if (amount.lte(0)) throw new BadRequestException('Amount must be positive');

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Wallet" WHERE "teacherId" = ${params.teacherId} FOR UPDATE`;
      const wallet = await tx.wallet.findUnique({
        where: { teacherId: params.teacherId },
      });
      if (!wallet) throw new NotFoundException('Wallet not found');

      const previous = wallet.balance;
      const next =
        params.type === 'ADMIN_DEBIT'
          ? previous.minus(amount)
          : previous.plus(amount);
      if (next.lt(0)) {
        throw new BadRequestException('Adjustment would make the wallet negative');
      }

      const updated = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: next,
          totalPurchased:
            params.type === 'ADMIN_CREDIT' || params.type === 'REFUND'
              ? wallet.totalPurchased.plus(amount)
              : wallet.totalPurchased,
          totalDeducted:
            params.type === 'ADMIN_DEBIT'
              ? wallet.totalDeducted.plus(amount)
              : wallet.totalDeducted,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: params.type,
          amount,
          previousBalance: previous,
          newBalance: next,
          reference: publicReference(params.type === 'REFUND' ? 'rf' : 'adj'),
          description: params.reason,
          enquiryId: params.enquiryId,
          adminId: params.adminId,
        },
      });

      await tx.adminAuditLog.create({
        data: {
          adminId: params.adminId,
          action: `WALLET_${params.type}`,
          entityType: 'Wallet',
          entityId: wallet.id,
          reason: params.reason,
          metadata: { amount: amount.toFixed(2), teacherId: params.teacherId },
        },
      });

      return this.serialize(updated, params.teacherId);
    });

    const teacher = await this.prisma.teacherProfile.findUnique({
      where: { id: params.teacherId },
    });
    if (teacher) {
      await this.notifications.create({
        userId: teacher.userId,
        type: 'WALLET_ADJUSTMENT',
        title:
          params.type === 'REFUND'
            ? 'Advertising credit refunded'
            : 'Wallet updated by administrator',
        body: params.reason,
        link: '/dashboard/wallet',
      });
    }
    return result;
  }

  serialize(
    wallet: {
      id: string;
      balance: Prisma.Decimal;
      totalPurchased: Prisma.Decimal;
      totalDeducted: Prisma.Decimal;
      updatedAt: Date;
    },
    teacherId: string,
  ) {
    return {
      teacherId,
      balance: moneyString(wallet.balance),
      totalPurchased: moneyString(wallet.totalPurchased),
      totalDeducted: moneyString(wallet.totalDeducted),
      updatedAt: wallet.updatedAt,
    };
  }

  serializeTx(tx: {
    id: string;
    type: WalletTxType;
    amount: Prisma.Decimal;
    previousBalance: Prisma.Decimal;
    newBalance: Prisma.Decimal;
    reference: string;
    description: string;
    enquiryId: string | null;
    createdAt: Date;
  }) {
    return {
      id: tx.id,
      type: tx.type,
      amount: moneyString(tx.amount),
      previousBalance: moneyString(tx.previousBalance),
      newBalance: moneyString(tx.newBalance),
      reference: tx.reference,
      description: tx.description,
      enquiryId: tx.enquiryId,
      createdAt: tx.createdAt,
    };
  }
}
