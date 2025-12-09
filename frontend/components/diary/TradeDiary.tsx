// frontend/components/diary/TradeDiary.tsx
'use client';

import { useState } from 'react';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Edit,
  Trash2,
  Plus,
  Filter,
  Download,
  BarChart2
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface Trade {
  id: string;
  date: string;
  asset: string;
  type: 'buy' | 'sell';
  entry: number;
  exit: number;
  quantity: number;
  profit: number;
  notes: string;
  tags: string[];
}

export default function TradeDiary() {
  const [trades, setTrades] = useState<Trade[]>([
    {
      id: '1',
      date: '2024-01-15',
      asset: 'BTC/USDT',
      type: 'buy',
      entry: 42000,
      exit: 45000,
      quantity: 0.1,
      profit: 300,
      notes: 'Entrada após suporte em MA50',
      tags: ['swing', 'btc', 'technical']
    },
    {
      id: '2',
      date: '2024-01-16',
      asset: 'ETH/USDT',
      type: 'sell',
      entry: 2500,
      exit: 2400,
      quantity: 1,
      profit: 100,
      notes: 'Short em resistência',
      tags: ['daytrade', 'eth']
    }
  ]);
  
  const [newTrade, setNewTrade] = useState<Partial<Trade>>({
    date: new Date().toISOString().split('T')[0],
    type: 'buy',
    asset: '',
    entry: 0,
    exit: 0,
    quantity: 1,
    notes: '',
    tags: []
  });
  
  const { isDark } = useTheme();

  const calculateProfit = (trade: Partial<Trade>) => {
    if (!trade.entry || !trade.exit || !trade.quantity) return 0;
    const diff = trade.exit - trade.entry;
    return diff * trade.quantity * (trade.type === 'sell' ? -1 : 1);
  };

  const handleAddTrade = () => {
    if (!newTrade.asset || !newTrade.entry || !newTrade.exit) return;
    
    const profit = calculateProfit(newTrade);
    const trade: Trade = {
      id: Date.now().toString(),
      date: newTrade.date || new Date().toISOString().split('T')[0],
      asset: newTrade.asset,
      type: newTrade.type || 'buy',
      entry: newTrade.entry,
      exit: newTrade.exit,
      quantity: newTrade.quantity || 1,
      profit,
      notes: newTrade.notes || '',
      tags: newTrade.tags || []
    };
    
    setTrades([trade, ...trades]);
    setNewTrade({
      date: new Date().toISOString().split('T')[0],
      type: 'buy',
      asset: '',
      entry: 0,
      exit: 0,
      quantity: 1,
      notes: '',
      tags: []
    });
  };

  const handleDeleteTrade = (id: string) => {
    setTrades(trades.filter(trade => trade.id !== id));
  };

  const totalProfit = trades.reduce((sum, trade) => sum + trade.profit, 0);
  const winRate = trades.length > 0 
    ? (trades.filter(t => t.profit > 0).length / trades.length * 100).toFixed(1)
    : '0.0';

  return (
    <div className="h-full p-6 bg-white dark:bg-gray-900 rounded-lg">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Formulário para novo trade */}
        <div className="lg:w-1/3">
          <div className={`
            p-6
            rounded-xl
            border
            ${isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-gray-50 border-gray-200'
            }
          `}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`
                w-10 h-10
                rounded-lg
                flex items-center justify-center
                ${isDark 
                  ? 'bg-primary-800/30 text-primary-400' 
                  : 'bg-primary-100 text-primary-600'
                }
              `}>
                <Plus className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Novo Trade
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={newTrade.date}
                    onChange={(e) => setNewTrade({...newTrade, date: e.target.value})}
                    className={`
                      w-full
                      px-3 py-2
                      rounded-lg
                      border
                      focus:outline-none focus:ring-2 focus:ring-primary-500
                      ${isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-800'
                      }
                    `}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo
                  </label>
                  <select
                    value={newTrade.type}
                    onChange={(e) => setNewTrade({...newTrade, type: e.target.value as 'buy' | 'sell'})}
                    className={`
                      w-full
                      px-3 py-2
                      rounded-lg
                      border
                      focus:outline-none focus:ring-2 focus:ring-primary-500
                      ${isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-800'
                      }
                    `}
                  >
                    <option value="buy">Compra</option>
                    <option value="sell">Venda</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ativo
                </label>
                <input
                  type="text"
                  value={newTrade.asset}
                  onChange={(e) => setNewTrade({...newTrade, asset: e.target.value})}
                  placeholder="Ex: BTC/USDT"
                  className={`
                    w-full
                    px-3 py-2
                    rounded-lg
                    border
                    focus:outline-none focus:ring-2 focus:ring-primary-500
                    ${isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-800'
                    }
                  `}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Entrada ($)
                  </label>
                  <input
                    type="number"
                    value={newTrade.entry}
                    onChange={(e) => setNewTrade({...newTrade, entry: parseFloat(e.target.value)})}
                    className={`
                      w-full
                      px-3 py-2
                      rounded-lg
                      border
                      focus:outline-none focus:ring-2 focus:ring-primary-500
                      ${isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-800'
                      }
                    `}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Saída ($)
                  </label>
                  <input
                    type="number"
                    value={newTrade.exit}
                    onChange={(e) => setNewTrade({...newTrade, exit: parseFloat(e.target.value)})}
                    className={`
                      w-full
                      px-3 py-2
                      rounded-lg
                      border
                      focus:outline-none focus:ring-2 focus:ring-primary-500
                      ${isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-800'
                      }
                    `}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantidade
                </label>
                <input
                  type="number"
                  value={newTrade.quantity}
                  onChange={(e) => setNewTrade({...newTrade, quantity: parseFloat(e.target.value)})}
                  step="0.01"
                  className={`
                    w-full
                    px-3 py-2
                    rounded-lg
                    border
                    focus:outline-none focus:ring-2 focus:ring-primary-500
                    ${isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-800'
                    }
                  `}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notas
                </label>
                <textarea
                  value={newTrade.notes}
                  onChange={(e) => setNewTrade({...newTrade, notes: e.target.value})}
                  rows={3}
                  className={`
                    w-full
                    px-3 py-2
                    rounded-lg
                    border
                    focus:outline-none focus:ring-2 focus:ring-primary-500
                    ${isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-800'
                    }
                  `}
                  placeholder="Observações sobre o trade..."
                />
              </div>

              <button
                onClick={handleAddTrade}
                className={`
                  w-full
                  py-3
                  rounded-lg
                  font-medium
                  transition-all
                  duration-200
                  ${isDark
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                  }
                  shadow-sm hover:shadow-md
                `}
              >
                Adicionar Trade
              </button>
            </div>
          </div>
        </div>

        {/* Lista de trades */}
        <div className="lg:w-2/3">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Histórico de Trades
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Registre e analise suas operações
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button className={`
                  px-4 py-2
                  rounded-lg
                  flex items-center gap-2
                  transition-colors
                  ${isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }
                `}>
                  <Filter className="w-4 h-4" />
                  Filtrar
                </button>
                <button className={`
                  px-4 py-2
                  rounded-lg
                  flex items-center gap-2
                  transition-colors
                  ${isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }
                `}>
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
              </div>
            </div>

            {/* Cards de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`
                p-4
                rounded-xl
                border
                ${isDark 
                  ? 'bg-gray-800/50 border-gray-700' 
                  : 'bg-white border-gray-200'
                }
              `}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Lucro Total</p>
                    <p className={`text-2xl font-bold ${
                      totalProfit >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      ${totalProfit.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className={`w-8 h-8 ${
                    totalProfit >= 0 
                      ? 'text-green-500 dark:text-green-400' 
                      : 'text-red-500 dark:text-red-400'
                  }`} />
                </div>
              </div>

              <div className={`
                p-4
                rounded-xl
                border
                ${isDark 
                  ? 'bg-gray-800/50 border-gray-700' 
                  : 'bg-white border-gray-200'
                }
              `}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Acerto</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {winRate}%
                    </p>
                  </div>
                  <BarChart2 className="w-8 h-8 text-primary-500" />
                </div>
              </div>

              <div className={`
                p-4
                rounded-xl
                border
                ${isDark 
                  ? 'bg-gray-800/50 border-gray-700' 
                  : 'bg-white border-gray-200'
                }
              `}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Trades</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {trades.length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-primary-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabela de trades */}
          <div className={`
            rounded-xl
            border
            overflow-hidden
            ${isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
            }
          `}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`
                    ${isDark 
                      ? 'bg-gray-900/50' 
                      : 'bg-gray-50'
                    }
                  `}>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Data
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Ativo
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Tipo
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Lucro
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <tr 
                      key={trade.id}
                      className={`
                        border-t
                        ${isDark 
                          ? 'border-gray-700 hover:bg-gray-800/50' 
                          : 'border-gray-100 hover:bg-gray-50'
                        }
                      `}
                    >
                      <td className="p-4 text-gray-600 dark:text-gray-400">
                        {trade.date}
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-gray-800 dark:text-white">
                          {trade.asset}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {trade.type === 'buy' ? (
                            <TrendingUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`font-medium ${
                            trade.type === 'buy' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {trade.type === 'buy' ? 'Compra' : 'Venda'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`font-bold ${
                          trade.profit >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          ${trade.profit.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button className={`
                            p-1.5
                            rounded
                            transition-colors
                            ${isDark
                              ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                            }
                          `}>
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTrade(trade.id)}
                            className={`
                              p-1.5
                              rounded
                              transition-colors
                              hover:bg-red-50 dark:hover:bg-red-900/20
                              text-red-500 hover:text-red-600 dark:hover:text-red-400
                            `}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}