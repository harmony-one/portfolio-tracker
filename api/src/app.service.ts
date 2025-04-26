import {Injectable, Logger} from '@nestjs/common';
import {Cron, CronExpression, SchedulerRegistry} from "@nestjs/schedule";
import {ConfigService} from "@nestjs/config";
import {PortfolioItem} from "../types";
import {DataSource} from "typeorm";
import {PortfolioSnapshotEntity} from "./entities/portfolio.snapshot.entity";
import {GetPortfolioSnapshotsDto} from "./dto/portfolio.dto";
import { getShadowInfo } from '../providers/shadow'
import { getSwapXInfo } from '../providers/swapx'
import { getMagpieInfo } from '../providers/magpie'
import { getSiloInfo } from '../providers/silo'
import { getEulerInfo } from '../providers/euler'
import { getSpectraInfo } from '../providers/spectra'

const cronJobName = 'update_job'

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private dataSource: DataSource,
  ) {}

  async bootstrap() {
    if(this.configService.get<boolean>('CLEAN_STATE')) {
      this.logger.log('Start CLEAN_STATE...')
      const { affected: snapshots } = await this.dataSource.manager.delete(PortfolioSnapshotEntity, {})
      this.logger.log(`DB CLEANED, deleted entries: snapshots=${snapshots}`)
    }

    const snapshots = await this.getPortfolioSnapshots({})
    if(snapshots.length === 0) {
      this.savePortfolioSnapshot()
    }
  }

  private async getWalletPortfolios(walletAddress: string) {
    const items: PortfolioItem[] = []

    const dataProviders = [
      getShadowInfo,
      getSwapXInfo,
      getMagpieInfo,
      getSiloInfo,
      getEulerInfo,
      getSpectraInfo
    ]

    for(let i = 0; i < dataProviders.length; i++) {
      const fetchData = dataProviders[i]
      try {
        const data = await fetchData(walletAddress) as PortfolioItem[]
        items.push(...data)
        this.logger.log(`[provider ${i + 1} / ${dataProviders.length}] portfolio items=${data.length}`)
      } catch (e) {
        console.error('Failed to fetch data', i, e.message)
      }
    }

    return items
  }

  private async savePortfolioSnapshot() {
    const wallets = this.configService.get<string[]>('WALLET_ADDRESSES')
    for(const walletAddress of wallets) {
      this.logger.log(`Started updating wallet=${walletAddress}...`)
      const portfolioItems = await this.getWalletPortfolios(walletAddress)
      const snapshotEntity = this.dataSource.manager.create(PortfolioSnapshotEntity, {
        version: '1.0.0',
        walletAddress: walletAddress.toLowerCase(),
        data: portfolioItems,
      })
      await this.dataSource.manager.save(PortfolioSnapshotEntity, snapshotEntity);
      this.logger.log(`Saved new snapshot: wallet=${walletAddress}, portfolio items=${portfolioItems.length}`)
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: cronJobName
  })
  async portfolioSnapshotJob() {
    const job = this.schedulerRegistry.getCronJob(cronJobName)
    await job.stop();

    try {
      await this.savePortfolioSnapshot()
    } catch (e) {
      this.logger.error('Failed to update wallet portfolio', e)
    }

    job.start()
  }

  public async getPortfolioSnapshots(dto: GetPortfolioSnapshotsDto) {
    return await this.dataSource.manager.find(PortfolioSnapshotEntity, {
      where: {
        walletAddress: dto.walletAddress
      },
      take: dto.limit || 1000,
      skip: dto.offset || 0,
      order: {
        createdAt: 'desc'
      }
    })
  }
}
