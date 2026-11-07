import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { moneyString } from '../common/utils/money';

@Controller()
export class SettingsController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  health() {
    return { ok: true };
  }

  @Get('settings/public')
  async public() {
    const settings = await this.prisma.platformSettings.findUnique({
      where: { id: 'default' },
    });
    const packages = await this.prisma.creditPackage.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    return {
      siteName: settings?.siteName ?? 'Merit English',
      contactFee: moneyString(settings?.contactFee ?? 2),
      packages: packages.map((p) => ({
        id: p.id,
        name: p.name,
        creditAmount: moneyString(p.creditAmount),
        price: moneyString(p.price),
        currency: p.currency,
      })),
    };
  }
}
