import {PortfolioSnapshot} from "../../types.ts";
import {Box} from "grommet";
import {Table, TableProps} from "antd";
import {useMemo} from "react";

interface DataType {
  totalValue: string
  cagrValue: string
}

const calculateCAGR = (
  start: number,
  end: number,
  periods: number,
) => {
  return (Math.pow((end / start), 1 / periods) - 1) * 100
}

export const MetricsTable = (props: {
  snapshots: PortfolioSnapshot[]
}) => {
  const { snapshots } = props

  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'Total Value',
      dataIndex: 'totalValue',
      key: 'totalValue',
    },
    {
      title: 'CAGR',
      dataIndex: 'cagrValue',
      key: 'cagrValue',
    },
  ];

  const dataSource = useMemo(() => {
    if(snapshots.length > 0) {
      const firstSnapshot = snapshots[snapshots.length - 1];
      const lastSnapshot = snapshots[0]

      const cagrValue = calculateCAGR(
        firstSnapshot.data.totalValueUSD,
        lastSnapshot.data.totalValueUSD,
        snapshots.length
      )

      return [
        {
          key: lastSnapshot.id,
          totalValue: lastSnapshot.data.totalValueUSD.toString(),
          cagrValue: cagrValue.toString(),
        },
      ]
    }
    return []
  }, [snapshots])

  return <Box>
    <Box margin={{ top: '16px' }} style={{ maxWidth: '1000px' }}>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
      />
    </Box>
  </Box>
}
