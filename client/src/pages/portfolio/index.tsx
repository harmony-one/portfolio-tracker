import {Box, Text} from "grommet";
import {useEffect, useState} from "react";
import {PortfolioSnapshot} from "../../types.ts";
import {appConfig} from "../../config.ts";
import {getPortfolioSnapshots} from "../../api";
import {WalletPortfolio} from "./WalletPortfolio.tsx";
import {TradingViewChart} from "./chart";

export const PortfolioPage = () => {
  const [_, setInProgress] = useState(false);
  // const [status, setStatus] = useState<string>('');
  const [walletAddress] = useState(appConfig.defaultWalletAddress)
  const [portfolioSnapshots, setPortfolioSnapshots] = useState<PortfolioSnapshot[]>([]);

  useEffect(() => {
    loadSnapshots()
  }, []);

  const loadSnapshots = async () => {
    setInProgress(true)
    try {
      const items = await getPortfolioSnapshots({
        walletAddress,
        limit: 10
      })
      console.log('items', items)
      setPortfolioSnapshots(items)
    } catch (e) {
      console.error('Failed to load snapshots', e)
    }
    setInProgress(false)
  }

  // const onGetRewardsClick = async () => {
  //   return loadSnapshots()
  // }

  return <Box pad={'16px 32px'}>
    <Box>
      <Text size={'22px'} weight={600}>Portfolio Tracker</Text>
    </Box>
    <Box margin={{ top: '16px' }}>
      <Box gap={'8px'} width={'500px'}>
        <Text>Wallet Address</Text>
        <Text size={'18px'}>{walletAddress}</Text>
        {/*<Input*/}
        {/*  placeholder={'0x...'}*/}
        {/*  size={'large'}*/}
        {/*  value={walletAddress}*/}
        {/*  onChange={(e) => setWalletAddress(e.target.value)}*/}
        {/*/>*/}
      </Box>
      {/*<Box margin={{ top: '32px' }} width={'200px'}>*/}
      {/*  <Button*/}
      {/*    type={'primary'}*/}
      {/*    disabled={inProgress}*/}
      {/*    loading={inProgress}*/}
      {/*    onClick={onGetRewardsClick}>*/}
      {/*    Get Rewards*/}
      {/*  </Button>*/}
      {/*</Box>*/}
      {/*<Box margin={{ top: '32px' }}>*/}
      {/*  <Text>{status}</Text>*/}
      {/*</Box>*/}
    </Box>
    <Box>
      <TradingViewChart height={300} snapshots={portfolioSnapshots} />
    </Box>
    <Box margin={{ top: '16px' }}>
      <Text size={'14px'}>Position Snapshots</Text>
      <WalletPortfolio
        walletAddress={walletAddress}
        snapshots={portfolioSnapshots}
      />
    </Box>
  </Box>
}
