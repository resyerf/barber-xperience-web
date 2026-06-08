export interface AgendaItem {
  reservationId: string;
  clientName: string;
  serviceOrPackageName: string;
  startDateTime: string;
  endDateTime: string;
  status: number;
  statusLabel: string;
}
