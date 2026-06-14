import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/ui/custom/PageHeader';
import { GlassCard } from '../components/ui/custom/GlassCard';
import { SettingsRow } from '../components/ui/custom/SettingsRow';
import { toast } from 'sonner';

export default function StatusPage() {
  const { settings, updateSettings } = useApp();

  const handleSave = () => {
    toast.success('Status updated');
  };

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
      className="min-h-[100dvh] relative pb-20"
    >
      <PageHeader title="Status" />
      
      <div className="p-4 space-y-6">
        <GlassCard className="overflow-hidden">
          <div className="p-4 flex justify-between items-center hover:bg-[rgba(255,255,255,0.05)] cursor-pointer" onClick={() => updateSettings({ userStatus: 'online' })}>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#C6FF3B]" />
              <span className="text-white font-medium">Online</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${settings.userStatus === 'online' ? 'border-[#C6FF3B]' : 'border-[rgba(255,255,255,0.3)]'}`}>
              {settings.userStatus === 'online' && <div className="w-3 h-3 bg-[#C6FF3B] rounded-full" />}
            </div>
          </div>
          <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
          <div className="p-4 flex justify-between items-center hover:bg-[rgba(255,255,255,0.05)] cursor-pointer" onClick={() => updateSettings({ userStatus: 'offline' })}>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
              <span className="text-white font-medium">Offline</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${settings.userStatus === 'offline' ? 'border-[#EF4444]' : 'border-[rgba(255,255,255,0.3)]'}`}>
              {settings.userStatus === 'offline' && <div className="w-3 h-3 bg-[#EF4444] rounded-full" />}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="overflow-hidden">
          <SettingsRow 
            label="Show Offline Status" 
            description="Allow others to see when you are offline"
            isToggle 
            toggleChecked={settings.showOfflineStatus} 
            onToggle={(v) => updateSettings({ showOfflineStatus: v })} 
            textColor="text-[#EF4444]"
          />
        </GlassCard>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          className="w-full py-4 bg-[#C6FF3B] text-[#050505] rounded-full font-semibold text-lg hover:bg-[#b0eb2d] transition-colors mt-8"
        >
          Save Status
        </motion.button>
      </div>
    </motion.div>
  );
}