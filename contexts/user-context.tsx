'use client';

import { appUrl } from '@/constants/appRoutes';
import { deleteCookie } from 'cookies-next';
import { usePathname, useRouter } from 'next/navigation';
import type React from 'react';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import Cookies from 'js-cookie';
import api from '@/services/api';
import { Profession } from '@/types';
import { fetchUserAuthenticated } from '@/lib/user-api';
import { AddressData } from '@/types/address';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
  address: {
    id: string;
    state: string;
    city: string;
    district: string;
    street: string;
    complement: string;
    number: string;
    zipCode: string;
  };

  partnerSupplier?: {
    id: string;
    tradeName: string;
    companyName: string;
    document: string;
    stateRegistration: string;
    contact: string;
    addressId: string;
    accessPending: boolean;
    isPaid?: boolean;
    subscription?: {
      id: string;
      partnerSupplier: string;
      partnerSupplierId: string;
      stripeCustomerId: string;
      subscriptionId: string;
      subscriptionStatus: string;
      planType: string;
      currentPeriodEnd: string;
      cancelAtPeriodEnd: boolean;
      createdAt: string;
      updatedAt: string;
    };
  } | null;
  professional?: {
    id: string;
    name: string;
    profession: Profession;
    document: string;
    generalRegister: string;
    registrationAgency: string;
    description: string;
    experience: string;
    officeName: string;
    verified: boolean;
    featured: boolean;
    level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    points: number;
    phone: string;
    socialMediaId?: string;
  } | null;
  loveDecoration?: {
    id: string;
    name: string;
    contact: string;
    instagram: string;
    tiktok: string;
  } | null;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateProfileImage: (profileImage: string) => void;
  role: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string>('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if(pathname.includes("/auth")) {
          return;
        }

        const token = getCookie('token');
        
        if (!token) {
          router.push(appUrl.login);
          return;
        }
        const result = await fetchUserAuthenticated();
        setUser(result.data);
      } catch (err) {
        console.error('Erro ao carregar usuário:', err);
        setError('Erro ao carregar usuário');
        router.push(appUrl.login);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [router]);

  useEffect(() => {
    const roleFromCookie = Cookies.get('role');
    if (roleFromCookie) setRole(JSON.parse(roleFromCookie));
  }, []);

  const logout = () => {
    deleteCookie('token');
    setUser(null);
    setError(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user && user.loveDecoration)
      setUser({
        ...user,
        ...userData,
        loveDecoration: {
          ...user.loveDecoration,
          ...userData,
        },
      });

    if (user && user.professional)
      setUser({
        ...user,
        ...userData,
        professional: {
          ...user.professional,
          ...userData,
        },
      });

    if (user && user.partnerSupplier)
      setUser({
        ...user,
        ...userData,
        partnerSupplier: {
          ...user.partnerSupplier,
          ...userData,
        },
      });
  };

  const updateProfileImage = (profileImage: string) => {
    if (user)
      setUser({
        ...user,
        profileImage,
      });
  };

  const value: UserContextType = {
    user,
    isLoading,
    logout,
    updateUser,
    updateProfileImage,
    role,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useAuth = () => {
  const { user, isLoading } = useUser();
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
};
