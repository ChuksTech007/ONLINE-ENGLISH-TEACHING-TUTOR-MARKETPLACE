import { Body, Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private config: ConfigService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.register(dto);
    this.setCookie(res, result.token);
    return { user: result.user };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(dto);
    this.setCookie(res, result.token);
    return { user: result.user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    const cookie = this.cookieOptions();
    res.clearCookie(this.auth.cookieName(), {
      httpOnly: cookie.httpOnly,
      sameSite: cookie.sameSite,
      secure: cookie.secure,
      path: cookie.path,
    });
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: { id: string }) {
    return this.auth.me(user.id);
  }

  @Get('verify')
  verify(@Query('token') token: string) {
    return this.auth.verifyEmail(token);
  }

  private cookieOptions() {
    const secure = this.config.get('COOKIE_SECURE') === 'true';
    return {
      httpOnly: true as const,
      // Vercel (frontend) and Render (API) are different sites, so the
      // login cookie must be SameSite=None; Secure. Localhost stays Lax.
      sameSite: (secure ? 'none' : 'lax') as 'none' | 'lax',
      secure,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    };
  }

  private setCookie(res: Response, token: string) {
    res.cookie(this.auth.cookieName(), token, this.cookieOptions());
  }
}
