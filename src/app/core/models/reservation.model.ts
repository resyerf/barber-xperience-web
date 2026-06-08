export enum ReservationStatus {
  Pending = 1,
  Confirmed = 2,
  InProgress = 3,
  Completed = 4,
  Cancelled = 5,
  NoShow = 6
}

export interface Reservation {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  barberId: string;
  barberName: string;
  serviceId?: string;
  serviceName?: string;
  packageId?: string;
  packageName?: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  status: number;
  statusLabel: string;
  totalAmount: number;
  notes?: string;
  confirmationCode: string;
  cancellationReason?: string;
  createdAt: string;
}
