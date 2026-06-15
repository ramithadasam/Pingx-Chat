import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/ui/custom/PageHeader';
import { GlassCard } from '../components/ui/custom/GlassCard';
import { UserPlus, Search, MessageCircle, Shield, QrCode, Phone, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import { useSendFriendRequest } from '@workspace/api-client-react';

type Tab = 'phone' | 'qr';

export default function AddFriendPage() {
  const { user } = useApp();
  const [tab, setTab] = useState<Tab>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('+91');
  const [copied, setCopied] = useState(false);

  const sendRequest = useSendFriendRequest({
    mutation: {
      onSuccess: () => {
        toast.success('Friend request sent!');
        setPhone('');
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : 'Could not send request';
        toast.error(msg);
      },
    },
  });

  const qrValue = `pingx://add/${user?.username ?? ''}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrValue)}&bgcolor=111111&color=C6FF3B&margin=10`;

  const handleAdd = () => {
    if (phone.length < 10) {
      toast.error('Please enter a valid 10-digit number');
      return;
    }
    const fullPhone = `${code}${phone}`;
    sendRequest.mutate({ phone: fullPhone });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`pingx.app/add/${user?.username ?? ''}`).then(() => {
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    });
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

      <div className="p-4 space-y-5">
        <div className="flex gap-2 p-1 bg-[rgba(255,255,255,0.05)] rounded-[20px]">
          <button
            onClick={() => setTab('phone')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[16px] font-semibold text-sm transition-all duration-200 ${
              tab === 'phone' ? 'bg-[#C6FF3B] text-[#050505]' : 'text-[rgba(255,255,255,0.5)] hover:text-white'
            }`}
          >
            <Phone className="w-4 h-4" />
            Phone Number
          </button>
          <button
            onClick={() => setTab('qr')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[16px] font-semibold text-sm transition-all duration-200 ${
              tab === 'qr' ? 'bg-[#C9A8FF] text-[#050505]' : 'text-[rgba(255,255,255,0.5)] hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            QR Code
          </button>
        </div>

        {tab === 'phone' && (
          <motion.div key="phone-tab" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
            <GlassCard className="p-5">
              <h2 className="text-white font-semibold text-lg mb-4">Add by Phone Number</h2>

              <div className="flex gap-2 mb-4">
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
                  placeholder="Enter phone number"
                  className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[16px] px-4 py-3 text-white placeholder-[rgba(255,255,255,0.4)] focus:outline-none focus:border-[#C6FF3B]"
                  maxLength={10}
                />
              </div>

              {phone.length > 0 && phone.length < 10 && (
                <p className="text-red-400 text-xs mb-3 ml-1">Enter at least 10 digits</p>
              )}

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                disabled={sendRequest.isPending}
                className="w-full py-3.5 bg-[#C6FF3B] text-[#050505] rounded-full font-semibold text-[15px] hover:bg-[#d4ff5e] transition-colors disabled:opacity-60"
              >
                {sendRequest.isPending ? 'Sending...' : 'Add Friend'}
              </motion.button>
            </GlassCard>

            <div className="mt-5">
              <h3 className="text-[rgba(255,255,255,0.5)] text-xs font-medium ml-1 mb-3 uppercase tracking-wider">How it works</h3>
              <GlassCard className="p-5 space-y-5">
                {[
                  { icon: <span className="text-[#C9A8FF] font-bold text-sm">1</span>, bg: '#C9A8FF', title: 'Enter Number', desc: "Enter your friend's complete phone number with country code." },
                  { icon: <Search className="w-4 h-4 text-[#C6FF3B]" />, bg: '#C6FF3B', title: 'Send Request', desc: "We'll send them a friend request if they are on PingX." },
                  { icon: <MessageCircle className="w-4 h-4 text-[#FFC6DA]" />, bg: '#FFC6DA', title: 'Start Chatting', desc: 'Once they accept, you can start messaging immediately.' },
                ].map(({ icon, bg, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${bg}22` }}>
                      {icon}
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm mb-0.5">{title}</h4>
                      <p className="text-[rgba(255,255,255,0.55)] text-sm leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </GlassCard>
            </div>
          </motion.div>
        )}

        {tab === 'qr' && (
          <motion.div key="qr-tab" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="space-y-4">
            <GlassCard className="p-6 flex flex-col items-center">
              <h2 className="text-white font-semibold text-lg mb-1">Your QR Code</h2>
              <p className="text-[rgba(255,255,255,0.5)] text-sm mb-6 text-center">Ask your friend to scan this code to add you instantly</p>

              <div className="relative mb-6">
                <div className="w-52 h-52 rounded-[24px] bg-[#111] border border-[rgba(255,255,255,0.08)] flex items-center justify-center overflow-hidden p-3">
                  <img src={qrApiUrl} alt="QR Code" className="w-full h-full object-contain rounded-[16px]" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[rgba(255,255,255,0.05)] px-5 py-2.5 rounded-full mb-6">
                <div className="w-2 h-2 rounded-full bg-[#C6FF3B]" />
                <span className="text-white font-semibold text-sm">@{user?.username ?? '...'}</span>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className={`w-full py-3.5 rounded-full font-semibold text-[15px] flex items-center justify-center gap-2 transition-all duration-200 ${
                  copied ? 'bg-[#1a1a1a] text-[#C6FF3B] border border-[#C6FF3B]' : 'bg-[#C9A8FF] text-[#050505]'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Invite Link'}
              </motion.button>
            </GlassCard>

            <div className="flex items-center gap-3 p-4 bg-[#C9A8FF]/10 rounded-[20px] border border-[#C9A8FF]/20">
              <Shield className="w-5 h-5 text-[#C9A8FF] shrink-0" />
              <p className="text-xs text-[rgba(255,255,255,0.7)]">QR codes expire every 14 days for your security.</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
