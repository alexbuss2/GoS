export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Asset {
  id: number;
  user_id: string;
  name: string;
  category: 'gold' | 'crypto' | 'stock' | 'currency' | 'other';
  quantity: number;
  purchase_price: number;
  purchase_date?: string;
  current_price: number;
  currency: 'TRY' | 'USD' | 'EUR';
  is_sold: boolean;
  sold_price?: number;
  sold_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PriceAlert {
  id: number;
  user_id: string;
  asset_name: string;
  asset_category: string;
  target_price: number;
  condition: 'above' | 'below';
  currency: 'TRY' | 'USD' | 'EUR';
  is_active: boolean;
  is_triggered: boolean;
  triggered_at?: string;
  created_at?: string;
}

export interface Transaction {
  id: number;
  user_id: string;
  asset_id?: number;
  asset_name: string;
  transaction_type: 'buy' | 'sell';
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  currency: 'TRY' | 'USD' | 'EUR';
  profit_loss?: number;
  transaction_date?: string;
  notes?: string;
  created_at?: string;
}

export interface PortfolioSnapshot {
  id: number;
  user_id: string;
  total_value_try: number;
  total_value_usd?: number;
  total_value_eur?: number;
  gold_value?: number;
  crypto_value?: number;
  stock_value?: number;
  currency_value?: number;
  other_value?: number;
  snapshot_date: string;
  created_at?: string;
}

export interface UserSettings {
  id: number;
  user_id: string;
  base_currency: 'TRY' | 'USD' | 'EUR';
  pin_code?: string;
  pin_enabled: boolean;
  theme: 'dark' | 'light';
  notifications_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Subscription {
  id: number;
  user_id: string;
  plan_type: 'free' | 'pro';
  is_pro: boolean;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_start?: string;
  subscription_end?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionStatus {
  is_pro: boolean;
  plan_type: 'free' | 'pro';
  subscription_end?: string;
  asset_limit: number;
  alerts_enabled: boolean;
  ads_enabled: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  category: 'gold' | 'crypto' | 'economy';
}

export interface ChartDataPoint {
  date: string;
  value: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export type Currency = 'TRY' | 'USD' | 'EUR';
export type AssetCategory = 'gold' | 'crypto' | 'stock' | 'currency' | 'other';