import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/ui/custom/PageHeader';
import { SettingsRow } from '../components/ui/custom/SettingsRow';
import { GlassCard } from '../components/ui/custom/GlassCard';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { 
  UserPlus, UserMinus, User, Shield, Bell, 
  HelpCircle, Info, LogOut 
} from 'lucide-react';

export default function SettingsPage() {
  const { user, settings, updateSettings } = useApp();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    toast.success("Logged out successfully");
    // In a real app this would clear auth state
  };

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
      className="min-h-[100dvh] relative pb-20 overflow-x-hidden"
    >
      {/* Decorative SVG */}
      <div className="absolute top-0 right-0 pointer-events-none opacity-10 z-0">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="0" r="150" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="200" cy="0" r="100" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
      </div>

      <PageHeader 
        title="Settings" 
        subtitle="Manage your preferences and account"
        rightElement={
          <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-[#C6FF3B] to-[#C6FF3B] overflow-hidden cursor-pointer" onClick={() => setLocation('/profile')}>
            <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full bg-[#111]" />
          </div>
        }
      />
      
      <div className="p-4 space-y-6 relative z-10">
        
        <div>
          <h3 className="text-[rgba(255,255,255,0.5)] text-sm font-medium ml-4 mb-2 uppercase tracking-wider">Friends</h3>
          <GlassCard className="overflow-hidden">
            <SettingsRow 
              icon={<UserPlus className="w-5 h-5 text-[#C9A8FF]" />} 
              label="Add Friends" 
              onClick={() => setLocation('/add-friend')} 
            />
            <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
            <SettingsRow 
              icon={<UserMinus className="w-5 h-5 text-[#FFC6DA]" />} 
              label="Remove Friends" 
              onClick={() => setLocation('/remove-friend')} 
            />
          </GlassCard>
        </div>

        <div>
          <h3 className="text-[rgba(255,255,255,0.5)] text-sm font-medium ml-4 mb-2 uppercase tracking-wider">Status</h3>
          <GlassCard className="overflow-hidden">
            <SettingsRow 
              label="Show Offline Status" 
              isToggle 
              toggleChecked={settings.showOfflineStatus} 
              onToggle={(v) => updateSettings({ showOfflineStatus: v })} 
              textColor="text-[#EF4444]"
            />
            <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
            <div className="p-4 flex justify-between items-center bg-[rgba(255,255,255,0.02)]">
              <span className="text-white font-medium">Online</span>
              <div 
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer"
                style={{ borderColor: settings.userStatus === 'online' ? '#C6FF3B' : 'rgba(255,255,255,0.2)' }}
                onClick={() => updateSettings({ userStatus: 'online' })}
              >
                {settings.userStatus === 'online' && <div className="w-3 h-3 rounded-full bg-[#C6FF3B]" />}
              </div>
            </div>
            <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
            <div className="p-4 flex justify-between items-center bg-[rgba(255,255,255,0.02)]">
              <span className="text-white font-medium">Offline</span>
              <div 
                className="w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer"
                style={{ borderColor: settings.userStatus === 'offline' ? '#EF4444' : 'rgba(255,255,255,0.2)' }}
                onClick={() => updateSettings({ userStatus: 'offline' })}
              >
                {settings.userStatus === 'offline' && <div className="w-3 h-3 rounded-full bg-[#EF4444]" />}
              </div>
            </div>
          </GlassCard>
        </div>

        <div>
          <h3 className="text-[rgba(255,255,255,0.5)] text-sm font-medium ml-4 mb-2 uppercase tracking-wider">Account</h3>
          <GlassCard className="overflow-hidden">
            <SettingsRow 
              icon={<User className="w-5 h-5 text-[#C6FF3B]" />} 
              label="Edit Profile" 
              onClick={() => setLocation('/profile')} 
            />
            <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
            <SettingsRow 
              icon={<Shield className="w-5 h-5 text-[#C9A8FF]" />} 
              label="Privacy" 
              onClick={() => setLocation('/privacy')} 
            />
            <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
            <SettingsRow 
              icon={<Bell className="w-5 h-5 text-[#FFC6DA]" />} 
              label="Notifications" 
              onClick={() => setLocation('/notifications')} 
            />
          </GlassCard>
        </div>

        <div>
          <h3 className="text-[rgba(255,255,255,0.5)] text-sm font-medium ml-4 mb-2 uppercase tracking-wider">General</h3>
          <GlassCard className="overflow-hidden">
            <SettingsRow 
              icon={<HelpCircle className="w-5 h-5" />} 
              label="Help & Support" 
              onClick={() => setLocation('/help-support')} 
            />
            <div className="h-[1px] bg-[rgba(255,255,255,0.05)] w-full" />
            <SettingsRow 
              icon={<Info className="w-5 h-5" />} 
              label="About" 
              onClick={() => toast("PingX v1.0.0")} 
            />
          </GlassCard>
        </div>

        <GlassCard className="overflow-hidden mt-8 border-[#EF4444]/30">
          <SettingsRow 
            icon={<LogOut className="w-5 h-5 text-[#EF4444]" />} 
            label="Logout" 
            textColor="text-[#EF4444]"
            onClick={handleLogout} 
          />
        </GlassCard>

      </div>
    </motion.div>
  );
}
