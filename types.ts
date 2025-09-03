export enum InsulinType {
  RAPID_ACTING = 'RAPID_ACTING',
  SHORT_ACTING = 'SHORT_ACTING',
  INTERMEDIATE_ACTING = 'INTERMEDIATE_ACTING',
  LONG_ACTING = 'LONG_ACTING',
}

export enum GlucoseType {
  PRE_MEAL = 'PRE_MEAL',
  POST_MEAL = 'POST_MEAL',
  FASTING = 'FASTING',
  OTHER = 'OTHER',
}

export enum InjectionSite {
  LEFT_ABDOMEN_UPPER = 'LEFT_ABDOMEN_UPPER',
  RIGHT_ABDOMEN_UPPER = 'RIGHT_ABDOMEN_UPPER',
  LEFT_ABDOMEN_LOWER = 'LEFT_ABDOMEN_LOWER',
  RIGHT_ABDOMEN_LOWER = 'RIGHT_ABDOMEN_LOWER',
}

export interface Injection {
  id: string;
  timestamp: number;
  type: InsulinType;
  units: number;
  notes?: string;
  nextDoseTimestamp?: number; // Added to link to the next scheduled dose
  glucoseLevel?: number;
  glucoseType?: GlucoseType;
  carbs?: number;
  site?: InjectionSite;
}

export type Role = 'Doctor' | 'Patient';

export interface User {
  username: string;
  password: string; // In a real app, this would be hashed for security.
  role: Role;
  doctorUsername?: string; // For patients, to link to their doctor.
}

export interface ScheduledDose {
  timestamp: number;
  units: number;
  type: InsulinType;
  sourceInjectionId: string; // The ID of the injection that scheduled this dose
}

// FIX: Add ChatMessage type for the ChatBot component
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}