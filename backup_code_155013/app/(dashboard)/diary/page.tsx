import TradeDiary from '@/components/diary/TradeDiary'

export default function DiaryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900"> Diário de Trade</h1>
        <p className="text-gray-600 mt-2">
          Registre, analise e aprenda com suas operações
        </p>
      </div>
      <TradeDiary />
    </div>
  )
}
