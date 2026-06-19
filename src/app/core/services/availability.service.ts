import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  AvailableDay,
  AvailableSlot,
  BarberAvailabilityBlock,
  BarberMonthAvailability,
  CreateAvailabilityBlockRequest,
  ShrinkAvailabilityBlockRequest,
  UpdateAvailabilityBlockRequest
} from '../models';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private readonly api = inject(ApiService);
  private readonly endpoint = 'barber-availability';

  getByMonth(barberId: string, year: number, month: number): Observable<BarberMonthAvailability> {
    return this.api.get<BarberMonthAvailability>(`${this.endpoint}/barber/${barberId}/month`, { year, month });
  }

  getByDate(barberId: string, date: string): Observable<AvailableDay | null> {
    return this.api.get<AvailableDay | null>(`${this.endpoint}/barber/${barberId}/date`, { date });
  }

  getAvailableSlots(barberId: string, date: string, serviceDurationMinutes: number): Observable<AvailableSlot[]> {
    return this.api.get<AvailableSlot[]>(`${this.endpoint}/barber/${barberId}/slots`, { date, serviceDurationMinutes });
  }

  create(body: CreateAvailabilityBlockRequest): Observable<BarberAvailabilityBlock> {
    return this.api.post<BarberAvailabilityBlock>(this.endpoint, body);
  }

  update(blockId: string, body: UpdateAvailabilityBlockRequest): Observable<BarberAvailabilityBlock> {
    return this.api.put<BarberAvailabilityBlock>(`${this.endpoint}/${blockId}`, body);
  }

  shrink(blockId: string, body: ShrinkAvailabilityBlockRequest): Observable<BarberAvailabilityBlock> {
    return this.api.patch<BarberAvailabilityBlock>(`${this.endpoint}/${blockId}/shrink`, body);
  }

  delete(blockId: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${blockId}`);
  }
}
