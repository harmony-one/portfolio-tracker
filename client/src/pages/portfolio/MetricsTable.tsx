import {PortfolioSnapshot} from "../../types.ts";
import {Box} from "grommet";
import {Table, TableProps} from "antd";
import {useMemo} from "react";
import Decimal from "decimal.js";

interface DataType {
  totalValue: string
  cagrValue: string
  volatility: string
  // maxDrawdown: string
}

const calculateCAGR = (
  start: number,
  end: number,
  periods: number,
) => {
  return (Math.pow((end / start), 1 / periods) - 1) * 100
}

function calculateVolatility(prices: number[]): number {
  if (!prices || prices.length === 0) {
    return 0;
  }

  // Calculate mean
  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;

  // Calculate variance
  const variance = prices.reduce((sum, price) => {
    const diff = price - mean;
    return sum + diff * diff;
  }, 0) / prices.length;

  return Math.sqrt(variance);
}

/**
 * Calculates the maximum drawdown (MDD) for a series of portfolio values.
 * MDD is the largest peak-to-trough percentage decline.
 * @param values Array of portfolio values over time
 * @returns Maximum drawdown as a decimal (e.g., 0.1818 for 18.18%)
 */
function calculateMaxDrawdown(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }

  let peak: number = values[0];
  let maxDrawdown: number = 0;

  for (const value of values) {
    if (value > peak) {
      peak = value;
    }

    const drawdown: number = (peak - value) / peak;

    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
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

      const values = snapshots.map(item => item.data.totalValueUSD)
      const volatility = calculateVolatility(values)
      const maxDrawdown = calculateMaxDrawdown(values)
      return [
        {
          key: lastSnapshot.id,
          totalValue: new Decimal(lastSnapshot.data.totalValueUSD).toDecimalPlaces(2).toString(),
          cagrValue: new Decimal(cagrValue).toSD(3).toString(),
          volatility: `${new Decimal(volatility).toSD(3).toString()}%`,
          maxDrawdown: `${new Decimal(maxDrawdown).mul(100).toSD(3).toString()}%`,
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
