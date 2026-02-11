import { useState, useEffect, useRef } from 'react';
import { Plus, Search, Filter, LogIn, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { AssetCard } from '@/components/assets/AssetCard';
import { AddAssetModal } from '@/components/assets/AddAssetModal';
import { AdBanner } from '@/components/ads/AdBanner';
import { InterstitialAd } from '@/components/ads/InterstitialAd';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { api } from '@/lib/api';
import type { Asset } from '@/types';
import { toast } from 'sonner';

export default function AssetsPage() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, login } = useAuth();
  const { isPro, shouldShowAds, checkAssetLimit, startCheckout } = useSubscription();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isInterstitialOpen, setIsInterstitialOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const actionCountRef = useRef(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAssets();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let filtered = assets.filter(a => !a.is_sold);
    
    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(a => a.category === categoryFilter);
    }
    
    setFilteredAssets(filtered);
  }, [assets, searchQuery, categoryFilter]);

  const fetchAssets = async () => {
    setIsLoadingAssets(true);
    try {
      const response = await api.assets.query({
        query: {},
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

  const checkAndShowInterstitial = () => {
    if (!isPro && shouldShowAds()) {
      actionCountRef.current += 1;
      if (actionCountRef.current % 3 === 0) {
        setIsInterstitialOpen(true);
      }
    }
  };

  const handleAddClick = () => {
    const activeAssets = assets.filter(a => !a.is_sold);
    if (!checkAssetLimit(activeAssets.length)) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setEditingAsset(null);
    setIsAddModalOpen(true);
  };

  const handleSaveAsset = async (assetData: Partial<Asset>) => {
    try {
      if (editingAsset) {
        await api.assets.update({
          id: editingAsset.id.toString(),
          data: {
            ...assetData,
            updated_at: new Date().toISOString(),
          },
        });
        toast.success('Varlık güncellendi');
      } else {
        await api.assets.create({
          data: {
            ...assetData,
            purchase_date: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });
        toast.success('Varlık eklendi');
        checkAndShowInterstitial();
      }
      fetchAssets();
      setEditingAsset(null);
    } catch (error) {
      console.error('Failed to save asset:', error);
      toast.error('İşlem başarısız');
    }
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setIsAddModalOpen(true);
  };

  const handleDeleteAsset = async (asset: Asset) => {
    if (!confirm('Bu varlığı silmek istediğinize emin misiniz?')) return;
    
    try {
      await api.assets.delete({ id: asset.id.toString() });
      toast.success('Varlık silindi');
      fetchAssets();
    } catch (error) {
      console.error('Failed to delete asset:', error);
      toast.error('Silme işlemi başarısız');
    }
  };

  const handleSellAsset = async (asset: Asset) => {
    const soldPrice = prompt('Satış fiyatını girin:');
    if (!soldPrice) return;

    try {
      await api.assets.update({
        id: asset.id.toString(),
        data: {
          is_sold: true,
          sold_price: parseFloat(soldPrice),
          sold_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });

      const profitLoss = (parseFloat(soldPrice) - asset.purchase_price) * asset.quantity;
      await api.transactions.create({
        data: {
          asset_id: asset.id,
          asset_name: asset.name,
          transaction_type: 'sell',
          quantity: asset.quantity,
          price_per_unit: parseFloat(soldPrice),
          total_amount: parseFloat(soldPrice) * asset.quantity,
          currency: asset.currency,
          profit_loss: profitLoss,
          transaction_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      });

      toast.success('Varlık satıldı olarak işaretlendi');
      checkAndShowInterstitial();
      fetchAssets();
    } catch (error) {
      console.error('Failed to sell asset:', error);
      toast.error('İşlem başarısız');
    }
  };

  const handleUpgrade = async () => {
    setIsUpgradeModalOpen(false);
    setIsInterstitialOpen(false);
    try {
      await startCheckout();
    } catch (error) {
      toast.error('Ödeme başlatılamadı');
    }
  };

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
          Varlıklarınızı görüntülemek için giriş yapın
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

  const activeAssetCount = assets.filter(a => !a.is_sold).length;

  return (
    <div className="min-h-screen bg-[#0A1628] pb-24">
      <Header title="Varlıklarım" />
      
      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Asset Limit Indicator for Free Users */}
        {!isPro && (
          <div className="bg-[#1A2744] rounded-xl p-3 border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm">Varlık Limiti</p>
              <p className="text-white font-medium">
                {activeAssetCount} / 5 kullanıldı
              </p>
            </div>
            <button
              onClick={() => navigate('/pro')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg"
            >
              <Crown className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs font-medium">Sınırsız</span>
            </button>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Varlık ara..."
              className="pl-10 bg-[#1A2744] border-white/10 text-white placeholder:text-white/30"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32 bg-[#1A2744] border-white/10 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filtre" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A2744] border-white/10">
              <SelectItem value="all" className="text-white hover:bg-white/10">Tümü</SelectItem>
              <SelectItem value="gold" className="text-white hover:bg-white/10">Altın</SelectItem>
              <SelectItem value="crypto" className="text-white hover:bg-white/10">Kripto</SelectItem>
              <SelectItem value="stock" className="text-white hover:bg-white/10">Hisse</SelectItem>
              <SelectItem value="currency" className="text-white hover:bg-white/10">Döviz</SelectItem>
              <SelectItem value="other" className="text-white hover:bg-white/10">Diğer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assets List */}
        {isLoadingAssets ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-[#00D9A5] border-t-transparent rounded-full" />
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/50 mb-4">Henüz varlık eklenmedi</p>
            <Button
              onClick={handleAddClick}
              className="bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              İlk Varlığını Ekle
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onEdit={handleEditAsset}
                onDelete={handleDeleteAsset}
                onSell={handleSellAsset}
              />
            ))}
          </div>
        )}

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

      {/* Interstitial Ad */}
      <InterstitialAd
        isOpen={isInterstitialOpen}
        onClose={() => setIsInterstitialOpen(false)}
        onUpgrade={handleUpgrade}
      />

      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAsset(null);
        }}
        onSave={handleSaveAsset}
        editingAsset={editingAsset}
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