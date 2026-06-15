import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useUpdateMe } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { PageHeader } from '../components/ui/custom/PageHeader';
import { GlassCard } from '../components/ui/custom/GlassCard';
import { Edit2, Check, Share2, QrCode, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { getAvatarUrl } from '../lib/avatar';

export default function ProfilePage() {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: user?.name ?? '', username: user?.username ?? '', bio: user?.bio ?? '' });
  const updateMe = useUpdateMe();

  const handleSave = async () => {
    try {
      await updateMe.mutateAsync(editData);
      queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
      className="min-h-[100dvh] relative pb-20 overflow-x-hidden"
    >
      <div className="absolute top-0 right-0 pointer-events-none opacity-10 z-0">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="0" r="150" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="200" cy="0" r="100" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
      </div>

      <PageHeader
        title="Profile"
        rightElement={
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[rgba(255,255,255,0.1)] transition-colors"
          >
            {isEditing ? <Check className="w-5 h-5 text-[#C6FF3B]" /> : <Edit2 className="w-5 h-5 text-white" />}
          </button>
        }
      />

      <div className="p-4 flex flex-col items-center relative z-10">
        <div className="relative mb-4">
          <div className="w-28 h-28 rounded-full p-[3px] bg-gradient-to-tr from-[#C6FF3B] to-[#050505] overflow-hidden">
            <img src={getAvatarUrl(user.avatarUrl ?? null, user.name)} alt="Profile" className="w-full h-full rounded-full bg-[#111] object-cover" />
          </div>
          {isEditing && (
            <div className="absolute inset-0 m-[3px] rounded-full bg-black/50 flex items-center justify-center cursor-pointer">
              <Camera className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        {isEditing ? (
          <input
            value={editData.name}
            onChange={e => setEditData({...editData, name: e.target.value})}
            className="bg-transparent border-b border-[#C6FF3B] text-2xl font-bold text-center text-white focus:outline-none mb-1 w-full max-w-[200px]"
          />
        ) : (
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-white">{user.name}</h2>
            <div className="w-5 h-5 rounded-full bg-[#0ea5e9] flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          </div>
        )}

        <p className="text-[rgba(255,255,255,0.6)] mb-4">@{user.username}</p>

        <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full px-4 py-1.5 flex items-center gap-2 mb-8">
          <div className="w-2.5 h-2.5 rounded-full bg-[#C6FF3B]" />
          <span className="text-sm font-medium text-white capitalize">{user.status}</span>
        </div>

        <div className="w-full space-y-6">
          <GlassCard className="p-4">
            <h3 className="text-[rgba(255,255,255,0.5)] text-sm font-medium mb-4 uppercase tracking-wider">User Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[rgba(255,255,255,0.5)] text-xs mb-1">Username</p>
                {isEditing ? (
                  <input
                    value={editData.username}
                    onChange={e => setEditData({...editData, username: e.target.value})}
                    className="w-full bg-[rgba(255,255,255,0.05)] rounded-lg p-2 text-white border border-[rgba(255,255,255,0.1)] focus:border-[#C6FF3B] focus:outline-none"
                  />
                ) : (
                  <p className="text-white">@{user.username}</p>
                )}
              </div>
              <div>
                <p className="text-[rgba(255,255,255,0.5)] text-xs mb-1">Bio</p>
                {isEditing ? (
                  <textarea
                    value={editData.bio}
                    onChange={e => setEditData({...editData, bio: e.target.value})}
                    className="w-full bg-[rgba(255,255,255,0.05)] rounded-lg p-2 text-white border border-[rgba(255,255,255,0.1)] focus:border-[#C6FF3B] focus:outline-none resize-none h-20"
                  />
                ) : (
                  <p className="text-white">{user.bio ?? '—'}</p>
                )}
              </div>
              <div>
                <p className="text-[rgba(255,255,255,0.5)] text-xs mb-1">Phone</p>
                <p className="text-white">{user.phone}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <h3 className="text-[rgba(255,255,255,0.5)] text-sm font-medium mb-4 uppercase tracking-wider">About</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[rgba(255,255,255,0.6)]">Member Since</span>
                <span className="text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgba(255,255,255,0.6)]">Last Active</span>
                <span className="text-white">Now</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden">
            <div className="p-4 flex items-center gap-3 hover:bg-[rgba(255,255,255,0.05)] cursor-pointer transition-colors border-b border-[rgba(255,255,255,0.05)]">
              <Share2 className="w-5 h-5 text-[#C6FF3B]" />
              <span className="text-white font-medium flex-1">Share Profile</span>
            </div>
            <div className="p-4 flex items-center gap-3 hover:bg-[rgba(255,255,255,0.05)] cursor-pointer transition-colors">
              <QrCode className="w-5 h-5 text-[#C9A8FF]" />
              <span className="text-white font-medium flex-1">My QR Code</span>
            </div>
          </GlassCard>

          {isEditing && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="w-full py-4 bg-[#C6FF3B] text-[#050505] rounded-full font-bold mt-4"
            >
              Save Changes
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
