import {PortfolioSnapshot} from "../../types.ts";
import {Box} from "grommet";
import {Button, Card, Statistic, Table, TableProps, Typography} from "antd";
import moment from 'moment'
import {useMemo} from "react";
import { arrayToTSV } from '../../utils.ts'
import { roundToSignificantDigits } from '../../helpers.ts'

interface DataType {
  name: string
  rewardUsd: string
  link: string
}

export const PositionsTable = (props: {
  snapshot: PortfolioSnapshot
}) => {
  const { snapshot } = props
  const { walletAddress, createdAt } = snapshot

  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Reward (USD)',
      dataIndex: 'rewardUsd',
      key: 'rewardUsd',
      render: (value) => {
        return <Typography.Text copyable={true}>{value}</Typography.Text>
      }
    },
    {
      title: 'Deposit Link',
      dataIndex: 'link',
      key: 'link',
      render: (value) => {
        return <Typography.Link href={value} target={`_blank`}>Open</Typography.Link>
      }
    },
  ];

  const dataSource = snapshot.data.map((item, index) => {
    return {
      key: index,
      name: item.name,
      rewardUsd: item.rewardValue,
      link: item.depositLink
    }
  })

  const totalRewardsUsd = useMemo(() => {
    return snapshot.data.reduce((acc, item) => {
      return acc + Number(item.rewardValue)
    }, 0)
  }, [snapshot])

  const onExportClicked = () => {
    try {
      const tsvContent = arrayToTSV(snapshot.data)
      const blob = new Blob([tsvContent], { type: "text/tab-separated-values" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `portfolio-${walletAddress}-${Math.round(Date.now() / 1000)}.tsv`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export', e)
    }
  }

  return <Box>
    <Box direction={'row'} gap={'32px'}>
      <Card variant="borderless">
        <Statistic
          title="Total Rewards (USD)"
          value={roundToSignificantDigits(String(totalRewardsUsd), 6)}
          valueRender={(value) => {
            return <Typography.Text
              copyable={true}
              style={{ fontSize: '20px' }}
            >
              {value}
            </Typography.Text>
          }}
        />
      </Card>
      <Card variant="borderless">
        <Statistic
          title="Snapshot Date"
          value={moment(createdAt).format('YYYY MMM DD, HH:mm')}
          valueRender={(value) => {
            return <Typography.Text style={{ fontSize: '16px' }}>{value}</Typography.Text>
          }}
        />
      </Card>
    </Box>
    <Box margin={{ top: '16px' }} style={{ maxWidth: '1000px' }}>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
      />
    </Box>
    <Box margin={{ top: '32px' }} width={'200px'}>
      <Button
        type={'primary'}
        onClick={onExportClicked}
      >
        Save to TSV
      </Button>
    </Box>
  </Box>
}
