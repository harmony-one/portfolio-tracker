import * as process from 'process';

const parseStringArray = (value: string) =>
  value.split(',').map(item => item.trim()).filter(_ => _)

function parseBoolean(envVar: string) {
  return envVar === 'true';
}

export default () => ({
  version: process.env.npm_package_version || '0.0.1',
  name: process.env.npm_package_name || '',
  port: parseInt(process.env.PORT, 10) || 3000,
  RATE_LIMITER_TTL: parseInt(process.env.RATE_LIMITER_TTL) || 60000,
  RATE_LIMITER_LIMIT: parseInt(process.env.RATE_LIMITER_LIMIT) || 500,
  CLEAN_STATE: parseBoolean(process.env.CLEAN_STATE || 'false'),
  WALLET_ADDRESSES: parseStringArray(process.env.WALLET_ADDRESSES || ''),
});
