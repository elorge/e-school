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

  // ── STATIC routes FIRST, always — anything with a fixed path segment
  // (search, signup-requests, etc.) MUST be declared before ':slug'
  // below, or Express will match ':slug' first and swallow the request
  // (e.g. "/schools/search" gets treated as slug="search"). This is
  // exactly the bug that made school search silently fail. Keep every
  // new static route in this block, above :slug, permanently.

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Get()
  listAll() {
    return this.schoolsService.listAll();
  }

  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.FINANCE_OPS)
  @Get('search')
  search(@Query('q') q: string) {
    return this.schoolsService.search(q);
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

    await this.authService.createUser(body.adminEmail, body.adminPassword, body.adminName, Role.SCHOOL_ADMIN, school.id);

    return school;
  }

  // ── :slug-scoped routes — must come AFTER every static route above.
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

  // ── THIS MUST BE THE LAST ROUTE IN THE CLASS. ':slug' matches any
  // single path segment, so anything declared below it would never be
  // reachable — and anything ABOVE it that shares a literal name (like
  // "search") would get swallowed BY it if it were declared first.
  @Public()
  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.schoolsService.findBySlug(slug);
  }
}