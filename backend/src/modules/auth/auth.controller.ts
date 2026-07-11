// backend/src/modules/auth/auth.controller.ts
import { Body, Controller, ForbiddenException, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Public, Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/types/auth.types';
import { Role } from '@prisma/client';

const RESET_URL_BASE = process.env.FRONTEND_RESET_PASSWORD_URL ?? 'https://app.elorgeschools.com/reset-password';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    await this.authService.requestPasswordReset(body.email, RESET_URL_BASE);
    // Same response whether or not the email exists — see AuthService docstring.
    return { message: 'If that email is registered, a reset link has been sent.' };
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    await this.authService.resetPasswordWithToken(body.token, body.newPassword);
    return { message: 'Password updated. You can now log in with your new password.' };
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @Post('users')
  createUser(@Body() body: CreateUserDto, @CurrentUser() caller: AuthenticatedUser) {
    if (caller.role === Role.SCHOOL_ADMIN) {
      if (!caller.schoolId) {
        throw new ForbiddenException('School Admin account has no associated school');
      }
      return this.authService.createUser(body.email, body.password, body.fullName, Role.STAFF, caller.schoolId);
    }

    const isPlatformRole = body.role === Role.SUPER_ADMIN || body.role === Role.FINANCE_OPS;
    if (isPlatformRole && body.schoolId) {
      throw new ForbiddenException(`${body.role} accounts are platform-wide and cannot be scoped to a school`);
    }
    if (!isPlatformRole && !body.schoolId) {
      throw new ForbiddenException(`${body.role} accounts must be scoped to a school`);
    }

    return this.authService.createUser(body.email, body.password, body.fullName, body.role, body.schoolId);
  }
}