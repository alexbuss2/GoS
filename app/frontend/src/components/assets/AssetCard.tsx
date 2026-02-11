import { TrendingUp, TrendingDown, MoreVertical, Edit, Trash2, CheckCircle } from 'lucide-react';
import { formatCurrency, getCategoryLabel, getCategoryColor } from '@/lib/currency';
import type { Asset } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AssetCardProps {
  asset: Asset;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  onSell: (asset: Asset) => void;
}

export const AssetCard = ({ asset, onEdit, onDelete, onSell }: AssetCardProps) => {
  const totalValue = asset.quantity * asset.current_price;
  const purchaseValue = asset.quantity * asset.purchase_price;
  const profitLoss = totalValue - purchaseValue;
  const profitLossPercent = ((profitLoss / purchaseValue) * 100);
  const isPositive = profitLoss >= 0;

  const categoryImages: Record<string, string> = {
    gold: 'https://mgx-backend-cdn.metadl.com/generate/images/944326/2026-02-03/264a90c7-cfb0-4342-9d1d-4f47fa42501f.png',
    crypto: 'https://mgx-backend-cdn.metadl.com/generate/images/944326/2026-02-03/eae83290-3172-4a6b-bad6-94f6b0f381c9.png',
    stock: 'https://mgx-backend-cdn.metadl.com/generate/images/944326/2026-02-03/80047afb-1982-4e03-af68-0355197a29eb.png',
  };

  return (
    <div className="bg-[#1A2744] rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl overflow-hidden"
            style={{ 
              backgroundColor: getCategoryColor(asset.category) + '20',
            }}
          >
            {categoryImages[asset.category] ? (
              <img 
                src={categoryImages[asset.category]} 
                alt={asset.category}
                className="w-full h-full object-cover"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center text-lg font-bold"
                style={{ color: getCategoryColor(asset.category) }}
              >
                {asset.name.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h4 className="text-white font-semibold">{asset.name}</h4>
            <div className="flex items-center gap-2">
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ 
                  backgroundColor: getCategoryColor(asset.category) + '20',
                  color: getCategoryColor(asset.category),
                }}
              >
                {getCategoryLabel(asset.category)}
              </span>
              <span className="text-white/50 text-xs">
                {asset.quantity} adet
              </span>
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-lg hover:bg-white/10 transition-colors">
              <MoreVertical className="w-5 h-5 text-white/50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#1A2744] border-white/10">
            <DropdownMenuItem 
              onClick={() => onEdit(asset)}
              className="text-white hover:bg-white/10 cursor-pointer"
            >
              <Edit className="w-4 h-4 mr-2" />
              Düzenle
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onSell(asset)}
              className="text-[#D4AF37] hover:bg-white/10 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Satıldı İşaretle
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(asset)}
              className="text-[#EF4444] hover:bg-white/10 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/50 text-xs mb-1">Güncel Değer</p>
            <p className="text-white text-lg font-bold">
              {formatCurrency(totalValue, asset.currency)}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-[#10B981]" />
              ) : (
                <TrendingDown className="w-4 h-4 text-[#EF4444]" />
              )}
              <span className={isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                {isPositive ? '+' : ''}{formatCurrency(profitLoss, asset.currency)}
              </span>
            </div>
            <p className={`text-xs ${isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {isPositive ? '+' : ''}{profitLossPercent.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};