export interface WorkSchedule {
  id: string;
  barberId: string;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  isWorkingDay: boolean;
  slotDurationMinutes: number;
}
