import ChatInterface from '@/components/chat/ChatInterface'

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900"> Chat com Mentor</h1>
        <p className="text-gray-600 mt-2">
          Converse com o mentor de trading especialista em NTSL
        </p>
      </div>
      <ChatInterface />
    </div>
  )
}
