// backend/src/modules/schools/schools.controller.ts
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { AuthService } from '../auth/auth.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { SetPriceOverrideDto } from './dto/set-price-override.dto';
import { CreateSignupRequestDto } from './dto/create-signup-request.dto';
import { SignupRequestStatus } from '@prisma/client';
import { Public, Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('schools')
export class SchoolsController {
  constructor(
    private readonly schoolsService: SchoolsService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Get()
  listAll() {
    return this.schoolsService.listAll();
  }

  @Public()
  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.schoolsService.findBySlug(slug);
  }

  @Public()
  @Post('signup-requests')
  requestSignup(@Body() body: CreateSignupRequestDto) {
    return this.schoolsService.createSignupRequest(body);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Get('signup-requests')
  listSignupRequests(@Query('status') status?: SignupRequestStatus) {
    return this.schoolsService.listSignupRequests(status);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post('signup-requests/:id/approve')
  approveSignupRequest(@Param('id') id: string) {
    return this.schoolsService.approveSignupRequest(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post('signup-requests/:id/reject')
  rejectSignupRequest(@Param('id') id: string) {
    return this.schoolsService.rejectSignupRequest(id);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post()
  async create(@Body() body: CreateSchoolDto) {
    const school = await this.schoolsService.create({
      slug: body.slug,
      name: body.name,
      code: body.code,
      logoUrl: body.logoUrl,
      adminEmail: body.adminEmail,
      adminName: body.adminName,
    });

    // Create the admin's login-capable account now that the school (and
    // its FK target) exists. Reuses AuthService.createUser, which already
    // sends its own "your account is ready" email — so the admin gets two
    // emails on first onboarding (welcome + account-created), which is
    // intentional: one confirms the school, the other confirms their
    // personal login.
    await this.authService.createUser(body.adminEmail, body.adminPassword, body.adminName, Role.SCHOOL_ADMIN, school.id);

    return school;
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch(':slug/price-override')
  setPriceOverride(@Param('slug') slug: string, @Body() body: SetPriceOverrideDto) {
    return this.schoolsService.setPriceOverride(slug, body.pricePerStudentKobo);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch(':slug/suspend')
  suspend(@Param('slug') slug: string) {
    return this.schoolsService.suspend(slug);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch(':slug/reactivate')
  reactivate(@Param('slug') slug: string) {
    return this.schoolsService.reactivate(slug);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch(':slug/features/session-wrap')
  setSessionWrapEnabled(@Param('slug') slug: string, @Body() body: { enabled: boolean }) {
    return this.schoolsService.setSessionWrapEnabled(slug, body.enabled);
  }
}