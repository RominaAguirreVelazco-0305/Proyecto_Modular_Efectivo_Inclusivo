import { useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { audioFeedback } from '../utils/audioFeedback';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      audioFeedback.playSuccess();
      return result.user;
    } catch (error: any) {
      setError(error.message);
      audioFeedback.playError();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      audioFeedback.playSuccess();
    } catch (error: any) {
      setError(error.message);
      audioFeedback.playError();
      throw error;
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    logout
  };
};