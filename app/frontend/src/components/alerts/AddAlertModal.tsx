import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { PriceAlert, AssetCategory, Currency } from '@/types';

interface AddAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (alert: Partial<PriceAlert>) => void;
}

const categories: { value: AssetCategory; label: string }[] = [
  { value: 'gold', label: 'Altın' },
  { value: 'crypto', label: 'Kripto Para' },
  { value: 'stock', label: 'Hisse Senedi' },
  { value: 'currency', label: 'Döviz' },
  { value: 'other', label: 'Diğer' },
];

const currencies: { value: Currency; label: string }[] = [
  { value: 'TRY', label: '₺ Türk Lirası' },
  { value: 'USD', label: '$ Amerikan Doları' },
  { value: 'EUR', label: '€ Euro' },
];

export const AddAlertModal = ({ isOpen, onClose, onSave }: AddAlertModalProps) => {
  const [formData, setFormData] = useState({
    asset_name: '',
    asset_category: 'gold' as AssetCategory,
    target_price: '',
    condition: 'above' as 'above' | 'below',
    currency: 'TRY' as Currency,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      asset_name: formData.asset_name,
      asset_category: formData.asset_category,
      target_price: parseFloat(formData.target_price),
      condition: formData.condition,
      currency: formData.currency,
      is_active: true,
      is_triggered: false,
    });
    setFormData({
      asset_name: '',
      asset_category: 'gold',
      target_price: '',
      condition: 'above',
      currency: 'TRY',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A2744] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] bg-clip-text text-transparent">
            Yeni Fiyat Alarmı
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="asset_name" className="text-white/70">Varlık Adı</Label>
            <Input
              id="asset_name"
              value={formData.asset_name}
              onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
              placeholder="Örn: Gram Altın, Bitcoin"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70">Kategori</Label>
              <Select
                value={formData.asset_category}
                onValueChange={(value: AssetCategory) => setFormData({ ...formData, asset_category: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A2744] border-white/10">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-white/10">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Para Birimi</Label>
              <Select
                value={formData.currency}
                onValueChange={(value: Currency) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A2744] border-white/10">
                  {currencies.map((cur) => (
                    <SelectItem key={cur.value} value={cur.value} className="text-white hover:bg-white/10">
                      {cur.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white/70">Alarm Koşulu</Label>
            <Select
              value={formData.condition}
              onValueChange={(value: 'above' | 'below') => setFormData({ ...formData, condition: value })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A2744] border-white/10">
                <SelectItem value="above" className="text-white hover:bg-white/10">
                  Fiyat üstüne çıkarsa
                </SelectItem>
                <SelectItem value="below" className="text-white hover:bg-white/10">
                  Fiyat altına düşerse
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_price" className="text-white/70">Hedef Fiyat</Label>
            <Input
              id="target_price"
              type="number"
              step="any"
              value={formData.target_price}
              onChange={(e) => setFormData({ ...formData, target_price: e.target.value })}
              placeholder="0.00"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              İptal
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] text-white hover:opacity-90"
            >
              Alarm Oluştur
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};