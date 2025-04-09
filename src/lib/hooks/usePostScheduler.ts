import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PostScheduler } from '../services/post-scheduler';

export function usePostScheduler() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      PostScheduler.start();
      return () => PostScheduler.stop();
    }
  }, [user]);
}