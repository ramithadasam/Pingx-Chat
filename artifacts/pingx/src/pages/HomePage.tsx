import { useApp } from '../context/AppContext';
import { Link, useLocation } from 'wouter';
import { Settings, ChevronRight, NotebookPen, UserPlus, Lightbulb, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useListConversations, useListFriendRequests, useListFriends, useCreateConversation, getFriendsQueryKey } from '@workspace/api-client-react';
import type { ConversationSummary } from '@workspace/api-client-react';
import { getAvatarUrl } from '../lib/avatar';
import { formatMessageTime } from '../lib/format';

function ConversationRow({ conv, onClick }: { conv: ConversationSummary; onClick: () => void }) {
  const other = conv.otherUser;
  const avatarSrc = getAvatarUrl(other.avatarUrl, other.name);
  const isOnline = other.status === 'online';

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-[20px] hover:bg-[rgba(255,255,255,0.04)] transition-colors w-full text-left"
    >
      <div className="relative shrink-0">
        <img src={avatarSrc} alt={other.name} className="w-12 h-12 rounded-full bg-[#1a1a1a]" />
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#C6FF3B] border-2 border-[#050505]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <span className="text-white font-medium text-[15px] truncate">{other.name}</span>
          <span className="text-[rgba(255,255,255,0.4)] text-xs shrink-0 ml-2">
            {conv.lastMessage ? formatMessageTime(conv.lastMessage.createdAt) : ''}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-[rgba(255,255,255,0.5)] text-sm truncate">
            {conv.lastMessage?.text ?? 'Start chatting'}
          </p>
          {conv.unreadCount > 0 && (
            <span className="ml-2 shrink-0 min-w-[20px] h-5 px-1 rounded-full bg-[#C6FF3B] text-[#050505] text-xs font-bold flex items-center justify-center">
              {conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function HomePage() {
  const { user } = useApp();
  const [, setLocation] = useLocation();
  const { data: conversations = [], isLoading } = useListConversations();
  const { data: friendRequests } = useListFriendRequests({ query: { queryKey: ['/api/friends/requests'] } });
  const pendingRequestCount = friendRequests?.incoming?.length ?? 0;
  const { data: friends = [] } = useListFriends({ query: { queryKey: getFriendsQueryKey() } });
  const createConversation = useCreateConversation();

  const avatarSrc = getAvatarUrl(user?.avatarUrl ?? null, user?.name ?? 'Me');

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-[100dvh] pb-20 relative overflow-x-hidden"
    >
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

          <div className="flex items-center gap-3">
            <Link href="/friend-requests">
              <button className="relative w-12 h-12 flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition">
                <Bell className="w-6 h-6 text-white" />
                {pendingRequestCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#C6FF3B] text-[#050505] text-xs font-bold flex items-center justify-center">
                    {pendingRequestCount}
                  </span>
                )}
              </button>
            </Link>
            <Link href="/profile">
              <div className="relative cursor-pointer">
                <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#C6FF3B] to-[#C6FF3B] overflow-hidden">
                  <img src={avatarSrc} alt="Profile" className="w-full h-full rounded-full bg-[#111]" />
                </div>
              </div>
            </Link>
          </div>
        </header>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Bhooooo!!!</h1>
          <h2 className="text-3xl font-bold text-[#C6FF3B]">
            {user ? `Hey ${user.name.split(' ')[0]}!` : 'Howz ur day goinnn??!!'}
          </h2>
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

        {friends.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3 px-1">
              <h3 className="text-lg font-bold text-white">Friends</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {friends.map(({ user: friend, conversationId }) => (
                <button
                  key={friend.id}
                  onClick={() => {
                    if (conversationId) {
                      setLocation(`/chat/${conversationId}`);
                    } else {
                      createConversation.mutate(
                        { data: { userId: friend.id } },
                        { onSuccess: (res) => setLocation(`/chat/${res.id}`) },
                      );
                    }
                  }}
                  className="flex flex-col items-center gap-1.5 shrink-0"
                >
                  <div className="relative">
                    <img
                      src={getAvatarUrl(friend.avatarUrl, friend.name)}
                      alt={friend.name}
                      className="w-14 h-14 rounded-full bg-[#1a1a1a]"
                    />
                    {friend.status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#C6FF3B] border-2 border-[#050505]" />
                    )}
                  </div>
                  <span className="text-[rgba(255,255,255,0.7)] text-xs truncate max-w-[56px]">{friend.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-lg font-bold text-white">Recent</h3>
          </div>

          {isLoading && (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-[20px] bg-[rgba(255,255,255,0.03)] animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && conversations.length === 0 && (
            <div className="text-center py-10 text-[rgba(255,255,255,0.35)]">
              <p className="text-base font-medium">No conversations yet</p>
              <p className="text-sm mt-1">Add a friend to start chatting</p>
            </div>
          )}

          <div className="flex flex-col gap-1">
            {conversations.map(conv => (
              <ConversationRow
                key={conv.id}
                conv={conv}
                onClick={() => setLocation(`/chat/${conv.id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
