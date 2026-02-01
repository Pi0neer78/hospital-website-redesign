import { useState, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface InstructionCardProps {
  title: string;
  icon: string;
  iconColor: string;
  bgGradient: string;
  borderColor: string;
  children: ReactNode;
}

export const InstructionCard = ({
  title,
  icon,
  iconColor,
  bgGradient,
  borderColor,
  children
}: InstructionCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className={`mb-6 ${bgGradient} ${borderColor}`}>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Icon name={icon} size={24} className={`${iconColor} mt-0.5 flex-shrink-0`} />
          <div className="flex-1">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={() => setIsOpen(!isOpen)}
            >
              <h3 className="text-base font-bold">{title}</h3>
              <Icon 
                name={isOpen ? "ChevronUp" : "ChevronDown"} 
                size={20} 
                className={`${iconColor} flex-shrink-0`}
              />
            </div>
            {isOpen && <div className="mt-3">{children}</div>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
