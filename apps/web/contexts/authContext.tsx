import React, { createContext, useContext, useState, useEffect } from 'react';

import { Config } from '../config/config';
import { ApiClient } from '../services/client';
import { AuthService } from '../services/api/authService';
import { User } from '../types/user';

const config = Config.getInstance();
const axios = new ApiClient(config.baseUrl);
const authService = new AuthService(axios);

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Même en cas d'erreur côté serveur, on déconnecte l'utilisateur côté client
      setUser(null);
    }
  };

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      // Pour l'instant, on va simplement vérifier s'il y a un token côté client
      // Plus tard, on pourra appeler un endpoint backend pour valider le token
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.log('Utilisateur non connecté ou token expiré');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const contextValues: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValues}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
