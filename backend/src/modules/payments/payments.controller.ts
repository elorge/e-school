// backend/src/modules/payments/payments.controller.ts
import { Body, Controller, Headers, Post, Req, HttpCode, Logger, BadRequestException, UseGuards } from '@nestjs/common';
import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { Public, Roles } from '../../common/decorators/roles.decorator';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Role } from '@prisma/client';
import { PaymentsService } from './payments.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';

@Controller('webhooks/payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(TenantGuard, RolesGuard)
  @Roles(Role.SCHOOL_ADMIN)
  @Post(':school/payments/initialize')
  initialize(@Req() req: Request, @Body() body: InitializePaymentDto) {
    return this.paymentsService.initialize(req.schoolId!, body.amountKobo, body.provider, body.payerEmail);
  }

  @Public()
  @Post('paystack')
  @HttpCode(200)
  async paystack(@Req() req: RawBodyRequest<Request>, @Headers('x-paystack-signature') signature: string) {
    if (!req.rawBody) throw new BadRequestException('Missing raw body');
    const valid = this.paymentsService.verifyPaystackSignature(req.rawBody, signature);
    if (!valid) {
      this.logger.warn('Rejected Paystack webhook — signature mismatch');
      return { received: true }; // 200 anyway; never leak *why* it failed
    }
    await this.paymentsService.handlePaystackEvent(JSON.parse(req.rawBody.toString('utf8')));
    return { received: true };
  }

  @Public()
  @Post('flutterwave')
  @HttpCode(200)
  async flutterwave(@Req() req: RawBodyRequest<Request>, @Headers('verif-hash') verifHash: string) {
    if (!req.rawBody) throw new BadRequestException('Missing raw body');
    const valid = this.paymentsService.verifyFlutterwaveSignature(verifHash);
    if (!valid) {
      this.logger.warn('Rejected Flutterwave webhook — hash mismatch');
      return { received: true };
    }
    await this.paymentsService.handleFlutterwaveEvent(JSON.parse(req.rawBody.toString('utf8')));
    return { received: true };
  }
}