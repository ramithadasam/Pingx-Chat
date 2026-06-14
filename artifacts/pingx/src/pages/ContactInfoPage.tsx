import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { useParams, useLocation } from 'wouter';
import { PageHeader } from '../components/ui/custom/PageHeader';
import { GlassCard } from '../components/ui/custom/GlassCard';
import { SettingsRow } from '../components/ui/custom/SettingsRow';
import { ConfirmModal } from '../components/ui/custom/ConfirmModal';
import { Pen, Image as ImageIcon, Search, Ban, Trash2, Eraser } from 'lucide-react';

export default function ContactInfoPage() {
  const { contacts, removeContact } = useApp();
  const params = useParams();
  const [, setLocation] = useLocation();
  const [modalType, setModalType] = useState<'block' | 'delete' | 'clear' | null>(null);
  const [notifications, setNotifications] = useState(true);
  
  const id = params.id as string;
  const contact = contacts.find(c => c.id === id);

  if (!contact) {
    return <div className="min-h-[100dvh] flex items-center justify-center text-white">Contact not found</div>;
  }

  const handleAction = () => {
    if (modalType === 'block' || modalType === 'delete') {
      removeContact(id);
      setLocation('/home');
    }
    setModalType(null);
  };

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
      className="min-h-[100dvh] relative pb-20 overflow-x-hidden"
    >
      <PageHeader 
        title="Contact Info" 
        rightElement={<span className="text-[#C6FF3B] font-medium cursor-pointer">Edit</span>}
        onBack={() => setLocation(`/chat/${id}`)}
      />
      
      <div className="p-4 flex flex-col items-center">
        <div className="w-32 h-32 rounded-full p-[2px] bg-gradient-to-tr from-[rgba(255,255,255,0.2)] to-[rgba(255,255,255,0.05)] overflow-hidden mb-4">
          <img src={contact.avatar} alt={contact.name} className="w-full h-full rounded-full bg-[#111]" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-1">{contact.name}</h2>
        <p className="text-[rgba(255,255,255,0.6)] mb-3">{contact.phone}</p>
        
        <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full px-4 py-1.5 flex items-center gap-2 mb-8">
          <div className={`w-2 h-2 rounded-full ${contact.status === 'online' ? 'bg-[#C6FF3B]' : 'bg-[rgba(255,255,255,0.3)]'}`} />
          <span className="text-sm font-medium text-white capitalize">{contact.status}</span>
        </div>

        <div className="w-full space-y-6">
          <GlassCard className="overflow-hidden">
            <SettingsRow 
              icon={<Pen className="w-5 h-5 text-[#C6FF3B]" />} 
              label="Edit Name" 
              onClick={() => {}} 
            />
            <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
            <SettingsRow 
              label="Notifications" 
              isToggle 
              toggleChecked={notifications} 
              onToggle={setNotifications} 
            />
            <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
            <SettingsRow 
              label="Privacy" 
              onClick={() => setLocation('/privacy')} 
            />
            <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
            <SettingsRow 
              icon={<ImageIcon className="w-5 h-5" />} 
              label="Media, Links & Docs" 
              rightElement={<span className="text-[rgba(255,255,255,0.6)] flex items-center gap-1">156 <span className="text-xl leading-none font-light">›</span></span>}
              onClick={() => {}} 
            />
            <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
            <SettingsRow 
              icon={<Search className="w-5 h-5" />} 
              label="Search in Chat" 
              onClick={() => {}} 
            />
          </GlassCard>

          <GlassCard className="overflow-hidden border-[#EF4444]/30">
            <SettingsRow 
              icon={<Ban className="w-5 h-5 text-[#EF4444]" />} 
              label="Block Contact" 
              textColor="text-[#EF4444]"
              onClick={() => setModalType('block')} 
            />
            <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
            <SettingsRow 
              icon={<Trash2 className="w-5 h-5 text-[#EF4444]" />} 
              label="Delete Chat" 
              textColor="text-[#EF4444]"
              onClick={() => setModalType('delete')} 
            />
            <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
            <SettingsRow 
              icon={<Eraser className="w-5 h-5 text-[#EF4444]" />} 
              label="Clear Chat" 
              textColor="text-[#EF4444]"
              onClick={() => setModalType('clear')} 
            />
          </GlassCard>
        </div>
      </div>

      <ConfirmModal 
        isOpen={modalType !== null}
        title={
          modalType === 'block' ? 'Block Contact' : 
          modalType === 'delete' ? 'Delete Chat' : 
          'Clear Chat'
        }
        description={
          modalType === 'block' ? `Are you sure you want to block ${contact.name}? They won't be able to message you.` :
          modalType === 'delete' ? `Are you sure you want to delete this chat with ${contact.name}? This action cannot be undone.` :
          `Are you sure you want to clear all messages in this chat?`
        }
        onConfirm={handleAction}
        onCancel={() => setModalType(null)}
      />
    </motion.div>
  );
}