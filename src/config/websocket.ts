import { CONFIG } from './index';

export const WS_CONFIG = {
  RECONNECT_INTERVAL: 5000,
  MAX_RETRIES: 5,
  ENDPOINTS: {
    MAIN: 'wss://pony.town/ws',
    FALLBACK: 'wss://backup.pony.town/ws'
  },
  TIMEOUT: CONFIG.NODE_ENV === 'production' ? 10000 : 30000
};