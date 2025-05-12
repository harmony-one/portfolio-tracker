import {getPendlePositions} from "../../api/pendle";
import {getBeefyInfo} from "../beefy";
import {getEulerInfo} from "../euler";
import {getMagpieInfo} from "../magpie";
import {getMerklRewards} from "../../api/euler-api";
import Decimal from "decimal.js";

const calculateCAGR = (
  start: number,
  end: number,
  periods: number,
) => {
  return (Math.pow((end / start), 1 / periods) - 1) * 100
}

export const getPortfolioMetrics = async (
  walletAddress: string
) => {
  let pendleLPValue = 0
  let pendlePTValue = 0
  const pendlePositions = await getPendlePositions(walletAddress)
  const sonicPositions = pendlePositions.find(item => item.chainId === 146)
  if(sonicPositions) {
    const openPositions = sonicPositions.openPositions
    pendleLPValue = openPositions.reduce((acc, cur) => acc + cur.lp.valuation, 0)
    pendlePTValue = openPositions.reduce((acc, cur) => acc + cur.pt.valuation, 0)
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

  const merklRewards = await getMerklRewards(walletAddress)
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
    {
      platform: 'Pendle',
      name: 'PT USDC (Silo-20)',
      value: pendlePTValue
    },
    {
      platform: 'Pendle',
      name: 'LP aUSDC',
      value: pendleLPValue
    },
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
