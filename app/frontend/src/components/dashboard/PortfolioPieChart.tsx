import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getCategoryLabel } from '@/lib/currency';
import type { PieChartData } from '@/types';

interface PortfolioPieChartProps {
  data: PieChartData[];
}

export const PortfolioPieChart = ({ data }: PortfolioPieChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="bg-[#1A2744] rounded-2xl p-4 border border-white/10">
        <h3 className="text-white font-semibold mb-4">Portföy Dağılımı</h3>
        <div className="h-48 flex items-center justify-center text-white/50">
          Henüz varlık eklenmedi
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1A2744] rounded-2xl p-4 border border-white/10">
      <h3 className="text-white font-semibold mb-4">Portföy Dağılımı</h3>
      <div className="flex items-center gap-4">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as PieChartData;
                    const percent = ((item.value / total) * 100).toFixed(1);
                    return (
                      <div className="bg-[#0A1628] border border-white/20 rounded-lg px-3 py-2">
                        <p className="text-white text-sm font-medium">{getCategoryLabel(item.name)}</p>
                        <p className="text-white/70 text-xs">{percent}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-2">
          {data.map((item, index) => {
            const percent = ((item.value / total) * 100).toFixed(1);
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-white/70 text-sm">{getCategoryLabel(item.name)}</span>
                </div>
                <span className="text-white text-sm font-medium">{percent}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};