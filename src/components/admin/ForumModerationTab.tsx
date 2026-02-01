import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ForumModerationTabProps {
  forumUsers: any[];
  forumTopics: any[];
  onBlockUser: (userId: number) => void;
  onUnblockUser: (userId: number) => void;
  onHideTopic: (topicId: number) => void;
  onUnhideTopic: (topicId: number) => void;
}

const ForumModerationTab = ({ forumUsers, forumTopics, onBlockUser, onUnblockUser, onHideTopic, onUnhideTopic }: ForumModerationTabProps) => {
  return (
    <Tabs defaultValue="users">
      <TabsList>
        <TabsTrigger value="users">Пользователи</TabsTrigger>
        <TabsTrigger value="topics">Темы</TabsTrigger>
      </TabsList>
      <TabsContent value="users">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forumUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${user.is_blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {user.is_blocked ? 'Заблокирован' : 'Активен'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {user.is_blocked ? (
                    <Button size="sm" onClick={() => onUnblockUser(user.id)}>Разблокировать</Button>
                  ) : (
                    <Button size="sm" variant="destructive" onClick={() => onBlockUser(user.id)}>Заблокировать</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
      <TabsContent value="topics">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Автор</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forumTopics.map((topic) => (
              <TableRow key={topic.id}>
                <TableCell>{topic.title}</TableCell>
                <TableCell>{topic.author_name}</TableCell>
                <TableCell>{new Date(topic.created_at).toLocaleDateString('ru-RU')}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${topic.is_hidden ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {topic.is_hidden ? 'Скрыта' : 'Видна'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {topic.is_hidden ? (
                    <Button size="sm" onClick={() => onUnhideTopic(topic.id)}>Показать</Button>
                  ) : (
                    <Button size="sm" variant="destructive" onClick={() => onHideTopic(topic.id)}>Скрыть</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  );
};

export default ForumModerationTab;
