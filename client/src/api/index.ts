import axios from 'axios'
import {PortfolioSnapshot} from "../types.ts";

const client = axios.create({
  baseURL: 'https://portfolio-tracker-api.fly.dev'
})

export const getPortfolioSnapshots = async (params: {
  walletAddress: string
  limit?: number
}) => {
  const { data } = await client.get<PortfolioSnapshot[]>(`/portfolioSnapshots`, {
    params: {
      walletAddress: params.walletAddress,
      limit: params.limit || 100
    }
  })
  return data
}
