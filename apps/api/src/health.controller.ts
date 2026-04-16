import { Controller, Get } from '@nestjs/common';
import { Public } from './common/public.decorator.js';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  health(): { ok: true; service: string; sprint: number } {
    return { ok: true, service: 'ico-api', sprint: 1 };
  }
}
