import React, {createContext, useCallback, useContext, useState} from 'react';
import api from '../services/api';

interface AuthState {
  token: string;
  responseUser: object;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: object;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData
);

export const AuthProvider: React.FC = ({children}) => {
  const [data, setData] = useState<AuthState>(() => {
    const token = localStorage.getItem('@Gobarber:token');
    const responseUser = localStorage.getItem('@Gobarber:user');

    if (token && responseUser) {
      return {token, responseUser: JSON.parse(responseUser)};
    }

    return {} as AuthState;
  });

  const signOut = useCallback(() => {
    localStorage.removeItem('@Gobarber:token');
    localStorage.removeItem('@Gobarber:user');

    setData({} as AuthState);
  }, []);

  const signIn = useCallback(async ({email, password}) => {
    const response = await api.post('sessions', {
      email,
      password,
    });

    const {token, responseUser} = response.data;

    localStorage.setItem('@Gobarber:token', token);
    localStorage.setItem('@Gobarber:user', JSON.stringify(responseUser));

    setData({token, responseUser});
  }, []);

  return (
    <AuthContext.Provider value={{user: data.responseUser, signIn, signOut}}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must br used within an AuthProvider');
  }
  return context;
}
