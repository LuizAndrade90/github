import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './useAuth';
import { CustomGuide, FitnessLevel, GoalType } from '../types';

interface GenerateGuideParams {
  goal: GoalType;
  fitnessLevel: FitnessLevel;
  durationWeeks: number;
  daysPerWeek: number;
  hasInjuries: boolean;
  injuryDetails?: string;
  additionalNotes?: string;
}

export const useCustomGuides = () => {
  const { user } = useAuth();
  const [guides, setGuides] = useState<CustomGuide[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCustomGuides = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('custom_guides')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGuides(data || []);
    } catch (error) {
      console.error('Error fetching custom guides:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateCustomGuide = async (params: GenerateGuideParams): Promise<CustomGuide | null> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-custom-guide', {
        body: {
          userId: user.id,
          goal: params.goal,
          fitnessLevel: params.fitnessLevel,
          durationWeeks: params.durationWeeks,
          daysPerWeek: params.daysPerWeek,
          hasInjuries: params.hasInjuries,
          injuryDetails: params.injuryDetails,
          additionalNotes: params.additionalNotes,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (data?.guide) {
        // Refresh the guides list
        await fetchCustomGuides();
        return data.guide;
      }

      return null;
    } catch (error) {
      console.error('Error generating custom guide:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getGuideById = async (id: string): Promise<CustomGuide | null> => {
    try {
      const { data, error } = await supabase
        .from('custom_guides')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching custom guide:', error);
      throw error;
    }
  };

  const deleteCustomGuide = async (id: string) => {
    try {
      const { error } = await supabase.from('custom_guides').delete().eq('id', id);

      if (error) throw error;

      // Refresh the guides list
      await fetchCustomGuides();
    } catch (error) {
      console.error('Error deleting custom guide:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCustomGuides();
  }, [user]);

  return {
    guides,
    loading,
    generateCustomGuide,
    getGuideById,
    deleteCustomGuide,
    refresh: fetchCustomGuides,
  };
};
