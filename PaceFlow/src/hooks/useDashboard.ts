import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './useAuth';
import { RunningSession } from '../types';

interface DashboardStats {
  totalDistance: number;
  totalRuns: number;
  totalDuration: number;
  averagePace: number;
  thisWeekDistance: number;
  thisWeekRuns: number;
  thisMonthDistance: number;
  thisMonthRuns: number;
  currentStreak: number;
  recentSessions: RunningSession[];
}

export const useDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalDistance: 0,
    totalRuns: 0,
    totalDuration: 0,
    averagePace: 0,
    thisWeekDistance: 0,
    thisWeekRuns: 0,
    thisMonthDistance: 0,
    thisMonthRuns: 0,
    currentStreak: 0,
    recentSessions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch all sessions
      const { data: sessions, error } = await supabase
        .from('running_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      if (!sessions || sessions.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate total stats
      const totalDistance = sessions.reduce((sum, s) => sum + (s.distance || 0), 0);
      const totalRuns = sessions.length;
      const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      const avgPace = sessions.reduce((sum, s) => sum + (s.pace || 0), 0) / sessions.filter(s => s.pace).length || 0;

      // Calculate this week stats
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
      weekStart.setHours(0, 0, 0, 0);

      const thisWeekSessions = sessions.filter(s => new Date(s.date) >= weekStart);
      const thisWeekDistance = thisWeekSessions.reduce((sum, s) => sum + (s.distance || 0), 0);
      const thisWeekRuns = thisWeekSessions.length;

      // Calculate this month stats
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthSessions = sessions.filter(s => new Date(s.date) >= monthStart);
      const thisMonthDistance = thisMonthSessions.reduce((sum, s) => sum + (s.distance || 0), 0);
      const thisMonthRuns = thisMonthSessions.length;

      // Calculate current streak (consecutive days with runs)
      const currentStreak = calculateStreak(sessions);

      // Get recent sessions (last 5)
      const recentSessions = sessions.slice(0, 5);

      setStats({
        totalDistance,
        totalRuns,
        totalDuration,
        averagePace: avgPace,
        thisWeekDistance,
        thisWeekRuns,
        thisMonthDistance,
        thisMonthRuns,
        currentStreak,
        recentSessions,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (sessions: RunningSession[]): number => {
    if (sessions.length === 0) return 0;

    const sortedSessions = [...sessions].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sortedSessions) {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (diffDays > streak) {
        break;
      }
    }

    return streak;
  };

  return {
    stats,
    loading,
    error,
    refetch: fetchDashboardData,
  };
};
