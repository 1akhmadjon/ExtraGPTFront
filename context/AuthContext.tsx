import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api/client';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  businessId: number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [businessId, setBusinessId] = useState<number | null>(null);

  useEffect(() => {
    const initAuth = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');
      const storedBusinessId = localStorage.getItem('business_id');

      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          if (storedBusinessId) {
            setBusinessId(parseInt(storedBusinessId));
          }
        } catch (e) {
          console.error("Failed to parse user from local storage");
          localStorage.removeItem('user');
          localStorage.removeItem('business_id');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);

      // If user is owner or operator, fetch their business
      if (data.user.role === 'owner' || data.user.role === 'operator') {
        try {
          // For owners, get their businesses
          if (data.user.role === 'owner') {
            const { data: businesses } = await apiClient.get('/admin/businesses');
            if (businesses.businesses && businesses.businesses.length > 0) {
              // Get first business owned by this user
              const ownedBusiness = businesses.businesses.find(
                (b: any) => b.owner_id === data.user.id
              );
              if (ownedBusiness) {
                setBusinessId(ownedBusiness.id);
                localStorage.setItem('business_id', ownedBusiness.id.toString());
              }
            }
          }
          // For operators, we would need an endpoint to get their assigned business
          // For now, we'll set it manually or through another endpoint
        } catch (err) {
          console.error('Failed to fetch business information', err);
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('business_id');
    setUser(null);
    setBusinessId(null);
    window.location.href = '/#/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        businessId
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
