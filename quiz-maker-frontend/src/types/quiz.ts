export interface Option {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  questionText: string;
  options: string[];
  correctAnswer: string;
}

export interface ParticipantField {
  id: number;
  label: string;
  type: string;
  required: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  participants?: number;
  averageScore?: number;
  settings: QuizSettings;
  createdAt: string;
  participantFields: ParticipantField[]
}

export interface QuizResult {
  quizId: string;
  quizTitle: string;
  participantName: string;
  participantEmail: string;
  score: number;
  date: string;
}

export interface QuizSettings {
  allowRetake: boolean;
  timeLimit: number;
  startDate: string;
  endDate: string;
}