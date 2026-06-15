import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUpdateStatus } from '@workspace/api-client-react';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/ui/custom/PageHeader';
import { GlassCard } from '../components/ui/custom/GlassCard';
import { SettingsRow } from '../components/ui/custom/SettingsRow';
import { toast } from 'sonner';

export default function StatusPage() {
  const { user } = useApp();
  const [localStatus, setLocalStatus] = useState<'online' | 'offline'>(user?.status === 'offline' ? 'offline' : 'online');
  const updateStatus = useUpdateStatus();

  const handleSave = () => {
    updateStatus.mutate({ status: localStatus }, {
      onSuccess: () => toast.success('Status updated'),
      onError: () => toast.error('Failed to update status'),
    });
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
      className="min-h-[100dvh] relative pb-20"
    >
      <PageHeader title="Status" />

      <div className="p-4 space-y-6">
        <GlassCard className="overflow-hidden">
          <div className="p-4 flex justify-between items-center hover:bg-[rgba(255,255,255,0.05)] cursor-pointer" onClick={() => setLocalStatus('online')}>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#C6FF3B]" />
              <span className="text-white font-medium">Online</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${localStatus === 'online' ? 'border-[#C6FF3B]' : 'border-[rgba(255,255,255,0.3)]'}`}>
              {localStatus === 'online' && <div className="w-3 h-3 bg-[#C6FF3B] rounded-full" />}
            </div>
          </div>
          <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
          <div className="p-4 flex justify-between items-center hover:bg-[rgba(255,255,255,0.05)] cursor-pointer" onClick={() => setLocalStatus('offline')}>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
              <span className="text-white font-medium">Offline</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${localStatus === 'offline' ? 'border-[#EF4444]' : 'border-[rgba(255,255,255,0.3)]'}`}>
              {localStatus === 'offline' && <div className="w-3 h-3 bg-[#EF4444] rounded-full" />}
            </div>
          </div>
        </GlassCard>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={updateStatus.isPending}
          className="w-full py-4 bg-[#C6FF3B] text-[#050505] rounded-full font-semibold text-lg hover:bg-[#b0eb2d] transition-colors mt-8"
        >
          {updateStatus.isPending ? 'Saving...' : 'Save Status'}
        </motion.button>
      </div>
    </motion.div>
  );
}
