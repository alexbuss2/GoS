import { createClient } from '@metagptx/web-sdk';

export const client = createClient();

export const api = {
  client,
  
  // Auth helpers
  auth: {
    me: () => client.auth.me(),
    toLogin: () => client.auth.toLogin(),
    login: () => client.auth.login(),
    logout: () => client.auth.logout(),
  },
  
  // Entity helpers
  assets: client.entities.assets,
  price_alerts: client.entities.price_alerts,
  transactions: client.entities.transactions,
  portfolio_snapshots: client.entities.portfolio_snapshots,
  user_settings: client.entities.user_settings,
};