import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setUser } from '@/lib/redux/slices/authSlice';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'parent' | 'child';
  children?: string[];
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
}

export const useAuth = (requireAuth = true): UseAuthReturn => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector(state => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');

        if (response.ok) {
          const data = await response.json();
          dispatch(setUser(data.user));
        } else if (requireAuth) {
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (requireAuth) {
          router.push('/login');
        }
      }
    };

    if (!user && !isLoading) {
      checkAuth();
    }
  }, [user, isLoading, requireAuth, router, dispatch]);

  return { user, isLoading };
};
