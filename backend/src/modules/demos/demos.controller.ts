// backend/src/modules/demos/demos.controller.ts
import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/roles.decorator';
import { DemosService } from './demos.service';
import { RequestDemoDto } from './demos.dto';

@Controller('demos')
export class DemosController {
  constructor(private readonly demos: DemosService) {}

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @HttpCode(200)
  @Post()
  request(@Body() dto: RequestDemoDto) {
    return this.demos.request(dto);
  }
}
