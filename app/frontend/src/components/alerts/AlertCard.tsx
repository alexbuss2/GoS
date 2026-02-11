import { Bell, BellOff, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, getCategoryLabel, getCategoryColor } from '@/lib/currency';
import type { PriceAlert } from '@/types';
import { Switch } from '@/components/ui/switch';

interface AlertCardProps {
  alert: PriceAlert;
  onToggle: (alert: PriceAlert) => void;
  onDelete: (alert: PriceAlert) => void;
}

export const AlertCard = ({ alert, onToggle, onDelete }: AlertCardProps) => {
  const isAbove = alert.condition === 'above';

  return (
    <div 
      className={`bg-[#1A2744] rounded-2xl p-4 border transition-all ${
        alert.is_triggered 
          ? 'border-[#D4AF37]/50 bg-[#D4AF37]/5' 
          : alert.is_active 
            ? 'border-[#00D9A5]/30' 
            : 'border-white/10 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div 
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              alert.is_triggered 
                ? 'bg-[#D4AF37]/20' 
                : alert.is_active 
                  ? 'bg-[#00D9A5]/20' 
                  : 'bg-white/10'
            }`}
          >
            {alert.is_triggered ? (
              <Bell className="w-5 h-5 text-[#D4AF37]" />
            ) : alert.is_active ? (
              <Bell className="w-5 h-5 text-[#00D9A5]" />
            ) : (
              <BellOff className="w-5 h-5 text-white/50" />
            )}
          </div>
          <div>
            <h4 className="text-white font-semibold">{alert.asset_name}</h4>
            <span 
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ 
                backgroundColor: getCategoryColor(alert.asset_category) + '20',
                color: getCategoryColor(alert.asset_category),
              }}
            >
              {getCategoryLabel(alert.asset_category)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={alert.is_active}
            onCheckedChange={() => onToggle(alert)}
            className="data-[state=checked]:bg-[#00D9A5]"
          />
          <button 
            onClick={() => onDelete(alert)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-white/50 hover:text-[#EF4444]" />
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isAbove ? (
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#EF4444]" />
            )}
            <span className="text-white/70 text-sm">
              {isAbove ? 'Üstüne çıkarsa' : 'Altına düşerse'}
            </span>
          </div>
          <p className="text-white font-bold">
            {formatCurrency(alert.target_price, alert.currency)}
          </p>
        </div>
        {alert.is_triggered && alert.triggered_at && (
          <p className="text-[#D4AF37] text-xs mt-2">
            ✓ Tetiklendi: {new Date(alert.triggered_at).toLocaleString('tr-TR')}
          </p>
        )}
      </div>
    </div>
  );
};