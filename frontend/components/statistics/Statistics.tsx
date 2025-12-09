// frontend/components/statistics/Statistics.tsx
'use client';

import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Activity,
  PieChart,
  BarChart3,
  Calendar,
  ArrowUp,
  ArrowDown,
  TrendingDown
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Statistics() {
  const { isDark } = useTheme();

  const metrics = [
    {
      title: 'Lucro Total',
      value: '$2,450.80',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      title: 'Taxa de Acerto',
      value: '68.2%',
      change: '+3.2%',
      trend: 'up',
      icon: Target,
      color: 'text-blue-500'
    },
    {
      title: 'Média por Trade',
      value: '$124.50',
      change: '-2.1%',
      trend: 'down',
      icon: TrendingUp,
      color: 'text-purple-500'
    },
    {
      title: 'Trades/Mês',
      value: '24',
      change: '+8.3%',
      trend: 'up',
      icon: Activity,
      color: 'text-orange-500'
    }
  ];

  const performanceData = [
    { month: 'Jan', profit: 1200 },
    { month: 'Fev', profit: 1800 },
    { month: 'Mar', profit: 1450 },
    { month: 'Abr', profit: 2200 },
    { month: 'Mai', profit: 1950 },
    { month: 'Jun', profit: 2450 },
  ];

  const assetDistribution = [
    { asset: 'BTC', percentage: 45, color: 'bg-orange-500' },
    { asset: 'ETH', percentage: 25, color: 'bg-blue-400' },
    { asset: 'SOL', percentage: 15, color: 'bg-purple-500' },
    { asset: 'Outros', percentage: 15, color: 'bg-gray-500' },
  ];

  const recentTrades = [
    { id: 1, asset: 'BTC/USDT', profit: 320, type: 'win' },
    { id: 2, asset: 'ETH/USDT', profit: -120, type: 'loss' },
    { id: 3, asset: 'SOL/USDT', profit: 180, type: 'win' },
    { id: 4, asset: 'BNB/USDT', profit: 95, type: 'win' },
    { id: 5, asset: 'XRP/USDT', profit: -65, type: 'loss' },
  ];

  return (
    <div className="h-full p-6 bg-white dark:bg-gray-900 rounded-lg">
      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Estatísticas Detalhadas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Análise completa do seu desempenho de trading
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select className={`
              px-4 py-2
              rounded-lg
              border
              focus:outline-none focus:ring-2 focus:ring-primary-500
              ${isDark
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-800'
              }
            `}>
              <option>Últimos 30 dias</option>
              <option>Últimos 90 dias</option>
              <option>Este ano</option>
            </select>
            <button className={`
              px-4 py-2
              rounded-lg
              flex items-center gap-2
              transition-colors
              ${isDark
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-primary-500 hover:bg-primary-600 text-white'
              }
            `}>
              <Calendar className="w-4 h-4" />
              Exportar Dados
            </button>
          </div>
        </div>
      </div>

      {/* Grid de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className={`
                p-6
                rounded-xl
                border
                ${isDark 
                  ? 'bg-gray-800/50 border-gray-700' 
                  : 'bg-white border-gray-200'
                }
                transition-transform hover:scale-[1.02]
              `}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  metric.trend === 'up' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {metric.trend === 'up' ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  {metric.change}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                {metric.value}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {metric.title}
              </p>
            </div>
          );
        })}
      </div>

      {/* Gráficos e distribuição */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Gráfico de desempenho */}
        <div className={`
          lg:col-span-2
          p-6
          rounded-xl
          border
          ${isDark 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white border-gray-200'
          }
        `}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Desempenho Mensal
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Evolução do lucro ao longo do tempo
              </p>
            </div>
            <BarChart3 className="w-6 h-6 text-primary-500" />
          </div>
          
          <div className="flex items-end h-48 gap-2 pt-4">
            {performanceData.map((item, index) => {
              const maxProfit = Math.max(...performanceData.map(d => d.profit));
              const height = (item.profit / maxProfit) * 100;
              
              return (
                <div key={item.month} className="flex-1 flex flex-col items-center">
                  <div
                    className={`
                      w-full
                      rounded-t-lg
                      transition-all
                      hover:opacity-80
                      ${isDark
                        ? 'bg-gradient-to-t from-primary-800 to-primary-600'
                        : 'bg-gradient-to-t from-primary-500 to-primary-300'
                      }
                    `}
                    style={{ height: `${height}%` }}
                  />
                  <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {item.month}
                  </span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    ${item.profit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribuição de ativos */}
        <div className={`
          p-6
          rounded-xl
          border
          ${isDark 
            ? 'bg-gray-800/50 border-gray-700' 
            : 'bg-white border-gray-200'
          }
        `}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Distribuição
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Alocação por ativo
              </p>
            </div>
            <PieChart className="w-6 h-6 text-primary-500" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative w-48 h-48">
                {assetDistribution.map((item, index, array) => {
                  const totalPercentage = array
                    .slice(0, index)
                    .reduce((sum, i) => sum + i.percentage, 0);
                  
                  return (
                    <div
                      key={item.asset}
                      className="absolute inset-0 rounded-full"
                      style={{
                        clipPath: `conic-gradient(${item.color} 0% ${item.percentage}%, transparent ${item.percentage}% 100%)`,
                        transform: `rotate(${totalPercentage * 3.6}deg)`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-3">
              {assetDistribution.map((item) => (
                <div key={item.asset} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {item.asset}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trades recentes */}
      <div className={`
        p-6
        rounded-xl
        border
        ${isDark 
          ? 'bg-gray-800/50 border-gray-700' 
          : 'bg-white border-gray-200'
        }
      `}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Trades Recentes
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Últimas operações realizadas
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Últimos 5 trades
          </div>
        </div>
        
        <div className="space-y-3">
          {recentTrades.map((trade) => (
            <div
              key={trade.id}
              className={`
                flex items-center justify-between
                p-4
                rounded-lg
                transition-colors
                ${isDark 
                  ? 'hover:bg-gray-800' 
                  : 'hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`
                  w-10 h-10
                  rounded-lg
                  flex items-center justify-center
                  ${trade.type === 'win'
                    ? isDark
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-green-100 text-green-600'
                    : isDark
                      ? 'bg-red-900/30 text-red-400'
                      : 'bg-red-100 text-red-600'
                  }
                `}>
                  {trade.type === 'win' ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    {trade.asset}
                  </h4>
                  <p className={`text-sm font-medium ${
                    trade.type === 'win'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {trade.type === 'win' ? 'Lucro' : 'Prejuízo'}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  trade.type === 'win'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {trade.type === 'win' ? '+' : ''}${trade.profit}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {trade.type === 'win' ? 'Ganho' : 'Perda'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}