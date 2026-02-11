import { useState, useEffect } from 'react';
import { X, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InterstitialAdProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export const InterstitialAd = ({ isOpen, onClose, onUpgrade }: InterstitialAdProps) => {
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setCanClose(false);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanClose(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6">
      <div className="bg-[#1A2744] rounded-2xl p-6 max-w-sm w-full border border-white/10 relative">
        {/* Close button */}
        <button
          onClick={canClose ? onClose : undefined}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            canClose 
              ? 'bg-white/10 hover:bg-white/20 cursor-pointer' 
              : 'bg-white/5 cursor-not-allowed'
          }`}
        >
          {canClose ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <span className="text-white text-sm font-medium w-5 h-5 flex items-center justify-center">
              {countdown}
            </span>
          )}
        </button>

        {/* Ad Content */}
        <div className="text-center pt-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#00D9A5]/20 to-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-10 h-10 text-[#D4AF37]" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">
            Reklamsız Deneyim İster misiniz?
          </h3>
          <p className="text-white/60 text-sm mb-6">
            BİRİKİO PRO ile tüm reklamlardan kurtulun, sınırsız varlık ekleyin ve fiyat alarmlarını kullanın!
          </p>

          <div className="bg-gradient-to-r from-[#00D9A5]/10 to-[#D4AF37]/10 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm">Aylık PRO Üyelik</span>
              <span className="text-[#D4AF37] font-bold">₺50/ay</span>
            </div>
            <ul className="text-left text-sm space-y-2">
              <li className="text-white/70 flex items-center gap-2">
                <span className="text-[#00D9A5]">✓</span> Sınırsız varlık ekleme
              </li>
              <li className="text-white/70 flex items-center gap-2">
                <span className="text-[#00D9A5]">✓</span> Fiyat alarmları
              </li>
              <li className="text-white/70 flex items-center gap-2">
                <span className="text-[#00D9A5]">✓</span> Reklamsız deneyim
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={canClose ? onClose : undefined}
              variant="outline"
              className={`flex-1 bg-transparent border-white/20 text-white ${
                canClose ? 'hover:bg-white/10' : 'opacity-50 cursor-not-allowed'
              }`}
              disabled={!canClose}
            >
              {canClose ? 'Kapat' : `${countdown}s`}
            </Button>
            <Button
              onClick={onUpgrade}
              className="flex-1 bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] text-white hover:opacity-90"
            >
              PRO'ya Geç
            </Button>
          </div>
        </div>

        <p className="text-white/30 text-[10px] text-center mt-4">Reklam</p>
      </div>
    </div>
  );
};