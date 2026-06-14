import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function GlassCard({ children, className = '', onClick, ...props }: GlassCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={`bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] backdrop-blur-md rounded-[24px] overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
