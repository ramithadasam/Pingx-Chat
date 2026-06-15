import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, Phone, Video, MoreVertical, Plus, Smile, Mic, Send, CheckCheck, Lock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useListConversations,
  useListMessages,
  useSendMessage,
  getMessagesQueryKey,
  getConversationsQueryKey,
} from '@workspace/api-client-react';
import type { Message } from '@workspace/api-client-react';
import { getSocket, connectSocket } from '../lib/socket';
import { getAvatarUrl } from '../lib/avatar';
import { formatMessageTime } from '../lib/format';
import { encryptMessage, decryptMessage, isEncrypted } from '../lib/crypto';
import { getMyPrivateKey, getOrDeriveSharedKey } from '../lib/keyManager';

export default function ChatPage() {
  const { user } = useApp();
  const params = useParams();
  const [, setLocation] = useLocation();
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const conversationId = params.id as string;

  const { data: conversations = [] } = useListConversations();
  const conv = conversations.find(c => c.id === conversationId);
  const other = conv?.otherUser;

  const { data: messagesPage, isLoading } = useListMessages(conversationId);
  const messages: Message[] = messagesPage?.messages ?? [];

  // E2E: derived AES-GCM shared key for this conversation
  const [sharedKey, setSharedKey] = useState<CryptoKey | null>(null);
  // Keep a ref so socket callbacks always read the latest value without
  // causing the effect to re-register on every render.
  const sharedKeyRef = useRef<CryptoKey | null>(null);
  sharedKeyRef.current = sharedKey;

  // Decrypted text per message id (only populated for E2E messages)
  const [decryptedTexts, setDecryptedTexts] = useState<Map<string, string>>(new Map());

  // Derive the shared key whenever the other user's public key becomes available
  useEffect(() => {
    if (!other?.publicKey) return;

    void (async () => {
      const privKey = await getMyPrivateKey();
      if (!privKey) return;
      try {
        const sk = await getOrDeriveSharedKey(conversationId, privKey, other.publicKey!);
        setSharedKey(sk);
      } catch {
        // Key derivation failed — chat continues in plaintext
      }
    })();
  }, [conversationId, other?.publicKey]);

  // Decrypt all loaded messages whenever the key or the message list changes
  useEffect(() => {
    if (!sharedKey || messages.length === 0) return;

    void (async () => {
      const map = new Map<string, string>();
      for (const msg of messages) {
        if (msg.text && isEncrypted(msg.text)) {
          try {
            map.set(msg.id, await decryptMessage(msg.text, sharedKey));
          } catch {
            map.set(msg.id, '[Encrypted message — key mismatch]');
          }
        }
      }
      setDecryptedTexts(map);
    })();
  }, [sharedKey, messages.length]);

  const sendMutation = useSendMessage({
    mutation: {
      onSuccess: async (newMsg) => {
        queryClient.setQueryData(
          getMessagesQueryKey(conversationId),
          (old: typeof messagesPage) => {
            const existing = old?.messages ?? [];
            if (existing.some(m => m.id === newMsg.id)) return old;
            return { messages: [...existing, newMsg], nextCursor: old?.nextCursor ?? null };
          },
        );
        // Decrypt the echoed-back message so our own sent bubble shows plaintext
        if (newMsg.text && isEncrypted(newMsg.text) && sharedKeyRef.current) {
          try {
            const plain = await decryptMessage(newMsg.text, sharedKeyRef.current);
            setDecryptedTexts(prev => new Map(prev).set(newMsg.id, plain));
          } catch { /* show ciphertext as fallback */ }
        }
        queryClient.invalidateQueries({ queryKey: getConversationsQueryKey() });
      },
    },
  });

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Socket.IO: listen for incoming messages
  useEffect(() => {
    connectSocket();
    const socket = getSocket();

    const handleNewMessage = async (msg: Message) => {
      if (msg.conversationId !== conversationId) return;

      queryClient.setQueryData(
        getMessagesQueryKey(conversationId),
        (old: typeof messagesPage) => {
          const existing = old?.messages ?? [];
          if (existing.some(m => m.id === msg.id)) return old;
          return { messages: [...existing, msg], nextCursor: old?.nextCursor ?? null };
        },
      );
      queryClient.invalidateQueries({ queryKey: getConversationsQueryKey() });

      // Decrypt incoming E2E message
      if (msg.text && isEncrypted(msg.text) && sharedKeyRef.current) {
        try {
          const plain = await decryptMessage(msg.text, sharedKeyRef.current);
          setDecryptedTexts(prev => new Map(prev).set(msg.id, plain));
        } catch {
          setDecryptedTexts(prev => new Map(prev).set(msg.id, '[Encrypted message — key mismatch]'));
        }
      }
    };

    socket.on('message:new', (msg: Message) => { void handleNewMessage(msg); });
    return () => { socket.off('message:new'); };
  }, [conversationId, queryClient]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    let payload = trimmed;
    if (sharedKeyRef.current) {
      try {
        payload = await encryptMessage(trimmed, sharedKeyRef.current);
      } catch {
        // If encryption fails for any reason, send plaintext rather than losing the message
      }
    }

    sendMutation.mutate({ conversationId, data: { text: payload, contentType: 'text' } });
    setText('');
  };

  // Resolve display text: prefer decrypted, fall back to raw (plaintext legacy messages)
  function displayText(msg: Message): string {
    if (!msg.text) return '';
    if (isEncrypted(msg.text)) return decryptedTexts.get(msg.id) ?? '🔒 Decrypting…';
    return msg.text;
  }

  const e2eActive = !!sharedKey;

  if (!conv && !isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center text-white">
        Conversation not found
      </div>
    );
  }

  const avatarSrc = getAvatarUrl(other?.avatarUrl ?? null, other?.name ?? '?');

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
            onClick={() => other && setLocation(`/contact-info/${other.id}`)}
          >
            <img src={avatarSrc} alt={other?.name} className="w-10 h-10 rounded-full bg-[#1a1a1a]" />
            <div>
              <h2 className="text-white font-medium">{other?.name ?? '...'}</h2>
              <div className="flex items-center gap-1.5">
                {e2eActive ? (
                  <>
                    <Lock className="w-3 h-3 text-[#C6FF3B]" />
                    <span className="text-[rgba(255,255,255,0.5)] text-xs">end-to-end encrypted</span>
                  </>
                ) : (
                  <>
                    {other?.status === 'online' && <div className="w-2 h-2 rounded-full bg-[#C6FF3B]" />}
                    <span className="text-[rgba(255,255,255,0.5)] text-xs capitalize">{other?.status ?? ''}</span>
                  </>
                )}
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
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#C6FF3B] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {e2eActive && (
          <div className="flex justify-center my-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(198,255,59,0.06)] border border-[rgba(198,255,59,0.15)] rounded-full">
              <Lock className="w-3 h-3 text-[#C6FF3B]" />
              <span className="text-[#C6FF3B] text-[11px] font-medium">Messages are end-to-end encrypted</span>
            </div>
          </div>
        )}

        <div className="flex justify-center my-4">
          <span className="px-3 py-1 bg-[rgba(255,255,255,0.05)] rounded-full text-xs text-[rgba(255,255,255,0.5)]">Today</span>
        </div>

        {messages.map(msg => {
          const isSent = msg.senderId === user?.id;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${isSent ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-[20px] px-4 py-2.5 ${
                  isSent
                    ? 'bg-[#C6FF3B] text-[#050505] rounded-tr-sm'
                    : 'bg-[#1a1a1a] text-white rounded-tl-sm'
                }`}
              >
                <p className="text-[15px] leading-relaxed">{displayText(msg)}</p>
              </div>
              <div className="flex items-center gap-1 mt-1 px-1">
                <span className="text-[10px] text-[rgba(255,255,255,0.4)]">{formatMessageTime(msg.createdAt)}</span>
                {isSent && <CheckCheck className="w-3 h-3 text-[#C6FF3B]" />}
              </div>
            </motion.div>
          );
        })}
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
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) void handleSend(); }}
              placeholder={e2eActive ? '🔒 Encrypted message…' : 'Type a message...'}
              className="flex-1 bg-transparent text-white placeholder-[rgba(255,255,255,0.4)] focus:outline-none px-2"
            />
            <button className="w-8 h-8 flex items-center justify-center text-[rgba(255,255,255,0.4)] hover:text-white">
              <Smile className="w-5 h-5" />
            </button>
          </div>

          {text.trim() ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => void handleSend()}
              disabled={sendMutation.isPending}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-[#C6FF3B] shrink-0 disabled:opacity-60"
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
