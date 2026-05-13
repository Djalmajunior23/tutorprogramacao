import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { authService } from '../services/api';

const STORAGE_KEY = 'portal_prof_djalma_user';

const INITIAL_USER: UserProfile = {
  name: '',
  className: '',
  avatar: '👨‍💻',
  xp: 0,
  completedModules: [],
  completedChallenges: [],
  unlockedAchievements: [],
  lastAccess: new Date().toISOString(),
  role: 'STUDENT'
};

export function useUser() {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncWithBackend = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const dbUser = await authService.getMe();
          if (dbUser) {
            const profile: UserProfile = {
              name: dbUser.name,
              role: dbUser.role,
              className: dbUser.studentProfile?.classId || '',
              xp: dbUser.studentProfile?.xp || 0,
              avatar: dbUser.studentProfile?.avatar || '👨‍💻',
              completedModules: dbUser.studentProfile?.progress 
                ?.filter((p: any) => p.status === 'COMPLETED')
                ?.map((p: any) => p.moduleId) || [],
              completedChallenges: dbUser.studentProfile?.attempts
                ?.filter((a: any) => a.isCorrect)
                ?.map((a: any) => a.challengeId) || [],
              unlockedAchievements: dbUser.studentProfile?.achievements?.map((a: any) => a.achievementId) || [],
              lastAccess: new Date().toISOString()
            };
            setUser(profile);
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error("Failed to sync profile:", error);
          // If token is invalid, logout
          if ((error as any).response?.status === 403 || (error as any).response?.status === 401) {
             logout();
          }
        }
      }
      setIsLoading(false);
    };

    syncWithBackend();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }, [user, isAuthenticated]);

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
  };

  const login = async (credentials: any) => {
    const data = await authService.login(credentials);
    setIsAuthenticated(true);
    // Reload profile
    const dbUser = await authService.getMe();
    updateProfileFromBackend(dbUser);
    return data;
  };

  const register = async (data: any) => {
    const response = await authService.register(data);
    setIsAuthenticated(true);
    const dbUser = await authService.getMe();
    updateProfileFromBackend(dbUser);
    return response;
  };

  const updateProfileFromBackend = (dbUser: any) => {
    const profile: UserProfile = {
      name: dbUser.name,
      role: dbUser.role,
      className: dbUser.studentProfile?.classId || '',
      xp: dbUser.studentProfile?.xp || 0,
      avatar: dbUser.studentProfile?.avatar || '👨‍💻',
      completedModules: [], // Simplified for now
      completedChallenges: [],
      unlockedAchievements: [],
      lastAccess: new Date().toISOString()
    };
    setUser(profile);
  };

  const addXP = (amount: number) => {
    setUser(prev => ({ ...prev, xp: prev.xp + amount }));
    // In a full implementation, we'd also sync this to the backend here
  };

  const completeModule = (moduleId: string, xpReward: number) => {
    if (!user.completedModules.includes(moduleId)) {
      setUser(prev => ({
        ...prev,
        completedModules: [...prev.completedModules, moduleId],
        xp: prev.xp + xpReward
      }));
    }
  };

  const completeChallenge = (challengeId: string, xpReward: number) => {
    if (!user.completedChallenges.includes(challengeId)) {
      setUser(prev => ({
        ...prev,
        completedChallenges: [...prev.completedChallenges, challengeId],
        xp: prev.xp + xpReward
      }));
    }
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...profile }));
  };

  const resetData = () => {
    logout();
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    addXP,
    completeModule,
    completeChallenge,
    updateProfile,
    resetData,
    isProfileSetup: isAuthenticated || !!user.isGuest
  };
}
