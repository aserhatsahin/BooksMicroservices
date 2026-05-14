import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const NAME_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';

type JwtPayload = Record<string, unknown> & { exp: number };

interface AuthState {
  token: string | null;
  userName: string | null;
  isAdmin: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const parseToken = (token: string): AuthState => {
  try {
    const raw = token.replace(/^Bearer\s+/i, '');
    const decoded = jwtDecode<JwtPayload>(raw);
    const roleValue = decoded[ROLE_CLAIM];
    const roles = roleValue
      ? Array.isArray(roleValue) ? roleValue as string[] : [roleValue as string]
      : [];
    return {
      token,
      userName: decoded[NAME_CLAIM] as string ?? null,
      isAdmin: roles.includes('Admin'),
    };
  } catch {
    return { token: null, userName: null, isAdmin: false };
  }
};

const getInitialState = (): AuthState => {
  const token = localStorage.getItem('token');
  if (!token) return { token: null, userName: null, isAdmin: false };
  return parseToken(token);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(getInitialState);

  const login = useCallback((token: string, refreshToken: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    setAuth(parseToken(token));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setAuth({ token: null, userName: null, isAdmin: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
