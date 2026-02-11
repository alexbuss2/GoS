import { Crown, Zap, Bell, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  reason?: 'limit' | 'alerts' | 'general';
}

export const UpgradeModal = ({ isOpen, onClose, onUpgrade, reason = 'general' }: UpgradeModalProps) => {
  const titles = {
    limit: 'Varlık Limitine Ulaştınız! 🎯',
    alerts: 'Fiyat Alarmları PRO Özelliği 🔔',
    general: 'BİRİKİO PRO ile Daha Fazlası! 🚀',
  };

  const descriptions = {
    limit: 'Ücretsiz planda en fazla 5 varlık ekleyebilirsiniz. Sınırsız varlık eklemek için PRO\'ya geçin!',
    alerts: 'Fiyat alarmları sadece PRO üyelere özeldir. Hedef fiyatlarınızı takip etmek için PRO\'ya geçin!',
    general: 'Premium özelliklerle yatırımlarınızı daha etkili yönetin.',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A2744] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] bg-clip-text text-transparent">
            {titles[reason]}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <p className="text-white/70 text-center">
            {descriptions[reason]}
          </p>

          {/* PRO Features */}
          <div className="bg-gradient-to-r from-[#00D9A5]/10 to-[#D4AF37]/10 rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Crown className="w-6 h-6 text-[#D4AF37]" />
              <span className="text-white font-bold text-lg">PRO Avantajları</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-[#00D9A5]/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#00D9A5]" />
                </div>
                <div>
                  <p className="text-white font-medium">Sınırsız Varlık</p>
                  <p className="text-white/50 text-xs">İstediğiniz kadar varlık ekleyin</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-white font-medium">Fiyat Alarmları</p>
                  <p className="text-white/50 text-xs">Hedef fiyatlarda bildirim alın</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-[#EF4444]/20 flex items-center justify-center">
                  <Ban className="w-5 h-5 text-[#EF4444]" />
                </div>
                <div>
                  <p className="text-white font-medium">Sıfır Reklam</p>
                  <p className="text-white/50 text-xs">Tamamen reklamsız deneyim</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="text-center">
            <div className="inline-flex items-baseline gap-1">
              <span className="text-4xl font-bold bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] bg-clip-text text-transparent">
                ₺50
              </span>
              <span className="text-white/50">/ay</span>
            </div>
            <p className="text-white/40 text-xs mt-1">İstediğiniz zaman iptal edebilirsiniz</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Şimdilik Değil
            </Button>
            <Button
              onClick={onUpgrade}
              className="flex-1 bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] text-white hover:opacity-90"
            >
              <Crown className="w-4 h-4 mr-2" />
              PRO'ya Geç
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};