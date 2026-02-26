
export enum AppTab {
  ANALYZER = 'analyzer',
  LEARN = 'learn',
  METERS = 'meters',
  TOOLS = 'tools',
  ABOUT = 'about'
}

export interface AnalysisResult {
  verse: string;
  arudiWriting: string;
  meterName: string;
  tafilat: string[];
  scansion: string; // e.g., "||0|0 ||0|0|0"
  explanation: string;
  isCorrect: boolean;
  errors: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PoetryGeneration {
  verse: string;
  meter: string;
}
