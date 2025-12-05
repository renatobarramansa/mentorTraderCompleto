export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900"> Análises</h1>
        <p className="text-gray-600 mt-2">
          Estatísticas e insights sobre seu desempenho
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Estatísticas */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4"> Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Operações Totais</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxa de Acerto</span>
              <span className="font-semibold text-green-600">0%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Resultado Total</span>
              <span className="font-semibold">R$ 0,00</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4"> Métricas</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Expectativa Matemática</span>
              <span className="font-semibold">-</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sharpe Ratio</span>
              <span className="font-semibold">-</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Drawdown Máximo</span>
              <span className="font-semibold">-</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4"> Histórico</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Melhor Dia</span>
              <span className="font-semibold text-green-600">-</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pior Dia</span>
              <span className="font-semibold text-red-600">-</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sequência Atual</span>
              <span className="font-semibold">-</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4"> Análise Mensal</h3>
        <div className="text-center py-8 text-gray-500">
          <p>Importe operações do seu diário para ver análises detalhadas</p>
          <a href="/dashboard/diary" className="mt-4 inline-block text-purple-600 hover:text-purple-700 font-medium">
            Ir para o Diário 
          </a>
        </div>
      </div>
    </div>
  )
}
