import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';
import { useLocation } from 'wouter';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: ReactNode;
  onBack?: () => void;
}

export function PageHeader({ title, subtitle, rightElement, onBack }: PageHeaderProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    if (onBack) onBack();
    else setLocation('/home');
  };

  return (
    <div className="flex items-center justify-between p-4 sticky top-0 z-10 bg-[#050505]/80 backdrop-blur-lg">
      <div className="flex items-center gap-3">
        <button 
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          {subtitle && <p className="text-sm text-[rgba(255,255,255,0.6)]">{subtitle}</p>}
        </div>
      </div>
      {rightElement && (
        <div>{rightElement}</div>
      )}
    </div>
  );
}
