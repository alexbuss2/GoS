import { ExternalLink, Newspaper } from 'lucide-react';
import type { NewsItem } from '@/types';

interface NewsFeedProps {
  news: NewsItem[];
}

// Mock news data for demo
const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Altın fiyatları rekor seviyeye ulaştı',
    source: 'Bloomberg',
    url: '#',
    publishedAt: '2 saat önce',
    category: 'gold',
  },
  {
    id: '2',
    title: 'Bitcoin 100.000 doları aştı',
    source: 'CoinDesk',
    url: '#',
    publishedAt: '4 saat önce',
    category: 'crypto',
  },
  {
    id: '3',
    title: 'Merkez Bankası faiz kararını açıkladı',
    source: 'Reuters',
    url: '#',
    publishedAt: '6 saat önce',
    category: 'economy',
  },
  {
    id: '4',
    title: 'Ethereum 2.0 güncellemesi tamamlandı',
    source: 'CryptoNews',
    url: '#',
    publishedAt: '8 saat önce',
    category: 'crypto',
  },
];

const getCategoryBadgeColor = (category: string) => {
  switch (category) {
    case 'gold':
      return 'bg-[#D4AF37]/20 text-[#D4AF37]';
    case 'crypto':
      return 'bg-[#F7931A]/20 text-[#F7931A]';
    case 'economy':
      return 'bg-[#3B82F6]/20 text-[#3B82F6]';
    default:
      return 'bg-white/10 text-white/70';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'gold':
      return 'Altın';
    case 'crypto':
      return 'Kripto';
    case 'economy':
      return 'Ekonomi';
    default:
      return category;
  }
};

export const NewsFeed = ({ news = mockNews }: NewsFeedProps) => {
  return (
    <div className="bg-[#1A2744] rounded-2xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-5 h-5 text-[#00D9A5]" />
        <h3 className="text-white font-semibold">Ekonomi Haberleri</h3>
      </div>
      <div className="space-y-3">
        {news.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-white text-sm font-medium line-clamp-2 group-hover:text-[#00D9A5] transition-colors">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${getCategoryBadgeColor(item.category)}`}>
                    {getCategoryLabel(item.category)}
                  </span>
                  <span className="text-white/40 text-xs">{item.source}</span>
                  <span className="text-white/40 text-xs">• {item.publishedAt}</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-[#00D9A5] transition-colors flex-shrink-0" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};