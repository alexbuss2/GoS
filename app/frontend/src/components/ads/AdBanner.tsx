import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface AdBannerProps {
  position?: 'top' | 'bottom' | 'inline';
  onClose?: () => void;
}

const adContents = [
  {
    title: 'Altın Yatırımı Yapmak İster misiniz?',
    description: 'En güvenilir altın platformu ile yatırımlarınızı büyütün.',
    cta: 'Hemen Başla',
    bgColor: 'from-[#D4AF37]/20 to-[#B8860B]/20',
    borderColor: 'border-[#D4AF37]/30',
  },
  {
    title: 'Kripto Para Dünyasına Adım Atın',
    description: 'Bitcoin, Ethereum ve daha fazlası için güvenli platform.',
    cta: 'Keşfet',
    bgColor: 'from-[#F7931A]/20 to-[#627EEA]/20',
    borderColor: 'border-[#F7931A]/30',
  },
  {
    title: 'Döviz Kurlarını Takip Edin',
    description: 'Anlık döviz kurları ve en iyi alım-satım fırsatları.',
    cta: 'İncele',
    bgColor: 'from-[#00D9A5]/20 to-[#3B82F6]/20',
    borderColor: 'border-[#00D9A5]/30',
  },
];

export const AdBanner = ({ position = 'bottom', onClose }: AdBannerProps) => {
  const [currentAd, setCurrentAd] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % adContents.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const ad = adContents[currentAd];

  const positionClasses = {
    top: 'fixed top-16 left-0 right-0 z-30',
    bottom: 'fixed bottom-20 left-0 right-0 z-30',
    inline: 'relative w-full',
  };

  return (
    <div className={`${positionClasses[position]} px-4`}>
      <div 
        className={`bg-gradient-to-r ${ad.bgColor} backdrop-blur-sm rounded-xl p-3 border ${ad.borderColor} max-w-lg mx-auto`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{ad.title}</p>
            <p className="text-white/60 text-xs truncate">{ad.description}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs font-medium transition-colors">
              {ad.cta}
            </button>
            {onClose && (
              <button 
                onClick={() => {
                  setIsVisible(false);
                  onClose();
                }}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-white/50" />
              </button>
            )}
          </div>
        </div>
        <div className="flex justify-center gap-1 mt-2">
          {adContents.map((_, i) => (
            <div 
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === currentAd ? 'bg-white/70' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
        <p className="text-white/30 text-[10px] text-center mt-1">Reklam • PRO ile kaldır</p>
      </div>
    </div>
  );
};