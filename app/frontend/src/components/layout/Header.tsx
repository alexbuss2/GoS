import { Bell, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  title?: string;
}

export const Header = ({ title = 'BİRİKİO' }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-[#0A1628]/95 backdrop-blur-lg border-b border-white/10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/birikio-logo.png" 
            alt="BİRİKİO" 
            className="w-10 h-10 rounded-xl"
          />
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link 
            to="/alerts"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Bell className="w-5 h-5 text-white/70" />
          </Link>
          <Link 
            to="/settings"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Settings className="w-5 h-5 text-white/70" />
          </Link>
        </div>
      </div>
    </header>
  );
};