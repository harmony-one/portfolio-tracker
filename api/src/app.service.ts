import {Injectable, Logger} from '@nestjs/common';
import {Cron, CronExpression, SchedulerRegistry} from "@nestjs/schedule";
import {ConfigService} from "@nestjs/config";
import {DataSource} from "typeorm";
import {PortfolioSnapshotEntity} from "./entities/portfolio.snapshot.entity";
import {GetPortfolioSnapshotsDto} from "./dto/portfolio.dto";
import {getPortfolioMetrics} from "../providers/metrics";
import { FindOptionsWhere, MoreThan } from "typeorm"


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
      await this.savePortfolioSnapshot()
    }
  }

  // private async getWalletPortfolios(walletAddress: string) {
  //   const items: PortfolioItem[] = []
  //
  //   const dataProviders = [
  //     getShadowInfo,
  //     getSwapXInfo,
  //     getMagpieInfo,
  //     getSiloInfo,
  //     getEulerInfo,
  //     getBeefyInfo
  //   ]
  //
  //   for(let i = 0; i < dataProviders.length; i++) {
  //     const fetchData = dataProviders[i]
  //     try {
  //       const data = await fetchData(walletAddress) as PortfolioItem[]
  //       items.push(...data)
  //       this.logger.log(`[provider ${i + 1} / ${dataProviders.length}] portfolio items=${data.length}`)
  //     } catch (e) {
  //       console.error('Failed to fetch data', i, e.message)
  //     }
  //   }
  //
  //   return items
  // }

  private async savePortfolioSnapshot() {
    const wallets = this.configService.get<string[]>('WALLET_ADDRESSES')
    for(const walletAddress of wallets) {
      this.logger.log(`Started updating wallet=${walletAddress}...`)

      try {
        const data = await getPortfolioMetrics(walletAddress)
        const snapshotEntity = this.dataSource.manager.create(PortfolioSnapshotEntity, {
          version: '1.0.0',
          walletAddress: walletAddress.toLowerCase(),
          data,
        })
        await this.dataSource.manager.save(PortfolioSnapshotEntity, snapshotEntity);
        this.logger.log(`Saved new snapshot: wallet=${
          walletAddress
        }, total=${
          data.totalValueUSD
        }, portfolio=${
          data.items.map(item => {
            return `[${item.platform} ${item.name}]=${item.value}`
          }).join(', ')
        }`)
      } catch (e) {
        this.logger.error('Failed to update wallet:', e)
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR, {
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
    const where: FindOptionsWhere<PortfolioSnapshotEntity> = {}

    if(dto.walletAddress) {
      where.walletAddress = dto.walletAddress
    }

    if(dto.timestampFrom) {
      where.createdAt = MoreThan(new Date(dto.timestampFrom));
    }

    return await this.dataSource.manager.find(PortfolioSnapshotEntity, {
      where,
      take: dto.limit || 1000,
      skip: dto.offset || 0,
      order: {
        createdAt: 'desc'
      }
    })
  }
}
