import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/ui/custom/PageHeader';
import { GlassCard } from '../components/ui/custom/GlassCard';
import { MessageSquare, UploadCloud, ChevronRight, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function HelpSupportPage() {
  const [category, setCategory] = useState('Account Issue');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    toast.success('Your concern has been submitted');
    setMessage('');
  };

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
      className="min-h-[100dvh] relative pb-20"
    >
      <PageHeader 
        title="Help & Support" 
        subtitle="We're here to help!"
        rightElement={<MessageSquare className="w-6 h-6 text-[#C9A8FF]" />}
      />
      
      <div className="p-4 space-y-6">
        <GlassCard className="p-5">
          <h3 className="text-[#C9A8FF] font-medium mb-4">Send us a Message</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-[rgba(255,255,255,0.6)] mb-2 block">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[16px] px-4 py-3 text-white focus:outline-none focus:border-[#C9A8FF] appearance-none"
              >
                <option value="Account Issue" className="bg-[#111]">Account Issue</option>
                <option value="Bug Report" className="bg-[#111]">Bug Report</option>
                <option value="Feature Request" className="bg-[#111]">Feature Request</option>
                <option value="Other" className="bg-[#111]">Other</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm text-[rgba(255,255,255,0.6)] mb-2 flex justify-between">
                <span>Write your concern</span>
                <span>{message.length}/1000</span>
              </label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                placeholder="Type your message here..."
                className="w-full h-32 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[16px] p-4 text-white placeholder-[rgba(255,255,255,0.4)] focus:outline-none focus:border-[#C9A8FF] resize-none"
              />
            </div>
            
            <div>
              <label className="text-sm text-[rgba(255,255,255,0.6)] mb-2 block">Upload Screenshot (Optional)</label>
              <div className="border border-dashed border-[rgba(255,255,255,0.2)] rounded-[16px] p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <UploadCloud className="w-8 h-8 text-[rgba(255,255,255,0.4)] mb-2" />
                <span className="text-sm text-[rgba(255,255,255,0.5)]">Tap to upload</span>
              </div>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              className="w-full py-3.5 bg-[#C6FF3B] text-[#050505] rounded-full font-semibold text-[15px] hover:bg-[#b0eb2d] transition-colors flex items-center justify-center gap-2"
            >
              <span>Send Message</span>
            </motion.button>
          </div>
        </GlassCard>

        <GlassCard className="overflow-hidden">
          <div className="p-4 flex justify-between items-center hover:bg-[rgba(255,255,255,0.05)] cursor-pointer border-b border-[rgba(255,255,255,0.05)]">
            <span className="text-white font-medium">FAQ</span>
            <ChevronRight className="w-5 h-5 text-[rgba(255,255,255,0.4)]" />
          </div>
          <div className="p-4 flex justify-between items-center hover:bg-[rgba(255,255,255,0.05)] cursor-pointer">
            <span className="text-white font-medium">Contact Us</span>
            <ChevronRight className="w-5 h-5 text-[rgba(255,255,255,0.4)]" />
          </div>
        </GlassCard>

        <div className="p-4 bg-[rgba(255,255,255,0.05)] rounded-[20px] flex items-center gap-3">
          <Info className="w-5 h-5 text-[rgba(255,255,255,0.6)] shrink-0" />
          <p className="text-sm text-[rgba(255,255,255,0.6)]">Support hours: Monday to Friday, 9:00 AM - 6:00 PM EST. We usually respond within 24 hours.</p>
        </div>
      </div>
    </motion.div>
  );
}