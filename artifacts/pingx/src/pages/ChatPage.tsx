import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, Phone, Video, MoreVertical, Plus, Smile, Mic, Send, CheckCheck } from 'lucide-react';

export default function ChatPage() {
  const { contacts, messages, sendMessage } = useApp();
  const params = useParams();
  const [, setLocation] = useLocation();
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const id = params.id as string;
  const contact = contacts.find(c => c.id === id);
  const chatMessages = messages[id] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!contact) {
    return <div className="min-h-[100dvh] flex items-center justify-center text-white">Contact not found</div>;
  }

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(id, text);
    setText('');
  };

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
      className="h-[100dvh] flex flex-col relative overflow-hidden bg-[#050505]"
    >
      <header className="flex items-center justify-between p-3 border-b border-[rgba(255,255,255,0.05)] bg-[#050505]/90 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLocation('/home')}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setLocation(`/contact-info/${id}`)}
          >
            <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full" />
            <div>
              <h2 className="text-white font-medium">{contact.name}</h2>
              <div className="flex items-center gap-1.5">
                {contact.status === 'online' && <div className="w-2 h-2 rounded-full bg-[#C6FF3B]" />}
                <span className="text-[rgba(255,255,255,0.5)] text-xs capitalize">{contact.status}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors">
            <Phone className="w-5 h-5 text-white" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors">
            <Video className="w-5 h-5 text-white" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors">
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex justify-center my-4">
          <span className="px-3 py-1 bg-[rgba(255,255,255,0.05)] rounded-full text-xs text-[rgba(255,255,255,0.5)]">Today</span>
        </div>
        
        {chatMessages.map(msg => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${msg.sent ? 'items-end' : 'items-start'}`}
          >
            <div 
              className={`max-w-[75%] rounded-[20px] px-4 py-2.5 ${
                msg.sent 
                  ? 'bg-[#C6FF3B] text-[#050505] rounded-tr-sm' 
                  : 'bg-[#1a1a1a] text-white rounded-tl-sm'
              }`}
            >
              <p className="text-[15px] leading-relaxed">{msg.text}</p>
            </div>
            <div className="flex items-center gap-1 mt-1 px-1">
              <span className="text-[10px] text-[rgba(255,255,255,0.4)]">{msg.time}</span>
              {msg.sent && <CheckCheck className="w-3 h-3 text-[#C6FF3B]" />}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-[rgba(255,255,255,0.02)] border-t border-[rgba(255,255,255,0.05)] backdrop-blur-lg shrink-0">
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.6)]">
            <Plus className="w-6 h-6" />
          </button>
          
          <div className="flex-1 flex items-center bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full px-3 py-1.5 min-h-[44px]">
            <input 
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-white placeholder-[rgba(255,255,255,0.4)] focus:outline-none px-2"
            />
            <button className="w-8 h-8 flex items-center justify-center text-[rgba(255,255,255,0.4)] hover:text-white">
              <Smile className="w-5 h-5" />
            </button>
          </div>
          
          {text.trim() ? (
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-[#C6FF3B] shrink-0"
            >
              <Send className="w-5 h-5 text-[#050505] ml-1" />
            </motion.button>
          ) : (
            <button className="w-11 h-11 flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)] shrink-0 text-white">
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}