import { Home, Wallet, Bell, History, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Ana Sayfa', path: '/' },
  { icon: Wallet, label: 'Varlıklar', path: '/assets' },
  { icon: Bell, label: 'Alarmlar', path: '/alerts' },
  { icon: History, label: 'Geçmiş', path: '/history' },
  { icon: Settings, label: 'Ayarlar', path: '/settings' },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A1628]/95 backdrop-blur-lg border-t border-white/10">
      <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all',
                isActive 
                  ? 'bg-gradient-to-r from-[#00D9A5]/20 to-[#D4AF37]/20' 
                  : 'hover:bg-white/5'
              )}
            >
              <Icon 
                className={cn(
                  'w-5 h-5 transition-colors',
                  isActive 
                    ? 'text-[#00D9A5]' 
                    : 'text-white/50'
                )} 
              />
              <span 
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  isActive 
                    ? 'text-[#D4AF37]' 
                    : 'text-white/50'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};