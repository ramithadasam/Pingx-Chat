import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '../components/ui/custom/PageHeader';
import { Plus, Trash2, Check } from 'lucide-react';
import {
  useListNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
  getNotesQueryKey,
} from '@workspace/api-client-react';
import type { Note, NoteColor } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function NotesPage() {
  const queryClient = useQueryClient();
  const { data: notes = [], isLoading } = useListNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editColor, setEditColor] = useState<NoteColor>('green');
  const [isCreating, setIsCreating] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState<NoteColor>('green');
  const newNoteRef = useRef<HTMLTextAreaElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isCreating && newNoteRef.current) newNoteRef.current.focus();
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
    if (!editContent.trim()) { setEditingId(null); return; }
    updateNote.mutate(
      { id: note.id, data: { content: editContent, color: editColor } },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getNotesQueryKey() }),
        onError: () => toast.error('Failed to update note'),
      },
    );
    setEditingId(null);
  };

  const saveNew = () => {
    if (!newContent.trim()) { setIsCreating(false); return; }
    createNote.mutate(
      { data: { content: newContent, color: newColor } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getNotesQueryKey() });
          setNewContent('');
          setNewColor('green');
          setIsCreating(false);
        },
        onError: () => toast.error('Failed to create note'),
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteNote.mutate(
      { id },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getNotesQueryKey() }),
        onError: () => toast.error('Failed to delete note'),
      },
    );
    setEditingId(null);
  };

  const ColorPicker = ({ value, onChange }: { value: string; onChange: (c: NoteColor) => void }) => (
    <div className="flex gap-2 mt-3">
      {(['green', 'purple', 'pink'] as NoteColor[]).map(c => (
        <button
          key={c}
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
        {isLoading && (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="rounded-[24px] h-40 bg-[rgba(255,255,255,0.05)] animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 gap-4">
            <AnimatePresence>
              {isCreating && (
                <motion.div
                  key="new-note"
                  variants={itemVariants}
                  initial="hidden" animate="show" exit={{ opacity: 0, scale: 0.85 }}
                  className="rounded-[24px] p-4 min-h-[160px] flex flex-col"
                  style={{ backgroundColor: getColorHex(newColor) }}
                >
                  <textarea
                    ref={newNoteRef}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Write your note..."
                    className="flex-1 bg-transparent text-[#050505] text-[14px] font-medium placeholder-[#050505]/50 focus:outline-none resize-none w-full"
                    rows={4}
                  />
                  <ColorPicker value={newColor} onChange={setNewColor} />
                  <div className="flex justify-between mt-3">
                    <button onClick={() => { setIsCreating(false); setNewContent(''); }} className="text-[#050505]/60 text-xs font-medium">
                      Cancel
                    </button>
                    <button
                      onClick={saveNew}
                      disabled={createNote.isPending}
                      className="w-8 h-8 rounded-full bg-[#050505]/15 flex items-center justify-center hover:bg-[#050505]/25 transition-colors disabled:opacity-50"
                    >
                      <Check className="w-4 h-4 text-[#050505]" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                      rows={4}
                    />
                    <ColorPicker value={editColor} onChange={setEditColor} />
                    <div className="flex justify-between mt-3">
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="w-8 h-8 rounded-full bg-[#050505]/10 flex items-center justify-center hover:bg-[#050505]/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-[#050505]" />
                      </button>
                      <button
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
        )}

        {!isLoading && notes.length === 0 && !isCreating && (
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
      >
        <Plus className="w-6 h-6 text-[#050505]" />
      </motion.button>
    </motion.div>
  );
}
