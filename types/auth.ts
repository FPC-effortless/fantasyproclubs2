
export type User = Database['public']['Tables']['users']['Row'];
export type UserRole = 'admin' | 'manager' | 'player';

export interface AuthState {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
} 