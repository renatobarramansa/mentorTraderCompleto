// frontend/components/trader/TraderConfig.tsx
'use client';

import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { User, Target, Settings } from 'lucide-react';

interface TraderConfigProps {
  traderName: string;
  traderLevel: 'iniciante' | 'intermediario' | 'avancado' | 'profissional';
  onSave: (name: string, level: 'iniciante' | 'intermediario' | 'avancado' | 'profissional') => void;
}

export default function TraderConfig({ 
  traderName: initialName, 
  traderLevel: initialLevel,
  onSave 
}: TraderConfigProps) {
  const [name, setName] = useState(initialName);
  const [level, setLevel] = useState(initialLevel);
  const [isEditing, setIsEditing] = useState(false);
  const { isDark } = useTheme();

  const handleSave = () => {
    onSave(name, level);
    setIsEditing(false);
  };

  const levelLabels = {
    iniciante: 'Iniciante',
    intermediario: 'Intermediário',
    avancado: 'Avançado',
    profissional: 'Profissional'
  };

  if (!isEditing) {
    return (
      <div className={`
        p-4
        rounded-lg
        border
        flex items-center justify-between
        ${isDark 
          ? 'bg-gray-800/50 border-gray-700' 
          : 'bg-gray-50 border-gray-200'
        }
      `}>
        <div className="flex items-center gap-4">
          <div className={`
            w-12 h-12
            rounded-full
            flex items-center justify-center
            ${isDark 
              ? 'bg-primary-800/30 text-primary-400' 
              : 'bg-primary-100 text-primary-600'
            }
          `}>
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-white">
              {name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Target className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {levelLabels[level]}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className={`
            p-2
            rounded-lg
            transition-colors
            ${isDark
              ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
              : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
            }
          `}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className={`
      p-6
      rounded-lg
      border
      ${isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
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
          <User className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 dark:text-white">
            Configuração do Trader
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configure seu perfil para respostas personalizadas
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Seu Nome ou Apelido
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João Trader"
            className={`
              w-full
              px-4 py-3
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Seu Nível de Experiência
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(['iniciante', 'intermediario', 'avancado', 'profissional'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`
                  p-3
                  rounded-lg
                  border
                  text-center
                  transition-all
                  duration-200
                  ${level === lvl
                    ? isDark
                      ? 'bg-primary-900/30 border-primary-600 ring-2 ring-primary-500/30'
                      : 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                    : isDark
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }
                `}
              >
                <div className="font-medium text-gray-800 dark:text-white">
                  {levelLabels[lvl]}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className={`
              flex-1
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
            Salvar Configuração
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setName(initialName);
              setLevel(initialLevel);
            }}
            className={`
              px-6 py-3
              rounded-lg
              font-medium
              transition-colors
              ${isDark
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }
            `}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}