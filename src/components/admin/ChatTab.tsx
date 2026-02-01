import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ChatTabProps {
  chats: any[];
  selectedChat: any;
  setSelectedChat: (chat: any) => void;
  chatMessages: any[];
  operatorMessage: string;
  setOperatorMessage: (msg: string) => void;
  operatorName: string;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  newChatsCount: number;
  onSendMessage: (e: React.FormEvent) => void;
  onArchiveChat: (chatId: number) => void;
}

const ChatTab = ({ chats, selectedChat, setSelectedChat, chatMessages, operatorMessage, setOperatorMessage, operatorName, showArchived, setShowArchived, newChatsCount, onSendMessage, onArchiveChat }: ChatTabProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 h-[600px]">
      <div className="col-span-1 border rounded-lg p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Чаты {newChatsCount > 0 && <span className="ml-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs">{newChatsCount}</span>}</h3>
          <Button size="sm" variant="outline" onClick={() => setShowArchived(!showArchived)}>
            {showArchived ? 'Активные' : 'Архив'}
          </Button>
        </div>
        <div className="space-y-2">
          {chats.map((chat) => (
            <Card key={chat.id} className={`p-3 cursor-pointer hover:bg-accent ${selectedChat?.id === chat.id ? 'bg-accent' : ''}`} onClick={() => setSelectedChat(chat)}>
              <p className="font-medium">{chat.user_name}</p>
              <p className="text-xs text-muted-foreground">{new Date(chat.created_at).toLocaleString('ru-RU')}</p>
              {chat.unread_count > 0 && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">{chat.unread_count}</span>}
            </Card>
          ))}
        </div>
      </div>
      <div className="col-span-2 border rounded-lg p-4 flex flex-col">
        {selectedChat ? (
          <>
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <div>
                <h3 className="font-bold">{selectedChat.user_name}</h3>
                <p className="text-sm text-muted-foreground">{selectedChat.email}</p>
              </div>
              <Button size="sm" onClick={() => onArchiveChat(selectedChat.id)}>Архивировать</Button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 mb-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'operator' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender === 'operator' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="text-xs font-medium mb-1">{msg.sender_name}</p>
                    <p>{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">{new Date(msg.created_at).toLocaleTimeString('ru-RU')}</p>
                  </div>
                </div>
              ))}
              <div id="chat-scroll-anchor" />
            </div>
            <form onSubmit={onSendMessage} className="flex gap-2">
              <Input placeholder="Сообщение..." value={operatorMessage} onChange={(e) => setOperatorMessage(e.target.value)} />
              <Button type="submit"><Icon name="Send" size={18} /></Button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Выберите чат
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatTab;
