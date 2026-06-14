import { useApp } from '../context/AppContext';
import { Link, useLocation } from 'wouter';
import { Settings, ChevronRight, NotebookPen, UserPlus, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { ContactRow } from '../components/ui/custom/ContactRow';

export default function HomePage() {
  const { user, contacts } = useApp();
  const [, setLocation] = useLocation();

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      exit={{ x: -20, opacity: 0 }} 
      transition={{ duration: 0.2 }}
      className="min-h-[100dvh] pb-20 relative overflow-x-hidden"
    >
      {/* Decorative SVG */}
      <div className="absolute top-0 right-0 pointer-events-none opacity-20 z-0">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="0" r="150" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="200" cy="0" r="100" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="200" cy="0" r="50" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
      </div>

      <div className="p-5 relative z-10">
        <header className="flex justify-between items-center mb-8">
          <Link href="/settings">
            <button className="w-12 h-12 flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition">
              <Settings className="w-6 h-6 text-white" />
            </button>
          </Link>
          
          <Link href="/profile">
            <div className="relative cursor-pointer">
              <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#C6FF3B] to-[#C6FF3B] overflow-hidden">
                <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full bg-[#111]" />
              </div>
            </div>
          </Link>
        </header>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Bhooooo!!!</h1>
          <h2 className="text-3xl font-bold text-[#C6FF3B]">Howz ur day goinnn??!!</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            onClick={() => setLocation('/notes')}
            className="bg-[#C6FF3B] rounded-[24px] p-5 cursor-pointer flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="w-10 h-10 rounded-full bg-[#050505]/10 flex items-center justify-center mb-4">
                <NotebookPen className="w-5 h-5 text-[#050505]" />
              </div>
              <h3 className="text-xl font-bold text-[#050505] mb-2">Notes</h3>
              <p className="text-[#050505]/70 text-sm leading-snug">Write, plan and keep track of things</p>
            </div>
            <div className="flex justify-end mt-4">
              <div className="w-8 h-8 rounded-full bg-[#050505] flex items-center justify-center">
                <ChevronRight className="w-5 h-5 text-[#C6FF3B]" />
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col gap-4">
            <motion.div 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              onClick={() => setLocation('/add-friend')}
              className="bg-[#C9A8FF] rounded-[24px] p-4 cursor-pointer flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#050505]/10 flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-[#050505]" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#050505] flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-[#C9A8FF]" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#050505] mb-1">Add a Friend</h3>
                <p className="text-[#050505]/70 text-xs">Connect and start chatting</p>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              onClick={() => setLocation('/thoughts')}
              className="bg-[#FFC6DA] rounded-[24px] p-4 cursor-pointer flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#050505]/10 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-[#050505]" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#050505] flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-[#FFC6DA]" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#050505] mb-1">Add a Thought</h3>
                <p className="text-[#050505]/70 text-xs">Jot down a thought whenever it strikes</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-lg font-bold text-white">Recent</h3>
            <button className="text-[#C6FF3B] text-sm font-medium">See all &gt;</button>
          </div>
          
          <div className="flex flex-col gap-1">
            {contacts.map(contact => (
              <ContactRow 
                key={contact.id} 
                contact={contact} 
                onClick={() => setLocation(`/chat/${contact.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
