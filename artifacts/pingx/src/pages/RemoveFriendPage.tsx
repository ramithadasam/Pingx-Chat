import { useState } from 'react';
import { useListFriends, useRemoveFriend, getFriendsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '../components/ui/custom/PageHeader';
import { ConfirmModal } from '../components/ui/custom/ConfirmModal';
import { UserMinus, Search } from 'lucide-react';
import { getAvatarUrl } from '../lib/avatar';
import { toast } from 'sonner';

export default function RemoveFriendPage() {
  const queryClient = useQueryClient();
  const { data: friends = [] } = useListFriends({ query: { queryKey: getFriendsQueryKey() } });
  const removeFriend = useRemoveFriend();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [toRemoveId, setToRemoveId] = useState<string | null>(null);

  const filtered = friends.filter(f => f.user.name.toLowerCase().includes(search.toLowerCase()));

  const toggleSelect = (id: string) => {
    const newSet = new Set(selected);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelected(newSet);
  };

  const doRemove = (ids: string[]) => {
    Promise.all(ids.map(id => removeFriend.mutateAsync({ userId: id }))).then(() => {
      queryClient.invalidateQueries({ queryKey: getFriendsQueryKey() });
      toast.success('Removed successfully');
      setSelected(new Set());
    }).catch(() => toast.error('Failed to remove'));
  };

  const handleRemove = () => {
    if (toRemoveId) {
      doRemove([toRemoveId]);
    } else if (selected.size > 0) {
      doRemove([...selected]);
    }
    setModalOpen(false);
    setToRemoveId(null);
  };

  const getContactName = (id: string) => friends.find(f => f.user.id === id)?.user.name ?? '';

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
      className="min-h-[100dvh] relative pb-24"
    >
      <PageHeader title="Remove Friends" subtitle="Manage your contact list" rightElement={<UserMinus className="w-6 h-6 text-[#FFC6DA]" />} />

      <div className="p-4">
        <div className="relative mb-6">
          <Search className="w-5 h-5 text-[rgba(255,255,255,0.4)] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full pl-11 pr-4 py-3 text-white placeholder-[rgba(255,255,255,0.4)] focus:outline-none focus:border-[#FFC6DA]"
          />
        </div>

        <div className="space-y-2">
          {filtered.map(({ user: contact }) => (
            <div key={contact.id} className="flex items-center gap-3 p-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-[20px]">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer ${selected.has(contact.id) ? 'bg-[#EF4444] border-[#EF4444]' : 'border-[rgba(255,255,255,0.3)]'}`}
                onClick={() => toggleSelect(contact.id)}
              >
                {selected.has(contact.id) && <motion.div initial={{scale:0}} animate={{scale:1}} className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
              <img src={getAvatarUrl(contact.avatarUrl, contact.name)} alt={contact.name} className="w-12 h-12 rounded-full" />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium truncate">{contact.name}</h3>
                <p className="text-[rgba(255,255,255,0.5)] text-sm truncate">@{contact.username}</p>
              </div>
              <button
                onClick={() => { setToRemoveId(contact.id); setModalOpen(true); }}
                className="px-3 py-1.5 bg-[#EF4444]/10 text-[#EF4444] text-sm font-medium rounded-full hover:bg-[#EF4444]/20 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center text-[rgba(255,255,255,0.4)] py-10">No contacts found.</div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-0 inset-x-0 p-4 bg-[#111]/90 backdrop-blur-lg border-t border-[rgba(255,255,255,0.1)] z-20 flex justify-between items-center"
          >
            <span className="text-white font-medium">{selected.size} selected</span>
            <button
              onClick={() => { setToRemoveId(null); setModalOpen(true); }}
              className="px-6 py-3 bg-[#EF4444] text-white font-semibold rounded-full hover:bg-[#DC2626] transition-colors"
            >
              Remove Selected
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={modalOpen}
        title="Confirm Remove"
        description={toRemoveId
          ? `Are you sure you want to remove ${getContactName(toRemoveId)} from your friends?`
          : `Are you sure you want to remove ${selected.size} friends?`}
        onConfirm={handleRemove}
        onCancel={() => { setModalOpen(false); setToRemoveId(null); }}
      />
    </motion.div>
  );
}
