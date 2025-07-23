import {getActivePendleMarkets, getInactivePendleMarkets, getPendlePositions, PendleMarket} from "../../api/pendle";
import {getBeefyInfo} from "../beefy";
import {getEulerInfo} from "../euler";
import {getMagpieInfo} from "../magpie";
import {getMerklRewards, MerklRewards} from "../../api/euler-api";
import Decimal from "decimal.js";

const calculateCAGR = (
  start: number,
  end: number,
  periods: number,
) => {
  return (Math.pow((end / start), 1 / periods) - 1) * 100
}

export interface PortfolioMetric {
  platform: string
  name: string
  value: number
  link: string
}

const SONIC_CHAIN_ID = 146

export const getPortfolioMetrics = async (
  walletAddress: string
) => {
  const pendlePortfolioItems: PortfolioMetric[] = []

  let allPendleMarkets: PendleMarket[] = []

  try {
    const activePendleMarkets = await getActivePendleMarkets(SONIC_CHAIN_ID)
    const inactivePendleMarkets = await getInactivePendleMarkets(SONIC_CHAIN_ID)
    allPendleMarkets = [...activePendleMarkets, ...inactivePendleMarkets]
  } catch (e) {
    console.error('Error fetching Pendle markets:', e)
    allPendleMarkets = []
  }

  const pendlePositions = await getPendlePositions(walletAddress)

  const sonicPositionsInfos = pendlePositions.filter(item => item.chainId === 146)

  if(sonicPositionsInfos.length > 0) {
    for(const sonicPositionsInfo of sonicPositionsInfos) {
      const { openPositions } = sonicPositionsInfo
      for (const openPosition of openPositions) {
        const { marketId: marketIdRaw, lp, pt } = openPosition
        const [_, marketId] = marketIdRaw.split('-') // "marketIdRaw":"146-0xacfad541698437f6ef0e728c56a50ce35c73cc3e"

        const marketName = allPendleMarkets.find(market => market.address === marketId)?.name || 'N/A'

        if(lp.valuation > 0) {
          pendlePortfolioItems.push({
            platform: 'Pendle',
            name: `LP ${marketName}`,
            value: lp.valuation,
            link: `https://app.pendle.finance/trade/pools/${marketId}/zap/in?chain=sonic`
          })
        }

        if(pt.valuation > 0) {
          pendlePortfolioItems.push({
            platform: 'Pendle',
            name: `PT ${marketName}`,
            value: pt.valuation,
            link: `https://app.pendle.finance/trade/markets/${marketId}/swap?view=pt&chain=sonic`
          })
        }
      }
    }
  }

  const beefyItems = await getBeefyInfo(walletAddress);
  const eulerItems = await getEulerInfo(walletAddress);
  const magpieItems = await getMagpieInfo(walletAddress);
  const portfolioItems = [...beefyItems, ...eulerItems, ...magpieItems]

  const beefyValue = beefyItems.reduce((acc, item) =>
    acc + Number(item.depositValue) + Number(item.rewardValue), 0)
  const magpieValue = magpieItems.reduce((acc, item) => {
    return acc + Number(item.depositValue) + Number(item.rewardValue)
  }, 0)
  const eulerMEVUSDCeValue = eulerItems
    .filter(item => {
      return item.address === '0x196F3C7443E940911EE2Bb88e019Fd71400349D9'
    })
    .reduce((acc, item) => acc + Number(item.depositValue) + Number(item.rewardValue), 0)

  const eulerRe7Value = eulerItems
    .filter(item => {
      return item.address === '0x3D9e5462A940684073EED7e4a13d19AE0Dcd13bc'
    })
    .reduce((acc, item) => acc + Number(item.depositValue) + Number(item.rewardValue), 0)


  let merklRewards: MerklRewards[] = []
  try {
    merklRewards = await getMerklRewards(walletAddress)
  } catch (error) {
    console.error('Error fetching Merkl rewards:', error)
    merklRewards = []
  }

  const merklValue = merklRewards.reduce((acc, item) => {
    const { reward, accumulated, tokenPrice } = item
    const rewardDecimals = reward.decimals;
    const amount = new Decimal(accumulated)
      .div(10 ** rewardDecimals)
      .toNumber();
    const rewardValueUSD = amount * tokenPrice
    return acc + rewardValueUSD
  }, 0)

  const items = [
    ...pendlePortfolioItems,
    {
      platform: 'Beefy',
      name: 'frxUSD-scUSD',
      value: beefyValue,
      link: 'https://app.beefy.com/vault/swapx-ichi-frxusd-scusd'
    },
    {
      platform: 'Euler',
      name: 'MEV USDC.e',
      value: eulerMEVUSDCeValue,
      link: 'https://app.euler.finance/vault/0x196F3C7443E940911EE2Bb88e019Fd71400349D9?network=sonic'
    },
    {
      platform: 'Euler',
      name: 'Re7 USDC.e',
      value: eulerRe7Value,
      link: 'https://app.euler.finance/vault/0x3D9e5462A940684073EED7e4a13d19AE0Dcd13bc?network=sonic'
    },
    {
      platform: 'Magpie',
      name: 'Aave aUSDC',
      value: magpieValue,
      link: 'https://www.pendle.magpiexyz.io/stake/0x3F5EA53d1160177445B1898afbB16da111182418'
    },
    {
      platform: 'Merkl',
      name: 'Rewards',
      value: merklValue,
      link: `https://app.merkl.xyz/users/${walletAddress}`
    }
  ]

  const totalValueUSD = items.reduce((acc, item) =>
    acc + item.value, 0)

  return {
    totalValueUSD,
    items,
    portfolioItems
  }
}
