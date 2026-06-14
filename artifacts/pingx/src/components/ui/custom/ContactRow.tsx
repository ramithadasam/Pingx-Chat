import { Contact } from '../../../types';
import { motion } from 'framer-motion';

interface ContactRowProps {
  contact: Contact;
  onClick?: () => void;
}

export function ContactRow({ contact, onClick }: ContactRowProps) {
  return (
    <motion.div 
      className="flex items-center gap-4 p-3 hover:bg-[rgba(255,255,255,0.05)] rounded-2xl cursor-pointer transition-colors"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative">
        <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.1)]" />
        {contact.status === 'online' && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#C6FF3B] rounded-full border-2 border-[#050505]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-medium text-[15px] truncate">{contact.name}</h3>
        <p className="text-[rgba(255,255,255,0.6)] text-sm truncate">{contact.lastMessage}</p>
      </div>
      <div className="text-[rgba(255,255,255,0.4)] text-xs whitespace-nowrap">
        {contact.lastMessageTime}
      </div>
    </motion.div>
  );
}
