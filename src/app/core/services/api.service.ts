import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagedResult } from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  readonly baseUrl = environment.apiUrl;

  get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params: httpParams });
  }

  getBlob(endpoint: string, params?: Record<string, any>): Observable<Blob> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }
    return this.http.get(`${this.baseUrl}/${endpoint}`, { params: httpParams, responseType: 'blob' });
  }

  getPaged<T>(endpoint: string, params?: Record<string, any>): Observable<PagedResult<T>> {
    return this.get<PagedResult<T>>(endpoint, params);
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  patch<T = void>(endpoint: string, body?: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, body ?? {});
  }

  delete<T = void>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
  }
}
