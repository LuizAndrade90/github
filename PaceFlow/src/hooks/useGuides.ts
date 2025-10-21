import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { StandardGuide } from '../types';

export const useStandardGuides = () => {
  const [guides, setGuides] = useState<StandardGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchGuides();
  }, []);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('standard_guides')
        .select('*')
        .order('duration_weeks', { ascending: true });

      if (error) throw error;

      setGuides(data || []);
    } catch (err) {
      console.error('Error fetching guides:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const getGuideById = async (id: string): Promise<StandardGuide | null> => {
    try {
      const { data, error } = await supabase
        .from('standard_guides')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      console.error('Error fetching guide:', err);
      return null;
    }
  };

  return {
    guides,
    loading,
    error,
    refetch: fetchGuides,
    getGuideById,
  };
};
