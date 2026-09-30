export type RehabMode = 'stroke' | 'sarcopenia' | 'osteo';

export interface AppState {
  view: 'intro' | 'setup' | 'calibration' | 'game' | 'result';
  selectedPatientId: string | null;
  selectedMode: RehabMode | null;
  selectedSongId: string;
  gsiThreshold?: number;
  stats: GameStats | null;
}

export interface GameStats {
  gsi?: number;
  avgReactionTime?: number;
  stabilityScore?: number;
  totalSteps: number;
  successfulSteps: number;
  bestReactionTime: number;
  streakRecord: number;
  songTitle?: string;
  patientName?: string;
}

