import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await api.auth.login();
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-[#00D9A5] border-t-transparent rounded-full mb-4" />
      <p className="text-white/60">Giriş yapılıyor...</p>
    </div>
  );
}