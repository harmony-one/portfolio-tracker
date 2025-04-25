import {Box} from "grommet";
import {PositionsTable} from "./PositionsTable.tsx";
import {PortfolioSnapshot} from "../../types.ts";

export const WalletPortfolio = (props: {
  walletAddress: string;
  snapshots: PortfolioSnapshot[];
}) => {
  const { snapshots } = props

  return <Box>
    {snapshots.map(item => {
      return <Box key={item.id}>
        <PositionsTable snapshot={item} />
      </Box>
    })}
  </Box>
}
