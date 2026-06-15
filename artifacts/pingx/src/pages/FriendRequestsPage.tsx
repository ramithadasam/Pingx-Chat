import { useListFriendRequests, useRespondToFriendRequest, getFriendsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { PageHeader } from '../components/ui/custom/PageHeader';
import { GlassCard } from '../components/ui/custom/GlassCard';
import { Check, X, Clock } from 'lucide-react';
import { getAvatarUrl } from '../lib/avatar';
import { toast } from 'sonner';

export default function FriendRequestsPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useListFriendRequests({
    query: { queryKey: ['/api/friends/requests'] },
  });
  const respond = useRespondToFriendRequest();

  const incoming = data?.incoming ?? [];
  const outgoing = data?.outgoing ?? [];

  const handleRespond = (id: string, action: 'accept' | 'reject') => {
    respond.mutate(
      { id, data: { action } },
      {
        onSuccess: () => {
          toast.success(action === 'accept' ? 'Friend request accepted!' : 'Request declined');
          refetch();
          queryClient.invalidateQueries({ queryKey: getFriendsQueryKey() });
          if (action === 'accept') {
            setTimeout(() => setLocation('/home'), 800);
          }
        },
        onError: () => toast.error('Something went wrong'),
      },
    );
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
      className="min-h-[100dvh] relative pb-20"
    >
      <PageHeader title="Friend Requests" onBack={() => setLocation('/home')} />

      <div className="p-4 space-y-6">
        {/* Incoming */}
        <div>
          <h3 className="text-[rgba(255,255,255,0.5)] text-sm font-medium mb-3 uppercase tracking-wider ml-1">
            Incoming ({incoming.length})
          </h3>

          {isLoading && (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-20 rounded-[20px] bg-[rgba(255,255,255,0.03)] animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && incoming.length === 0 && (
            <GlassCard className="p-6 text-center">
              <p className="text-[rgba(255,255,255,0.4)] text-sm">No incoming requests</p>
            </GlassCard>
          )}

          <div className="space-y-3">
            {incoming.map((req) => (
              <GlassCard key={req.id} className="p-4 flex items-center gap-3">
                <img
                  src={getAvatarUrl(req.sender.avatarUrl ?? null, req.sender.name)}
                  alt={req.sender.name}
                  className="w-12 h-12 rounded-full shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{req.sender.name}</p>
                  <p className="text-[rgba(255,255,255,0.5)] text-sm">@{req.sender.username}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleRespond(req.id, 'reject')}
                    disabled={respond.isPending}
                    className="w-10 h-10 rounded-full bg-[rgba(239,68,68,0.15)] flex items-center justify-center hover:bg-[rgba(239,68,68,0.3)] transition-colors"
                  >
                    <X className="w-5 h-5 text-[#EF4444]" />
                  </button>
                  <button
                    onClick={() => handleRespond(req.id, 'accept')}
                    disabled={respond.isPending}
                    className="w-10 h-10 rounded-full bg-[rgba(198,255,59,0.15)] flex items-center justify-center hover:bg-[rgba(198,255,59,0.3)] transition-colors"
                  >
                    <Check className="w-5 h-5 text-[#C6FF3B]" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Outgoing */}
        {outgoing.length > 0 && (
          <div>
            <h3 className="text-[rgba(255,255,255,0.5)] text-sm font-medium mb-3 uppercase tracking-wider ml-1">
              Sent ({outgoing.length})
            </h3>
            <div className="space-y-3">
              {outgoing.map((req) => (
                <GlassCard key={req.id} className="p-4 flex items-center gap-3">
                  <img
                    src={getAvatarUrl(req.receiver.avatarUrl ?? null, req.receiver.name)}
                    alt={req.receiver.name}
                    className="w-12 h-12 rounded-full shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{req.receiver.name}</p>
                    <p className="text-[rgba(255,255,255,0.5)] text-sm">@{req.receiver.username}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[rgba(255,255,255,0.4)] text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Pending</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
