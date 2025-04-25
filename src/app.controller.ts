import {Controller, Get, Query, UsePipes, ValidationPipe} from '@nestjs/common';
import { AppService } from './app.service';
import {GetPortfolioSnapshotsDto} from "./dto/portfolio.dto";
import {CacheTTL} from "@nestjs/common/cache";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @CacheTTL(1000)
  @Get('/portfolioSnapshots')
  @UsePipes(new ValidationPipe({ transform: true }))
  getPortfolioSnapshots(@Query() dto: GetPortfolioSnapshotsDto) {
    return this.appService.getPortfolioSnapshots(dto);
  }
}
