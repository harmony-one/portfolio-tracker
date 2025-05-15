export const calculateCAGR = (
  portfolioValues: number[],
  days: number
) => {
  if (portfolioValues.length < 2) {
    return 0
  }
  if (days <= 0) {
    return 0
  }
  const endingValue: number = portfolioValues[0]; // Newest value
  const startingValue: number = portfolioValues[portfolioValues.length - 1]; // Oldest value
  const years: number = days / 365; // Convert days to years

  return Math.pow(endingValue / startingValue, 1 / years) - 1;
}

export const calculateVolatility = (prices: number[]) => {
  if (prices.length < 2) {
    return 0
  }

  // Calculate returns
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }

  // Calculate mean of returns
  const meanReturn: number = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;

  // Calculate variance
  const variance: number = returns.reduce((sum, ret) => {
    return sum + Math.pow(ret - meanReturn, 2);
  }, 0) / (returns.length - 1);

  // Calculate standard deviation (volatility)
  const volatility: number = Math.sqrt(variance);

  return volatility;
}

/**
 * Calculates the maximum drawdown (MDD) for a series of portfolio values.
 * MDD is the largest peak-to-trough percentage decline.
 * @param values Array of portfolio values over time
 * @returns Maximum drawdown as a decimal (e.g., 0.1818 for 18.18%)
 */
export const calculateMaxDrawdown = (values: number[]) => {
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

export const calculateSharpeRatio = (
  portfolioValues: number[],
  riskFreeRate: number = 0
)  => {
  if (portfolioValues.length < 2) {
    console.error("At least two values are required to calculate Sharpe Ratio");
    return 0
  }

  // Calculate daily returns
  const returns: number[] = [];
  for (let i = 1; i < portfolioValues.length; i++) {
    returns.push((portfolioValues[i] - portfolioValues[i - 1]) / portfolioValues[i - 1]);
  }

  // Calculate average return
  const avgReturn: number = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;

  console.log('avgReturn', avgReturn)
  // Calculate variance
  const variance: number = returns.reduce((sum, ret) => {
    return sum + Math.pow(ret - avgReturn, 2);
  }, 0) / (returns.length - 1);

  // Calculate volatility (standard deviation)
  const volatility: number = Math.sqrt(variance);

  // Avoid division by zero
  if (volatility === 0) {
    console.error("Volatility is zero, cannot calculate Sharpe Ratio");
    return 0
  }

  // Calculate Sharpe Ratio
  const sharpeRatio: number = (avgReturn - riskFreeRate) / volatility;

  return sharpeRatio;
}

/**
 * Calculates the Sortino Ratio for an array of portfolio values.
 * Assumes daily data and annualizes using 252 trading days.
 * @param values Array of portfolio values over time
 * @param riskFreeRate Daily risk-free rate (default 0)
 * @param targetReturn Target return for downside risk (default 0)
 * @returns Annualized Sortino Ratio, or 0 if insufficient data
 */
export const calculateSortinoRatio = (values: number[], riskFreeRate: number = 0, targetReturn: number = 0) => {
  if (values.length < 2) {
    return 0;
  }

  // Calculate returns: (current - previous) / previous
  const returns: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const prevValue = values[i - 1];
    const currentValue = values[i];
    if (prevValue === 0) continue; // Avoid division by zero
    returns.push((currentValue - prevValue) / prevValue);
  }

  if (returns.length === 0) {
    return 0;
  }

  // Calculate excess returns
  const excessReturns: number[] = returns.map(r => r - riskFreeRate);

  // Calculate mean of excess returns
  const meanExcessReturn: number = excessReturns.reduce((sum, val) => sum + val, 0) / excessReturns.length;

  // Calculate downside deviation
  const downsideReturns: number[] = returns.filter(r => r < targetReturn);
  const downsideSquared: number = downsideReturns.reduce((sum, r) => sum + Math.pow(r - targetReturn, 2), 0);
  const downsideDeviation: number = Math.sqrt(downsideSquared / returns.length); // Use total periods for consistency

  // Avoid division by zero
  if (downsideDeviation === 0) {
    return 0;
  }

  // Calculate daily Sortino Ratio and annualize (252 trading days)
  const sortinoRatio: number = meanExcessReturn / downsideDeviation;
  const annualizedSortino: number = sortinoRatio * Math.sqrt(252);

  return annualizedSortino;
}

/**
 * Calculates the Ulcer Index for an array of portfolio values.
 * Measures the severity and duration of drawdowns.
 * @param values Array of portfolio values over time
 * @returns Ulcer Index as a decimal (e.g., 0.1 for 10%)
 */
export const calculateUlcerIndex = (values: number[]) => {
  if (values.length < 1) {
    return 0;
  }

  let peak: number = values[0];
  const drawdownsSquared: number[] = [];

  for (const value of values) {
    // Update peak if current value is higher
    if (value > peak) {
      peak = value;
    }

    // Calculate drawdown: (peak - value) / peak
    const drawdown: number = peak > 0 ? (peak - value) / peak : 0;
    drawdownsSquared.push(drawdown * drawdown);
  }

  // Calculate mean of squared drawdowns
  const meanSquaredDrawdown: number = drawdownsSquared.reduce((sum, val) => sum + val, 0) / values.length;

  // Ulcer Index is the square root of the mean squared drawdown
  const ulcerIndex: number = Math.sqrt(meanSquaredDrawdown);

  return ulcerIndex;
}

/**
 * Calculates the Ulcer Performance Index (UPI) for an array of portfolio values.
 * Measures annualized excess return per unit of Ulcer Index (downside risk).
 * Assumes daily data and annualizes using 252 trading days.
 * @param values Array of portfolio values over time
 * @param riskFreeRate Daily risk-free rate (default 0)
 * @returns Ulcer Performance Index, or 0 if insufficient data
 */
export const calculateUlcerPerformanceIndex = (values: number[], riskFreeRate: number = 0) => {
  if (values.length < 2) {
    return 0;
  }

  // Calculate returns: (current - previous) / previous
  const returns: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const prevValue = values[i - 1];
    const currentValue = values[i];
    if (prevValue === 0) continue; // Avoid division by zero
    returns.push((currentValue - prevValue) / prevValue);
  }

  if (returns.length === 0) {
    return 0;
  }

  // Calculate average return
  const meanReturn: number = returns.reduce((sum, val) => sum + val, 0) / returns.length;

  // Calculate annualized excess return
  const excessReturn: number = meanReturn - riskFreeRate;
  const annualizedExcessReturn: number = excessReturn * 252;

  // Calculate Ulcer Index
  let peak: number = values[0];
  const drawdownsSquared: number[] = [];

  for (const value of values) {
    // Update peak if current value is higher
    if (value > peak) {
      peak = value;
    }

    // Calculate drawdown: (peak - value) / peak
    const drawdown: number = peak > 0 ? (peak - value) / peak : 0;
    drawdownsSquared.push(drawdown * drawdown);
  }

  // Calculate mean of squared drawdowns and Ulcer Index
  const meanSquaredDrawdown: number = drawdownsSquared.reduce((sum, val) => sum + val, 0) / values.length;
  const ulcerIndex: number = Math.sqrt(meanSquaredDrawdown);

  // Avoid division by zero
  if (ulcerIndex === 0) {
    return 0;
  }

  // Calculate UPI
  const upi: number = annualizedExcessReturn / ulcerIndex;

  return upi;
}
