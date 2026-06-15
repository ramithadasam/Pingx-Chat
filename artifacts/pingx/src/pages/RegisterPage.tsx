import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useRegister, useUpdateMe } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { setToken } from '../lib/auth';
import { connectSocket } from '../lib/socket';
import { initializeKeys } from '../lib/keyManager';

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const registerMutation = useRegister();
  const updateMeMutation = useUpdateMe();

  const [code, setCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (phone.length < 10) {
      toast.error('Enter a valid phone number');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (username.length < 3) {
      toast.error('Username must be at least 3 characters');
      return;
    }
    if (!name.trim()) {
      toast.error('Enter your name');
      return;
    }

    registerMutation.mutate(
      { data: { phone: `${code}${phone}`, password, username, name } },
      {
        onSuccess: ({ token }) => {
          setToken(token);
          connectSocket();
          void queryClient.invalidateQueries();
          toast.success('Welcome to PingX!');
          // Generate E2E keys on first registration and upload the public key
          void initializeKeys().then((publicKey) => {
            if (publicKey) updateMeMutation.mutate({ publicKey });
          });
          setLocation('/home');
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Registration failed');
        },
      },
    );
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.2 }}
      className="min-h-[100dvh] flex flex-col justify-center p-6 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 pointer-events-none opacity-20 z-0">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="0" r="150" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="200" cy="0" r="100" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="200" cy="0" r="50" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
      </div>

      <div className="relative z-10">
        <h1 className="text-4xl font-bold text-white mb-2">Join PingX</h1>
        <p className="text-[rgba(255,255,255,0.6)] mb-8">Create an account to start chatting</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[rgba(255,255,255,0.5)] text-xs mb-1.5 block">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              data-testid="input-name"
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[16px] px-4 py-3 text-white placeholder-[rgba(255,255,255,0.4)] focus:outline-none focus:border-[#C6FF3B]"
            />
          </div>

          <div>
            <label className="text-[rgba(255,255,255,0.5)] text-xs mb-1.5 block">Username</label>
            <div className="flex items-center bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[16px] px-4 py-3 focus-within:border-[#C6FF3B]">
              <span className="text-[rgba(255,255,255,0.4)] mr-1">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_.]/g, ''))}
                placeholder="username"
                data-testid="input-username"
                className="flex-1 bg-transparent text-white placeholder-[rgba(255,255,255,0.4)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[rgba(255,255,255,0.5)] text-xs mb-1.5 block">Phone number</label>
            <div className="flex gap-2">
              <select
                value={code}
                onChange={(e) => setCode(e.target.value)}
                data-testid="select-country-code"
                className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[16px] px-3 py-3 text-white focus:outline-none focus:border-[#C6FF3B] appearance-none"
              >
                <option value="+91">+91 🇮🇳</option>
                <option value="+1">+1 🇺🇸</option>
                <option value="+44">+44 🇬🇧</option>
                <option value="+61">+61 🇦🇺</option>
                <option value="+971">+971 🇦🇪</option>
              </select>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter phone number"
                data-testid="input-phone-number"
                maxLength={10}
                className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[16px] px-4 py-3 text-white placeholder-[rgba(255,255,255,0.4)] focus:outline-none focus:border-[#C6FF3B]"
              />
            </div>
          </div>

          <div>
            <label className="text-[rgba(255,255,255,0.5)] text-xs mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              data-testid="input-password"
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[16px] px-4 py-3 text-white placeholder-[rgba(255,255,255,0.4)] focus:outline-none focus:border-[#C6FF3B]"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={registerMutation.isPending}
            data-testid="button-register"
            className="w-full py-3.5 bg-[#C6FF3B] text-[#050505] rounded-full font-semibold text-[15px] hover:bg-[#d4ff5e] transition-colors disabled:opacity-60 mt-2"
          >
            {registerMutation.isPending ? 'Creating account...' : 'Create account'}
          </motion.button>
        </form>

        <p className="text-center text-[rgba(255,255,255,0.5)] text-sm mt-6">
          Already have an account?{' '}
          <button onClick={() => setLocation('/login')} className="text-[#C6FF3B] font-medium">
            Log in
          </button>
        </p>
      </div>
    </motion.div>
  );
}
