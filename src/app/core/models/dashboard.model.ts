export interface DashboardStats {
  todayReservations: number;
  monthReservations: number;
  monthRevenue: number;
  todayRevenue: number;
  totalClients: number;
  activeBarbers: number;
  topServices: TopService[];
  topBarbers: TopBarber[];
  reservationsByStatus: ReservationByStatus[];
  revenueByDay: RevenueByDay[];
}

export interface TopService {
  serviceName: string;
  count: number;
  revenue: number;
}

export interface TopBarber {
  barberName: string;
  reservations: number;
  revenue: number;
  rating: number;
}

export interface ReservationByStatus {
  status: string;
  count: number;
  color: string;
}

export interface RevenueByDay {
  date: string;
  revenue: number;
  reservations: number;
}
