import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/ui/custom/PageHeader';
import { Trash2 } from 'lucide-react';

export default function ThoughtsPage() {
  const { thoughts, addThought } = useApp();
  const [newThought, setNewThought] = useState('');

  const handleSave = () => {
    if (!newThought.trim()) return;
    addThought(newThought);
    setNewThought('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
      className="min-h-[100dvh] relative pb-20"
    >
      <PageHeader title="Add a Thought" />
      
      <div className="p-4">
        <textarea
          value={newThought}
          onChange={(e) => setNewThought(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full h-40 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-5 text-white text-lg placeholder-[rgba(255,255,255,0.3)] focus:outline-none focus:border-[#FFC6DA] transition-colors resize-none mb-4"
        />
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={!newThought.trim()}
          className="w-full py-4 bg-[#FFC6DA] text-[#050505] rounded-full font-semibold text-lg hover:bg-[#ffb0ca] disabled:opacity-50 transition-colors mb-8"
        >
          Save Thought
        </motion.button>
        
        <div className="space-y-4">
          <h3 className="text-white font-medium mb-4">Previous Thoughts</h3>
          
          {thoughts.map(thought => (
            <motion.div 
              key={thought.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-[24px] p-5"
            >
              <p className="text-white text-[15px] leading-relaxed mb-4">{thought.text}</p>
              <div className="flex justify-between items-center">
                <span className="text-[rgba(255,255,255,0.4)] text-sm">{formatDate(thought.createdAt)}</span>
                <button className="text-[rgba(255,255,255,0.4)] hover:text-[#EF4444] transition-colors p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
          
          {thoughts.length === 0 && (
            <div className="text-center text-[rgba(255,255,255,0.4)] py-10">
              No thoughts yet.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
