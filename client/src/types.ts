import {UTCTimestamp} from "lightweight-charts";

export interface PortfolioItem {
  name: string
  address: string
  depositTime: string
  depositAsset0: string
  depositAsset1: string
  depositAmount0: string
  depositAmount1: string
  depositValue0: string
  depositValue1: string
  depositValue: string
  rewardAsset0: string
  rewardAsset1: string
  rewardAmount0: string
  rewardAmount1: string
  rewardValue0: string
  rewardValue1: string
  rewardValue: string
  totalDays: string
  totalBlocks: string
  apr: string
  type: string
  depositLink: string
}

export interface PortfolioSnapshotItem {
  platform: string
  name: string
  value: number
}

export interface PortfolioSnapshotData {
  totalValueUSD: number
  items: Array<PortfolioSnapshotItem>
  portfolioItems: PortfolioItem[]
}

export interface PortfolioSnapshot {
  id: string
  version: string
  walletAddress: string
  data: PortfolioSnapshotData
  createdAt: string
}

export interface PositionReward {
  asset: string
  amount: string
  value: string
}

export interface TradingViewItem {
  time: UTCTimestamp
  value: number
  items: PortfolioSnapshotItem[]
}
