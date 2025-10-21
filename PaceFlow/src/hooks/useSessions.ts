import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { RunningSession } from '../types';
import { useAuth } from './useAuth';

export const useSessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<RunningSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('running_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      setSessions(data || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (session: Partial<RunningSession>): Promise<RunningSession | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('running_sessions')
        .insert({
          ...session,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh sessions list
      await fetchSessions();

      return data;
    } catch (err) {
      console.error('Error creating session:', err);
      throw err;
    }
  };

  const updateSession = async (id: string, updates: Partial<RunningSession>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('running_sessions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Refresh sessions list
      await fetchSessions();

      return true;
    } catch (err) {
      console.error('Error updating session:', err);
      return false;
    }
  };

  const deleteSession = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('running_sessions')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Refresh sessions list
      await fetchSessions();

      return true;
    } catch (err) {
      console.error('Error deleting session:', err);
      return false;
    }
  };

  const getSessionById = async (id: string): Promise<RunningSession | null> => {
    try {
      const { data, error } = await supabase
        .from('running_sessions')
        .select('*')
        .eq('id', id)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error fetching session:', err);
      return null;
    }
  };

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    getSessionById,
  };
};
