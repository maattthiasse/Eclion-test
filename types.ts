export enum TrainingStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  role: string;
  hasSigned: boolean;
  signature?: string; // Base64 data URL
  isPresent: boolean;
}

export interface TrainingSession {
  id: string;
  companyName: string;
  trainingName: string;
  date: string;
  startTime?: string; // Format HH:mm
  status: TrainingStatus;
  participants: Participant[];
  trainerName: string;
  trainerSignature?: string; // Base64 signature of the trainer
}

export interface AIAnalysisResult {
  companyName: string;
  trainingName: string;
  dates: string[]; // Changed from single date to array of dates
  participants: { name: string; email: string; role: string }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'alert';
  timestamp: Date;
  trainingId?: string;
  read: boolean;
}