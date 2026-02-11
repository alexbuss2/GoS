import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { formatCurrency } from '@/lib/currency';
import type { ChartDataPoint, Currency } from '@/types';

interface WealthLineChartProps {
  data: ChartDataPoint[];
  currency: Currency;
}

export const WealthLineChart = ({ data, currency }: WealthLineChartProps) => {
  if (data.length === 0) {
    return (
      <div className="bg-[#1A2744] rounded-2xl p-4 border border-white/10">
        <h3 className="text-white font-semibold mb-4">Servet Değişimi</h3>
        <div className="h-48 flex items-center justify-center text-white/50">
          Henüz veri yok
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A2744] rounded-2xl p-4 border border-white/10">
      <h3 className="text-white font-semibold mb-4">Servet Değişimi</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D9A5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
            />
            <YAxis 
              hide
              domain={['dataMin - 1000', 'dataMax + 1000']}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as ChartDataPoint;
                  return (
                    <div className="bg-[#0A1628] border border-white/20 rounded-lg px-3 py-2">
                      <p className="text-white/70 text-xs">{item.date}</p>
                      <p className="text-white font-medium">{formatCurrency(item.value, currency)}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="url(#lineGradient)"
              fill="url(#wealthGradient)"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00D9A5" />
                <stop offset="100%" stopColor="#D4AF37" />
              </linearGradient>
            </defs>
            <Line
              type="monotone"
              dataKey="value"
              stroke="url(#lineGradient)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};