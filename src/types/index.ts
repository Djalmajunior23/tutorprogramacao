
export interface UserProfile {
  name: string;
  className: string;
  avatar: string;
  xp: number;
  completedModules: string[];
  completedChallenges: string[];
  unlockedAchievements: string[];
  lastAccess: string;
  role: string;
  isGuest?: boolean;
  skills: {
    logic: number;
    variables: number;
    conditionals: number;
    loops: number;
    arrays: number;
    functions: number;
  };
}

export interface Module {
  id: string;
  title: string;
  description: string;
  content: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  xpReward: number;
  examples: {
    pseudo: string;
    csharp: string;
    java: string;
  }[];
}

export interface Trail {
  id: string;
  title: string;
  description: string;
  modules: string[]; // IDs of modules
  xpReward: number;
}

export interface Challenge {
  id: string;
  title: string;
  context: string;
  instruction: string;
  initialCode: string;
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  xpReward: number;
  testCases: {
    input: string[];
    expectedOutput: string;
  }[];
  hint?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  requirement: (user: UserProfile) => boolean;
  xpReward: number;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'atividade' | 'avisos' | 'urgente';
  date: string;
}
