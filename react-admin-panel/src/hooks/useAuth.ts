import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { AdminUser } from '@/types/auth.types';

export const useAuth = () => {
  const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  return {
    user: user as AdminUser | null,
    token,
    isAuthenticated,
  };
};
