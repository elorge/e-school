// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './common/services/audit.module';
import { AuditLogModule } from './modules/audit/audit.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { StudentsModule } from './modules/students/students.module';
import { IdCardsModule } from './modules/id-cards/id-cards.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ClassesModule } from './modules/classes/classes.module';
import { ResultsModule } from './modules/results/results.module';
import { PinsModule } from './modules/pins/pins.module';
import { ReportsModule } from './modules/reports/reports.module';
import { EmailModule } from './modules/email/email.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { TermsModule } from './modules/terms/terms.module';
import { InsightsModule } from './modules/insights/insights.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { CbtModule } from './modules/cbt/cbt.module';
import { FeesModule } from './modules/fees/fees.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { AccountingModule } from './modules/accounting/accounting.module';
import { LessonNotesModule } from './modules/lesson-notes/lesson-notes.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PlatformFinanceModule } from './modules/platform-finance/platform-finance.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { AssessmentModule } from './modules/assessment/assessment.module';
import { HealthModule } from './modules/health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { envValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envValidationSchema }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    PrismaModule,
    AuditModule,
    AuditLogModule,
    HealthModule,
    EmailModule,
    AuthModule,
    UsersModule,
    SchoolsModule,
    ClassesModule,
    StudentsModule,
    ResultsModule,
    PinsModule,
    WalletModule,
    IdCardsModule,
    ReportsModule,
    PaymentsModule,
    CalendarModule,
    TermsModule,
    InsightsModule,
    UploadsModule,
    CbtModule,
    FeesModule,
    InventoryModule,
    AccountingModule,
    LessonNotesModule,
    NotificationsModule,
    PlatformFinanceModule,
    SubjectsModule,
    AssessmentModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}