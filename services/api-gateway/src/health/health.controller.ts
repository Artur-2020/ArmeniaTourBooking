import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private healthCheckService: HealthCheckService) {}

  @Get('/')
  @HealthCheck()
  async check() {
    return this.healthCheckService.check([
      async () => ({
        api_gateway: {
          status: 'up',
          timestamp: new Date().toISOString(),
        },
      }),
    ]);
  }
}
