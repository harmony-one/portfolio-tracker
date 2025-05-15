import {PortfolioSnapshot} from "../../types.ts";
import {Box} from "grommet";
import {Table, TableProps} from "antd";
import {useMemo} from "react";
import Decimal from "decimal.js";
import {
  calculateCAGR,
  calculateSharpeRatio,
  calculateSortinoRatio,
  calculateUlcerIndex, calculateUlcerPerformanceIndex,
  calculateVolatility
} from "./metrics-helpers.ts";
import {calculateMaxDrawdown} from "../../utils.ts";
import moment from "moment";

interface DataType {
  totalValue: string
  cagrValue: string
  volatility: string
  maxDrawdown: string
  sharpe: string
  sortino: string
  ulcer: string
  upi: string
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
    {
      title: 'Max Drawdown',
      dataIndex: 'maxDrawdown',
      key: 'maxDrawdown',
    },
    {
      title: 'Volatility',
      dataIndex: 'volatility',
      key: 'volatility',
    },
    {
      title: 'Sharpe',
      dataIndex: 'sharpe',
      key: 'sharpe',
    },
    {
      title: 'Sortino',
      dataIndex: 'sortino',
      key: 'sortino',
    },
    {
      title: 'Ulcer index',
      dataIndex: 'ulcer',
      key: 'ulcer',
    },
    {
      title: 'UPI',
      dataIndex: 'upi',
      key: 'upi',
    },
  ];

  const dataSource = useMemo(() => {
    if(snapshots.length > 0) {
      const values = snapshots
        .sort((a, b) => {
          return moment(b.createdAt).unix() - moment(a.createdAt).unix()
        })
        .map(item => item.data.totalValueUSD)

      console.log('Sorted values:', values)

      const firstValueUSD = values[values.length - 1]
      const lastValueUSD = values[0]

      const cagrValue = calculateCAGR(
        firstValueUSD,
        lastValueUSD,
        snapshots.length
      )

      return [
        {
          key: snapshots[0].id,
          totalValue: new Decimal(lastValueUSD).toDecimalPlaces(2).toString(),
          cagrValue: `${new Decimal(cagrValue).toSD(3).toString()}%`,
          volatility: `${new Decimal(calculateVolatility(values))
            .toSD(3).toString()}%`,
          maxDrawdown: `${new Decimal(calculateMaxDrawdown(values))
            .mul(100)
            .toSD(3).toString()}%`,
          sharpe: `${new Decimal(calculateSharpeRatio(values))
            .toSD(3).toString()}`,
          sortino: `${new Decimal(calculateSortinoRatio(values))
            .toSD(3).toString()}`,
          ulcer: `${new Decimal(calculateUlcerIndex(values))
            .toSD(3).toString()}`,
          upi: `${new Decimal(calculateUlcerPerformanceIndex(values))
            .toSD(3).toString()}`,
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
