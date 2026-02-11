import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Lock, 
  Moon, 
  Sun, 
  Bell, 
  LogOut, 
  LogIn,
  Crown,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { AdBanner } from '@/components/ads/AdBanner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { api } from '@/lib/api';
import type { UserSettings, Currency } from '@/types';
import { toast } from 'sonner';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  const { isPro, status, shouldShowAds } = useSubscription();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
    }
  }, [isAuthenticated]);

  const fetchSettings = async () => {
    try {
      const response = await api.user_settings.query({
        query: {},
        limit: 1,
      });
      if (response?.data?.items?.[0]) {
        setSettings(response.data.items[0] as UserSettings);
      } else {
        // Create default settings
        const newSettings = await api.user_settings.create({
          data: {
            base_currency: 'TRY',
            pin_enabled: false,
            theme: 'dark',
            notifications_enabled: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        });
        if (newSettings?.data) {
          setSettings(newSettings.data as UserSettings);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: unknown) => {
    if (!settings) return;
    
    try {
      await api.user_settings.update({
        id: settings.id.toString(),
        data: {
          [key]: value,
          updated_at: new Date().toISOString(),
        },
      });
      setSettings({ ...settings, [key]: value });
      toast.success('Ayar güncellendi');
    } catch (error) {
      console.error('Failed to update setting:', error);
      toast.error('Ayar güncellenemedi');
    }
  };

  const handleSetPin = async () => {
    if (pinInput.length !== 4) {
      toast.error('PIN 4 haneli olmalıdır');
      return;
    }

    await updateSetting('pin_code', pinInput);
    await updateSetting('pin_enabled', true);
    setIsPinModalOpen(false);
    setPinInput('');
    setIsSettingPin(false);
    toast.success('PIN kodu ayarlandı');
  };

  const handleDisablePin = async () => {
    await updateSetting('pin_enabled', false);
    await updateSetting('pin_code', null);
    toast.success('PIN kodu kaldırıldı');
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
          Ayarları görüntülemek için giriş yapın
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
      <Header title="Ayarlar" />
      
      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* PRO Status Card */}
        <button
          onClick={() => navigate('/pro')}
          className={`w-full rounded-2xl p-4 border transition-colors ${
            isPro 
              ? 'bg-gradient-to-r from-[#00D9A5]/20 to-[#D4AF37]/20 border-[#D4AF37]/30' 
              : 'bg-[#1A2744] border-white/10 hover:border-[#D4AF37]/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isPro ? 'bg-[#D4AF37]/20' : 'bg-white/10'
              }`}>
                <Crown className={`w-6 h-6 ${isPro ? 'text-[#D4AF37]' : 'text-white/50'}`} />
              </div>
              <div className="text-left">
                <p className={`font-semibold ${isPro ? 'text-[#D4AF37]' : 'text-white'}`}>
                  {isPro ? 'PRO Üye' : 'Ücretsiz Plan'}
                </p>
                <p className="text-white/50 text-sm">
                  {isPro 
                    ? `Bitiş: ${status.subscription_end ? new Date(status.subscription_end).toLocaleDateString('tr-TR') : '-'}` 
                    : 'Sınırsız özellikler için PRO\'ya geç'
                  }
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/30" />
          </div>
        </button>

        {/* Currency Setting */}
        <div className="bg-[#1A2744] rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <p className="text-white font-medium">Para Birimi</p>
                <p className="text-white/50 text-sm">Varsayılan para birimi</p>
              </div>
            </div>
            <Select 
              value={settings?.base_currency || 'TRY'} 
              onValueChange={(value) => updateSetting('base_currency', value as Currency)}
            >
              <SelectTrigger className="w-24 bg-[#0A1628] border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A2744] border-white/10">
                <SelectItem value="TRY" className="text-white hover:bg-white/10">₺ TRY</SelectItem>
                <SelectItem value="USD" className="text-white hover:bg-white/10">$ USD</SelectItem>
                <SelectItem value="EUR" className="text-white hover:bg-white/10">€ EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* PIN Setting */}
        <div className="bg-[#1A2744] rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <p className="text-white font-medium">PIN Kilidi</p>
                <p className="text-white/50 text-sm">Uygulama güvenliği</p>
              </div>
            </div>
            {settings?.pin_enabled ? (
              <Button
                onClick={handleDisablePin}
                variant="outline"
                size="sm"
                className="bg-transparent border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10"
              >
                Kaldır
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setIsSettingPin(true);
                  setIsPinModalOpen(true);
                }}
                variant="outline"
                size="sm"
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Ayarla
              </Button>
            )}
          </div>
        </div>

        {/* Theme Setting */}
        <div className="bg-[#1A2744] rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                {settings?.theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-[#F59E0B]" />
                ) : (
                  <Sun className="w-5 h-5 text-[#F59E0B]" />
                )}
              </div>
              <div>
                <p className="text-white font-medium">Tema</p>
                <p className="text-white/50 text-sm">
                  {settings?.theme === 'dark' ? 'Karanlık mod' : 'Aydınlık mod'}
                </p>
              </div>
            </div>
            <Switch
              checked={settings?.theme === 'dark'}
              onCheckedChange={(checked) => updateSetting('theme', checked ? 'dark' : 'light')}
            />
          </div>
        </div>

        {/* Notifications Setting */}
        <div className="bg-[#1A2744] rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00D9A5]/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#00D9A5]" />
              </div>
              <div>
                <p className="text-white font-medium">Bildirimler</p>
                <p className="text-white/50 text-sm">Fiyat alarmları ve güncellemeler</p>
              </div>
            </div>
            <Switch
              checked={settings?.notifications_enabled ?? true}
              onCheckedChange={(checked) => updateSetting('notifications_enabled', checked)}
            />
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-[#1A2744] rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#10B981]" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Güvenlik</p>
              <p className="text-white/50 text-sm">Verileriniz şifreli olarak saklanır</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={logout}
          variant="outline"
          className="w-full bg-transparent border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444]/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Çıkış Yap
        </Button>

        {/* App Version */}
        <p className="text-center text-white/30 text-xs">
          BİRİKİO v1.0.0 • {isPro ? 'PRO' : 'Free'}
        </p>
      </main>

      <BottomNav />

      {/* Ad Banner for Free Users */}
      {shouldShowAds() && <AdBanner position="bottom" />}

      {/* PIN Modal */}
      <Dialog open={isPinModalOpen} onOpenChange={setIsPinModalOpen}>
        <DialogContent className="bg-[#1A2744] border-white/10 text-white max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-center">
              {isSettingPin ? 'PIN Kodu Belirle' : 'PIN Girin'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl font-bold ${
                    pinInput[i] ? 'border-[#00D9A5] bg-[#00D9A5]/10' : 'border-white/20'
                  }`}
                >
                  {pinInput[i] ? '•' : ''}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((num, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (num === '⌫') {
                      setPinInput(pinInput.slice(0, -1));
                    } else if (num !== '' && pinInput.length < 4) {
                      setPinInput(pinInput + num);
                    }
                  }}
                  className={`h-14 rounded-xl text-xl font-medium transition-colors ${
                    num === '' 
                      ? 'invisible' 
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            {isSettingPin && (
              <Button
                onClick={handleSetPin}
                disabled={pinInput.length !== 4}
                className="w-full bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] text-white"
              >
                PIN'i Kaydet
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}