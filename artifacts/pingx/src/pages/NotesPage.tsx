import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '../components/ui/custom/PageHeader';
import { GlassCard } from '../components/ui/custom/GlassCard';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { Note } from '../types';

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState<'green' | 'purple' | 'pink'>('green');

  const openModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setNoteContent(note.content);
      setNoteColor(note.color);
    } else {
      setEditingNote(null);
      setNoteContent('');
      setNoteColor('green');
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!noteContent.trim()) return;
    
    if (editingNote) {
      updateNote(editingNote.id, { content: noteContent, color: noteColor });
    } else {
      addNote({
        id: Date.now().toString(),
        content: noteContent,
        color: noteColor,
        createdAt: new Date().toISOString()
      });
    }
    setIsModalOpen(false);
  };

  const getColorHex = (color: string) => {
    switch(color) {
      case 'green': return '#C6FF3B';
      case 'purple': return '#C9A8FF';
      case 'pink': return '#FFC6DA';
      default: return '#C6FF3B';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
      className="min-h-[100dvh] relative pb-20"
    >
      <PageHeader title="My Notes" />
      
      <div className="p-4">
        <motion.div 
          variants={containerVariants} initial="hidden" animate="show"
          className="grid grid-cols-2 gap-4"
        >
          {notes.map(note => (
            <motion.div key={note.id} variants={itemVariants}>
              <div 
                className="rounded-[24px] p-4 min-h-[160px] flex flex-col justify-between"
                style={{ backgroundColor: getColorHex(note.color) }}
              >
                <p className="text-[#050505] text-[15px] font-medium leading-relaxed whitespace-pre-wrap">{note.content}</p>
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => openModal(note)} className="w-8 h-8 rounded-full bg-[#050505]/10 flex items-center justify-center hover:bg-[#050505]/20 transition-colors">
                    <Edit2 className="w-4 h-4 text-[#050505]" />
                  </button>
                  <button onClick={() => deleteNote(note.id)} className="w-8 h-8 rounded-full bg-[#050505]/10 flex items-center justify-center hover:bg-[#050505]/20 transition-colors">
                    <Trash2 className="w-4 h-4 text-[#050505]" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => openModal()}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#C6FF3B] rounded-full flex items-center justify-center shadow-lg z-20"
      >
        <Plus className="w-6 h-6 text-[#050505]" />
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="fixed inset-x-0 bottom-0 z-50 p-4 pb-8 pointer-events-none flex flex-col justify-end h-full">
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-[#111] border border-[rgba(255,255,255,0.1)] rounded-[32px] p-6 w-full pointer-events-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">{editingNote ? 'Edit Note' : 'New Note'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)]">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Type your note here..."
                  className="w-full h-32 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[20px] p-4 text-white placeholder-[rgba(255,255,255,0.4)] focus:outline-none focus:border-[#C6FF3B] resize-none mb-6"
                />
                
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-[rgba(255,255,255,0.6)] text-sm">Color:</span>
                  <div className="flex gap-3">
                    {(['green', 'purple', 'pink'] as const).map(color => (
                      <button
                        key={color}
                        onClick={() => setNoteColor(color)}
                        className={`w-8 h-8 rounded-full border-2 ${noteColor === color ? 'border-white' : 'border-transparent'}`}
                        style={{ backgroundColor: getColorHex(color) }}
                      />
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={handleSave}
                  className="w-full py-4 bg-[#C6FF3B] text-[#050505] rounded-full font-semibold text-lg hover:bg-[#b0eb2d] transition-colors"
                >
                  Save Note
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
