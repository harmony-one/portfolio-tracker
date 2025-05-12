import {Box, Text} from "grommet";
import {useEffect, useMemo, useState} from "react";
import {PortfolioSnapshot} from "../../types.ts";
import {appConfig} from "../../config.ts";
import {getPortfolioSnapshots} from "../../api";
import {TradingViewChart} from "./chart";
import {MetricsTable} from "./MetricsTable.tsx";
import { ExportOutlined } from '@ant-design/icons'
import {Button} from "antd";
import {arrayToTSV} from "../../utils.ts";
import moment from "moment";

export const PortfolioPage = () => {
  const [_, setInProgress] = useState(false);
  const [walletAddress] = useState(appConfig.defaultWalletAddress)
  const [portfolioSnapshots, setPortfolioSnapshots] = useState<PortfolioSnapshot[]>([]);

  const latestPortfolioItems = useMemo(() => {
    if(portfolioSnapshots.length > 0) {
      if(portfolioSnapshots[0].data.portfolioItems) {
        return portfolioSnapshots[0].data.portfolioItems
      }
    }
    return []
  }, [portfolioSnapshots])

  useEffect(() => {
    loadSnapshots()
  }, []);

  const loadSnapshots = async () => {
    setInProgress(true)
    try {
      const items = await getPortfolioSnapshots({
        walletAddress: walletAddress.toLowerCase(),
        limit: 1000
      })
      setPortfolioSnapshots(items)
      console.log('Loaded snapshots: ', items)
    } catch (e) {
      console.error('Failed to load snapshots', e)
    }
    setInProgress(false)
  }

  const onExportClicked = () => {
    try {
      console.log('Export items:', latestPortfolioItems)
      const tsvContent = arrayToTSV(latestPortfolioItems)
      const blob = new Blob([tsvContent], { type: "text/tab-separated-values" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const currentDate = moment().format('YYYY-MM-DD_HH-mm')
      link.download = `${currentDate}-portfolio-${walletAddress}.tsv`
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export', e)
    }
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
      <Box width={'200px'} margin={{ top: '16px' }}>
        <Button
          type={'primary'}
          disabled={latestPortfolioItems.length === 0}
          onClick={() => {
            onExportClicked()
          }}
        >Download TSV</Button>
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
