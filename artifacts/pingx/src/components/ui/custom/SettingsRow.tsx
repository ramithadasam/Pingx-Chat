import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Toggle } from './Toggle';

interface SettingsRowProps {
  icon?: ReactNode;
  label: string;
  description?: string;
  rightElement?: ReactNode;
  isToggle?: boolean;
  toggleChecked?: boolean;
  onToggle?: (checked: boolean) => void;
  onClick?: () => void;
  textColor?: string;
}

export function SettingsRow({ 
  icon, 
  label, 
  description, 
  rightElement,
  isToggle,
  toggleChecked = false,
  onToggle,
  onClick,
  textColor = "text-white"
}: SettingsRowProps) {
  const Wrapper = onClick ? 'button' : 'div';
  
  return (
    <Wrapper 
      className={`w-full flex items-center justify-between p-4 bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] transition-colors ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {icon && <div className="text-[rgba(255,255,255,0.7)]">{icon}</div>}
        <div className="text-left">
          <p className={`font-medium ${textColor}`}>{label}</p>
          {description && <p className="text-sm text-[rgba(255,255,255,0.5)]">{description}</p>}
        </div>
      </div>
      
      <div>
        {isToggle && onToggle ? (
          <Toggle checked={toggleChecked} onChange={onToggle} color={textColor === 'text-[#EF4444]' ? 'red' : 'green'} />
        ) : rightElement ? (
          rightElement
        ) : onClick ? (
          <ChevronRight className="w-5 h-5 text-[rgba(255,255,255,0.4)]" />
        ) : null}
      </div>
    </Wrapper>
  );
}
