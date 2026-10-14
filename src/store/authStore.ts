import { create } from 'zustand';
import { StorageService } from '../services/storage';

export interface UserSession {
  fullName: string;
  email: string;
  phone: string;
  isLoggedIn: boolean;
  loggedInAt: string;
}

interface AuthStore {
  user: UserSession | null;
  login: (userData: { fullName: string; email: string; phone: string }) => void;
  logout: () => void;
}

const initialAuth = StorageService.getAuth<UserSession | null>(null);

export const useAuthStore = create<AuthStore>((set) => ({
  user: initialAuth,
  login: (userData) => {
    const session: UserSession = {
      ...userData,
      isLoggedIn: true,
      loggedInAt: new Date().toISOString(),
    };
    StorageService.setAuth(session);
    set({ user: session });
  },
  logout: () => {
    StorageService.removeItem('cmc_auth_session');
    set({ user: null });
  },
}));
