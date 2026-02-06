import { ReactNode } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import Icon from '@/components/ui/icon';

interface AppointmentContextMenuProps {
  children: ReactNode;
  appointment: any;
  onEdit: () => void;
  onReschedule: () => void;
  onClone: () => void;
  onComplete: () => void;
  onCancel: () => void;
}

export function AppointmentContextMenu({
  children,
  appointment,
  onEdit,
  onReschedule,
  onClone,
  onComplete,
  onCancel,
}: AppointmentContextMenuProps) {
  const isScheduled = appointment.status === 'scheduled';
  const isCompleted = appointment.status === 'completed';
  const isCancelled = appointment.status === 'cancelled';

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {isScheduled && (
          <>
            <ContextMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="cursor-pointer gap-2"
            >
              <Icon name="Edit" size={16} className="text-blue-600" />
              <span>Изменить данные</span>
            </ContextMenuItem>
            
            <ContextMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onReschedule();
              }}
              className="cursor-pointer gap-2"
            >
              <Icon name="Calendar" size={16} className="text-purple-600" />
              <span>Перенести на другое время</span>
            </ContextMenuItem>
            
            <ContextMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onClone();
              }}
              className="cursor-pointer gap-2"
            >
              <Icon name="Copy" size={16} className="text-blue-600" />
              <span>Клонировать запись</span>
            </ContextMenuItem>
            
            <ContextMenuSeparator />
            
            <ContextMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
              className="cursor-pointer gap-2"
            >
              <Icon name="CheckCircle" size={16} className="text-green-600" />
              <span>Завершить прием</span>
            </ContextMenuItem>
            
            <ContextMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              className="cursor-pointer gap-2 text-red-600 focus:text-red-700"
            >
              <Icon name="XCircle" size={16} />
              <span>Отменить прием</span>
            </ContextMenuItem>
          </>
        )}
        
        {(isCompleted || isCancelled) && (
          <>
            <ContextMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="cursor-pointer gap-2"
            >
              <Icon name="Edit" size={16} className="text-blue-600" />
              <span>Изменить данные</span>
            </ContextMenuItem>
            
            <ContextMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                onClone();
              }}
              className="cursor-pointer gap-2"
            >
              <Icon name="Copy" size={16} className="text-blue-600" />
              <span>Клонировать запись</span>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
