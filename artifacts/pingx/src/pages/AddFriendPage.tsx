import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/ui/custom/PageHeader';
import { GlassCard } from '../components/ui/custom/GlassCard';
import { UserPlus, Search, MessageCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function AddFriendPage() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('+91');

  const handleAdd = () => {
    if (phone.length < 10) {
      toast.error("Please enter a valid 10-digit number");
      return;
    }
    toast.success("Friend request sent!");
    setPhone('');
  };

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
      className="min-h-[100dvh] relative pb-20"
    >
      <PageHeader 
        title="Add Friends" 
        subtitle="Connect with new people"
        rightElement={<UserPlus className="w-6 h-6 text-[#C9A8FF]" />}
      />
      
      <div className="p-4 space-y-6">
        <GlassCard className="p-5">
          <h2 className="text-white font-semibold text-lg mb-4">Add by Phone Number</h2>
          
          <div className="flex gap-2 mb-6">
            <select 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[16px] px-3 py-3 text-white focus:outline-none focus:border-[#C9A8FF] appearance-none"
            >
              <option value="+91">+91 🇮🇳</option>
              <option value="+1">+1 🇺🇸</option>
              <option value="+44">+44 🇬🇧</option>
              <option value="+61">+61 🇦🇺</option>
              <option value="+971">+971 🇦🇪</option>
            </select>
            
            <input 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Phone Number"
              className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[16px] px-4 py-3 text-white placeholder-[rgba(255,255,255,0.4)] focus:outline-none focus:border-[#C9A8FF]"
              maxLength={10}
            />
          </div>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            className="w-full py-3.5 bg-[#C9A8FF] text-[#050505] rounded-full font-semibold text-[15px] hover:bg-[#d6bfff] transition-colors"
          >
            Add Friend
          </motion.button>
        </GlassCard>

        <div>
          <h3 className="text-[rgba(255,255,255,0.5)] text-sm font-medium ml-4 mb-4 uppercase tracking-wider">How it works</h3>
          <GlassCard className="p-5 space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#C9A8FF]/20 flex items-center justify-center shrink-0">
                <span className="text-[#C9A8FF] font-bold">1</span>
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Enter Number</h4>
                <p className="text-[rgba(255,255,255,0.6)] text-sm leading-relaxed">Enter your friend's complete phone number with country code.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#C6FF3B]/20 flex items-center justify-center shrink-0">
                <Search className="w-5 h-5 text-[#C6FF3B]" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Search</h4>
                <p className="text-[rgba(255,255,255,0.6)] text-sm leading-relaxed">We'll find if they are already using PingX.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFC6DA]/20 flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-[#FFC6DA]" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Start Chatting</h4>
                <p className="text-[rgba(255,255,255,0.6)] text-sm leading-relaxed">Once they accept, you can start messaging immediately.</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="flex items-center gap-3 p-4 bg-[#C9A8FF]/10 rounded-[20px] border border-[#C9A8FF]/20">
          <Shield className="w-6 h-6 text-[#C9A8FF] shrink-0" />
          <p className="text-sm text-[rgba(255,255,255,0.8)]">Your Privacy Matters. We never share your phone number with anyone except your approved contacts.</p>
        </div>
      </div>
    </motion.div>
  );
}
