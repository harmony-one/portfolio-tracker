import {PortfolioSnapshot} from "../../types.ts";
import {Box} from "grommet";
import {Card, Statistic, Table, TableProps, Typography} from "antd";
import moment from 'moment'
import {useMemo} from "react";
import Link from "antd/es/typography/Link";

interface DataType {
  name: string
  rewardUsd: string
  link: string
}

export const PositionsTable = (props: {
  snapshot: PortfolioSnapshot
}) => {
  const { snapshot } = props
  const { createdAt } = snapshot

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
      title: 'Link',
      dataIndex: 'link',
      key: 'link',
      render: (value) => {
        return <Link href={value} target={`_blank`}>Open</Link>
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

  return <Box>
    <Box direction={'row'} gap={'32px'}>
      <Card variant="borderless">
        <Statistic
          title="Total Rewards (USD)"
          value={totalRewardsUsd}
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
          title="Last Updated"
          value={moment(createdAt).format('YYYY MMM DD, HH:mm')}
          valueRender={(value) => {
            return <Typography.Text style={{ fontSize: '16px' }}>{value}</Typography.Text>
          }}
        />
      </Card>
    </Box>
    <Box margin={{ top: '32px' }} style={{ maxWidth: '1000px' }}>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
      />
    </Box>
  </Box>
}
