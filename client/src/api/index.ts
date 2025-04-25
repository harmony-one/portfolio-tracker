import axios from 'axios'
import {PortfolioSnapshot} from "../types.ts";

const client = axios.create({
  baseURL: 'https://portfolio-tracker-api.fly.dev'
})

export const getPortfolioSnapshots = async (walletAddress: string) => {
  const { data } = await client.get<PortfolioSnapshot[]>(`/portfolioSnapshots`, {
    params: {
      // walletAddress
      limit: 1
    }
  })
  return data
}
