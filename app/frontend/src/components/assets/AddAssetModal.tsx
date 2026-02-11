import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
import type { Asset, AssetCategory, Currency } from '@/types';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: Partial<Asset>) => void;
  editingAsset?: Asset | null;
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

export const AddAssetModal = ({ isOpen, onClose, onSave, editingAsset }: AddAssetModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'gold' as AssetCategory,
    quantity: '',
    purchase_price: '',
    current_price: '',
    currency: 'TRY' as Currency,
    notes: '',
  });

  useEffect(() => {
    if (editingAsset) {
      setFormData({
        name: editingAsset.name,
        category: editingAsset.category,
        quantity: editingAsset.quantity.toString(),
        purchase_price: editingAsset.purchase_price.toString(),
        current_price: editingAsset.current_price.toString(),
        currency: editingAsset.currency,
        notes: editingAsset.notes || '',
      });
    } else {
      setFormData({
        name: '',
        category: 'gold',
        quantity: '',
        purchase_price: '',
        current_price: '',
        currency: 'TRY',
        notes: '',
      });
    }
  }, [editingAsset, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...editingAsset,
      name: formData.name,
      category: formData.category,
      quantity: parseFloat(formData.quantity),
      purchase_price: parseFloat(formData.purchase_price),
      current_price: parseFloat(formData.current_price),
      currency: formData.currency,
      notes: formData.notes,
      is_sold: false,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A2744] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#00D9A5] to-[#D4AF37] bg-clip-text text-transparent">
            {editingAsset ? 'Varlık Düzenle' : 'Yeni Varlık Ekle'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/70">Varlık Adı</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Örn: Gram Altın, Bitcoin"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value: AssetCategory) => setFormData({ ...formData, category: value })}
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
            <Label htmlFor="quantity" className="text-white/70">Miktar</Label>
            <Input
              id="quantity"
              type="number"
              step="any"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              placeholder="0"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price" className="text-white/70">Alış Fiyatı</Label>
              <Input
                id="purchase_price"
                type="number"
                step="any"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                placeholder="0.00"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_price" className="text-white/70">Güncel Fiyat</Label>
              <Input
                id="current_price"
                type="number"
                step="any"
                value={formData.current_price}
                onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                placeholder="0.00"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-white/70">Notlar (Opsiyonel)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ek notlar..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
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
              {editingAsset ? 'Güncelle' : 'Ekle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};