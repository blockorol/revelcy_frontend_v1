import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {jwtDecode} from 'jwt-decode';

const STORAGE_KEY = 'auth-token';

interface JwtPayload {
  sub: string;
  user_id: string;
  avatar_url?: string;
  current_wallet?: string;
  username?: string;
}

export interface UserInfo {
  jwt: string;
  userId: string;
  walletAddress: string;
  username: string;
  avatarUrl: string | null;
}

const AuthContext = createContext<{
  user: UserInfo | null;
  login: (jwt: string) => void;
  logout: () => void;
}>({
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((jwt) => {
      if (jwt) {
        try {
          const userInfo = convertJwtToUser(jwt)
          setUser(userInfo);
        } catch (e) {
          AsyncStorage.removeItem(STORAGE_KEY);
        }
      }
    });
  }, []);

  const login = (jwt: string) => {
    try {
      const userInfo = convertJwtToUser(jwt)
      setUser(userInfo);
      AsyncStorage.setItem(STORAGE_KEY, jwt);
    } catch {}
  };

  const logout = () => {
    setUser(null);
    AsyncStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function convertJwtToUser(jwt: string): UserInfo {
      const decoded = jwtDecode<JwtPayload>(jwt);
      return {
        jwt,
        userId: decoded.sub,
        walletAddress: decoded.current_wallet ?? '',
        username: decoded.username ?? '',
        avatarUrl: decoded.avatar_url ?? null,
      }
}

export const useAuth = () => useContext(AuthContext);
