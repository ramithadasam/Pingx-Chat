import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useGetMe, useUpdateSettings } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/ui/custom/PageHeader';
import { GlassCard } from '../components/ui/custom/GlassCard';
import { SettingsRow } from '../components/ui/custom/SettingsRow';
import { Bell, Info } from 'lucide-react';
import type { NotificationSettings } from '@workspace/api-client-react';

export default function NotificationsPage() {
  const { data } = useGetMe({ query: { queryKey: ["/api/users/me"] } });
  const queryClient = useQueryClient();
  const updateSettings = useUpdateSettings();
  const [pending, setPending] = useState<Partial<NotificationSettings>>({});

  const settings = { ...data?.settings, ...pending };

  const toggle = (key: keyof NotificationSettings, value: boolean) => {
    const update = { [key]: value };
    setPending(p => ({ ...p, ...update }));
    updateSettings.mutate(update, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/users/me"] }),
    });
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
      className="min-h-[100dvh] relative pb-20"
    >
      <PageHeader title="Notifications" rightElement={<Bell className="w-6 h-6 text-[#14b8a6]" />} />

      <div className="p-4 space-y-6">
        <GlassCard className="overflow-hidden">
          <SettingsRow
            label="Enable Notifications"
            isToggle
            toggleChecked={settings.notificationsEnabled ?? true}
            onToggle={(v) => toggle('notificationsEnabled', v)}
          />
        </GlassCard>

        {(settings.notificationsEnabled ?? true) && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h3 className="text-[rgba(255,255,255,0.5)] text-sm font-medium ml-4 mb-2 uppercase tracking-wider">Message Notifications</h3>
              <GlassCard className="overflow-hidden">
                <SettingsRow label="Message Notifications" isToggle toggleChecked={settings.messageNotifications ?? true} onToggle={(v) => toggle('messageNotifications', v)} />
                <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
                <SettingsRow label="Group Notifications" isToggle toggleChecked={settings.groupNotifications ?? true} onToggle={(v) => toggle('groupNotifications', v)} />
                <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
                <SettingsRow label="Mentions" isToggle toggleChecked={settings.mentions ?? true} onToggle={(v) => toggle('mentions', v)} />
              </GlassCard>
            </div>

            <div>
              <h3 className="text-[rgba(255,255,255,0.5)] text-sm font-medium ml-4 mb-2 uppercase tracking-wider">Other Notifications</h3>
              <GlassCard className="overflow-hidden">
                <SettingsRow label="Friend Requests" isToggle toggleChecked={settings.friendRequests ?? true} onToggle={(v) => toggle('friendRequests', v)} />
                <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
                <SettingsRow label="New Friends" isToggle toggleChecked={settings.newFriends ?? true} onToggle={(v) => toggle('newFriends', v)} />
                <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
                <SettingsRow label="App Updates" isToggle toggleChecked={settings.appUpdates ?? false} onToggle={(v) => toggle('appUpdates', v)} />
                <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
                <SettingsRow label="Promotions" isToggle toggleChecked={settings.promotions ?? false} onToggle={(v) => toggle('promotions', v)} />
              </GlassCard>
            </div>

            <div>
              <h3 className="text-[rgba(255,255,255,0.5)] text-sm font-medium ml-4 mb-2 uppercase tracking-wider">Quiet Hours</h3>
              <GlassCard className="overflow-hidden">
                <SettingsRow label="Quiet Hours" isToggle toggleChecked={settings.quietHours ?? false} onToggle={(v) => toggle('quietHours', v)} />
                {(settings.quietHours ?? false) && (
                  <>
                    <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
                    <SettingsRow label="Quiet Hours Timing" rightElement={<span className="text-[rgba(255,255,255,0.6)]">10:00 PM - 7:00 AM</span>} onClick={() => {}} />
                  </>
                )}
              </GlassCard>
            </div>
          </motion.div>
        )}

        <div className="p-4 bg-[#14b8a6]/10 rounded-[20px] border border-[#14b8a6]/20 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#14b8a6] shrink-0 mt-0.5" />
          <p className="text-sm text-[rgba(255,255,255,0.8)] leading-relaxed">System level notifications must also be enabled in your device settings.</p>
        </div>
      </div>
    </motion.div>
  );
}
