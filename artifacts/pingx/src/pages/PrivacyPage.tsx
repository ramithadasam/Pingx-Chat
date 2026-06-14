import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/ui/custom/PageHeader';
import { GlassCard } from '../components/ui/custom/GlassCard';
import { SettingsRow } from '../components/ui/custom/SettingsRow';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  const { settings, updateSettings } = useApp();

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
      className="min-h-[100dvh] relative pb-20"
    >
      <PageHeader 
        title="Privacy" 
        rightElement={<Shield className="w-6 h-6 text-[#C9A8FF]" />}
      />
      
      <div className="p-4 space-y-6">
        
        <div>
          <h3 className="text-[rgba(255,255,255,0.5)] text-sm font-medium ml-4 mb-2 uppercase tracking-wider">Privacy & Security</h3>
          <GlassCard className="overflow-hidden">
            <SettingsRow 
              label="End-to-End Encryption" 
              description="Your messages are secure"
              isToggle 
              toggleChecked={settings.endToEndEncryption} 
              onToggle={(v) => updateSettings({ endToEndEncryption: v })} 
            />
            <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
            <SettingsRow 
              label="Vanish Mode" 
              description="Messages disappear after seen"
              isToggle 
              toggleChecked={settings.vanishMode} 
              onToggle={(v) => updateSettings({ vanishMode: v })} 
            />
          </GlassCard>
        </div>

        {settings.vanishMode && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <h3 className="text-[rgba(255,255,255,0.5)] text-sm font-medium ml-4 mb-2 uppercase tracking-wider">Vanish Mode Settings</h3>
            <GlassCard className="overflow-hidden">
              <SettingsRow 
                label="Vanish Timer" 
                rightElement={<span className="text-[rgba(255,255,255,0.6)]">24 Hours</span>}
                onClick={() => {}}
              />
            </GlassCard>
          </motion.div>
        )}

        <div>
          <h3 className="text-[rgba(255,255,255,0.5)] text-sm font-medium ml-4 mb-2 uppercase tracking-wider">Additional Privacy</h3>
          <GlassCard className="overflow-hidden">
            <SettingsRow 
              label="Read Receipts" 
              description="Let others know when you read their msgs"
              isToggle 
              toggleChecked={settings.readReceipts} 
              onToggle={(v) => updateSettings({ readReceipts: v })} 
            />
            <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
            <SettingsRow 
              label="Profile Visibility" 
              rightElement={<span className="text-[rgba(255,255,255,0.6)]">Everyone</span>}
              onClick={() => {}}
            />
            <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
            <SettingsRow 
              label="Blocked Users" 
              rightElement={<span className="text-[rgba(255,255,255,0.6)]">0</span>}
              onClick={() => {}}
            />
          </GlassCard>
        </div>

        <div className="p-5 bg-[#C9A8FF]/10 rounded-[24px] border border-[#C9A8FF]/20 text-center">
          <Shield className="w-8 h-8 text-[#C9A8FF] mx-auto mb-2" />
          <h4 className="text-white font-medium mb-1">Your Privacy Matters</h4>
          <p className="text-[rgba(255,255,255,0.6)] text-sm">PingX cannot read or listen to your personal messages and calls. Privacy is built into our DNA.</p>
        </div>

      </div>
    </motion.div>
  );
}
