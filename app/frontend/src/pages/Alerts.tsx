import { useState, useEffect } from 'react';
import { Plus, Bell, LogIn, Crown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { AlertCard } from '@/components/alerts/AlertCard';
import { AddAlertModal } from '@/components/alerts/AddAlertModal';
import { AdBanner } from '@/components/ads/AdBanner';
import { UpgradeModal } from '@/components/subscription/UpgradeModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { api } from '@/lib/api';
import type { PriceAlert } from '@/types';
import { toast } from 'sonner';

export default function AlertsPage() {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, login } = useAuth();
  const { isPro, canUseAlerts, shouldShowAds, startCheckout } = useSubscription();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);

  useEffect(() => {
    if (isAuthenticated && canUseAlerts()) {
      fetchAlerts();
    }
  }, [isAuthenticated, canUseAlerts]);

  const fetchAlerts = async () => {
    setIsLoadingAlerts(true);
    try {
      const response = await api.price_alerts.query({
        query: {},
        sort: '-created_at',
      });
      if (response?.data?.items) {
        setAlerts(response.data.items as PriceAlert[]);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      toast.error('Alarmlar yüklenirken hata oluştu');
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  const handleAddClick = () => {
    if (!canUseAlerts()) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleAddAlert = async (alertData: Partial<PriceAlert>) => {
    try {
      await api.price_alerts.create({
        data: {
          ...alertData,
          created_at: new Date().toISOString(),
        },
      });
      toast.success('Alarm oluşturuldu');
      fetchAlerts();
    } catch (error) {
      console.error('Failed to add alert:', error);
      toast.error('Alarm oluşturulamadı');
    }
  };

  const handleToggleAlert = async (alert: PriceAlert) => {
    try {
      await api.price_alerts.update({
        id: alert.id.toString(),
        data: {
          is_active: !alert.is_active,
        },
      });
      toast.success(alert.is_active ? 'Alarm devre dışı' : 'Alarm aktif');
      fetchAlerts();
    } catch (error) {
      console.error('Failed to toggle alert:', error);
      toast.error('İşlem başarısız');
    }
  };

  const handleDeleteAlert = async (alert: PriceAlert) => {
    if (!confirm('Bu alarmı silmek istediğinize emin misiniz?')) return;
    
    try {
      await api.price_alerts.delete({ id: alert.id.toString() });
      toast.success('Alarm silindi');
      fetchAlerts();
    } catch (error) {
      console.error('Failed to delete alert:', error);
      toast.error('Silme işlemi başarısız');
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

  const activeAlerts = alerts.filter(a => a.is_active && !a.is_triggered);
  const triggeredAlerts = alerts.filter(a => a.is_triggered);
  const inactiveAlerts = alerts.filter(a => !a.is_active && !a.is_triggered);

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
          Alarmlarınızı görüntülemek için giriş yapın
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

  // Show PRO upgrade prompt for free users
  if (!canUseAlerts()) {
    return (
      <div className="min-h-screen bg-[#0A1628] pb-24">
        <Header title="Fiyat Alarmları" />
        
        <main className="px-4 py-8 max-w-lg mx-auto">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]/30">
              <Lock className="w-12 h-12 text-[#D4AF37]" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              PRO Özelliği 🔔
            </h2>
            <p className="text-white/60 mb-8 max-w-xs mx-auto">
              Fiyat alarmları sadece PRO üyelere özeldir. Hedef fiyatlarınızı takip etmek için PRO'ya geçin!
            </p>

            <div className="bg-[#1A2744] rounded-2xl p-6 border border-white/10 mb-6">
              <h3 className="text-white font-semibold mb-4">Fiyat Alarmları ile:</h3>
              <ul className="text-left space-y-3">
                <li className="text-white/70 flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[#00D9A5]" />
                  Hedef fiyata ulaşıldığında bildirim alın
                </li>
                <li className="text-white/70 flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[#00D9A5]" />
                  Altın, döviz ve kripto için alarm kurun
                </li>
                <li className="text-white/70 flex items-center gap-3">
                  <Bell className="w-5 h-5 text-[#00D9A5]" />
                  Sınırsız alarm oluşturun
                </li>
              </ul>
            </div>

            <Button
              onClick={() => navigate('/pro')}
              className="w-full bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] text-white py-6 text-lg font-semibold"
            >
              <Crown className="w-5 h-5 mr-2" />
              PRO'ya Geç - ₺50/ay
            </Button>
          </div>
        </main>

        <BottomNav />
        
        {shouldShowAds() && <AdBanner position="bottom" />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1628] pb-24">
      <Header title="Fiyat Alarmları" />
      
      <main className="px-4 py-4 space-y-6 max-w-lg mx-auto">
        {isLoadingAlerts ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-[#00D9A5] border-t-transparent rounded-full" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 mb-4">Henüz alarm eklenmedi</p>
            <Button
              onClick={handleAddClick}
              className="bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              İlk Alarmını Oluştur
            </Button>
          </div>
        ) : (
          <>
            {/* Triggered Alerts */}
            {triggeredAlerts.length > 0 && (
              <div>
                <h3 className="text-[#D4AF37] font-semibold mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Tetiklenen Alarmlar ({triggeredAlerts.length})
                </h3>
                <div className="space-y-3">
                  {triggeredAlerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onToggle={handleToggleAlert}
                      onDelete={handleDeleteAlert}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Active Alerts */}
            {activeAlerts.length > 0 && (
              <div>
                <h3 className="text-[#00D9A5] font-semibold mb-3 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Aktif Alarmlar ({activeAlerts.length})
                </h3>
                <div className="space-y-3">
                  {activeAlerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onToggle={handleToggleAlert}
                      onDelete={handleDeleteAlert}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Alerts */}
            {inactiveAlerts.length > 0 && (
              <div>
                <h3 className="text-white/50 font-semibold mb-3">
                  Devre Dışı ({inactiveAlerts.length})
                </h3>
                <div className="space-y-3">
                  {inactiveAlerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onToggle={handleToggleAlert}
                      onDelete={handleDeleteAlert}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
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

      <AddAlertModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddAlert}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgrade={handleUpgrade}
        reason="alerts"
      />
    </div>
  );
}