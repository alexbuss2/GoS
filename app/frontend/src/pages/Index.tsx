import { useState, useEffect } from 'react';
import { Plus, LogIn, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { PortfolioSummary } from '@/components/dashboard/PortfolioSummary';
import { PortfolioPieChart } from '@/components/dashboard/PortfolioPieChart';
import { WealthLineChart } from '@/components/dashboard/WealthLineChart';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { AddAssetModal } from '@/components/assets/AddAssetModal';
import { AdBanner } from '@/components/ads/AdBanner';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { api } from '@/lib/api';
import { getCategoryColor } from '@/lib/currency';
import type { Asset, PieChartData, ChartDataPoint, Currency } from '@/types';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated, login } = useAuth();
  const { isPro, shouldShowAds, checkAssetLimit, startCheckout } = useSubscription();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [baseCurrency] = useState<Currency>('TRY');
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAssets();
    }
  }, [isAuthenticated]);

  const fetchAssets = async () => {
    setIsLoadingAssets(true);
    try {
      const response = await api.assets.query({
        query: { is_sold: false },
        sort: '-created_at',
      });
      if (response?.data?.items) {
        setAssets(response.data.items as Asset[]);
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      toast.error('Varlıklar yüklenirken hata oluştu');
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const handleAddClick = () => {
    const activeAssets = assets.filter(a => !a.is_sold);
    if (!checkAssetLimit(activeAssets.length)) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleAddAsset = async (assetData: Partial<Asset>) => {
    try {
      await api.assets.create({
        data: {
          ...assetData,
          purchase_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
      toast.success('Varlık başarıyla eklendi');
      fetchAssets();
    } catch (error) {
      console.error('Failed to add asset:', error);
      toast.error('Varlık eklenirken hata oluştu');
    }
  };

  const handleUpgrade = async () => {
    setIsUpgradeModalOpen(false);
    try {
      await startCheckout();
    } catch (error) {
      toast.error('Ödeme başlatılamadı');
    }
  };

  // Calculate portfolio data
  const totalValue = assets.reduce((sum, asset) => {
    return sum + (asset.quantity * asset.current_price);
  }, 0);

  const purchaseValue = assets.reduce((sum, asset) => {
    return sum + (asset.quantity * asset.purchase_price);
  }, 0);

  const change24h = totalValue - purchaseValue;
  const changePercent = purchaseValue > 0 ? (change24h / purchaseValue) * 100 : 0;

  // Prepare pie chart data
  const categoryTotals = assets.reduce((acc, asset) => {
    const value = asset.quantity * asset.current_price;
    acc[asset.category] = (acc[asset.category] || 0) + value;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData: PieChartData[] = Object.entries(categoryTotals).map(([category, value]) => ({
    name: category,
    value,
    color: getCategoryColor(category),
  }));

  // Mock line chart data
  const lineChartData: ChartDataPoint[] = [
    { date: 'Oca', value: totalValue * 0.85 },
    { date: 'Şub', value: totalValue * 0.88 },
    { date: 'Mar', value: totalValue * 0.92 },
    { date: 'Nis', value: totalValue * 0.90 },
    { date: 'May', value: totalValue * 0.95 },
    { date: 'Haz', value: totalValue * 0.98 },
    { date: 'Tem', value: totalValue },
  ];

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
        <img 
          src="https://mgx-backend-cdn.metadl.com/generate/images/944326/2026-02-03/85a011a2-8878-4106-bc5e-3b31201dcea5.png" 
          alt="BİRİKİO" 
          className="w-24 h-24 rounded-2xl mb-6"
        />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] bg-clip-text text-transparent mb-2">
          BİRİKİO
        </h1>
        <p className="text-white/60 text-center mb-8 max-w-xs">
          Premium Finansal Takip Asistanınız. Varlıklarınızı akıllıca yönetin.
        </p>
        <Button
          onClick={login}
          className="bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] text-white px-8 py-6 rounded-xl text-lg font-semibold hover:opacity-90 transition-opacity"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Giriş Yap
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1628] pb-24">
      <Header />
      
      {/* PRO Badge */}
      {!isPro && (
        <button
          onClick={() => navigate('/pro')}
          className="fixed top-16 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full"
        >
          <Crown className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-[#D4AF37] text-xs font-medium">PRO'ya Geç</span>
        </button>
      )}
      
      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <PortfolioSummary
          totalValue={totalValue}
          currency={baseCurrency}
          change24h={change24h}
          changePercent={changePercent}
        />

        <PortfolioPieChart data={pieChartData} />

        <WealthLineChart data={lineChartData} currency={baseCurrency} />

        <NewsFeed news={[]} />

        {/* Floating Add Button */}
        <button
          onClick={handleAddClick}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-40"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      </main>

      <BottomNav />

      {/* Ad Banner for Free Users */}
      {shouldShowAds() && <AdBanner position="bottom" />}

      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddAsset}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgrade={handleUpgrade}
        reason="limit"
      />
    </div>
  );
}