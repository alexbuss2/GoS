import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import type { Currency } from '@/types';

interface PortfolioSummaryProps {
  totalValue: number;
  currency: Currency;
  change24h?: number;
  changePercent?: number;
}

export const PortfolioSummary = ({
  totalValue,
  currency,
  change24h = 0,
  changePercent = 0,
}: PortfolioSummaryProps) => {
  const isPositive = change24h >= 0;

  return (
    <div 
      className="relative overflow-hidden rounded-2xl p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(0, 217, 165, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'url(https://mgx-backend-cdn.metadl.com/generate/images/944326/2026-02-03/cde9bce4-ebba-4058-bef9-205d90324f29.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="relative z-10">
        <p className="text-white/60 text-sm mb-1">Toplam Servet</p>
        <h2 className="text-3xl font-bold text-white mb-2">
          {formatCurrency(totalValue, currency)}
        </h2>
        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
          ) : (
            <TrendingDown className="w-4 h-4 text-[#EF4444]" />
          )}
          <span className={isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}>
            {isPositive ? '+' : ''}{formatCurrency(change24h, currency)}
          </span>
          <span className={`text-sm ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>
    </div>
  );
};