import { createContext, useContext, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetMe } from '@workspace/api-client-react';
import { clearToken } from '../lib/auth';
import { disconnectSocket } from '../lib/socket';
import type { User } from '@workspace/api-client-react';

interface AppState {
  user: User | null;
  isLoadingUser: boolean;
  logout: () => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetMe({
    query: {
      queryKey: ["/api/users/me"],
      retry: false,
      enabled: !!localStorage.getItem('pingx_token'),
    },
  });

  const logout = () => {
    clearToken();
    disconnectSocket();
    queryClient.clear();
    window.location.href = '/login';
  };

  return (
    <AppContext.Provider value={{
      user: data?.user ?? null,
      isLoadingUser: isLoading,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
