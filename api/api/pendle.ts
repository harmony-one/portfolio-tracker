import axios from "axios";

// https://api-v2.pendle.finance/core/docs#/Dashboard/DashboardController_getUserPositions
const client = axios.create({
  baseURL: "https://api-v2.pendle.finance",
})

interface PositionValue {
  valuation: number,
  balance: string
}

interface LPPositionValue extends PositionValue {
  activeBalance: string
}

export interface PendlePosition {
  marketId: string
  pt: PositionValue
  yt: PositionValue
  lp: LPPositionValue
}

export interface PendlePositionsInfo {
  chainId: number
  totalOpen: number
  totalClosed: number
  totalSy: number
  openPositions: PendlePosition[]
  closedPositions: PendlePosition[]
  syPositions: Array<{ syId: string; balance: string; }>
  updatedAt: string
}

export interface PendleMarket {
  name: string
  address: string
  expiry: string
  pt: string
  yt: string
  sy: string
  underlyingAsset: string
  "details": {
    "liquidity": number,
    "pendleApy": number,
    "impliedApy": number,
    "feeRate": number
    "movement10Percent": {
      "ptMovementUpUsd": number
      "ptMovementDownUsd": number
      "ytMovementUpUsd": number
      "ytMovementDownUsd": number
    },
    "yieldRange": {
      "min": number
      "max": number
    },
    "aggregatedApy": number
    "maxBoostedApy": number
  },
}

export const getPendlePositions = async (walletAddress: string) => {
  const { data } = await client.get<{
    positions: PendlePositionsInfo[];
  }>(`/core/v1/dashboard/positions/database/${walletAddress}?filterUsd=0.1`)
  return data.positions
}

export const getActivePendleMarkets = async (chainId: number) => {
  const { data } = await client.get<{
    markets: PendleMarket[];
  }>(`/core/v1/${chainId}/markets/active`)
  return data.markets
}

export const getInactivePendleMarkets = async (chainId: number) => {
  const { data } = await client.get<{
    markets: PendleMarket[];
  }>(`/core/v1/${chainId}/markets/inactive`)
  return data.markets
}
