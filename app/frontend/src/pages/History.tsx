import { useState, useEffect } from 'react';
import { History as HistoryIcon, TrendingUp, TrendingDown, LogIn, Archive } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { formatCurrency, getCategoryLabel, getCategoryColor } from '@/lib/currency';
import type { Transaction, Asset } from '@/types';
import { toast } from 'sonner';

export default function HistoryPage() {
  const { isLoading, isAuthenticated, login } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [soldAssets, setSoldAssets] = useState<Asset[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      const [transactionsRes, assetsRes] = await Promise.all([
        api.transactions.query({
          query: {},
          sort: '-transaction_date',
        }),
        api.assets.query({
          query: { is_sold: true },
          sort: '-sold_date',
        }),
      ]);

      if (transactionsRes?.data?.items) {
        setTransactions(transactionsRes.data.items as Transaction[]);
      }
      if (assetsRes?.data?.items) {
        setSoldAssets(assetsRes.data.items as Asset[]);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setIsLoadingData(false);
    }
  };

  const totalProfit = transactions.reduce((sum, t) => {
    if (t.transaction_type === 'sell' && t.profit_loss) {
      return sum + t.profit_loss;
    }
    return sum;
  }, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#00D9A5] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center p-6">
        <p className="text-white/60 text-center mb-4">
          Geçmişinizi görüntülemek için giriş yapın
        </p>
        <Button
          onClick={login}
          className="bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] text-white"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Giriş Yap
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1628] pb-24">
      <Header title="Geçmiş" />
      
      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Summary Card */}
        <div className="bg-[#1A2744] rounded-2xl p-4 border border-white/10">
          <p className="text-white/60 text-sm mb-1">Toplam Kar/Zarar</p>
          <div className="flex items-center gap-2">
            {totalProfit >= 0 ? (
              <TrendingUp className="w-6 h-6 text-[#10B981]" />
            ) : (
              <TrendingDown className="w-6 h-6 text-[#EF4444]" />
            )}
            <span className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit, 'TRY')}
            </span>
          </div>
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="w-full bg-[#1A2744] border border-white/10">
            <TabsTrigger 
              value="transactions" 
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00D9A5]/20 data-[state=active]:to-[#D4AF37]/20 data-[state=active]:text-white"
            >
              <HistoryIcon className="w-4 h-4 mr-2" />
              İşlemler
            </TabsTrigger>
            <TabsTrigger 
              value="archive" 
              className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00D9A5]/20 data-[state=active]:to-[#D4AF37]/20 data-[state=active]:text-white"
            >
              <Archive className="w-4 h-4 mr-2" />
              Arşiv
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-4">
            {isLoadingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-[#00D9A5] border-t-transparent rounded-full" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <HistoryIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">Henüz işlem yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-[#1A2744] rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-semibold">{transaction.asset_name}</h4>
                        <p className="text-white/50 text-sm">
                          {transaction.quantity} adet × {formatCurrency(transaction.price_per_unit, transaction.currency)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          transaction.transaction_type === 'buy' 
                            ? 'bg-[#3B82F6]/20 text-[#3B82F6]' 
                            : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                        }`}>
                          {transaction.transaction_type === 'buy' ? 'Alış' : 'Satış'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-white/50 text-xs">
                        {transaction.transaction_date 
                          ? new Date(transaction.transaction_date).toLocaleDateString('tr-TR')
                          : '-'
                        }
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          {formatCurrency(transaction.total_amount, transaction.currency)}
                        </span>
                        {transaction.profit_loss !== undefined && transaction.profit_loss !== null && (
                          <span className={`text-sm ${transaction.profit_loss >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            ({transaction.profit_loss >= 0 ? '+' : ''}{formatCurrency(transaction.profit_loss, transaction.currency)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archive" className="mt-4">
            {isLoadingData ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-[#00D9A5] border-t-transparent rounded-full" />
              </div>
            ) : soldAssets.length === 0 ? (
              <div className="text-center py-12">
                <Archive className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">Satılan varlık yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {soldAssets.map((asset) => {
                  const profitLoss = asset.sold_price 
                    ? (asset.sold_price - asset.purchase_price) * asset.quantity 
                    : 0;
                  const isPositive = profitLoss >= 0;

                  return (
                    <div
                      key={asset.id}
                      className="bg-[#1A2744] rounded-xl p-4 border border-white/10"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-white font-semibold">{asset.name}</h4>
                          <span 
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: getCategoryColor(asset.category) + '20',
                              color: getCategoryColor(asset.category),
                            }}
                          >
                            {getCategoryLabel(asset.category)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {isPositive ? (
                            <TrendingUp className="w-4 h-4 text-[#10B981]" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-[#EF4444]" />
                          )}
                          <span className={isPositive ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                            {isPositive ? '+' : ''}{formatCurrency(profitLoss, asset.currency)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-white/50">Alış</p>
                          <p className="text-white">{formatCurrency(asset.purchase_price, asset.currency)}</p>
                        </div>
                        <div>
                          <p className="text-white/50">Satış</p>
                          <p className="text-white">{formatCurrency(asset.sold_price || 0, asset.currency)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}