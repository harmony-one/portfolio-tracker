import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {PortfolioSnapshotData} from "../../types";

@Entity({ name: 'portfolio_snapshots' })
export class PortfolioSnapshotEntity {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  version: string;

  @ApiProperty()
  @Column()
  walletAddress: string;

  @Column({ type: 'json' })
  data: PortfolioSnapshotData;

  @ApiProperty()
  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
