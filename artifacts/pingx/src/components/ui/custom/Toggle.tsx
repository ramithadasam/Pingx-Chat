import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: 'green' | 'red';
}

export function Toggle({ checked, onChange, color = 'green' }: ToggleProps) {
  const bgColor = checked ? (color === 'green' ? '#C6FF3B' : '#EF4444') : 'rgba(255,255,255,0.1)';
  
  return (
    <div 
      className="w-12 h-7 rounded-full p-1 cursor-pointer flex items-center transition-colors duration-300"
      style={{ backgroundColor: bgColor }}
      onClick={() => onChange(!checked)}
      data-testid="custom-toggle"
    >
      <motion.div 
        className="w-5 h-5 bg-white rounded-full shadow-sm"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </div>
  );
}
