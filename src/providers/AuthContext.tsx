// storage/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { setAuthToken } from '@api/http';
import { getOrCreateInstallIdWeb } from '@services/fingerprint/collector';
import { userSetAdditionalInfo } from '@services/fingerprint/sender';

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
  internalId: string;
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

  // init AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((jwt) => {
      if (!jwt) {
        setAuthToken(undefined);
        return;
      }
      try {
        const userInfo = convertJwtToUser(jwt);
        setUser(userInfo);
        setAuthToken(jwt);       // update http client during startup
      } catch {
        AsyncStorage.removeItem(STORAGE_KEY);
        setAuthToken(undefined);
      }
    });
  }, []);

  useEffect(() => {
    setAuthToken(user?.jwt); // update http client
  }, [user?.jwt]);

  const login = (jwt: string) => {
    try {
      const userInfo = convertJwtToUser(jwt);
      setUser(userInfo);
      AsyncStorage.setItem(STORAGE_KEY, jwt);
      setAuthToken(jwt);         // update http client
    } catch {
      // todo: add error
    }
  };

  const logout = () => {
    const userPrev = user?.internalId ?? "none"
    console.log("internalId", user?.internalId ?? "none")
    userSetAdditionalInfo({
      eventType: 'logout',
      userId: userPrev
    });
    setUser(null);
    AsyncStorage.removeItem(STORAGE_KEY);
    setAuthToken(undefined);     // ⟵ очистим токен в http-клиенте
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
    internalId: decoded.sub,
    walletAddress: decoded.current_wallet ?? '',
    username: decoded.username ?? '',
    avatarUrl: decoded.avatar_url ?? null,
  };
}

export const useAuth = () => useContext(AuthContext);
