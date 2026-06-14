import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '../components/ui/custom/PageHeader';
import { Plus, Trash2, Check } from 'lucide-react';
import { Note } from '../types';

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editColor, setEditColor] = useState<'green' | 'purple' | 'pink'>('green');
  const [isCreating, setIsCreating] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState<'green' | 'purple' | 'pink'>('green');
  const newNoteRef = useRef<HTMLTextAreaElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isCreating && newNoteRef.current) {
      newNoteRef.current.focus();
    }
  }, [isCreating]);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.selectionStart = editRef.current.value.length;
    }
  }, [editingId]);

  const getColorHex = (color: string) => {
    switch (color) {
      case 'green': return '#C6FF3B';
      case 'purple': return '#C9A8FF';
      case 'pink': return '#FFC6DA';
      default: return '#C6FF3B';
    }
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
    setEditColor(note.color);
  };

  const saveEdit = (note: Note) => {
    if (editContent.trim()) {
      updateNote(note.id, { content: editContent, color: editColor });
    }
    setEditingId(null);
  };

  const saveNew = () => {
    if (newContent.trim()) {
      addNote({
        id: Date.now().toString(),
        content: newContent,
        color: newColor,
        createdAt: new Date().toISOString(),
      });
    }
    setNewContent('');
    setNewColor('green');
    setIsCreating(false);
  };

  const ColorPicker = ({ value, onChange }: { value: string; onChange: (c: 'green' | 'purple' | 'pink') => void }) => (
    <div className="flex gap-2 mt-3">
      {(['green', 'purple', 'pink'] as const).map(c => (
        <button
          key={c}
          data-testid={`color-${c}`}
          onClick={(e) => { e.stopPropagation(); onChange(c); }}
          className={`w-6 h-6 rounded-full border-2 transition-transform ${value === c ? 'border-[#050505] scale-110' : 'border-transparent'}`}
          style={{ backgroundColor: getColorHex(c) }}
        />
      ))}
    </div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.85 },
    show: { opacity: 1, scale: 1 },
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
      className="min-h-[100dvh] relative pb-24"
    >
      <PageHeader title="My Notes" subtitle="Tap a note to edit" />

      <div className="p-4">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 gap-4">

          {/* New note card inline */}
          <AnimatePresence>
            {isCreating && (
              <motion.div
                key="new-note"
                variants={itemVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.85 }}
                className="rounded-[24px] p-4 min-h-[160px] flex flex-col"
                style={{ backgroundColor: getColorHex(newColor) }}
              >
                <textarea
                  ref={newNoteRef}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write your note..."
                  className="flex-1 bg-transparent text-[#050505] text-[14px] font-medium placeholder-[#050505]/50 focus:outline-none resize-none w-full"
                  data-testid="input-new-note"
                  rows={4}
                />
                <ColorPicker value={newColor} onChange={setNewColor} />
                <div className="flex justify-between mt-3">
                  <button
                    data-testid="button-cancel-new-note"
                    onClick={() => { setIsCreating(false); setNewContent(''); }}
                    className="text-[#050505]/60 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    data-testid="button-save-new-note"
                    onClick={saveNew}
                    className="w-8 h-8 rounded-full bg-[#050505]/15 flex items-center justify-center hover:bg-[#050505]/25 transition-colors"
                  >
                    <Check className="w-4 h-4 text-[#050505]" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Existing notes */}
          {notes.map((note) => (
            <motion.div key={note.id} variants={itemVariants}>
              {editingId === note.id ? (
                <div
                  className="rounded-[24px] p-4 min-h-[160px] flex flex-col"
                  style={{ backgroundColor: getColorHex(editColor) }}
                >
                  <textarea
                    ref={editRef}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="flex-1 bg-transparent text-[#050505] text-[14px] font-medium focus:outline-none resize-none w-full"
                    data-testid={`input-edit-note-${note.id}`}
                    rows={4}
                  />
                  <ColorPicker value={editColor} onChange={setEditColor} />
                  <div className="flex justify-between mt-3">
                    <button
                      data-testid={`button-delete-note-${note.id}`}
                      onClick={() => { deleteNote(note.id); setEditingId(null); }}
                      className="w-8 h-8 rounded-full bg-[#050505]/10 flex items-center justify-center hover:bg-[#050505]/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-[#050505]" />
                    </button>
                    <button
                      data-testid={`button-save-note-${note.id}`}
                      onClick={() => saveEdit(note)}
                      className="w-8 h-8 rounded-full bg-[#050505]/15 flex items-center justify-center hover:bg-[#050505]/25 transition-colors"
                    >
                      <Check className="w-4 h-4 text-[#050505]" />
                    </button>
                  </div>
                </div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => startEdit(note)}
                  className="rounded-[24px] p-4 min-h-[160px] flex flex-col justify-between cursor-pointer"
                  style={{ backgroundColor: getColorHex(note.color) }}
                  data-testid={`card-note-${note.id}`}
                >
                  <p className="text-[#050505] text-[14px] font-medium leading-relaxed whitespace-pre-wrap flex-1">
                    {note.content}
                  </p>
                  <p className="text-[#050505]/40 text-[11px] mt-3">Tap to edit</p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {notes.length === 0 && !isCreating && (
          <div className="text-center mt-16 text-[rgba(255,255,255,0.3)]">
            <p className="text-lg font-medium">No notes yet</p>
            <p className="text-sm mt-1">Tap + to create your first note</p>
          </div>
        )}
      </div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsCreating(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#C6FF3B] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(198,255,59,0.4)] z-20"
        data-testid="button-add-note"
      >
        <Plus className="w-6 h-6 text-[#050505]" />
      </motion.button>
    </motion.div>
  );
}
