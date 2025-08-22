'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { api } from '../../services/api';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  isAuth: boolean;
  loading: boolean;
  hasMore: boolean;
}

interface AuthContextData {
  user: User | null;
  isAuth: boolean;
  loading: boolean;
  hasMore: boolean;
  handleLogin: (userData: { email: string; password: string }) => Promise<void>;
  handleLogout: () => void;
  getCurrentUser: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const initialState: AuthState = {
  user: null,
  isAuth: false,
  loading: true,
  hasMore: true,
};

type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'RESET' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuth: true,
        loading: false,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuth: false,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuth: false,
        loading: false,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async (): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const { data } = await api.get('/auth/me');
      dispatch({ type: 'AUTH_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'AUTH_FAILURE' });
    }
  };

  const handleLogin = async (userData: { email: string; password: string }): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const { data } = await api.post('/auth/login', userData);
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Set token in axios headers
      api.defaults.headers.Authorization = `Bearer ${data.token}`;
      
      dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
    } catch (err) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw err;
    }
  };

  const handleLogout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('companyId');
    delete api.defaults.headers.Authorization;
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuth: state.isAuth,
        loading: state.loading,
        hasMore: state.hasMore,
        handleLogin,
        handleLogout,
        getCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider, useAuth };