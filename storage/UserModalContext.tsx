import { updateAvatar as updateAvatarAPI } from '@api/auth';
import { UserModal } from '@components/user/UserModal';
import { useAuth } from '@storage/AuthContext';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  userId: string;
  username: string;
  walletAddress: string;
  avatarUrl: string | null;
}

interface UserModalContextType {
  openUserModal: (user: User) => void;
  openPersonalUserModal: () => void;
  closeUserModal: () => void;
}

const UserModalContext = createContext<UserModalContextType | null>(null);

export const useUserModal = (): UserModalContextType => {
  const context = useContext(UserModalContext);
  if (!context) throw new Error("useUserModal must be used within a UserModalProvider");
  return context;
};

export const UserModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const currentUser = useAuth()
  const [user, setUser] = useState<User | null>(null);
  const updateAvatar = async(avatarUri:string) => {
    if (currentUser.user === null) {
      return
    }
    try {
      const response = await fetch(avatarUri);
      const blob = await response.blob();

      const file = new File([blob], 'avatar.png', { type: blob.type });

      const resp = await updateAvatarAPI({file:file, jwt:currentUser.user.jwt});
      currentUser.login(resp.jwt)
      setUser(currentUser.user)
    } catch (err) {
      console.error(err);
    }
  }

  const openUserModal = (u: User) => setUser(u);
  const openPersonalUserModal = () => setUser(currentUser.user);
  const closeUserModal = () => setUser(null);

  return (
    <UserModalContext.Provider value={{
      openPersonalUserModal,
      openUserModal,
      closeUserModal 
      }}>
      {children}
      {user && <UserModal 
        updateAvatar={updateAvatar}
        logout={currentUser.logout}
        isPersonal={currentUser.user?.userId===user.userId}
        user={user}
        onClose={closeUserModal} />}
    </UserModalContext.Provider>
  );
};
