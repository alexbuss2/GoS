import { useState, useEffect } from 'react';
import { Delete, Lock } from 'lucide-react';

interface PinLockProps {
  onUnlock: () => void;
  correctPin: string;
}

export const PinLock = ({ onUnlock, correctPin }: PinLockProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPin) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
      }
    }
  }, [pin, correctPin, onUnlock]);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className="fixed inset-0 z-[100] bg-[#0A1628] flex flex-col items-center justify-center p-6">
      <div className="mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] flex items-center justify-center mb-4 mx-auto">
          <Lock className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-white text-xl font-bold text-center">BİRİKİO</h2>
        <p className="text-white/60 text-sm text-center mt-2">PIN kodunuzu girin</p>
      </div>

      <div className={`flex gap-4 mb-12 ${error ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all ${
              pin.length > i
                ? error
                  ? 'bg-[#EF4444]'
                  : 'bg-gradient-to-r from-[#00D9A5] to-[#D4AF37]'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-xs">
        {numbers.map((num, i) => {
          if (num === '') {
            return <div key={i} />;
          }
          if (num === 'del') {
            return (
              <button
                key={i}
                onClick={handleDelete}
                className="w-16 h-16 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors"
              >
                <Delete className="w-6 h-6" />
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => handleNumberClick(num)}
              className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white text-2xl font-medium transition-colors"
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
};