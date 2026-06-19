export interface BarberAvailabilityBlock {
  id: string;
  barberId: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  note?: string;
}

export interface AvailableDay {
  date: string;
  dayOfWeek: string;
  blocks: BarberAvailabilityBlock[];
}

export interface BarberMonthAvailability {
  barberId: string;
  year: number;
  month: number;
  days: AvailableDay[];
}

export interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
  availabilityBlockId: string;
}

export interface CreateAvailabilityBlockRequest {
  barberId: string;
  date: string;
  startTime: string;
  endTime: string;
  note?: string;
}

export interface UpdateAvailabilityBlockRequest {
  startTime: string;
  endTime: string;
  note?: string;
}

export interface ShrinkAvailabilityBlockRequest {
  newEndTime: string;
}
