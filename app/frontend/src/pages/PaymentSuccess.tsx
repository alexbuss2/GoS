import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyPayment, refreshStatus } = useSubscription();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verify = async () => {
      const sessionId = searchParams.get('session_id');
      if (sessionId) {
        const success = await verifyPayment(sessionId);
        setIsSuccess(success);
      }
      setIsVerifying(false);
    };

    verify();
  }, [searchParams, verifyPayment]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center p-6">
        <div className="animate-spin w-12 h-12 border-3 border-[#00D9A5] border-t-transparent rounded-full mb-4" />
        <p className="text-white/60">Ödeme doğrulanıyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        {isSuccess ? (
          <>
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[#00D9A5]/20 to-[#D4AF37]/20 flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="w-12 h-12 text-[#00D9A5]" />
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              Hoş Geldiniz PRO! 🎉
            </h1>
            <p className="text-white/60 mb-8">
              Ödemeniz başarıyla tamamlandı. Artık tüm PRO özelliklere erişebilirsiniz.
            </p>

            <div className="bg-gradient-to-r from-[#00D9A5]/10 to-[#D4AF37]/10 rounded-2xl p-4 mb-8 border border-white/10">
              <div className="flex items-center gap-3 justify-center">
                <Crown className="w-6 h-6 text-[#D4AF37]" />
                <span className="text-white font-semibold">PRO Üyelik Aktif</span>
              </div>
              <ul className="text-left text-sm space-y-2 mt-4">
                <li className="text-white/70 flex items-center gap-2">
                  <span className="text-[#00D9A5]">✓</span> Sınırsız varlık ekleme
                </li>
                <li className="text-white/70 flex items-center gap-2">
                  <span className="text-[#00D9A5]">✓</span> Fiyat alarmları aktif
                </li>
                <li className="text-white/70 flex items-center gap-2">
                  <span className="text-[#00D9A5]">✓</span> Reklamlar kaldırıldı
                </li>
              </ul>
            </div>

            <Button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] text-white hover:opacity-90"
            >
              Dashboard'a Git
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        ) : (
          <>
            <div className="w-24 h-24 rounded-full bg-[#EF4444]/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">😕</span>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              Bir Sorun Oluştu
            </h1>
            <p className="text-white/60 mb-8">
              Ödeme doğrulanamadı. Lütfen tekrar deneyin veya destek ile iletişime geçin.
            </p>

            <div className="flex gap-3">
              <Button
                onClick={() => navigate('/pro')}
                variant="outline"
                className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Tekrar Dene
              </Button>
              <Button
                onClick={() => navigate('/')}
                className="flex-1 bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] text-white hover:opacity-90"
              >
                Ana Sayfa
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}