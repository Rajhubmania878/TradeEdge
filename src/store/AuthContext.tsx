import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/shared/types';
import { authService } from '@/services/authService';

export type ViewMode =
  | 'LANDING'
  | 'LOGIN'
  | 'SIGNUP'
  | 'FORGOT_PASSWORD'
  | 'TERMS'
  | 'PRIVACY'
  | 'APP';

interface AuthContextType {
  currentUser: UserProfile | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  isUniverseLoaded: boolean;
  setIsUniverseLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  logout: () => Promise<void>;
  isCheckingAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authService.getUser());
  const [viewMode, setViewMode] = useState<ViewMode>(() => (authService.getToken() ? 'APP' : 'LANDING'));
  const [isUniverseLoaded, setIsUniverseLoaded] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    authService.me()
      .then(user => {
        if (user && user.isActive) {
          setCurrentUser(user);
          if (viewMode === 'LOGIN' || viewMode === 'SIGNUP' || viewMode === 'LANDING') {
            setViewMode('APP');
          }
        } else {
          setCurrentUser(null);
          if (viewMode === 'APP') {
            setViewMode('LOGIN');
          }
        }
      })
      .catch(err => {
        console.error('[AuthContext] Auth check failed:', err);
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, []);

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setIsUniverseLoaded(false);
    setViewMode('LOGIN');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        viewMode,
        setViewMode,
        isUniverseLoaded,
        setIsUniverseLoaded,
        logout,
        isCheckingAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
