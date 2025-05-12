import {Box, Text} from "grommet";
import {useEffect, useState} from "react";
import {PortfolioSnapshot} from "../../types.ts";
import {appConfig} from "../../config.ts";
import {getPortfolioSnapshots} from "../../api";
import {TradingViewChart} from "./chart";
import {MetricsTable} from "./MetricsTable.tsx";
import { ExportOutlined } from '@ant-design/icons'

export const PortfolioPage = () => {
  const [_, setInProgress] = useState(false);
  const [walletAddress] = useState(appConfig.defaultWalletAddress)
  const [portfolioSnapshots, setPortfolioSnapshots] = useState<PortfolioSnapshot[]>([]);

  useEffect(() => {
    loadSnapshots()
  }, []);

  const loadSnapshots = async () => {
    setInProgress(true)
    try {
      const items = await getPortfolioSnapshots({
        walletAddress: walletAddress.toLowerCase(),
        limit: 100
      })
      setPortfolioSnapshots(items)
    } catch (e) {
      console.error('Failed to load snapshots', e)
    }
    setInProgress(false)
  }

  return <Box pad={'16px 32px'}>
    <Box>
      <Text size={'22px'} weight={600}>Portfolio Tracker</Text>
    </Box>
    <Box margin={{ top: '16px' }}>
      <Box gap={'8px'}>
        <Text size={'16px'}>Wallet Address</Text>
        <Box direction={'row'} gap={'16px'} align={'baseline'}>
          <Text size={'18px'}>{walletAddress}</Text>
          <Box direction={'row'} align={'center'} gap={'4px'} onClick={() => {
            window.open(`https://app.merkl.xyz/users/${walletAddress}`, '_blank');
          }}>
            <Text color={'#1677ff'}>
              Merkl
            </Text>
            <ExportOutlined style={{ color: '#1677ff' }} />
          </Box>
        </Box>
      </Box>
    </Box>
    <Box margin={{ top: '16px'}}>
      <MetricsTable snapshots={portfolioSnapshots}/>
    </Box>
    <Box margin={{ top: '32px' }}>
      <Text size={'16px'}>Performance</Text>
      <TradingViewChart height={300} snapshots={portfolioSnapshots} />
    </Box>
  </Box>
}
