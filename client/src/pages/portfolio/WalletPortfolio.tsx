import {PositionsTable} from "./PositionsTable.tsx";
import {PortfolioSnapshot} from "../../types.ts";
import {Tabs, TabsProps} from "antd";
import moment from "moment";

export const WalletPortfolio = (props: {
  walletAddress: string;
  snapshots: PortfolioSnapshot[];
}) => {
  const { snapshots } = props

  const items: TabsProps['items'] = snapshots.map((item) => {
    return {
      key: item.id,
      label: moment(item.createdAt).format("HH:mm"),
      children: <PositionsTable snapshot={item} />
    }
  })

  return <Tabs
    defaultActiveKey="1"
    items={items}
  />

  // return <Box>
  //   {snapshots.map(item => {
  //     return <Box key={item.id}>
  //       <PositionsTable snapshot={item} />
  //     </Box>
  //   })}
  // </Box>
}
