import type { Currency } from '@/types';

// Exchange rates (will be updated from API in production)
const exchangeRates: Record<Currency, Record<Currency, number>> = {
  TRY: { TRY: 1, USD: 0.031, EUR: 0.029 },
  USD: { TRY: 32.5, USD: 1, EUR: 0.92 },
  EUR: { TRY: 35.2, USD: 1.09, EUR: 1 },
};

export const convertCurrency = (
  amount: number,
  from: Currency,
  to: Currency
): number => {
  if (from === to) return amount;
  return amount * exchangeRates[from][to];
};

export const formatCurrency = (
  amount: number,
  currency: Currency,
  locale: string = 'tr-TR'
): string => {
  const symbols: Record<Currency, string> = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
  };
  
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return `${symbols[currency]}${formatted}`;
};

export const getCurrencySymbol = (currency: Currency): string => {
  const symbols: Record<Currency, string> = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
  };
  return symbols[currency];
};

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    gold: 'Altın',
    crypto: 'Kripto',
    stock: 'Hisse',
    currency: 'Döviz',
    other: 'Diğer',
  };
  return labels[category] || category;
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    gold: '#D4AF37',
    crypto: '#F7931A',
    stock: '#00D9A5',
    currency: '#3B82F6',
    other: '#8B5CF6',
  };
  return colors[category] || '#6B7280';
};