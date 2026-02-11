import { useState } from 'react';
import { Crown, Zap, Bell, Ban, TrendingUp, Shield, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

export default function ProPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const { isPro, status, startCheckout, cancelSubscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    setIsLoading(true);
    try {
      await startCheckout();
    } catch (error) {
      toast.error('Ödeme başlatılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Aboneliğinizi iptal etmek istediğinize emin misiniz?')) return;
    
    setIsLoading(true);
    try {
      await cancelSubscription();
      toast.success('Abonelik iptal edildi');
    } catch (error) {
      toast.error('İptal işlemi başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Zap,
      title: 'Sınırsız Varlık Ekleme',
      description: 'Portföyünüze istediğiniz kadar varlık ekleyin',
      color: '#00D9A5',
    },
    {
      icon: Bell,
      title: 'Canlı Fiyat Alarmları',
      description: 'Hedef fiyatlara ulaşıldığında anında bildirim alın',
      color: '#D4AF37',
    },
    {
      icon: Ban,
      title: 'Sıfır Reklam',
      description: 'Tamamen reklamsız, kesintisiz deneyim',
      color: '#EF4444',
    },
    {
      icon: TrendingUp,
      title: 'Gelişmiş Analizler',
      description: 'Detaylı kar/zarar raporları ve grafikler',
      color: '#3B82F6',
    },
    {
      icon: Shield,
      title: 'Öncelikli Destek',
      description: '7/24 öncelikli müşteri desteği',
      color: '#8B5CF6',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A1628]">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0A1628]/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] bg-clip-text text-transparent">
            BİRİKİO PRO
          </h1>
          <div className="w-9" />
        </div>
      </div>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Hero */}
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#00D9A5]/20 to-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Crown className="w-12 h-12 text-[#D4AF37]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Premium Finansal Takip
          </h2>
          <p className="text-white/60">
            Yatırımlarınızı profesyonel araçlarla yönetin
          </p>
        </div>

        {/* Current Status */}
        {isPro && (
          <div className="bg-gradient-to-r from-[#00D9A5]/20 to-[#D4AF37]/20 rounded-2xl p-4 border border-[#D4AF37]/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <p className="text-[#D4AF37] font-semibold">PRO Üyesiniz! 🎉</p>
                {status.subscription_end && (
                  <p className="text-white/50 text-sm">
                    Bitiş: {new Date(status.subscription_end).toLocaleDateString('tr-TR')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Comparison */}
        <div className="bg-[#1A2744] rounded-2xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-3 text-center border-b border-white/10">
            <div className="p-3">
              <p className="text-white/50 text-xs">Özellik</p>
            </div>
            <div className="p-3 border-x border-white/10">
              <p className="text-white/70 text-xs font-medium">Ücretsiz</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-[#00D9A5]/10 to-[#D4AF37]/10">
              <p className="text-[#D4AF37] text-xs font-bold">PRO</p>
            </div>
          </div>
          
          {[
            { feature: 'Varlık Limiti', free: '5 adet', pro: 'Sınırsız' },
            { feature: 'Fiyat Alarmları', free: '—', pro: '✓' },
            { feature: 'Reklamlar', free: 'Var', pro: 'Yok' },
            { feature: 'Gelişmiş Analiz', free: '—', pro: '✓' },
            { feature: 'Öncelikli Destek', free: '—', pro: '✓' },
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-3 text-center border-b border-white/10 last:border-b-0">
              <div className="p-3 text-left">
                <p className="text-white/70 text-sm">{row.feature}</p>
              </div>
              <div className="p-3 border-x border-white/10">
                <p className="text-white/50 text-sm">{row.free}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-[#00D9A5]/5 to-[#D4AF37]/5">
                <p className="text-[#00D9A5] text-sm font-medium">{row.pro}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="space-y-3">
          {features.map((feature, i) => (
            <div 
              key={i}
              className="bg-[#1A2744] rounded-xl p-4 border border-white/10 flex items-center gap-4"
            >
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: feature.color + '20' }}
              >
                <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
              </div>
              <div>
                <p className="text-white font-medium">{feature.title}</p>
                <p className="text-white/50 text-sm">{feature.description}</p>
              </div>
              <Check className="w-5 h-5 text-[#00D9A5] flex-shrink-0 ml-auto" />
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-r from-[#00D9A5]/10 to-[#D4AF37]/10 rounded-2xl p-6 border border-white/10 text-center">
          <p className="text-white/50 text-sm mb-2">Aylık Abonelik</p>
          <div className="flex items-baseline justify-center gap-1 mb-4">
            <span className="text-5xl font-bold bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] bg-clip-text text-transparent">
              ₺50
            </span>
            <span className="text-white/50">/ay</span>
          </div>
          <ul className="text-left text-sm space-y-2 mb-6">
            <li className="text-white/70 flex items-center gap-2">
              <Check className="w-4 h-4 text-[#00D9A5]" />
              İstediğiniz zaman iptal edin
            </li>
            <li className="text-white/70 flex items-center gap-2">
              <Check className="w-4 h-4 text-[#00D9A5]" />
              Güvenli ödeme (Stripe)
            </li>
            <li className="text-white/70 flex items-center gap-2">
              <Check className="w-4 h-4 text-[#00D9A5]" />
              Anında aktivasyon
            </li>
          </ul>

          {isPro ? (
            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-full bg-transparent border-[#EF4444]/50 text-[#EF4444] hover:bg-[#EF4444]/10"
              disabled={isLoading}
            >
              {isLoading ? 'İşleniyor...' : 'Aboneliği İptal Et'}
            </Button>
          ) : (
            <Button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] text-white hover:opacity-90 py-6 text-lg font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                'İşleniyor...'
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  PRO'ya Geç
                </>
              )}
            </Button>
          )}
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 text-white/30 text-xs">
          <span>🔒 Güvenli Ödeme</span>
          <span>•</span>
          <span>💳 Stripe ile</span>
          <span>•</span>
          <span>✓ SSL Korumalı</span>
        </div>
      </main>
    </div>
  );
}